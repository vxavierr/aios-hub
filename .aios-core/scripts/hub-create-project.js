#!/usr/bin/env node
/**
 * Hub Create Project Command
 *
 * Creates a new AIOS project with isolated .aios-core/ structure.
 *
 * Usage:
 *   node hub-create-project.js {nome} [--template greenfield|brownfield|custom]
 *
 * @module scripts/hub-create-project
 */

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const VALID_TEMPLATES = ['greenfield', 'brownfield', 'custom'];
const PROJECT_NAME_REGEX = /^[a-z0-9-_]+$/;

/**
 * Validate project name
 * @param {string} name - Project name
 * @returns {{valid: boolean, error?: string}}
 */
function validateProjectName(name) {
  if (!name) {
    return { valid: false, error: 'Project name is required' };
  }

  if (name.length > 50) {
    return { valid: false, error: 'Project name must be 50 characters or less' };
  }

  if (!PROJECT_NAME_REGEX.test(name)) {
    return { valid: false, error: 'Project name must contain only lowercase letters, numbers, hyphens, and underscores' };
  }

  if (name.startsWith('-') || name.startsWith('_')) {
    return { valid: false, error: 'Project name cannot start with hyphen or underscore' };
  }

  return { valid: true };
}

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Directory path
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Create .gitkeep file in directory
 * @param {string} dirPath - Directory path
 */
function createGitkeep(dirPath) {
  ensureDir(dirPath);
  const gitkeepPath = path.join(dirPath, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '', 'utf8');
  }
}

/**
 * Generate core-config.yaml content
 * @param {string} projectName - Project name
 * @param {string} template - Template type
 * @returns {string} YAML content
 */
function generateCoreConfig(projectName, template) {
  const config = {
    project: {
      name: projectName,
      type: template,
      created: new Date().toISOString(),
      hub: true
    },
    aios: {
      version: '3.0',
      mode: 'project'
    }
  };

  return yaml.dump(config, { lineWidth: -1, quotingType: '"' });
}

/**
 * Generate project-status.yaml content
 * @param {string} projectName - Project name
 * @returns {string} YAML content
 */
function generateProjectStatus(projectName) {
  const now = new Date().toISOString();

  const status = {
    version: '1.0',
    project: {
      name: projectName,
      status: 'active',
      created: now
    },
    status: {
      currentEpic: null,
      currentStory: null,
      lastUpdate: now,
      modifiedFilesTotalCount: 0,
      modifiedFiles: []
    }
  };

  return yaml.dump(status, { lineWidth: -1 });
}

/**
 * Create project structure based on template
 * @param {string} projectPath - Project root path
 * @param {string} projectName - Project name
 * @param {string} template - Template type
 */
function createProjectStructure(projectPath, projectName, template) {
  // Create .aios-core/ structure
  const aiosCorePath = path.join(projectPath, '.aios-core');
  createGitkeep(path.join(aiosCorePath, 'data'));
  createGitkeep(path.join(aiosCorePath, 'development'));
  createGitkeep(path.join(aiosCorePath, 'scripts'));

  // Create core-config.yaml
  const coreConfigPath = path.join(aiosCorePath, 'core-config.yaml');
  fs.writeFileSync(coreConfigPath, generateCoreConfig(projectName, template), 'utf8');

  // Create .aios/ structure
  const aiosPath = path.join(projectPath, '.aios');
  ensureDir(aiosPath);

  // Create project-status.yaml
  const projectStatusPath = path.join(aiosPath, 'project-status.yaml');
  fs.writeFileSync(projectStatusPath, generateProjectStatus(projectName), 'utf8');

  // Create docs/ structure
  createGitkeep(path.join(projectPath, 'docs', 'stories'));
  createGitkeep(path.join(projectPath, 'docs', 'prd'));

  // Create template-specific structure
  switch (template) {
    case 'greenfield':
      createGitkeep(path.join(projectPath, 'src'));
      createGitkeep(path.join(projectPath, 'tests'));
      break;

    case 'brownfield':
      // Minimal structure for existing projects
      break;

    case 'custom':
      // Just .aios-core/ - user adds their own structure
      break;
  }
}

/**
 * Run sync-projects.js to register the new project
 * @param {string} hubRoot - Hub root path
 */
function syncProjects(hubRoot) {
  try {
    const syncPath = path.join(hubRoot, '.aios-core', 'scripts', 'sync-projects.js');
    if (fs.existsSync(syncPath)) {
      // Require and execute sync
      const { SyncProjects } = require(syncPath);
      const syncer = new SyncProjects(hubRoot);
      return syncer.sync();
    }
  } catch (error) {
    console.log(`   ⚠️  Warning: Could not run sync-projects.js: ${error.message}`);
  }
  return null;
}

/**
 * Main function to create a project
 * @param {string[]} args - Command line arguments
 */
function createProject(args = []) {
  const hubRoot = process.cwd();
  const projectsDir = path.join(hubRoot, 'projects');

  // Parse arguments
  const templateIndex = args.indexOf('--template');
  const template = templateIndex !== -1 && args[templateIndex + 1]
    ? args[templateIndex + 1].toLowerCase()
    : 'greenfield';

  // Get project name (first non-flag argument)
  const projectName = args.find(arg => !arg.startsWith('--'));

  // Validate project name
  const nameValidation = validateProjectName(projectName);
  if (!nameValidation.valid) {
    console.log('');
    console.log(`❌ ${nameValidation.error}`);
    console.log('');
    return { success: false, error: 'INVALID_NAME' };
  }

  // Validate template
  if (!VALID_TEMPLATES.includes(template)) {
    console.log('');
    console.log(`❌ Invalid template: ${template}`);
    console.log(`   Valid options: ${VALID_TEMPLATES.join(', ')}`);
    console.log('');
    return { success: false, error: 'INVALID_TEMPLATE' };
  }

  // Check if project already exists
  const projectPath = path.join(projectsDir, projectName);
  if (fs.existsSync(projectPath)) {
    console.log('');
    console.log(`❌ Project "${projectName}" already exists.`);
    console.log(`   Path: ${projectPath}`);
    console.log('');
    return { success: false, error: 'PROJECT_EXISTS' };
  }

  // Create project
  console.log('');
  console.log(`📁 Creating project: ${projectName}`);
  console.log(`   Template: ${template}`);
  console.log('');

  try {
    // Ensure projects directory exists
    ensureDir(projectsDir);

    // Create project directory
    ensureDir(projectPath);

    // Create project structure
    createProjectStructure(projectPath, projectName, template);

    console.log('   ✅ Created .aios-core/');
    console.log('   ✅ Created .aios/project-status.yaml');
    console.log('   ✅ Created docs/');

    if (template === 'greenfield') {
      console.log('   ✅ Created src/');
      console.log('   ✅ Created tests/');
    }

    // Sync with registry
    console.log('');
    console.log('   🔄 Syncing with registry...');
    const syncResult = syncProjects(hubRoot);

    if (syncResult) {
      console.log(`   ✅ Registered in entity-registry.yaml`);
      console.log(`   ✅ Updated hub-context.json`);
    }

    console.log('');
    console.log('🎉 Project created successfully!');
    console.log('');
    console.log(`   Path: ${projectPath}`);
    console.log('');
    console.log('   Next steps:');
    console.log(`   1. cd projects/${projectName}`);
    console.log(`   2. Initialize git (optional)`);
    console.log(`   3. Start development with AIOS`);
    console.log('');

    return {
      success: true,
      project: {
        name: projectName,
        path: projectPath,
        template
      }
    };

  } catch (error) {
    console.log('');
    console.log(`❌ Failed to create project: ${error.message}`);
    console.log('');

    // Cleanup on failure
    if (fs.existsSync(projectPath)) {
      console.log('   Cleaning up partial project...');
      fs.rmSync(projectPath, { recursive: true, force: true });
    }

    return { success: false, error: 'CREATION_FAILED' };
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  createProject(args);
}

module.exports = {
  createProject,
  validateProjectName,
  generateCoreConfig,
  generateProjectStatus
};

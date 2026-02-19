#!/usr/bin/env node
/**
 * Validate Project Schema - Entity Registry Validation
 *
 * Validates that project entities in entity-registry.yaml conform to the
 * expected schema for AIOS Hub Multi-Projeto.
 *
 * Usage:
 *   node validate-project-schema.js [--fix]
 *
 * Options:
 *   --fix    Attempt to auto-fix minor issues
 *
 * @module scripts/validate-project-schema
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Required fields for project entities
const REQUIRED_FIELDS = ['path', 'aiosCore', 'type', 'purpose', 'status', 'lastActivity'];

// Optional fields for project entities
const OPTIONAL_FIELDS = [
  'techStack', 'activeStory', 'activeEpic', 'description',
  'keywords', 'adaptability', 'lastVerified', 'usedBy', 'dependencies', 'checksum'
];

// Valid status values
const VALID_STATUSES = ['active', 'paused', 'archived'];

// Valid types
const VALID_TYPES = ['project'];

/**
 * Validate a single project entity
 * @param {string} projectName - Name of the project
 * @param {object} project - Project entity data
 * @returns {object} Validation result with errors and warnings
 */
function validateProject(projectName, project) {
  const errors = [];
  const warnings = [];

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (project[field] === undefined || project[field] === null || project[field] === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate type
  if (project.type && !VALID_TYPES.includes(project.type)) {
    errors.push(`Invalid type: ${project.type}. Must be one of: ${VALID_TYPES.join(', ')}`);
  }

  // Validate status
  if (project.status && !VALID_STATUSES.includes(project.status)) {
    errors.push(`Invalid status: ${project.status}. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  // Validate lastActivity is ISO8601
  if (project.lastActivity) {
    const date = new Date(project.lastActivity);
    if (isNaN(date.getTime())) {
      errors.push(`Invalid lastActivity format: ${project.lastActivity}. Must be ISO8601`);
    }
  }

  // Validate path exists and points to projects/
  if (project.path && !project.path.startsWith('projects/')) {
    warnings.push(`Path should start with 'projects/': ${project.path}`);
  }

  // Validate aiosCore exists and points to .aios-core
  if (project.aiosCore && !project.aiosCore.includes('.aios-core')) {
    warnings.push(`aiosCore should reference .aios-core directory: ${project.aiosCore}`);
  }

  // Validate techStack is array if present
  if (project.techStack && !Array.isArray(project.techStack)) {
    errors.push(`techStack must be an array, got: ${typeof project.techStack}`);
  }

  // Validate keywords is array if present
  if (project.keywords && !Array.isArray(project.keywords)) {
    errors.push(`keywords must be an array, got: ${typeof project.keywords}`);
  }

  // Check for unknown fields
  const allValidFields = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];
  for (const field of Object.keys(project)) {
    if (!allValidFields.includes(field)) {
      warnings.push(`Unknown field: ${field}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Main validation function
 */
async function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');

  const registryPath = path.join(__dirname, '..', 'data', 'entity-registry.yaml');
  const projectRoot = path.join(__dirname, '..', '..');

  console.log('📋 Validating project schema in entity-registry.yaml\n');

  try {
    // Load registry
    const content = fs.readFileSync(registryPath, 'utf8');
    const registry = yaml.load(content);

    // Check if projects section exists
    if (!registry.entities || !registry.entities.projects) {
      console.log('⚠️  No projects section found in entity-registry.yaml');
      console.log('   This is normal for a fresh Hub with no projects yet.\n');
      return;
    }

    const projects = registry.entities.projects;
    const projectNames = Object.keys(projects);

    if (projectNames.length === 0) {
      console.log('ℹ️  No projects registered yet.\n');
      return;
    }

    console.log(`Found ${projectNames.length} project(s) to validate:\n`);

    let totalErrors = 0;
    let totalWarnings = 0;

    for (const name of projectNames) {
      const project = projects[name];
      const result = validateProject(name, project);

      if (result.valid && result.warnings.length === 0) {
        console.log(`✅ ${name}: Valid`);
      } else if (result.valid) {
        console.log(`⚠️  ${name}: Valid with warnings`);
        for (const warning of result.warnings) {
          console.log(`   - ${warning}`);
        }
        totalWarnings += result.warnings.length;
      } else {
        console.log(`❌ ${name}: Invalid`);
        for (const error of result.errors) {
          console.log(`   ERROR: ${error}`);
        }
        for (const warning of result.warnings) {
          console.log(`   WARNING: ${warning}`);
        }
        totalErrors += result.errors.length;
        totalWarnings += result.warnings.length;
      }
    }

    console.log('\n--- Summary ---');
    console.log(`Projects: ${projectNames.length}`);
    console.log(`Errors: ${totalErrors}`);
    console.log(`Warnings: ${totalWarnings}`);

    if (totalErrors > 0) {
      console.log('\n❌ Validation FAILED');
      process.exit(1);
    } else {
      console.log('\n✅ Validation PASSED');
    }

  } catch (error) {
    console.error('❌ Error reading entity-registry.yaml:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateProject, REQUIRED_FIELDS, OPTIONAL_FIELDS, VALID_STATUSES };

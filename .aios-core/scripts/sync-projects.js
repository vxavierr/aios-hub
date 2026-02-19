#!/usr/bin/env node
/**
 * SyncProjects - Hub Project Synchronization
 *
 * Scans projects/ directory, detects AIOS projects (with .aios-core/),
 * and updates:
 *   1. entity-registry.yaml (projects section)
 *   2. .aios/hub-context.json (fast cache for greeting)
 *   3. .aios/project-status.yaml (consolidated status)
 *
 * Usage:
 *   node sync-projects.js [--verbose]
 *
 * Performance target: < 5s for 10 projects
 *
 * @module scripts/sync-projects
 * @see docs/architecture/hub-multi-projeto-architecture.md
 */

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Performance constants
const SCAN_TIMEOUT_MS = 500; // Per project
const MAX_PROJECTS = 50;

// Schema constants for projects
const REQUIRED_FIELDS = ['path', 'aiosCore', 'type', 'purpose', 'status', 'lastActivity'];
const VALID_STATUSES = ['active', 'paused', 'archived'];

/**
 * SyncProjects - Main synchronization class
 */
class SyncProjects {
  /**
   * @param {string} hubRoot - Path to Hub root directory
   */
  constructor(hubRoot = process.cwd()) {
    this.hubRoot = hubRoot;
    this.projectsDir = path.join(hubRoot, 'projects');
    this.entityRegistryPath = path.join(hubRoot, '.aios-core', 'data', 'entity-registry.yaml');
    this.hubContextPath = path.join(hubRoot, '.aios', 'hub-context.json');
    this.projectStatusPath = path.join(hubRoot, '.aios', 'project-status.yaml');
    this.verbose = process.argv.includes('--verbose');
  }

  /**
   * Main sync function
   * @returns {Promise<SyncResult>}
   */
  async sync() {
    const startTime = Date.now();
    const result = {
      duration: 0,
      added: [],
      updated: [],
      removed: [],
      unchanged: [],
      total: 0,
      errors: [],
    };

    try {
      // 1. Scan projects directory
      const detectedProjects = await this.scanProjects();
      result.total = detectedProjects.length;

      // 2. Load current registry
      const currentRegistry = await this.loadEntityRegistry();
      const currentProjects = currentRegistry.entities?.projects || {};

      // 3. Compute changes
      const changes = this.computeChanges(currentProjects, detectedProjects);
      result.added = changes.added;
      result.updated = changes.updated;
      result.removed = changes.removed;
      result.unchanged = changes.unchanged;

      // 4. Update entity registry
      if (changes.added.length > 0 || changes.updated.length > 0 || changes.removed.length > 0) {
        await this.updateEntityRegistry(currentRegistry, changes, detectedProjects);
      }

      // 5. Update hub context (fast cache)
      await this.updateHubContext(detectedProjects);

      // 6. Update consolidated project status
      await this.updateConsolidatedStatus(detectedProjects);

      result.duration = Date.now() - startTime;

      if (this.verbose) {
        this.log(`Sync completed in ${result.duration}ms`);
        this.log(`Added: ${result.added.length}, Updated: ${result.updated.length}, Removed: ${result.removed.length}`);
      }

      return result;

    } catch (error) {
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Scan projects directory for valid AIOS projects
   * @returns {Promise<Array<DetectedProject>>}
   */
  async scanProjects() {
    const projects = [];

    try {
      // Check if projects directory exists
      if (!fs.existsSync(this.projectsDir)) {
        return projects;
      }

      const entries = fs.readdirSync(this.projectsDir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (entry.name.startsWith('.')) continue; // Skip hidden directories

        const projectPath = path.join(this.projectsDir, entry.name);
        const aiosCorePath = path.join(projectPath, '.aios-core');

        // Check if valid AIOS project
        if (await this.isValidAiosProject(aiosCorePath)) {
          const projectInfo = await this.getProjectInfo(entry.name, projectPath);
          projects.push(projectInfo);
        }
      }
    } catch (error) {
      this.log(`Scan failed: ${error.message}`);
    }

    return projects;
  }

  /**
   * Check if directory contains valid AIOS structure
   * @param {string} aiosCorePath - Path to .aios-core directory
   * @returns {Promise<boolean>}
   */
  async isValidAiosProject(aiosCorePath) {
    try {
      const configPath = path.join(aiosCorePath, 'core-config.yaml');
      fs.accessSync(configPath, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract project info from .aios/project-status.yaml
   * @param {string} name - Project name
   * @param {string} projectPath - Path to project directory
   * @returns {Promise<DetectedProject>}
   */
  async getProjectInfo(name, projectPath) {
    const statusPath = path.join(projectPath, '.aios', 'project-status.yaml');
    const info = {
      name,
      path: `projects/${name}`,
      aiosCore: `projects/${name}/.aios-core`,
      type: 'project',
      purpose: '',
      status: 'active',
      lastActivity: new Date().toISOString(),
      techStack: [],
      activeStory: null,
      activeEpic: null,
    };

    try {
      if (fs.existsSync(statusPath)) {
        const content = fs.readFileSync(statusPath, 'utf8');
        const status = yaml.load(content);

        // Extract relevant fields
        if (status?.status) {
          info.activeStory = status.status.currentStory || null;
          info.activeEpic = status.status.currentEpic || null;
          info.lastActivity = status.status.lastUpdate || info.lastActivity;
        }
      }
    } catch (error) {
      // Keep defaults
    }

    // Detect tech stack
    info.techStack = await this.detectTechStack(projectPath);

    return info;
  }

  /**
   * Detect tech stack from project files
   * @param {string} projectPath - Path to project directory
   * @returns {Promise<Array<string>>}
   */
  async detectTechStack(projectPath) {
    const techStack = [];

    try {
      // Check package.json
      const pkgPath = path.join(projectPath, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

        if (pkg.dependencies?.react || pkg.devDependencies?.react) techStack.push('React');
        if (pkg.dependencies?.next || pkg.devDependencies?.next) techStack.push('Next.js');
        if (pkg.dependencies?.vue || pkg.devDependencies?.vue) techStack.push('Vue');
        if (pkg.dependencies?.svelte || pkg.devDependencies?.svelte) techStack.push('Svelte');
        if (pkg.dependencies?.express) techStack.push('Express');
        if (pkg.dependencies?.fastify) techStack.push('Fastify');
        if (pkg.dependencies?.nestjs || pkg.dependencies?.['@nestjs/core']) techStack.push('NestJS');
        if (pkg.dependencies?.typescript || pkg.devDependencies?.typescript) techStack.push('TypeScript');
        if (pkg.dependencies?.tailwindcss || pkg.devDependencies?.tailwindcss) techStack.push('TailwindCSS');
        if (pkg.dependencies?.prisma || pkg.devDependencies?.prisma) techStack.push('Prisma');
      }

      // Check requirements.txt for Python
      const reqPath = path.join(projectPath, 'requirements.txt');
      if (fs.existsSync(reqPath)) {
        techStack.push('Python');
      }

      // Check Cargo.toml for Rust
      const cargoPath = path.join(projectPath, 'Cargo.toml');
      if (fs.existsSync(cargoPath)) {
        techStack.push('Rust');
      }

      // Check go.mod for Go
      const goModPath = path.join(projectPath, 'go.mod');
      if (fs.existsSync(goModPath)) {
        techStack.push('Go');
      }

    } catch (error) {
      // Keep empty techStack
    }

    return techStack;
  }

  /**
   * Load entity registry from file
   * @returns {Promise<object>}
   */
  async loadEntityRegistry() {
    try {
      const content = fs.readFileSync(this.entityRegistryPath, 'utf8');
      return yaml.load(content);
    } catch (error) {
      return { metadata: {}, entities: {} };
    }
  }

  /**
   * Compute changes between current and detected projects
   * @param {object} currentProjects - Current projects in registry
   * @param {Array} detectedProjects - Detected projects from scan
   * @returns {Changes}
   */
  computeChanges(currentProjects, detectedProjects) {
    const changes = {
      added: [],
      updated: [],
      removed: [],
      unchanged: [],
    };

    const detectedNames = new Set(detectedProjects.map(p => p.name));
    const currentNames = new Set(Object.keys(currentProjects).filter(k => k !== ''));

    // Find added and updated
    for (const project of detectedProjects) {
      if (!currentNames.has(project.name)) {
        changes.added.push(project.name);
      } else {
        // Check if updated (simplified: always mark as updated if exists)
        const current = currentProjects[project.name];
        if (this.hasProjectChanged(current, project)) {
          changes.updated.push(project.name);
        } else {
          changes.unchanged.push(project.name);
        }
      }
    }

    // Find removed
    for (const name of currentNames) {
      if (!detectedNames.has(name)) {
        changes.removed.push(name);
      }
    }

    return changes;
  }

  /**
   * Check if project has changed
   * @param {object} current - Current project data
   * @param {object} detected - Detected project data
   * @returns {boolean}
   */
  hasProjectChanged(current, detected) {
    if (!current) return true;

    return (
      current.status !== detected.status ||
      current.activeStory !== detected.activeStory ||
      current.activeEpic !== detected.activeEpic ||
      current.lastActivity !== detected.lastActivity
    );
  }

  /**
   * Update entity registry with changes
   * @param {object} registry - Current registry
   * @param {Changes} changes - Computed changes
   * @param {Array} detectedProjects - Detected projects
   */
  async updateEntityRegistry(registry, changes, detectedProjects) {
    // Initialize entities if needed
    if (!registry.entities) registry.entities = {};
    if (!registry.entities.projects) registry.entities.projects = {};

    // Remove deleted projects
    for (const name of changes.removed) {
      delete registry.entities.projects[name];
    }

    // Add/update projects
    for (const project of detectedProjects) {
      registry.entities.projects[project.name] = {
        path: project.path,
        aiosCore: project.aiosCore,
        type: project.type,
        purpose: project.purpose || `Project ${project.name}`,
        status: project.status,
        lastActivity: project.lastActivity,
        techStack: project.techStack,
        activeStory: project.activeStory,
        activeEpic: project.activeEpic,
        adaptability: {
          score: 1.0,
          constraints: ['isolated'],
          extensionPoints: [],
        },
        lastVerified: new Date().toISOString(),
      };
    }

    // Update metadata
    registry.metadata.lastUpdated = new Date().toISOString();

    // Write back to file
    const content = yaml.dump(registry, { lineWidth: -1, quotingType: '"' });
    fs.writeFileSync(this.entityRegistryPath, content, 'utf8');
  }

  /**
   * Update hub context (fast cache for greeting)
   * @param {Array} detectedProjects - Detected projects
   */
  async updateHubContext(detectedProjects) {
    const hubContext = {
      version: '1.0',
      lastSync: new Date().toISOString(),
      hubRoot: this.hubRoot,
      projects: {},
      summary: {
        total: detectedProjects.length,
        active: detectedProjects.filter(p => p.status === 'active').length,
        paused: detectedProjects.filter(p => p.status === 'paused').length,
        archived: detectedProjects.filter(p => p.status === 'archived').length,
      },
    };

    for (const project of detectedProjects) {
      hubContext.projects[project.name] = {
        status: project.status,
        lastActivity: project.lastActivity,
        activeStory: project.activeStory,
        activeEpic: project.activeEpic,
      };
    }

    // Ensure .aios directory exists
    const aiosDir = path.dirname(this.hubContextPath);
    if (!fs.existsSync(aiosDir)) {
      fs.mkdirSync(aiosDir, { recursive: true });
    }

    fs.writeFileSync(this.hubContextPath, JSON.stringify(hubContext, null, 2), 'utf8');
  }

  /**
   * Update consolidated project status
   * @param {Array} detectedProjects - Detected projects
   */
  async updateConsolidatedStatus(detectedProjects) {
    // Load existing status or create new
    let status = {
      version: '1.0',
      lastSync: new Date().toISOString(),
      hub: {
        branch: null,
        modifiedFiles: [],
        recentCommits: [],
        isGitRepo: false,
      },
      projects: {
        total: detectedProjects.length,
        active: 0,
        paused: 0,
        archived: 0,
      },
      projectList: {},
    };

    // Count by status
    for (const project of detectedProjects) {
      if (project.status === 'active') status.projects.active++;
      else if (project.status === 'paused') status.projects.paused++;
      else if (project.status === 'archived') status.projects.archived++;

      status.projectList[project.name] = {
        status: project.status,
        lastActivity: project.lastActivity,
        branch: null, // Would need git to determine
        activeStory: project.activeStory,
        activeEpic: project.activeEpic,
        modifiedFiles: 0, // Would need git to determine
      };
    }

    // Ensure .aios directory exists
    const aiosDir = path.dirname(this.projectStatusPath);
    if (!fs.existsSync(aiosDir)) {
      fs.mkdirSync(aiosDir, { recursive: true });
    }

    const content = yaml.dump(status, { lineWidth: -1 });
    fs.writeFileSync(this.projectStatusPath, content, 'utf8');
  }

  /**
   * Log message if verbose mode
   * @param {string} message - Message to log
   */
  log(message) {
    if (this.verbose) {
      console.log(`[SyncProjects] ${message}`);
    }
  }
}

// CLI interface
async function main() {
  const syncer = new SyncProjects(process.cwd());
  const result = await syncer.sync();

  console.log(JSON.stringify(result, null, 2));

  if (result.errors.length > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { SyncProjects, REQUIRED_FIELDS, VALID_STATUSES };

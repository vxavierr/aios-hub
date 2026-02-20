#!/usr/bin/env node
/**
 * ScanStories - Cross-Project Story Scanner
 *
 * Scans docs/stories/ of all registered projects and extracts:
 *   - Story titles and IDs
 *   - Status (Draft, Ready, InProgress, InReview, Done)
 *   - Epic reference
 *   - Progress (checkbox completion)
 *
 * Output: .aios/hub-stories.json (consolidated cache)
 *
 * Usage:
 *   node scan-stories.js [--verbose] [--project name]
 *
 * Performance target: < 10s for 5 projects with 20 stories each
 *
 * @module scripts/scan-stories
 * @see docs/stories/3.1.scan-stories-script.md
 */

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Performance constants
const SCAN_TIMEOUT_MS = 2000; // Per project
const MAX_STORIES_PER_PROJECT = 100;
const MAX_FILE_SIZE_KB = 100;

// Valid story statuses
const VALID_STATUSES = ['Draft', 'Ready', 'InProgress', 'InReview', 'Done', 'Blocked'];

/**
 * ScanStories - Cross-project story scanner
 */
class ScanStories {
  /**
   * @param {string} hubRoot - Path to Hub root directory
   */
  constructor(hubRoot = process.cwd()) {
    this.hubRoot = hubRoot;
    this.projectsDir = path.join(hubRoot, 'projects');
    this.hubStoriesPath = path.join(hubRoot, '.aios', 'hub-stories.json');
    this.hubContextPath = path.join(hubRoot, '.aios', 'hub-context.json');
    this.verbose = process.argv.includes('--verbose');
    this.projectFilter = this._parseProjectFilter();
  }

  /**
   * Parse --project filter from command line
   * @private
   * @returns {string|null}
   */
  _parseProjectFilter() {
    const args = process.argv.slice(2);
    const projectIndex = args.indexOf('--project');
    if (projectIndex !== -1 && args[projectIndex + 1]) {
      return args[projectIndex + 1];
    }
    return null;
  }

  /**
   * Main scan function
   * @returns {Promise<ScanResult>}
   */
  async scan() {
    const startTime = Date.now();
    const result = {
      duration: 0,
      projectsScanned: 0,
      storiesFound: 0,
      errors: [],
    };

    try {
      // 1. Get list of projects to scan
      const projects = await this.getProjects();

      // 2. Scan each project
      const hubStories = {
        version: '1.0',
        lastSync: new Date().toISOString(),
        summary: {
          totalStories: 0,
          byStatus: {},
        },
        projects: {},
      };

      // 2a. First, scan the Hub itself (unless filtering by project)
      if (!this.projectFilter) {
        try {
          const hubProjectStories = await this.scanHub();
          if (hubProjectStories.stories.length > 0) {
            hubStories.projects['_hub'] = hubProjectStories;
            hubStories.summary.totalStories += hubProjectStories.stories.length;

            for (const story of hubProjectStories.stories) {
              const status = story.status || 'Unknown';
              hubStories.summary.byStatus[status] = (hubStories.summary.byStatus[status] || 0) + 1;
            }
          }
          result.projectsScanned++;
          result.storiesFound += hubProjectStories.stories.length;
        } catch (error) {
          result.errors.push(`_hub: ${error.message}`);
        }
      }

      // 2b. Then scan projects in projects/
      for (const projectName of projects) {
        try {
          const projectStories = await this.scanProject(projectName);
          if (projectStories.stories.length > 0) {
            hubStories.projects[projectName] = projectStories;
            hubStories.summary.totalStories += projectStories.stories.length;

            // Count by status
            for (const story of projectStories.stories) {
              const status = story.status || 'Unknown';
              hubStories.summary.byStatus[status] = (hubStories.summary.byStatus[status] || 0) + 1;
            }
          }
          result.projectsScanned++;
          result.storiesFound += projectStories.stories.length;
        } catch (error) {
          result.errors.push(`${projectName}: ${error.message}`);
        }
      }

      // 3. Write consolidated output
      await this.writeHubStories(hubStories);

      result.duration = Date.now() - startTime;

      if (this.verbose) {
        this.log(`Scan completed in ${result.duration}ms`);
        this.log(`Projects: ${result.projectsScanned}, Stories: ${result.storiesFound}`);
      }

      return result;

    } catch (error) {
      result.errors.push(error.message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Scan the Hub's own stories (docs/stories/ in hub root)
   * @returns {Promise<ProjectStories>}
   */
  async scanHub() {
    const storiesDir = path.join(this.hubRoot, 'docs', 'stories');

    const result = {
      lastActivity: null,
      stories: [],
    };

    if (!fs.existsSync(storiesDir)) {
      return result;
    }

    // Discover story files
    const storyFiles = await this.discoverStoryFiles(storiesDir);

    // Parse each story file
    for (const filePath of storyFiles) {
      try {
        const story = await this.parseStoryFile(filePath, '_hub');
        if (story) {
          // Adjust file path to be relative to hub root
          story.file = path.relative(this.hubRoot, filePath).replace(/\\/g, '/');
          result.stories.push(story);

          // Track last activity
          if (!result.lastActivity || story.lastModified > result.lastActivity) {
            result.lastActivity = story.lastModified;
          }
        }
      } catch (error) {
        this.log(`Failed to parse ${filePath}: ${error.message}`);
      }
    }

    // Sort stories by ID
    result.stories.sort((a, b) => {
      return (a.id || '').localeCompare(b.id || '', undefined, { numeric: true });
    });

    return result;
  }

  /**
   * Get list of projects to scan
   * @returns {Promise<string[]>}
   */
  async getProjects() {
    const projects = [];

    // If project filter specified, use only that
    if (this.projectFilter) {
      const projectPath = path.join(this.projectsDir, this.projectFilter);
      if (fs.existsSync(projectPath)) {
        return [this.projectFilter];
      }
      throw new Error(`Project not found: ${this.projectFilter}`);
    }

    // Otherwise, load from hub-context.json or scan projects/
    try {
      if (fs.existsSync(this.hubContextPath)) {
        const content = fs.readFileSync(this.hubContextPath, 'utf8');
        const hubContext = JSON.parse(content);
        if (hubContext.projects) {
          return Object.keys(hubContext.projects);
        }
      }
    } catch (error) {
      // Fall through to directory scan
    }

    // Fallback: scan projects directory
    try {
      if (!fs.existsSync(this.projectsDir)) {
        return projects;
      }

      const entries = fs.readdirSync(this.projectsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

        const aiosCorePath = path.join(this.projectsDir, entry.name, '.aios-core');
        if (fs.existsSync(aiosCorePath)) {
          projects.push(entry.name);
        }
      }
    } catch (error) {
      this.log(`Project scan failed: ${error.message}`);
    }

    return projects;
  }

  /**
   * Scan a single project for stories
   * @param {string} projectName - Name of the project
   * @returns {Promise<ProjectStories>}
   */
  async scanProject(projectName) {
    const projectPath = path.join(this.projectsDir, projectName);
    const storiesDir = path.join(projectPath, 'docs', 'stories');

    const result = {
      lastActivity: null,
      stories: [],
    };

    if (!fs.existsSync(storiesDir)) {
      return result;
    }

    // Discover story files
    const storyFiles = await this.discoverStoryFiles(storiesDir);

    // Parse each story file
    for (const filePath of storyFiles) {
      try {
        const story = await this.parseStoryFile(filePath, projectName);
        if (story) {
          result.stories.push(story);

          // Track last activity
          if (!result.lastActivity || story.lastModified > result.lastActivity) {
            result.lastActivity = story.lastModified;
          }
        }
      } catch (error) {
        this.log(`Failed to parse ${filePath}: ${error.message}`);
      }
    }

    // Sort stories by ID
    result.stories.sort((a, b) => {
      return (a.id || '').localeCompare(b.id || '', undefined, { numeric: true });
    });

    return result;
  }

  /**
   * Discover story files in a directory
   * @param {string} storiesDir - Path to stories directory
   * @returns {Promise<string[]>}
   */
  async discoverStoryFiles(storiesDir) {
    const files = [];

    const scanDir = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            // Recurse into subdirectories (like epics/)
            scanDir(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.md')) {
            // Skip templates and non-story files
            if (entry.name.includes('template') || entry.name.includes('tmpl')) {
              continue;
            }
            // Skip epic files (they're containers, not stories)
            if (entry.name.startsWith('epic-') && entry.name.includes('-epic')) {
              continue;
            }
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read
      }
    };

    scanDir(storiesDir);
    return files;
  }

  /**
   * Parse a story file and extract metadata
   * @param {string} filePath - Path to story file
   * @param {string} projectName - Name of the project
   * @returns {Promise<StoryMetadata|null>}
   */
  async parseStoryFile(filePath, projectName) {
    try {
      // Check file size
      const stats = fs.statSync(filePath);
      if (stats.size > MAX_FILE_SIZE_KB * 1024) {
        this.log(`Skipping large file: ${filePath}`);
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(path.join(this.projectsDir, projectName), filePath);

      // Extract metadata
      const metadata = {
        id: this.extractStoryId(filePath, content),
        title: this.extractTitle(content),
        status: this.extractStatus(content),
        epic: this.extractEpic(content),
        progress: this.extractProgress(content),
        file: relativePath.replace(/\\/g, '/'),
        lastModified: stats.mtime.toISOString(),
      };

      // Skip if not a valid story (no title or id)
      if (!metadata.title && !metadata.id) {
        return null;
      }

      return metadata;

    } catch (error) {
      throw new Error(`Parse error: ${error.message}`);
    }
  }

  /**
   * Extract story ID from filename or content
   * @param {string} filePath - File path
   * @param {string} content - File content
   * @returns {string|null}
   */
  extractStoryId(filePath, content) {
    // Try filename first (e.g., "1.1.story.md" -> "1.1")
    const basename = path.basename(filePath, '.md');
    const idMatch = basename.match(/^(\d+\.\d+)/);
    if (idMatch) {
      return idMatch[1];
    }

    // Try Story ID in content
    const contentMatch = content.match(/\*\*Story ID:\*\*\s*([A-Z0-9.-]+)/i);
    if (contentMatch) {
      return contentMatch[1];
    }

    // Try from first heading (e.g., "# Story 1.1: Title")
    const headingMatch = content.match(/^#\s*(?:Story\s+)?(\d+\.\d+)/m);
    if (headingMatch) {
      return headingMatch[1];
    }

    return null;
  }

  /**
   * Extract title from content
   * @param {string} content - File content
   * @returns {string|null}
   */
  extractTitle(content) {
    // Try first heading
    const headingMatch = content.match(/^#\s+(.+?)(?:\n|$)/m);
    if (headingMatch) {
      let title = headingMatch[1].trim();
      // Remove "Story X.X:" prefix if present
      title = title.replace(/^Story\s+\d+\.\d+:\s*/i, '');
      return title;
    }

    // Try title in frontmatter
    const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (yamlMatch) {
      try {
        const frontmatter = yaml.load(yamlMatch[1]);
        if (frontmatter.title) {
          return frontmatter.title;
        }
      } catch (e) {
        // Invalid YAML, ignore
      }
    }

    return null;
  }

  /**
   * Extract status from content
   * @param {string} content - File content
   * @returns {string}
   */
  extractStatus(content) {
    // Pattern 1: **Status:** Done
    const boldMatch = content.match(/\*\*Status:\*\*\s*(\w+)/i);
    if (boldMatch && VALID_STATUSES.includes(boldMatch[1])) {
      return boldMatch[1];
    }

    // Pattern 2: Status: InProgress
    const plainMatch = content.match(/^Status:\s*(\w+)/im);
    if (plainMatch && VALID_STATUSES.includes(plainMatch[1])) {
      return plainMatch[1];
    }

    // Pattern 3: status: in YAML frontmatter
    const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (yamlMatch) {
      try {
        const frontmatter = yaml.load(yamlMatch[1]);
        if (frontmatter.status && VALID_STATUSES.includes(frontmatter.status)) {
          return frontmatter.status;
        }
      } catch (e) {
        // Invalid YAML, ignore
      }
    }

    return 'Draft'; // Default
  }

  /**
   * Extract epic reference from content
   * @param {string} content - File content
   * @returns {string|null}
   */
  extractEpic(content) {
    // Pattern: **Epic:** Epic 1 - Foundation
    const epicMatch = content.match(/\*\*Epic:\*\*\s*(?:Epic\s+)?(\d+)/i);
    if (epicMatch) {
      return epicMatch[1];
    }

    // Pattern: Epic 1 - Title
    const plainMatch = content.match(/^Epic:\s*(?:Epic\s+)?(\d+)/im);
    if (plainMatch) {
      return plainMatch[1];
    }

    return null;
  }

  /**
   * Extract progress (checkbox completion) from content
   * @param {string} content - File content
   * @returns {ProgressInfo}
   */
  extractProgress(content) {
    // Remove code blocks to avoid counting checkboxes inside them
    const contentWithoutCode = content.replace(/```[\s\S]*?```/g, '');

    // Count completed and total checkboxes
    const completed = (contentWithoutCode.match(/- \[x\]/gi) || []).length;
    const pending = (contentWithoutCode.match(/- \[ \]/g) || []).length;
    const total = completed + pending;

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  /**
   * Write hub-stories.json
   * @param {object} hubStories - Consolidated stories data
   */
  async writeHubStories(hubStories) {
    // Ensure .aios directory exists
    const aiosDir = path.dirname(this.hubStoriesPath);
    if (!fs.existsSync(aiosDir)) {
      fs.mkdirSync(aiosDir, { recursive: true });
    }

    fs.writeFileSync(this.hubStoriesPath, JSON.stringify(hubStories, null, 2), 'utf8');
  }

  /**
   * Log message if verbose mode
   * @param {string} message - Message to log
   */
  log(message) {
    if (this.verbose) {
      console.log(`[ScanStories] ${message}`);
    }
  }
}

// CLI interface
async function main() {
  const scanner = new ScanStories(process.cwd());
  const result = await scanner.scan();

  console.log(JSON.stringify(result, null, 2));

  if (result.errors.length > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ScanStories, VALID_STATUSES };

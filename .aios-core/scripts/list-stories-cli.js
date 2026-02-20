#!/usr/bin/env node
/**
 * list-stories CLI - List all stories from all projects
 *
 * Usage:
 *   node list-stories-cli.js [--project name] [--status status] [--epic number] [--refresh] [--json]
 *
 * @module scripts/list-stories-cli
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Status icons for visual display
const STATUS_ICONS = {
  Draft: '📝',
  Ready: '✅',
  InProgress: '🔄',
  InReview: '👀',
  Done: '✔️',
  Blocked: '🚫',
  Unknown: '❓',
};

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Parse command line arguments
 * @returns {Object}
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    project: null,
    status: null,
    epic: null,
    refresh: false,
    json: false,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--project' && args[i + 1]) {
      options.project = args[++i];
    } else if (arg === '--status' && args[i + 1]) {
      options.status = args[++i];
    } else if (arg === '--epic' && args[i + 1]) {
      options.epic = args[++i];
    } else if (arg === '--refresh') {
      options.refresh = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    }
  }

  return options;
}

/**
 * Check if cache is stale (> 5 minutes old)
 * @param {string} hubStoriesPath - Path to hub-stories.json
 * @returns {boolean}
 */
function isCacheStale(hubStoriesPath) {
  try {
    const content = fs.readFileSync(hubStoriesPath, 'utf8');
    const data = JSON.parse(content);
    const lastSync = new Date(data.lastSync).getTime();
    return Date.now() - lastSync > CACHE_TTL_MS;
  } catch {
    return true;
  }
}

/**
 * Run scan-stories to refresh cache
 */
async function refreshCache() {
  const { ScanStories } = require('./scan-stories');
  const scanner = new ScanStories(process.cwd());
  await scanner.scan();
}

/**
 * Load stories from cache
 * @param {string} hubStoriesPath - Path to hub-stories.json
 * @returns {Object}
 */
function loadStories(hubStoriesPath) {
  try {
    const content = fs.readFileSync(hubStoriesPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to load hub-stories.json:', error.message);
    return { projects: {}, summary: {} };
  }
}

/**
 * Filter stories based on options
 * @param {Object} data - hub-stories data
 * @param {Object} options - Filter options
 * @returns {Array}
 */
function filterStories(data, options) {
  const stories = [];

  for (const [projectName, projectData] of Object.entries(data.projects || {})) {
    for (const story of projectData.stories || []) {
      // Apply project filter
      if (options.project && projectName !== options.project && projectName !== `_${options.project}`) {
        continue;
      }

      // Apply status filter
      if (options.status && story.status !== options.status) {
        continue;
      }

      // Apply epic filter
      if (options.epic && story.epic !== options.epic && story.epic !== String(options.epic)) {
        continue;
      }

      stories.push({
        project: projectName,
        ...story,
      });
    }
  }

  return stories;
}

/**
 * Format stories as JSON output
 * @param {Array} stories - Filtered stories
 * @param {Object} summary - Summary data
 * @returns {string}
 */
function formatJsonOutput(stories, summary) {
  return JSON.stringify({
    summary: {
      total: stories.length,
      byStatus: stories.reduce((acc, s) => {
        acc[s.status] = (acc[s.status] || 0) + 1;
        return acc;
      }, {}),
    },
    stories,
  }, null, 2);
}

/**
 * Format stories as table output
 * @param {Array} stories - Filtered stories
 * @returns {string}
 */
function formatTableOutput(stories) {
  if (stories.length === 0) {
    return 'No stories found matching filters.';
  }

  // Calculate column widths
  const projectWidth = Math.max(10, ...stories.map(s => s.project.length));
  const idWidth = Math.max(4, ...stories.map(s => (s.id || '-').length));
  const titleWidth = 40; // Truncate long titles
  const statusWidth = 12;
  const progressWidth = 10;

  // Header
  const header =
    '┌' + '─'.repeat(projectWidth + 2) +
    '┬' + '─'.repeat(idWidth + 2) +
    '┬' + '─'.repeat(titleWidth + 2) +
    '┬' + '─'.repeat(statusWidth + 2) +
    '┬' + '─'.repeat(progressWidth + 2) + '┐\n';

  const headerRow =
    '│ ' + 'Project'.padEnd(projectWidth) +
    ' │ ' + 'ID'.padEnd(idWidth) +
    ' │ ' + 'Title'.padEnd(titleWidth) +
    ' │ ' + 'Status'.padEnd(statusWidth) +
    ' │ ' + 'Progress'.padEnd(progressWidth) + ' │\n';

  const separator =
    '├' + '─'.repeat(projectWidth + 2) +
    '┼' + '─'.repeat(idWidth + 2) +
    '┼' + '─'.repeat(titleWidth + 2) +
    '┼' + '─'.repeat(statusWidth + 2) +
    '┼' + '─'.repeat(progressWidth + 2) + '┤\n';

  // Rows
  const rows = stories.map(story => {
    const project = story.project.padEnd(projectWidth);
    const id = (story.id || '-').padEnd(idWidth);
    const title = truncate(story.title || 'Untitled', titleWidth).padEnd(titleWidth);
    const icon = STATUS_ICONS[story.status] || STATUS_ICONS.Unknown;
    const status = `${icon} ${story.status || 'Unknown'}`.padEnd(statusWidth);
    const progress = story.progress
      ? `${story.progress.completed}/${story.progress.total} (${story.progress.percentage}%)`.padEnd(progressWidth)
      : '-'.padEnd(progressWidth);

    return `│ ${project} │ ${id} │ ${title} │ ${status} │ ${progress} │`;
  }).join('\n');

  // Footer
  const footer =
    '\n└' + '─'.repeat(projectWidth + 2) +
    '┴' + '─'.repeat(idWidth + 2) +
    '┴' + '─'.repeat(titleWidth + 2) +
    '┴' + '─'.repeat(statusWidth + 2) +
    '┴' + '─'.repeat(progressWidth + 2) + '┘';

  // Summary line
  const summary = `\n\n📊 Total: ${stories.length} story(ies)`;

  return header + headerRow + separator + rows + footer + summary;
}

/**
 * Truncate string to max length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string}
 */
function truncate(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Main function
 */
async function main() {
  const startTime = Date.now();
  const options = parseArgs();
  const hubStoriesPath = path.join(process.cwd(), '.aios', 'hub-stories.json');

  // Check if refresh is needed
  const needsRefresh = options.refresh || !fs.existsSync(hubStoriesPath) || isCacheStale(hubStoriesPath);

  if (needsRefresh) {
    if (options.verbose) {
      console.log('Refreshing story cache...');
    }
    await refreshCache();
  }

  // Load and filter stories
  const data = loadStories(hubStoriesPath);
  const stories = filterStories(data, options);

  // Format output
  if (options.json) {
    console.log(formatJsonOutput(stories, data.summary));
  } else {
    console.log(formatTableOutput(stories));
  }

  if (options.verbose) {
    const duration = Date.now() - startTime;
    console.log(`\n⏱️  Completed in ${duration}ms`);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

module.exports = { listStories: main, filterStories, formatTableOutput };

#!/usr/bin/env node
/**
 * Hub List Projects Command
 *
 * Lists all Hub projects with their status, last activity, and active story/epic.
 *
 * Usage:
 *   node hub-list-projects.js [--status active|paused|archived]
 *
 * @module scripts/hub-list-projects
 */

'use strict';

const fs = require('fs');
const path = require('path');

const VALID_STATUSES = ['active', 'paused', 'archived'];

/**
 * Format ISO date string to readable format
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(isoString) {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return '-';
  }
}

/**
 * Format projects as ASCII table
 * @param {Array} projects - List of projects
 * @returns {string} Formatted table string
 */
function formatTable(projects) {
  if (projects.length === 0) {
    return 'No projects found.';
  }

  const headers = ['Name', 'Status', 'Last Activity', 'Story', 'Epic'];
  const rows = projects.map(p => [
    p.name || '-',
    p.status || '-',
    formatDate(p.lastActivity),
    p.activeStory || '-',
    p.activeEpic || '-'
  ]);

  // Calculate column widths
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => Math.min(r[i].length, 20)))
  );

  // Truncate long values
  const truncatedRows = rows.map(row =>
    row.map((cell, i) => cell.length > widths[i] ? cell.substring(0, widths[i] - 3) + '...' : cell)
  );

  // Build table
  const border = '┌' + widths.map(w => '─'.repeat(w + 2)).join('┬') + '┐';
  const separator = '├' + widths.map(w => '─'.repeat(w + 2)).join('┼') + '┤';
  const bottom = '└' + widths.map(w => '─'.repeat(w + 2)).join('┴') + '┘';

  const formatRow = (row) => '│ ' + row.map((cell, i) => cell.padEnd(widths[i])).join(' │ ') + ' │';

  let output = border + '\n';
  output += formatRow(headers) + '\n';
  output += separator + '\n';
  output += truncatedRows.map(formatRow).join('\n') + '\n';
  output += bottom;

  return output;
}

/**
 * Main function to list projects
 * @param {string[]} args - Command line arguments
 */
function listProjects(args = []) {
  const hubRoot = process.cwd();
  const hubContextPath = path.join(hubRoot, '.aios', 'hub-context.json');

  // Check if hub-context.json exists
  if (!fs.existsSync(hubContextPath)) {
    console.log('');
    console.log('⚠️  Hub context not found.');
    console.log('   Run: node .aios-core/scripts/sync-projects.js');
    console.log('');
    return { success: false, error: 'HUB_CONTEXT_NOT_FOUND' };
  }

  // Load hub context
  let hubContext;
  try {
    const content = fs.readFileSync(hubContextPath, 'utf8');
    hubContext = JSON.parse(content);
  } catch (error) {
    console.log('');
    console.log('❌ Failed to parse hub-context.json:', error.message);
    console.log('');
    return { success: false, error: 'PARSE_ERROR' };
  }

  const projects = hubContext.projects || {};

  // Parse status filter
  const statusIndex = args.indexOf('--status');
  const statusFilter = statusIndex !== -1 && args[statusIndex + 1]
    ? args[statusIndex + 1].toLowerCase()
    : null;

  if (statusFilter && !VALID_STATUSES.includes(statusFilter)) {
    console.log('');
    console.log(`❌ Invalid status filter: ${statusFilter}`);
    console.log(`   Valid options: ${VALID_STATUSES.join(', ')}`);
    console.log('');
    return { success: false, error: 'INVALID_STATUS' };
  }

  // Convert to array and filter
  let projectList = Object.entries(projects).map(([name, data]) => ({
    name,
    ...data
  }));

  if (statusFilter) {
    projectList = projectList.filter(p => p.status === statusFilter);
  }

  // Sort by last activity (most recent first)
  projectList.sort((a, b) => {
    const dateA = new Date(a.lastActivity);
    const dateB = new Date(b.lastActivity);
    return dateB - dateA;
  });

  // Display output
  const summary = hubContext.summary || {};
  const total = statusFilter ? projectList.length : (summary.total || projectList.length);

  console.log('');
  console.log(`📁 Hub Projects (${total} total)`);
  console.log('');

  if (projectList.length === 0) {
    if (statusFilter) {
      console.log(`   No ${statusFilter} projects found.`);
    } else {
      console.log('   No projects registered yet.');
      console.log('   Use *create-project {nome} to create one.');
    }
    console.log('');
    return { success: true, projects: [], total: 0 };
  }

  console.log(formatTable(projectList));
  console.log('');

  // Show summary
  if (!statusFilter && summary) {
    console.log(`   Summary: ${summary.active || 0} active, ${summary.paused || 0} paused, ${summary.archived || 0} archived`);
    console.log('');
  }

  return {
    success: true,
    projects: projectList,
    total: projectList.length
  };
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  listProjects(args);
}

module.exports = { listProjects, formatTable, formatDate };

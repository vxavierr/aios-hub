#!/usr/bin/env node
/**
 * Hub Project Status Command
 *
 * Shows detailed status of a specific project or current project.
 *
 * Usage:
 *   node hub-project-status.js [{nome}]
 *
 * @module scripts/hub-project-status
 */

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

const SESSION_STATE_PATH = '.aios/session-state.json';
const HUB_CONTEXT_PATH = '.aios/hub-context.json';
const ENTITY_REGISTRY_PATH = '.aios-core/data/entity-registry.yaml';

/**
 * Get current session state
 * @param {string} hubRoot - Hub root path
 * @returns {object} Session state
 */
function getSessionState(hubRoot) {
  const sessionPath = path.join(hubRoot, SESSION_STATE_PATH);

  if (fs.existsSync(sessionPath)) {
    try {
      const content = fs.readFileSync(sessionPath, 'utf8');
      return JSON.parse(content);
    } catch {
      // Return default state on error
    }
  }

  return {
    version: '1.0',
    hubRoot: hubRoot,
    currentContext: 'hub',
    currentProject: null
  };
}

/**
 * Get project data from registry
 * @param {string} hubRoot - Hub root path
 * @param {string} projectName - Project name
 * @returns {object|null} Project data
 */
function getProjectData(hubRoot, projectName) {
  // Check hub-context.json first
  const hubContextPath = path.join(hubRoot, HUB_CONTEXT_PATH);
  if (fs.existsSync(hubContextPath)) {
    const hubContext = JSON.parse(fs.readFileSync(hubContextPath, 'utf8'));
    if (hubContext.projects && hubContext.projects[projectName]) {
      return hubContext.projects[projectName];
    }
  }

  // Check entity-registry.yaml
  const registryPath = path.join(hubRoot, ENTITY_REGISTRY_PATH);
  if (fs.existsSync(registryPath)) {
    const registry = yaml.load(fs.readFileSync(registryPath, 'utf8'));
    if (registry.entities && registry.entities.projects && registry.entities.projects[projectName]) {
      return registry.entities.projects[projectName];
    }
  }

  return null;
}

/**
 * Get project status from project-status.yaml
 * @param {string} hubRoot - Hub root path
 * @param {string} projectName - Project name
 * @returns {object|null} Project status
 */
function getProjectStatus(hubRoot, projectName) {
  const statusPath = path.join(hubRoot, 'projects', projectName, '.aios', 'project-status.yaml');

  if (fs.existsSync(statusPath)) {
    try {
      const content = fs.readFileSync(statusPath, 'utf8');
      return yaml.load(content);
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Get recent git commits for project
 * @param {string} projectPath - Project path
 * @param {number} limit - Number of commits to return
 * @returns {Array} List of commits
 */
function getRecentCommits(projectPath, limit = 5) {
  try {
    // Check if project is a git repo
    if (!fs.existsSync(path.join(projectPath, '.git'))) {
      return [];
    }

    const output = execSync(
      `git log --oneline -${limit} --format="%h|%s|%ci|%an"`,
      { cwd: projectPath, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );

    return output.trim().split('\n').filter(Boolean).map(line => {
      const [hash, message, date, author] = line.split('|');
      return { hash, message, date, author };
    });
  } catch {
    return [];
  }
}

/**
 * Detect potential blockers
 * @param {object} projectStatus - Project status data
 * @returns {Array} List of blockers
 */
function detectBlockers(projectStatus) {
  const blockers = [];

  if (!projectStatus || !projectStatus.status) {
    return blockers;
  }

  // Check for modified files
  if (projectStatus.status.modifiedFilesTotalCount > 0) {
    blockers.push(`${projectStatus.status.modifiedFilesTotalCount} arquivos modificados não commitados`);
  }

  // Check for modified files list
  if (projectStatus.status.modifiedFiles && projectStatus.status.modifiedFiles.length > 0) {
    blockers.push(`${projectStatus.status.modifiedFiles.length} arquivos pendentes`);
  }

  return blockers;
}

/**
 * Format date for display
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(isoString) {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '-';
  }
}

/**
 * Display project status
 * @param {string} projectName - Project name
 * @param {object} projectData - Project data from registry
 * @param {object} projectStatus - Project status
 * @param {Array} commits - Recent commits
 * @param {Array} blockers - Detected blockers
 * @param {boolean} compact - Show compact format
 */
function displayStatus(projectName, projectData, projectStatus, commits, blockers, compact = false) {
  if (compact) {
    // Compact format for current project mode
    const status = projectData?.status || 'active';
    const epic = projectStatus?.status?.currentEpic || '-';
    const story = projectStatus?.status?.currentStory || '-';
    console.log(`📊 ${projectName} | ${status} | Epic ${epic} | Story ${story}`);
    return;
  }

  // Full format
  console.log('');
  console.log(`📊 Status do Projeto: ${projectName}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // General info
  console.log('📁 Informações Gerais');
  console.log(`├── Status: ${projectData?.status || 'active'}`);
  console.log(`├── Última atividade: ${formatDate(projectData?.lastActivity)}`);

  if (projectData?.techStack && projectData.techStack.length > 0) {
    console.log(`├── Tech Stack: ${projectData.techStack.join(', ')}`);
  }

  if (projectStatus?.project?.created) {
    console.log(`└── Criado em: ${formatDate(projectStatus.project.created)}`);
  } else {
    console.log('└── Criado em: -');
  }

  console.log('');

  // Epic and Story
  if (projectStatus?.status) {
    const epic = projectStatus.status.currentEpic;
    const story = projectStatus.status.currentStory;

    if (epic) {
      console.log(`🎯 Epic Ativo: ${epic}`);
    }
    if (story) {
      console.log(`📋 Story Ativa: ${story}`);
    }
  }

  console.log('');

  // Recent commits
  if (commits.length > 0) {
    console.log(`📝 Últimos Commits (${commits.length})`);
    commits.forEach((commit, i) => {
      const prefix = i === commits.length - 1 ? '└──' : '├──';
      const shortDate = commit.date ? commit.date.substring(0, 10) : '-';
      console.log(`${prefix} ${commit.hash} - ${commit.message} (${shortDate})`);
    });
    console.log('');
  }

  // Blockers
  if (blockers.length > 0) {
    console.log('⚠️  Blockers Detectados');
    blockers.forEach((blocker, i) => {
      const prefix = i === blockers.length - 1 ? '└──' : '├──';
      console.log(`${prefix} ${blocker}`);
    });
    console.log('');
  }
}

/**
 * Main function to show project status
 * @param {string[]} args - Command line arguments
 */
function projectStatus(args = []) {
  const hubRoot = process.cwd();
  const projectName = args[0];

  // Determine which project to show
  let targetProject = projectName;

  if (!targetProject) {
    // Check if we're in a project context
    const sessionState = getSessionState(hubRoot);
    if (sessionState.currentContext === 'project' && sessionState.currentProject) {
      targetProject = sessionState.currentProject;
    } else {
      console.log('');
      console.log('❌ No project specified and not in project context.');
      console.log('   Usage: *project-status {nome}');
      console.log('   Or switch to a project first: *switch-project {nome}');
      console.log('');
      return { success: false, error: 'NO_PROJECT' };
    }
  }

  // Get project data
  const projectData = getProjectData(hubRoot, targetProject);
  if (!projectData) {
    console.log('');
    console.log(`❌ Project "${targetProject}" not found.`);
    console.log('   Use *list-projects to see available projects.');
    console.log('');
    return { success: false, error: 'PROJECT_NOT_FOUND' };
  }

  // Get project status
  const projectStatus = getProjectStatus(hubRoot, targetProject);

  // Get commits
  const projectPath = path.join(hubRoot, 'projects', targetProject);
  const commits = getRecentCommits(projectPath, 5);

  // Detect blockers
  const blockers = detectBlockers(projectStatus);

  // Determine if compact mode (no argument, in project context)
  const compact = !projectName;

  // Display status
  displayStatus(targetProject, projectData, projectStatus, commits, blockers, compact);

  return {
    success: true,
    project: targetProject
  };
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  projectStatus(args);
}

module.exports = {
  projectStatus,
  getProjectData,
  getProjectStatus,
  getRecentCommits,
  detectBlockers
};

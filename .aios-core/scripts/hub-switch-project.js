#!/usr/bin/env node
/**
 * Hub Switch Project Command
 *
 * Switches context to a specific project, updating session state.
 *
 * Usage:
 *   node hub-switch-project.js {nome}
 *
 * @module scripts/hub-switch-project
 */

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

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
    currentProject: null,
    switchedAt: null,
    history: []
  };
}

/**
 * Save session state
 * @param {string} hubRoot - Hub root path
 * @param {object} state - Session state
 */
function saveSessionState(hubRoot, state) {
  const aiosDir = path.join(hubRoot, '.aios');

  if (!fs.existsSync(aiosDir)) {
    fs.mkdirSync(aiosDir, { recursive: true });
  }

  const sessionPath = path.join(hubRoot, SESSION_STATE_PATH);
  fs.writeFileSync(sessionPath, JSON.stringify(state, null, 2), 'utf8');
}

/**
 * Check if project exists in registry
 * @param {string} hubRoot - Hub root path
 * @param {string} projectName - Project name
 * @returns {object|null} Project data or null
 */
function getProjectFromRegistry(hubRoot, projectName) {
  // First check hub-context.json (faster)
  const hubContextPath = path.join(hubRoot, HUB_CONTEXT_PATH);
  if (fs.existsSync(hubContextPath)) {
    const hubContext = JSON.parse(fs.readFileSync(hubContextPath, 'utf8'));
    if (hubContext.projects && hubContext.projects[projectName]) {
      return hubContext.projects[projectName];
    }
  }

  // Fall back to entity-registry.yaml
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
 * Display project context greeting
 * @param {string} projectName - Project name
 * @param {object} projectData - Project data from registry
 * @param {object} projectStatus - Project status
 */
function displayProjectGreeting(projectName, projectData, projectStatus) {
  console.log('');
  console.log(`👑 AIOS Master — Projeto: ${projectName}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Status
  const status = projectData?.status || 'active';
  console.log(`📁 Status: ${status}`);

  // Epic and Story
  if (projectStatus && projectStatus.status) {
    if (projectStatus.status.currentEpic) {
      console.log(`🎯 Epic ativo: ${projectStatus.status.currentEpic}`);
    }
    if (projectStatus.status.currentStory) {
      console.log(`📋 Story ativa: ${projectStatus.status.currentStory}`);
    }
  }

  console.log('');
  console.log('Comandos: *hub (voltar ao Hub) | *help');
  console.log('');
}

/**
 * Main function to switch project
 * @param {string[]} args - Command line arguments
 */
function switchProject(args = []) {
  const hubRoot = process.cwd();
  const projectName = args[0];

  if (!projectName) {
    console.log('');
    console.log('❌ Project name is required.');
    console.log('   Usage: *switch-project {nome}');
    console.log('');
    return { success: false, error: 'NAME_REQUIRED' };
  }

  // Check if project exists
  const projectData = getProjectFromRegistry(hubRoot, projectName);
  if (!projectData) {
    console.log('');
    console.log(`❌ Project "${projectName}" not found.`);
    console.log('   Use *list-projects to see available projects.');
    console.log('');
    return { success: false, error: 'PROJECT_NOT_FOUND' };
  }

  // Get current session state
  const sessionState = getSessionState(hubRoot);
  const previousContext = sessionState.currentContext;
  const previousProject = sessionState.currentProject;

  // Update session state
  const now = new Date().toISOString();
  sessionState.currentContext = 'project';
  sessionState.currentProject = projectName;
  sessionState.switchedAt = now;

  // Add to history
  if (!sessionState.history) {
    sessionState.history = [];
  }
  sessionState.history.push({
    from: previousContext === 'project' ? previousProject : 'hub',
    to: projectName,
    at: now
  });

  // Keep only last 20 history entries
  if (sessionState.history.length > 20) {
    sessionState.history = sessionState.history.slice(-20);
  }

  // Save session state
  saveSessionState(hubRoot, sessionState);

  // Get project status
  const projectStatus = getProjectStatus(hubRoot, projectName);

  // Display greeting
  displayProjectGreeting(projectName, projectData, projectStatus);

  return {
    success: true,
    project: projectName,
    context: 'project'
  };
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  switchProject(args);
}

module.exports = {
  switchProject,
  getSessionState,
  saveSessionState,
  getProjectFromRegistry,
  getProjectStatus
};

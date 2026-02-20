#!/usr/bin/env node
/**
 * Hub Return Command
 *
 * Returns context to Hub from project context.
 *
 * Usage:
 *   node hub-return.js
 *
 * @module scripts/hub-return
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SESSION_STATE_PATH = '.aios/session-state.json';
const HUB_CONTEXT_PATH = '.aios/hub-context.json';

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
 * Get hub summary from hub-context.json
 * @param {string} hubRoot - Hub root path
 * @returns {object|null} Hub summary
 */
function getHubSummary(hubRoot) {
  const hubContextPath = path.join(hubRoot, HUB_CONTEXT_PATH);

  if (fs.existsSync(hubContextPath)) {
    try {
      const content = fs.readFileSync(hubContextPath, 'utf8');
      const hubContext = JSON.parse(content);
      return hubContext.summary || null;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Display Hub greeting
 * @param {object} summary - Hub summary
 */
function displayHubGreeting(summary) {
  console.log('');
  console.log('👑 AIOS Master — Hub Context');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  if (summary) {
    console.log(`📁 Projetos: ${summary.total || 0} total`);
    console.log(`   🟢 Active: ${summary.active || 0}`);
    console.log(`   🟡 Paused: ${summary.paused || 0}`);
    console.log(`   ⚫ Archived: ${summary.archived || 0}`);
  } else {
    console.log('📁 Hub Projects');
    console.log('   Use *list-projects to see all projects');
  }

  console.log('');
  console.log('Comandos: *switch-project {nome} | *list-projects | *help');
  console.log('');
}

/**
 * Main function to return to Hub
 */
function returnToHub() {
  const hubRoot = process.cwd();

  // Get current session state
  const sessionState = getSessionState(hubRoot);
  const previousProject = sessionState.currentProject;

  // Check if already in Hub context
  if (sessionState.currentContext === 'hub') {
    console.log('');
    console.log('ℹ️  Already in Hub context.');
    const summary = getHubSummary(hubRoot);
    displayHubGreeting(summary);
    return { success: true, context: 'hub' };
  }

  // Update session state
  const now = new Date().toISOString();
  sessionState.currentContext = 'hub';
  sessionState.currentProject = null;
  sessionState.switchedAt = now;

  // Add to history
  if (!sessionState.history) {
    sessionState.history = [];
  }
  sessionState.history.push({
    from: previousProject || 'unknown',
    to: 'hub',
    at: now
  });

  // Keep only last 20 history entries
  if (sessionState.history.length > 20) {
    sessionState.history = sessionState.history.slice(-20);
  }

  // Save session state
  saveSessionState(hubRoot, sessionState);

  // Get hub summary
  const summary = getHubSummary(hubRoot);

  // Display greeting
  console.log('');
  console.log(`✅ Switched from "${previousProject}" to Hub`);
  displayHubGreeting(summary);

  return {
    success: true,
    context: 'hub',
    previousProject
  };
}

// CLI interface
if (require.main === module) {
  returnToHub();
}

module.exports = {
  returnToHub,
  getSessionState,
  saveSessionState
};

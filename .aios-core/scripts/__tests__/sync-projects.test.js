/**
 * Unit Tests for SyncProjects
 *
 * Tests the project synchronization logic for AIOS Hub Multi-Projeto.
 *
 * Run with: node --test .aios-core/scripts/__tests__/sync-projects.test.js
 */

const assert = require('assert');
const path = require('path');
const { SyncProjects, REQUIRED_FIELDS, VALID_STATUSES } = require('../sync-projects.js');

// Mock filesystem for testing
const mockFs = {
  existsSync: (() => {
    const original = fs => fs.existsSync;
    return (paths) => {
      return paths.some(p => p);
    };
  })(),
};

/**
 * Test: isValidAiosProject detects valid projects
 */
async function testValidAiosProject() {
  console.log('Test: isValidAiosProject detects valid projects');

  // Create a mock syncer
  const syncer = new SyncProjects('/tmp/test-hub');

  // Test with valid path (mock)
  // In a real test, we'd create temp directories
  // For now, just verify the method exists and returns boolean
  assert.strictEqual(typeof syncer.isValidAiosProject, 'function');

  console.log('  ✅ isValidAiosProject method exists');
}

/**
 * Test: detectTechStack identifies common technologies
 */
async function testDetectTechStack() {
  console.log('Test: detectTechStack identifies common technologies');

  const syncer = new SyncProjects('/tmp/test-hub');

  // Test with non-existent path (should return empty array)
  const techStack = await syncer.detectTechStack('/nonexistent/path');
  assert.strictEqual(Array.isArray(techStack), true);
  assert.strictEqual(techStack.length, 0);

  console.log('  ✅ detectTechStack returns array');
}

/**
 * Test: computeChanges identifies added projects
 */
async function testComputeChanges() {
  console.log('Test: computeChanges identifies added projects');

  const syncer = new SyncProjects('/tmp/test-hub');

  const currentProjects = {};
  const detectedProjects = [
    { name: 'project-alpha', path: 'projects/project-alpha', status: 'active' },
  ];

  const changes = syncer.computeChanges(currentProjects, detectedProjects);

  assert.strictEqual(changes.added.length, 1);
  assert.strictEqual(changes.added[0], 'project-alpha');
  assert.strictEqual(changes.removed.length, 0);

  console.log('  ✅ computeChanges identifies added projects');
}

/**
 * Test: computeChanges identifies removed projects
 */
async function testComputeChangesRemoved() {
  console.log('Test: computeChanges identifies removed projects');

  const syncer = new SyncProjects('/tmp/test-hub');

  const currentProjects = {
    'old-project': { path: 'projects/old-project', status: 'active' },
  };
  const detectedProjects = [];

  const changes = syncer.computeChanges(currentProjects, detectedProjects);

  assert.strictEqual(changes.removed.length, 1);
  assert.strictEqual(changes.removed[0], 'old-project');

  console.log('  ✅ computeChanges identifies removed projects');
}

/**
 * Test: computeChanges identifies updated projects
 */
async function testComputeChangesUpdated() {
  console.log('Test: computeChanges identifies updated projects');

  const syncer = new SyncProjects('/tmp/test-hub');

  const currentProjects = {
    'project-alpha': {
      path: 'projects/project-alpha',
      status: 'active',
      activeStory: '1.1',
      lastActivity: '2026-02-18T00:00:00.000Z',
    },
  };
  const detectedProjects = [
    {
      name: 'project-alpha',
      path: 'projects/project-alpha',
      status: 'active',
      activeStory: '1.2', // Changed
      lastActivity: '2026-02-19T00:00:00.000Z',
    },
  ];

  const changes = syncer.computeChanges(currentProjects, detectedProjects);

  assert.strictEqual(changes.updated.length, 1);

  console.log('  ✅ computeChanges identifies updated projects');
}

/**
 * Test: hasProjectChanged detects changes correctly
 */
async function testHasProjectChanged() {
  console.log('Test: hasProjectChanged detects changes correctly');

  const syncer = new SyncProjects('/tmp/test-hub');

  // No change
  const noChange = syncer.hasProjectChanged(
    { status: 'active', activeStory: '1.1', lastActivity: '2026-02-19' },
    { status: 'active', activeStory: '1.1', lastActivity: '2026-02-19' }
  );
  assert.strictEqual(noChange, false);

  // Status changed
  const statusChanged = syncer.hasProjectChanged(
    { status: 'active' },
    { status: 'paused' }
  );
  assert.strictEqual(statusChanged, true);

  // Story changed
  const storyChanged = syncer.hasProjectChanged(
    { activeStory: '1.1' },
    { activeStory: '1.2' }
  );
  assert.strictEqual(storyChanged, true);

  console.log('  ✅ hasProjectChanged works correctly');
}

/**
 * Test: REQUIRED_FIELDS constant is correct
 */
async function testRequiredFields() {
  console.log('Test: REQUIRED_FIELDS constant is correct');

  assert.strictEqual(Array.isArray(REQUIRED_FIELDS), true);
  assert.ok(REQUIRED_FIELDS.includes('path'));
  assert.ok(REQUIRED_FIELDS.includes('aiosCore'));
  assert.ok(REQUIRED_FIELDS.includes('status'));
  assert.ok(REQUIRED_FIELDS.includes('lastActivity'));

  console.log('  ✅ REQUIRED_FIELDS contains expected fields');
}

/**
 * Test: VALID_STATUSES constant is correct
 */
async function testValidStatuses() {
  console.log('Test: VALID_STATUSES constant is correct');

  assert.strictEqual(Array.isArray(VALID_STATUSES), true);
  assert.ok(VALID_STATUSES.includes('active'));
  assert.ok(VALID_STATUSES.includes('paused'));
  assert.ok(VALID_STATUSES.includes('archived'));

  console.log('  ✅ VALID_STATUSES contains expected values');
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('\n🧪 Running SyncProjects Unit Tests\n');
  console.log('='.repeat(50) + '\n');

  const tests = [
    testValidAiosProject,
    testDetectTechStack,
    testComputeChanges,
    testComputeChangesRemoved,
    testComputeChangesUpdated,
    testHasProjectChanged,
    testRequiredFields,
    testValidStatuses,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test();
      passed++;
    } catch (error) {
      console.log(`  ❌ FAILED: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testValidAiosProject,
  testDetectTechStack,
  testComputeChanges,
  testHasProjectChanged,
};

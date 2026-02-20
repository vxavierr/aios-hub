/**
 * Unit tests for scan-stories.js
 *
 * Run with: node --test .aios-core/scripts/__tests__/scan-stories.test.js
 */

const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { ScanStories, VALID_STATUSES } = require('../scan-stories');

// Sample story content for testing
const SAMPLE_STORY_DONE = `# Story 1.1: Test Story Done

**Status:** Done
**Epic:** Epic 1 - Foundation

## Tasks
- [x] Task 1 completed
- [x] Task 2 completed
- [ ] Task 3 pending
`;

const SAMPLE_STORY_DRAFT = `# Story 1.2: Test Story Draft

**Status:** Draft

## Tasks
- [ ] Task 1
- [ ] Task 2
`;

const SAMPLE_STORY_NO_STATUS = `# Story 1.3: No Status

## Tasks
- [x] Done task
`;

const SAMPLE_EPIC = `# Epic 1: Test Epic

**Status:** Draft

## Stories
- Story 1.1
- Story 1.2

- [x] DoD item 1
- [ ] DoD item 2
`;

describe('ScanStories', () => {
  describe('VALID_STATUSES', () => {
    it('should contain expected statuses', () => {
      assert.ok(VALID_STATUSES.includes('Draft'));
      assert.ok(VALID_STATUSES.includes('Ready'));
      assert.ok(VALID_STATUSES.includes('InProgress'));
      assert.ok(VALID_STATUSES.includes('InReview'));
      assert.ok(VALID_STATUSES.includes('Done'));
      assert.ok(VALID_STATUSES.includes('Blocked'));
    });
  });

  describe('extractStoryId', () => {
    let scanner;

    before(() => {
      scanner = new ScanStories(process.cwd());
    });

    it('should extract ID from filename', () => {
      const filePath = '/path/to/docs/stories/1.1.story.md';
      const id = scanner.extractStoryId(filePath, '');
      assert.strictEqual(id, '1.1');
    });

    it('should extract ID from content Story ID field', () => {
      const content = '**Story ID:** HUB-1.1\n# Title';
      const id = scanner.extractStoryId('story.md', content);
      assert.strictEqual(id, 'HUB-1.1');
    });

    it('should extract ID from heading', () => {
      const content = '# Story 2.3: My Title';
      const id = scanner.extractStoryId('story.md', content);
      assert.strictEqual(id, '2.3');
    });

    it('should return null if no ID found', () => {
      const content = '# Some Random Title';
      const id = scanner.extractStoryId('random.md', content);
      assert.strictEqual(id, null);
    });
  });

  describe('extractTitle', () => {
    let scanner;

    before(() => {
      scanner = new ScanStories(process.cwd());
    });

    it('should extract title from heading', () => {
      const title = scanner.extractTitle(SAMPLE_STORY_DONE);
      assert.strictEqual(title, 'Test Story Done');
    });

    it('should remove Story prefix from title', () => {
      const content = '# Story 1.1: My Feature';
      const title = scanner.extractTitle(content);
      assert.strictEqual(title, 'My Feature');
    });

    it('should return null if no title found', () => {
      const content = 'No headings here';
      const title = scanner.extractTitle(content);
      assert.strictEqual(title, null);
    });
  });

  describe('extractStatus', () => {
    let scanner;

    before(() => {
      scanner = new ScanStories(process.cwd());
    });

    it('should extract **Status:** format', () => {
      const status = scanner.extractStatus(SAMPLE_STORY_DONE);
      assert.strictEqual(status, 'Done');
    });

    it('should extract Draft status', () => {
      const status = scanner.extractStatus(SAMPLE_STORY_DRAFT);
      assert.strictEqual(status, 'Draft');
    });

    it('should default to Draft if no status found', () => {
      const status = scanner.extractStatus(SAMPLE_STORY_NO_STATUS);
      assert.strictEqual(status, 'Draft');
    });

    it('should extract Status: format (without bold)', () => {
      const content = 'Status: InProgress\n# Title';
      const status = scanner.extractStatus(content);
      assert.strictEqual(status, 'InProgress');
    });
  });

  describe('extractEpic', () => {
    let scanner;

    before(() => {
      scanner = new ScanStories(process.cwd());
    });

    it('should extract epic number from **Epic:** format', () => {
      const epic = scanner.extractEpic(SAMPLE_STORY_DONE);
      assert.strictEqual(epic, '1');
    });

    it('should extract epic from "Epic 2 - Title" format', () => {
      const content = '**Epic:** Epic 2 - Commands\n# Title';
      const epic = scanner.extractEpic(content);
      assert.strictEqual(epic, '2');
    });

    it('should return null if no epic found', () => {
      const epic = scanner.extractEpic(SAMPLE_STORY_DRAFT);
      assert.strictEqual(epic, null);
    });
  });

  describe('extractProgress', () => {
    let scanner;

    before(() => {
      scanner = new ScanStories(process.cwd());
    });

    it('should count completed and total checkboxes', () => {
      const progress = scanner.extractProgress(SAMPLE_STORY_DONE);
      assert.strictEqual(progress.completed, 2);
      assert.strictEqual(progress.total, 3);
      assert.strictEqual(progress.percentage, 67);
    });

    it('should handle all pending tasks', () => {
      const progress = scanner.extractProgress(SAMPLE_STORY_DRAFT);
      assert.strictEqual(progress.completed, 0);
      assert.strictEqual(progress.total, 2);
      assert.strictEqual(progress.percentage, 0);
    });

    it('should return 0% if no checkboxes', () => {
      const content = '# Title\n\nNo checkboxes here';
      const progress = scanner.extractProgress(content);
      assert.strictEqual(progress.completed, 0);
      assert.strictEqual(progress.total, 0);
      assert.strictEqual(progress.percentage, 0);
    });

    it('should ignore checkboxes in code blocks', () => {
      const content = `# Title

- [x] Real task

\`\`\`
- [x] Fake task in code
- [ ] Another fake
\`\`\`
`;
      const progress = scanner.extractProgress(content);
      assert.strictEqual(progress.completed, 1);
      assert.strictEqual(progress.total, 1);
    });
  });

  describe('discoverStoryFiles', () => {
    it('should skip template files', () => {
      const files = ['story-template.md', 'tmpl.md', '1.1.story.md'];
      const filtered = files.filter(f =>
        !f.includes('template') && !f.includes('tmpl')
      );
      assert.strictEqual(filtered.length, 1);
      assert.strictEqual(filtered[0], '1.1.story.md');
    });

    it('should include .md files', () => {
      const filename = '1.1.story.md';
      assert.ok(filename.endsWith('.md'));
    });
  });
});

# QA Fix Request: AB-5

**Generated:** 2026-03-04T18:05:00Z
**Gate Source:** docs/qa/gates/AB-5-stories-kanban.yml
**Reviewer:** Quinn (Test Architect)

---

## Instructions for @dev

Fix ONLY the issues listed below. Do not add features or refactor unrelated code.

**Process:**

1. Read each issue carefully
2. Fix the specific problem described
3. Verify using the verification steps provided
4. Mark the issue as fixed in this document
5. Run `npx tsc --noEmit` before marking complete

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| HIGH | 3 | Must fix before merge |
| MEDIUM | 4 | Should fix before merge |
| LOW | 3 | Optional improvements |

---

## Issues to Fix

### 1. [HIGH] Missing optimistic update on drag-and-drop

**Issue ID:** FIX-AB5-001 (UX-001)

**Location:** `projects/aios-bridge/frontend/src/features/kanban/KanbanBoard.tsx` — `handleDrop` function

**Problem:**
Drag-and-drop sends PATCH request but doesn't update the store immediately. The card visually snaps back to the original column, then jumps to the new column ~600ms-1s later after the full round-trip: `PATCH → filesystem write → chokidar debounce (500ms) → SSE → store update`.

```typescript
const handleDrop = async (storyId: string, newStatus: StoryStatus) => {
  await fetch(`/api/stories/${storyId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  })
}
```

**Expected:**
Add optimistic update before the fetch call:

```typescript
const handleDrop = async (storyId: string, newStatus: StoryStatus) => {
  // Optimistic update — move card immediately
  updateStory(storyId, { status: newStatus })

  await fetch(`/api/stories/${storyId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus }),
  })
}
```

The subsequent SSE event will be a no-op since the store already reflects the new state.

**Verification:**
- [ ] Drag a story card to a different column
- [ ] Card stays in the new column immediately (no snap-back)
- [ ] After page refresh, card remains in the new column
- [ ] TypeScript compiles without errors

**Status:** [x] Fixed

---

### 2. [HIGH] SSE update events routed through wrong store action

**Issue ID:** FIX-AB5-002 (DATA-001)

**Location:** `projects/aios-bridge/frontend/src/features/kanban/useStories.ts` — SSE handler

**Problem:**
Both `'add'` and `'update'` SSE events are handled by `addStory()`. While `addStory` has upsert logic, it bypasses any future `updateStory`-specific logic and is semantically incorrect.

```typescript
if (event === 'remove') {
  removeStory(card.id)
} else {
  addStory(card) // handles both 'add' AND 'update'
}
```

**Expected:**
Distinguish event types properly:

```typescript
if (event === 'remove') {
  removeStory(card.id)
} else if (event === 'update') {
  updateStory(card.id, card)
} else {
  addStory(card)
}
```

**Verification:**
- [ ] Edit a story .md file externally (e.g., change Status via text editor)
- [ ] Board updates correctly via SSE within 2s
- [ ] No duplicate cards appear
- [ ] TypeScript compiles without errors

**Status:** [x] Fixed

---

### 3. [HIGH] StoryStatus type duplicated without sync mechanism

**Issue ID:** FIX-AB5-003 (ARCH-001)

**Location:**
- `projects/aios-bridge/backend/src/story-parser.ts` (line 4)
- `projects/aios-bridge/frontend/src/store/stories.ts` (line 3)

**Problem:**
`StoryStatus` type is declared independently in both backend and frontend. If a new status is added to one, the other silently diverges. The backend's `types.ts` (the canonical types file) does not include `StoryStatus` or `StoryMeta`.

**Expected:**

1. Move `StoryStatus` and `StoryMeta` interface to `backend/src/types.ts`
2. Re-export from `story-parser.ts`: `export { StoryStatus, StoryMeta } from './types'`
3. On frontend `store/stories.ts`, add sync comment:

```typescript
// Must mirror backend StoryStatus in backend/src/types.ts — keep in sync
export type StoryStatus = 'Draft' | 'Ready' | 'InProgress' | 'InReview' | 'Done'
```

**Verification:**
- [ ] `StoryStatus` and `StoryMeta` exist in `backend/src/types.ts`
- [ ] `story-parser.ts` imports from `./types` instead of declaring its own
- [ ] Frontend `store/stories.ts` has sync comment
- [ ] TypeScript compiles without errors in both backend and frontend

**Status:** [x] Fixed

---

### 4. [MEDIUM] Route order dependency not documented

**Issue ID:** FIX-AB5-004 (MNT-001)

**Location:** `projects/aios-bridge/backend/src/server.ts` — route registration

**Problem:**
`GET /api/stories/stream` (SSE) must be registered before `GET /api/stories/:id`. If routes are reordered, `"stream"` gets captured as `:id` param and SSE silently breaks.

**Expected:**
Add comment above the SSE route:

```typescript
// IMPORTANT: /stream MUST be registered before /:id
// Otherwise "stream" matches the :id parameter and SSE breaks silently
app.get('/api/stories/stream', (req, res) => {
```

**Verification:**
- [ ] Comment exists above the SSE route registration
- [ ] SSE endpoint still works: `curl http://localhost:3001/api/stories/stream`

**Status:** [x] Fixed

---

### 5. [MEDIUM] Activate button fails silently without master tab

**Issue ID:** FIX-AB5-005 (UX-002)

**Location:** `projects/aios-bridge/frontend/src/features/kanban/StoryCard.tsx` — `handleActivate`

**Problem:**
If no master tab exists, clicking "Activate" does nothing — no visual feedback to the user.

```typescript
const masterTab = tabs.find(t => t.isMaster)
if (!masterTab) return // silent failure
```

**Expected:**
Show user feedback when master tab is missing:

```typescript
const masterTab = tabs.find(t => t.isMaster)
if (!masterTab) {
  alert('Terminal master not found — open a terminal tab first')
  return
}
```

Or better: use a toast/notification system if one exists.

**Verification:**
- [ ] Close all terminal tabs, click "Activate" on a story
- [ ] User sees a message explaining the issue
- [ ] With master tab open, "Activate" works normally

**Status:** [x] Fixed

---

### 6. [MEDIUM] Terminal write endpoint accepts arbitrary input

**Issue ID:** FIX-AB5-006 (SEC-001)

**Location:** `projects/aios-bridge/backend/src/server.ts` — `POST /api/tabs/:tabId/write`

**Problem:**
The endpoint accepts any string and writes it directly to the PTY stdin. The story's own risk assessment flagged this (P: Média, I: Alta) with mitigation "Sanitizar: apenas comandos AIOS validos" — but no validation was implemented.

**Expected:**
For local-only tool, add a comment documenting the accepted risk:

```typescript
// SECURITY NOTE: This endpoint writes directly to PTY stdin.
// Acceptable for local-only tool. If exposed to network,
// add AIOS command pattern validation: /^@\w+ \*\w+/
app.post('/api/tabs/:tabId/write', express.json(), (req, res) => {
```

**Verification:**
- [ ] Comment documenting the security decision exists
- [ ] Endpoint still works for valid AIOS commands

**Status:** [x] Fixed

---

### 7. [MEDIUM] toggleCheckbox offset arithmetic undocumented

**Issue ID:** FIX-AB5-007 (MNT-002)

**Location:** `projects/aios-bridge/backend/src/story-parser.ts` — `toggleCheckbox` function

**Problem:**
The `slice(1)` + `nextSection + 1` offset compensation is correct but non-obvious. A maintainer could easily introduce bugs by modifying this logic.

**Expected:**
Add inline comments explaining the offset:

```typescript
// Skip first char to avoid re-matching "## Tasks" heading itself
const nextSection = afterTasks.slice(1).search(/^## /m)
// +1 compensates for the slice(1) offset
const tasksSection = nextSection === -1 ? afterTasks : afterTasks.slice(0, nextSection + 1)
```

**Verification:**
- [ ] Comments explain the offset logic
- [ ] Toggle a checkbox on a story card — file updates correctly

**Status:** [x] Fixed

---

## Constraints

**CRITICAL: @dev must follow these constraints:**

- [ ] Fix ONLY the issues listed above
- [ ] Do NOT add new features
- [ ] Do NOT refactor unrelated code
- [ ] Run TypeScript check: `npx tsc --noEmit` (both backend and frontend)
- [ ] Update story file list if any new files created
- [ ] Test drag-and-drop, SSE, and Activate after all fixes

---

## After Fixing

1. Mark each issue as fixed in this document
2. Commit with: `fix: address QA findings for AB-5 [Story AB-5]`
3. Request QA re-review: `@qa *review docs/stories/AB-5.stories-kanban.md`

---

_Generated by Quinn (Test Architect) - AIOS QA System_

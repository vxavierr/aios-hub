# Hub List Projects Task

**Task ID:** hub-list-projects
**Agent:** @aios-master
**Command:** `*list-projects [--status active|paused|archived]`

---

## Purpose

List all Hub projects with their status, last activity, and active story/epic information.

---

## Execution Steps

### 1. Load Hub Context

Read `.aios/hub-context.json` to get project data:

```javascript
const fs = require('fs');
const path = require('path');

const hubContextPath = path.join(process.cwd(), '.aios', 'hub-context.json');
```

### 2. Parse Status Filter

Check for `--status` argument:
- If provided, filter projects by status (active, paused, archived)
- If not provided, show all projects

### 3. Format Output

Display projects in a formatted table:

```
📁 Hub Projects (X total)

┌─────────────────┬──────────┬─────────────────────┬───────┬──────┐
│ Name            │ Status   │ Last Activity       │ Story │ Epic │
├─────────────────┼──────────┼─────────────────────┼───────┼──────┤
│ projeto-alpha   │ active   │ 2026-02-19 10:30    │ 1.2   │ 1    │
└─────────────────┴──────────┴─────────────────────┴───────┴──────┘
```

### 4. Handle Edge Cases

- **No projects:** Display "No projects registered yet. Use *create-project to create one."
- **Invalid filter:** Display "Invalid status filter. Use: active, paused, or archived."
- **Missing hub-context.json:** Run sync-projects.js first

---

## Implementation

```javascript
/**
 * List Hub Projects
 *
 * Usage: *list-projects [--status active|paused|archived]
 */

const fs = require('fs');
const path = require('path');

function formatDate(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

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
    Math.max(h.length, ...rows.map(r => r[i].length))
  );

  // Build table
  const border = '┌' + widths.map(w => '─'.repeat(w + 2)).join('┬') + '┐';
  const separator = '├' + widths.map(w => '─'.repeat(w + 2)).join('┼') + '┤';
  const bottom = '└' + widths.map(w => '─'.repeat(w + 2)).join('┴') + '┘';

  const formatRow = (row) => '│ ' + row.map((cell, i) => cell.padEnd(widths[i])).join(' │ ') + ' │';

  let output = border + '\n';
  output += formatRow(headers) + '\n';
  output += separator + '\n';
  output += rows.map(formatRow).join('\n') + '\n';
  output += bottom;

  return output;
}

async function listProjects(args = []) {
  const hubContextPath = path.join(process.cwd(), '.aios', 'hub-context.json');

  // Check if hub-context.json exists
  if (!fs.existsSync(hubContextPath)) {
    console.log('⚠️  Hub context not found. Run sync-projects.js first.');
    return;
  }

  // Load hub context
  const hubContext = JSON.parse(fs.readFileSync(hubContextPath, 'utf8'));
  const projects = hubContext.projects || {};

  // Parse status filter
  const statusIndex = args.indexOf('--status');
  const statusFilter = statusIndex !== -1 && args[statusIndex + 1]
    ? args[statusIndex + 1].toLowerCase()
    : null;

  const validStatuses = ['active', 'paused', 'archived'];
  if (statusFilter && !validStatuses.includes(statusFilter)) {
    console.log(`❌ Invalid status filter: ${statusFilter}`);
    console.log(`   Valid options: ${validStatuses.join(', ')}`);
    return;
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
  projectList.sort((a, b) =>
    new Date(b.lastActivity) - new Date(a.lastActivity)
  );

  // Display output
  const summary = hubContext.summary || {};
  const total = statusFilter ? projectList.length : (summary.total || projectList.length);

  console.log(`\n📁 Hub Projects (${total} total)\n`);

  if (projectList.length === 0) {
    if (statusFilter) {
      console.log(`No ${statusFilter} projects found.`);
    } else {
      console.log('No projects registered yet.');
      console.log('Use *create-project {nome} to create one.');
    }
  } else {
    console.log(formatTable(projectList));
  }
}

module.exports = { listProjects };
```

---

## Output Examples

### All Projects
```
*list-projects

📁 Hub Projects (3 total)

┌─────────────────┬──────────┬─────────────────────┬───────┬──────┐
│ Name            │ Status   │ Last Activity       │ Story │ Epic │
├─────────────────┼──────────┼─────────────────────┼───────┼──────┤
│ projeto-alpha   │ active   │ 19/02/2026 10:30    │ 1.2   │ 1    │
│ projeto-beta    │ paused   │ 18/02/2026 15:00    │ 2.1   │ 2    │
│ projeto-gamma   │ archived │ 01/02/2026 09:00    │ -     │ -    │
└─────────────────┴──────────┴─────────────────────┴───────┴──────┘
```

### Filtered by Status
```
*list-projects --status active

📁 Hub Projects (1 total)

┌─────────────────┬──────────┬─────────────────────┬───────┬──────┐
│ Name            │ Status   │ Last Activity       │ Story │ Epic │
├─────────────────┼──────────┼─────────────────────┼───────┼──────┤
│ projeto-alpha   │ active   │ 19/02/2026 10:30    │ 1.2   │ 1    │
└─────────────────┴──────────┴─────────────────────┴───────┴──────┘
```

---

## Error Handling

| Error | Message | Action |
|-------|---------|--------|
| Missing hub-context.json | "Hub context not found" | Run sync-projects.js |
| Invalid status filter | "Invalid status filter" | Use valid options |
| Empty projects | "No projects registered" | Use *create-project |

---

## Dependencies

- `.aios/hub-context.json` (created by sync-projects.js)
- Node.js fs module
- No external dependencies

---

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2026-02-19 | 1.0 | Initial implementation |

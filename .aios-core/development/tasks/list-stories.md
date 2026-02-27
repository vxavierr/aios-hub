# Task: list-stories

**Command:** `*list-stories`
**Agent:** aios-master
**Purpose:** List all stories from all projects with filtering options

---

## Usage

```bash
*list-stories [--project name] [--status status] [--epic number] [--refresh]
```

## Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `--project` | Filter by project name | `--project clone-ai` |
| `--status` | Filter by status | `--status InProgress` |
| `--epic` | Filter by epic number | `--epic 1` |
| `--refresh` | Force re-scan before display | `--refresh` |

## Output Format

Table with columns:
- **Project** - Project name (or `_hub` for Hub stories)
- **ID** - Story ID (e.g., "1.2")
- **Title** - Story title (truncated if too long)
- **Status** - Current status with icon
- **Progress** - Checkbox completion percentage

## Examples

```bash
# List all stories
*list-stories

# List only InProgress stories
*list-stories --status InProgress

# List stories from specific project
*list-stories --project clone-ai

# List stories from Epic 1
*list-stories --epic 1

# Force refresh before listing
*list-stories --refresh
```

## Performance

- Target: < 500ms for 50 stories
- Uses cache from `.aios/hub-stories.json`
- Lazy refresh (only re-scan if cache > 5 min old or --refresh flag)

## Status Icons

| Status | Icon |
|--------|------|
| Draft | 📝 |
| Ready | ✅ |
| InProgress | 🔄 |
| InReview | 👀 |
| Done | ✔️ |
| Blocked | 🚫 |

## Implementation

```javascript
// This task reads from .aios/hub-stories.json and formats output
// If cache is stale or --refresh is used, runs scan-stories.js first

const fs = require('fs');
const path = require('path');

async function listStories(options = {}) {
  const hubStoriesPath = path.join(process.cwd(), '.aios', 'hub-stories.json');

  // Check if cache exists and is fresh
  if (options.refresh || !fs.existsSync(hubStoriesPath)) {
    const { ScanStories } = require('../scripts/scan-stories');
    const scanner = new ScanStories(process.cwd());
    await scanner.scan();
  }

  // Load cached data
  const data = JSON.parse(fs.readFileSync(hubStoriesPath, 'utf8'));

  // Apply filters
  let stories = [];
  for (const [projectName, projectData] of Object.entries(data.projects)) {
    for (const story of projectData.stories) {
      // Apply filters
      if (options.project && projectName !== options.project) continue;
      if (options.status && story.status !== options.status) continue;
      if (options.epic && story.epic !== options.epic) continue;

      stories.push({
        project: projectName,
        ...story
      });
    }
  }

  // Format and display table
  return formatStoriesTable(stories);
}

function formatStoriesTable(stories) {
  // Table formatting logic
  const statusIcons = {
    Draft: '📝',
    Ready: '✅',
    InProgress: '🔄',
    InReview: '👀',
    Done: '✔️',
    Blocked: '🚫'
  };

  // ... table formatting
}

module.exports = { listStories };
```

---

*Part of Epic 3 - Story Scanner*

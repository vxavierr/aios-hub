# Hub Create Project Task

**Task ID:** hub-create-project
**Agent:** @aios-master
**Command:** `*create-project {nome} [--template greenfield|brownfield|custom]`

---

## Purpose

Create a new AIOS project with isolated `.aios-core/` structure in the Hub.

---

## Execution Steps

### 1. Validate Project Name

- Required argument: project name
- Must be lowercase alphanumeric with hyphens/underscores
- Max 50 characters
- Cannot start with hyphen or underscore

### 2. Validate Template

- Options: greenfield, brownfield, custom
- Default: greenfield

### 3. Check for Existing Project

- Verify `projects/{nome}/` doesn't exist
- Return error if project already exists

### 4. Create Project Structure

```
projects/{nome}/
├── .aios-core/
│   ├── core-config.yaml
│   ├── data/.gitkeep
│   ├── development/.gitkeep
│   └── scripts/.gitkeep
├── .aios/
│   └── project-status.yaml
└── docs/
    ├── stories/.gitkeep
    └── prd/.gitkeep
```

### 5. Template-Specific Structure

- **greenfield**: Add `src/` and `tests/`
- **brownfield**: Minimal (user adds their own)
- **custom**: Just .aios-core/

### 6. Sync with Registry

Run `sync-projects.js` to register the project.

---

## Output Examples

### Success
```
📁 Creating project: meu-projeto
   Template: greenfield

   ✅ Created .aios-core/
   ✅ Created .aios/project-status.yaml
   ✅ Created docs/
   ✅ Created src/
   ✅ Created tests/

   🔄 Syncing with registry...
   ✅ Registered in entity-registry.yaml
   ✅ Updated hub-context.json

🎉 Project created successfully!

   Path: D:\workspace\projects\meu-projeto

   Next steps:
   1. cd projects/meu-projeto
   2. Initialize git (optional)
   3. Start development with AIOS
```

### Error - Invalid Name
```
❌ Project name must contain only lowercase letters, numbers, hyphens, and underscores
```

### Error - Project Exists
```
❌ Project "meu-projeto" already exists.
   Path: D:\workspace\projects\meu-projeto
```

---

## Implementation

Script: `.aios-core/scripts/hub-create-project.js`

---

## Dependencies

- `fs` for file operations
- `js-yaml` for YAML generation
- `sync-projects.js` for registry sync

---

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2026-02-19 | 1.0 | Initial implementation |

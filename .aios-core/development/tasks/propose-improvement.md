---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Use with `--direct` flag: skip elicitation, jump straight to solution
- **Best for:** Users who already know what they want to improve

### 2. Interactive Mode - Guided 6-Step Flow (default)
- Natural language input → automatic file analysis → proposal → file creation → code prep → optional submission
- **Best for:** Anyone identifying a problem and wanting the system to guide the contribution

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: proposeImprovement()
responsável: Orion (Commander)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: problem_description
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Non-empty natural language description

- campo: direct
  tipo: boolean
  origem: CLI Flag (--direct)
  obrigatório: false
  default: false
  validação: Skips elicitation steps 1-2, goes straight to Step 3

- campo: target_file
  tipo: string
  origem: User Input (--file) or auto-detected
  obrigatório: false
  validação: Valid path within .aios-core/

**Saída:**
- campo: proposal_file
  tipo: string
  destino: .aios-core/pr-suggestions/{slug}-proposal.md
  persistido: true

- campo: affected_files
  tipo: array
  destino: Memory + proposal file
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

```yaml
pre-conditions:
  - [ ] Problem description provided; AIOS framework accessible
    tipo: pre-condition
    blocker: true
    validação: |
      Check problem_description is non-empty; .aios-core/ directory exists
    error_message: "Pre-condition failed: describe the problem you want to improve"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

```yaml
post-conditions:
  - [ ] Proposal file created in pr-suggestions/; content is valid markdown
    tipo: post-condition
    blocker: true
    validação: |
      Verify file exists at .aios-core/pr-suggestions/{slug}-proposal.md
    error_message: "Post-condition failed: proposal file not created"
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] User sees clear summary of what will change and why
    tipo: acceptance-criterion
    blocker: true
  - [ ] Proposal file captures: problem, affected files, proposed solution, code diff (if applicable)
    tipo: acceptance-criterion
    blocker: true
  - [ ] --direct mode completes in ≤ 2 prompts
    tipo: acceptance-criterion
    blocker: false
```

---

## Tools

- **Tool:** file-system
  - **Purpose:** Read existing task/agent/workflow files for analysis
  - **Source:** Node.js fs module

- **Tool:** grep / glob
  - **Purpose:** Identify affected files based on problem keywords
  - **Source:** Claude Code native tools

---

## Error Handling

**Strategy:** abort-with-guidance

1. **Error:** pr-suggestions/ directory missing
   - **Resolution:** Create `.aios-core/pr-suggestions/` automatically
   - **Recovery:** Proceed after directory creation

2. **Error:** No affected files detected
   - **Resolution:** Ask user to specify target file manually
   - **Recovery:** Re-run analysis with provided path

3. **Error:** Conflict with existing proposal (same slug)
   - **Resolution:** Append timestamp to filename
   - **Recovery:** Inform user of new filename

---

## Performance

```yaml
duration_expected: 3-8 min (interactive) / 1-2 min (--direct)
cost_estimated: $0.002-0.010
token_usage: ~1,500-4,000 tokens
```

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - propose-modification.md (related, for reference)
tags:
  - contribution
  - improvement
  - framework
  - pr-suggestions
updated_at: 2026-03-02
```

---

# Propose Improvement

## Purpose

Allow any user — technical or not — to contribute improvements to the AIOS framework through a guided 6-step flow. The system captures the problem in natural language, analyzes affected files automatically, generates a solution proposal, and stores it in `pr-suggestions/` for review.

This is the contribution engine that turns every AIOS installation into a point of improvement collection.

## Command Pattern

```
*propose-improvement [problem description] [--direct] [--file <path>]
```

### Options
- `--direct`: Skip elicitation (Steps 1-2), jump straight to solution. For users who already know what they want.
- `--file <path>`: Specify the target file explicitly instead of auto-detection.

### Examples
```bash
# Guided flow (default)
*propose-improvement "The QA agent doesn't update story status after a FAIL verdict"

# Direct mode — user knows exactly what they want
*propose-improvement --direct --file .aios-core/development/tasks/qa-gate.md "Add mandatory status update step at end of task"

# With target file hint
*propose-improvement "create-next-story doesn't validate that the epic exists before creating the story" --file .aios-core/development/tasks/create-next-story.md
```

---

## Interactive 6-Step Flow

### Step 1: Capture Problem (Natural Language)

```
ELICIT: Problem Description

Descreva o problema ou melhoria que você identificou.
Pode ser em linguagem natural — sem necessidade de saber o nome do arquivo.

Exemplos:
  - "O agente @qa não atualiza o status da story após reprovar"
  - "O installer sobrescreve minhas customizações quando faço update"
  - "Falta validação do epic antes de criar a story"

Problema: _
```

> Se `--direct` foi passado: pular para Step 3 com os inputs já fornecidos.

---

### Step 2: Analyze Affected Files (Automatic)

Based on the problem description, the system:

1. Extracts keywords (e.g., "qa", "status", "story", "fail")
2. Searches `.aios-core/development/tasks/`, `agents/`, `workflows/` for matches
3. Ranks candidates by keyword frequency and relevance
4. Presents top 3 candidates for confirmation

```
DISPLAY: Arquivos possivelmente afetados

Encontrei estes arquivos relacionados ao problema:

1. .aios-core/development/tasks/qa-gate.md          [score: 0.92]
2. .aios-core/development/agents/qa.md              [score: 0.78]
3. .aios-core/development/tasks/dev-develop-story.md [score: 0.41]

Confirmar? (Enter = sim, ou digitar número para ver conteúdo, ou especificar outro arquivo)
```

---

### Step 3: Propose Solution

With the problem + affected files identified, analyze the content and generate a structured proposal:

```markdown
## Proposta de Melhoria

**Problema:** {problem_description}

**Arquivo(s) afetado(s):**
- {file_1} — {why it's affected}
- {file_2} — {why it's affected}

**Causa raiz:**
{analysis of what is missing or wrong in the current implementation}

**Solução proposta:**
{clear description of the change}

**Impacto esperado:**
{what improves after this change}
```

Present to user for validation before continuing:

```
Proposta gerada. Confirmar e continuar? (s/n — ou 'editar' para ajustar)
```

---

### Step 4: Create Proposal File

Create the file at `.aios-core/pr-suggestions/{slug}-proposal.md` where `slug` is derived from the problem description (lowercase, hyphens).

**File structure:**

```markdown
# Proposal: {title}

**Date:** {YYYY-MM-DD}
**Status:** draft
**Author:** {user or "aios-master"}

## Problem
{problem_description}

## Affected Files
{list with paths and roles}

## Root Cause Analysis
{analysis}

## Proposed Solution
{solution description}

## Code Changes (if applicable)
{diff or pseudocode showing what changes}

## Expected Impact
{what improves}

## Notes
{any caveats, risks, or dependencies}
```

```
✅ Proposal file criado: .aios-core/pr-suggestions/{slug}-proposal.md
```

---

### Step 5: Prepare Code (Optional)

If the proposal involves a concrete change to an existing file, offer to draft the actual edit:

```
Quer que eu gere o diff/código para esta mudança? (s/n)
```

If yes:
- Read the affected file(s)
- Generate a precise code change or diff
- Append to the proposal file under `## Code Changes`
- Show preview to user

---

### Step 6: Submit (Optional)

Offer to prepare the contribution for upstream submission:

```
Opções:
1. Salvar apenas localmente (pr-suggestions/) — padrão
2. Criar um branch e commit com a proposta
3. Abrir PR para o repositório upstream (requer @devops)
```

If option 2: delegate `git add + git commit` to @dev or handle directly.
If option 3: produce handoff instruction for @devops `*push`.

---

## --direct Mode

When `--direct` is passed, the flow collapses to:

1. Parse `--file` and problem description from args
2. Read the specified file
3. Generate proposal directly (Steps 3-4)
4. Show result — done

No elicitation prompts. Maximum 2 interactive turns.

```bash
# Example: direct mode, minimal interaction
*propose-improvement --direct --file .aios-core/development/tasks/create-next-story.md \
  "Validate that epic exists before creating the story"
```

---

## Output: pr-suggestions/ Directory

All proposals are stored in `.aios-core/pr-suggestions/`:

```
.aios-core/
└── pr-suggestions/
    ├── qa-status-update-after-fail-proposal.md
    ├── installer-smart-merge-proposal.md
    └── epic-validation-before-story-creation-proposal.md
```

This directory is the contribution inbox — reviewed periodically and merged upstream when validated.

---

## Integration with aios-master

Add to `aios-master.md` dependencies:

```yaml
dependencies:
  tasks:
    - propose-improvement.md
```

Add to commands:

```yaml
- name: propose-improvement
  args: '[problem description] [--direct] [--file <path>]'
  description: 'Propose a framework improvement via guided 6-step flow or --direct mode'
```

---

## Important Note: Dependency on Smart Merge (Entregável 2)

> **⚠️ This task creates proposal files that users will customize.**
> Without smart merge logic in the installer/updater, running `aios update` will **overwrite** those files.
>
> **The smart merge feature must be implemented before this task reaches production use.**
> Priority: implement three-way merge (base + upstream + local) for the update flow first.
> See: `installer-smart-merge-proposal.md` (to be created as the first use of this very task).

---

## Validation Checklist

- [ ] Task name is unique (`propose-improvement.md` did not exist)
- [ ] 6 steps clearly defined with exact prompt formats
- [ ] `--direct` mode path documented
- [ ] Output directory and file naming convention defined
- [ ] Integration points with aios-master documented
- [ ] Dependency on smart merge flagged explicitly

## Success Output

```
✅ Task 'propose-improvement' criada com sucesso!
📁 Location: .aios-core/development/tasks/propose-improvement.md
📝 Integration: adicione 'propose-improvement.md' em aios-master.md → dependencies.tasks
⚠️  Próximo passo crítico: implementar smart merge no installer antes de usar em produção
```

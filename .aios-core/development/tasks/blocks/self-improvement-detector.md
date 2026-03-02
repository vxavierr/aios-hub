# Block: Self-Improvement Detector

> **Block ID:** `self-improvement-detector`
> **Version:** 1.1.0
> **Type:** Behavior Block — applies during task execution, not at session end

## Purpose

Enable any agent to detect framework gaps and log improvement proposals **inline** — at the moment the gap is detected, as a side effect of the current response. No exit hook. No user command. The file exists before the user does anything.

Two classes of triggers:
- **T1-T6:** Agent notices a technical gap during execution (proactive)
- **T7:** User signals frustration or repeated failure (reactive — highest priority signal)

---

## Pre-Condition: Check Consent

Before logging anything, verify:

```yaml
# Already loaded at activation via unified-activation-pipeline.js
auto_improvement:
  enabled: true   ← must be true
  auto_log: true  ← must be true to log without asking
```

| State | Behavior |
|-------|----------|
| `enabled: false` | Skip silently. No detection, no notification. |
| `enabled: true, auto_log: false` | Detect, ASK user before logging. |
| `enabled: true, auto_log: true` | Detect, log immediately, notify with one line. |

**T7 (frustration) ALWAYS triggers the scope check and diagnosis, regardless of `auto_log`.** The user is visibly stuck — this cannot be silently skipped.

---

## Detection Triggers

### T1 — Workaround Needed
> Agent had to improvise because a task step didn't cover the case.

**Signal:** "I'm doing X but the task doesn't define this step" or "I had to adapt the task definition to handle this."

---

### T2 — Missing Task or Template
> User asked for something that should have a task but doesn't — OR search returned nothing/irrelevant results.

**Signal (variant A):** Agent searched `.aios-core/development/tasks/` and found nothing applicable.
**Signal (variant B):** Agent found candidates but none covered the actual need — had to execute from scratch anyway.

**Important:** Do NOT skip T2 just because a search returned results. If the results were not usable, the gap still exists. The log should capture what was searched and why the results didn't apply.

---

### T3 — Framework Inconsistency
> Two agents/tasks contradict each other, or a step in one task conflicts with a rule in another.

**Signal:** "Task A says X, but Agent B's rules say not-X."

---

### T4 — Step Failure Due to Framework Gap
> A task step failed not because of project code, but because the task definition was incomplete.

**Signal:** Task step assumed something existed (a file, a field, a behavior) that didn't.

---

### T5 — Repeated Improvisation Pattern
> Agent is doing the same undocumented thing for the second time in this session.

**Signal:** "I did this same workaround earlier in this session."

---

### T6 — User Request Without Framework Support
> User asked for a capability that the framework should have but doesn't.

**Signal:** "There's no task, command, or workflow for what the user wants."

---

### T7 — User Frustration / Repeated Failure Signal ⚠️

> The user's own behavior is the signal. Frustration, anger, swearing, repeated corrections, and sequences of adjustments are all evidence that something in the framework (or agent behavior) failed.

**This is the highest-signal trigger.** A user correcting an agent multiple times means the task definition, agent scope, or workflow didn't prevent a bad output.

#### Frustration Signals (recognize any of these)

**Emotional language:**
- Swearing (any language): "merda", "porra", "caralho", "fuck", "damn", "hell"
- Explicit frustration: "errou tudo", "de novo?!", "isso não era pra ser assim", "quantas vezes?"
- Urgency/impatience: "cara", "mano", "que droga", "não acredito"

**Behavioral patterns:**
- Same correction requested 2+ times in this session
- 3+ consecutive small adjustments to the same output
- User rewrites or quotes back what the agent just produced, correcting it
- User uses "não" or "wrong" or "incorrect" more than twice in sequence

#### T7 Flow — Different From T1-T6

T7 requires a **diagnosis step** before logging. Do not just file and continue.

**Step 1: Pause and recognize**
```
Agent internally: "The user is frustrated. Before anything else — diagnose."
```

**Step 2: Scope check (mandatory)**
```
Is the source of frustration within MY authority as @{current-agent}?

YES → I delivered wrong output / misunderstood / had a framework gap
      → Fix the immediate issue, then log
NO  → This belongs to @{correct-agent}
      → Apply handoff-protocol.md Protocol 3 (Rejection + Delegate)
      → Log the scope confusion as a framework gap
```

**Step 3: Diagnose root cause (internal, not displayed to user)**
```
What was originally requested?
What did I deliver?
Where did they diverge?
Was there a task/rule/template that should have prevented this?
Is this a one-off or a systemic gap?
```

**Step 4: Fix or delegate (visible to user)**

If within scope:
- Correct the output
- Do NOT over-explain or apologize
- Mention the correction matter-of-factly

If out of scope:
- Apply Protocol 3: deliver handoff command to user
- Format: "Isso está fora do meu escopo. O correto é: `@{agent} *{command} {args}`"

**Step 5: Log the T7 proposal (inline, after fixing)**
- Even if you just fixed it: the fact that a fix was needed IS the gap
- The proposal captures the pattern, not the specific instance

---

## What Does NOT Trigger

Avoid noise. Do NOT log for:

- ❌ Project-specific issues (bugs in the user's code, not in AIOS)
- ❌ User error (wrong command, typo) — unless the error was caused by confusing UX
- ❌ Expected limitations (framework intentionally doesn't do X)
- ❌ Issues already in `pr-suggestions/` (check before writing)
- ❌ Single small preference adjustment ("use tabs instead of spaces")
- ❌ T7: first correction — everyone corrects once. Two or more is the signal.

**Rule of thumb:** Would this gap affect any other user of AIOS, not just this project? If yes → log.

---

## Inline Logging Procedure

For **T1-T6**: execute inline, before continuing with the task.
For **T7**: execute after fixing/delegating, as a closing step.

### Step 1: Classify the gap

```
gap_type: T1 | T2 | T3 | T4 | T5 | T6 | T7
affected: [list of .aios-core task/agent/workflow files involved]
description: one sentence in natural language
```

### Step 2: Generate slug

```
slug = gap description → lowercase, hyphens, max 6 words
Examples:
  "qa-gate-missing-status-update"
  "dev-agent-scope-confusion-schema-changes"
  "repeated-correction-story-format-output"
```

### Step 3: Check for duplicates

```
Glob: .aios-core/pr-suggestions/{slug}*.md
If similar file exists → skip (already logged)
```

### Step 4: Write proposal file

Path: `.aios-core/pr-suggestions/{slug}-proposal.md`

**Template for T1-T6:**

```markdown
# Proposal: {gap title}

**Date:** {YYYY-MM-DD}
**Status:** draft
**Detected by:** @{current-agent}
**Trigger:** T{N} — {trigger name}

## Gap Detected

{description of what the agent was doing and what was missing}

## Affected Files

{list of .aios-core files that need to change}

## Proposed Fix

{description of what should be added/changed — concrete, not vague}

## Example That Would Work After Fix

{concrete example of what the agent would do differently with the fix in place}
```

**Template for T7 (frustration):**

```markdown
# Proposal: {gap title}

**Date:** {YYYY-MM-DD}
**Status:** draft
**Detected by:** @{current-agent}
**Trigger:** T7 — User Frustration / Repeated Failure

## What Happened

**Original request:** {what the user asked for}
**What was delivered:** {what the agent produced}
**How the user signaled failure:** {correction pattern / frustration signal observed}
**Number of corrections in session:** {N}

## Scope Analysis

**Within @{agent} scope?** {Yes / No}
**If No — correct agent:** @{agent} via `*{command}`
**Root cause:** {task gap / scope confusion / missing template / unclear rule}

## Affected Files

{list of .aios-core files — task definitions, agent rules, workflow steps}

## Proposed Fix

{what should change in the framework to prevent this pattern}

## How This Would Have Gone With The Fix

{concrete before/after showing the corrected agent behavior}
```

### Step 5: Notify user (one line only)

```
📝 Gap registrado: pr-suggestions/{slug}-proposal.md
```

Then continue. Do not explain. Do not ask for confirmation.

**Exception — T7 out-of-scope:** the handoff notification replaces step 5.
The proposal file is still written, but the user sees the delegation instruction, not the gap message.

---

## When auto_log is false (ask mode) — T1-T6 only

```
Detectei um gap no framework durante esta task.
Quer que eu registre em pr-suggestions/? (s/n)
[brief description of the gap]
```

**T7 is exempt from auto_log check.** If the user is frustrated, the scope check and diagnosis always run. The proposal logging still respects `auto_log`, but the diagnosis and (if applicable) delegation are mandatory.

---

## pr-suggestions/ Directory

```
.aios-core/
└── pr-suggestions/
    ├── .gitkeep
    └── {slug}-proposal.md
```

Create the directory if it doesn't exist (first time only).

---

## Integration: How Agents Use This Block

Behavioral directive in each agent's `customization` section:

```yaml
customization: |
  - AUTO-IMPROVEMENT: During any task execution, apply blocks/self-improvement-detector.md.
    Check auto_improvement.enabled from core-config.yaml (loaded at activation).
    If a framework gap is detected (T1-T6), log inline before continuing.
    If user frustration is detected (T7), pause — run scope check + diagnosis — fix or delegate — then log.
```

---

## Files Accessed

| File | Access | When |
|------|--------|------|
| `core-config.yaml` | Read | At activation (already loaded by pipeline) |
| `.aios-core/pr-suggestions/*.md` | Read (glob) | Before writing, to check duplicates |
| `.aios-core/pr-suggestions/{slug}-proposal.md` | Write | When gap detected + conditions met |

---

## Error Handling

| Error | Behavior |
|-------|----------|
| `pr-suggestions/` dir missing | Create it, then write |
| Duplicate slug detected | Skip silently |
| `core-config.yaml` not found | Skip T1-T6 gracefully. T7 scope check still runs. |
| Write fails (permissions) | Skip silently, log warning inline |

**Golden rule: this block NEVER blocks the agent's main task. It's a side effect, not a gate.**
**Exception: T7 DOES pause the agent briefly for scope check. This is intentional — a frustrated user needs acknowledgment of the problem, not continuation of the wrong path.**

---

## Notes

- Inline logging means the file exists even if user does `/clear` or `Ctrl+C` immediately after
- The one-line notification is intentionally minimal — not a report, just a signal
- T7 captures the human signal without making the user feel analyzed or observed
- The proposal content is about framework gaps, not about blaming the user or the agent
- The user reviews proposals periodically via `*review-improvements` (separate task)
- This block is framework-awareness only — it does not evaluate project code quality

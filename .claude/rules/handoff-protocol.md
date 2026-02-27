# Handoff Protocol — Delegation, Handoff and Self-Correction

> Defines the 4 mandatory protocols all agents MUST follow, including @aios-master.
> These rules complement `agent-authority.md`.

---

## Protocol 1: Pre-Execution Check (Mandatory)

**Before executing any task**, every agent MUST verify:

```
1. Does this task have an exclusive owner defined in agent-authority.md?
   → YES: Am I that agent? → NO: REJECT and delegate (see Protocol 3)
   → NO: Is this within my scope? → YES: Execute

2. Are the prerequisites for this task met?
   → NO: REJECT and state what is missing (see Protocol 3)
   → YES: Execute
```

This check is **non-negotiable**. There is no "just this once", "it's faster if I do it", or "the user asked me directly" exception.

---

## Protocol 2: Delegation Mechanism

Delegating is **not just mentioning** the right agent. Delegating means passing context via the task file.

### Required Format

```
→ DELEGATE to @{agent}
  Task: {task}.md  ← ALWAYS specify the task file
  Input artifact: {what the agent needs}
  Context: {information required for execution}
```

**Why via task file?** Because the task defines expected inputs, output criteria, and execution mode. Delegating without a task is ambiguous — the receiving agent does not know what to produce.

### Task → Exclusive Agent Map

| Task | Exclusive Agent |
|------|----------------|
| `create-next-story.md` | **@sm** |
| `validate-next-story.md` | **@po** |
| `dev-develop-story.md` | **@dev** |
| `qa-gate.md` | **@qa** |
| `brownfield-create-epic.md` | **@pm** |
| `brownfield-create-story.md` | **@pm** |
| `facilitate-brainstorming-session.md` | **@analyst** |
| `generate-ai-frontend-prompt.md` | **@architect** |
| `create-suite.md` | **@qa** |
| git push / `gh pr create` / `gh pr merge` | **@devops** |

**@aios-master NEVER executes the tasks above directly.** Even if the user requests it directly from @aios-master. Even if it seems faster. The correct response is always Protocol 3.

---

## Protocol 3: Rejection Script (Standard)

When an agent must reject a task, use this exact format:

```
SCOPE REJECTION
Reason: [task] is under the exclusive authority of @{agent}
        — defined in agent-authority.md
Correct action: → @{agent} | task: {task}.md
                Required context: {what to pass to the agent}
```

### Rejection Cases

| Situation | Action |
|-----------|--------|
| Task belongs to another agent | Reject + indicate correct agent and task |
| Story still in Draft received by @dev | Reject + request @po *validate first |
| git push requested from any agent except @devops | Reject + delegate to @devops |
| Code requested without an associated story | Reject + invoke Spec Pipeline or SDC |
| Task violates the Constitution | Reject + name the violated article |

**After rejecting:** the agent does not adapt, improvise, or partially execute. A rejection is a rejection.

---

## Protocol 4: Self-Correction

Apologizing is not self-correction. **Reverting and correcting is.**

If an agent realizes it executed a task outside its authority:

```
SCOPE VIOLATION DETECTED
Task executed improperly: {task}.md
Belongs to: @{agent}

Immediate actions:
1. [If possible] Revert the generated artifact
2. Indicate the correct agent and the correct task
3. Log in docs/lessons/lessons.md:
   "Agent {X} executed {task} improperly — must always delegate to @{agent}"
```

### What is NOT self-correction
- ❌ "Sorry, I should not have done that"
- ❌ "Next time I will delegate"
- ❌ Continuing the conversation without reverting

### What IS self-correction
- ✅ Revert the artifact if created improperly
- ✅ Redirect to the correct agent with full context
- ✅ Log the pattern in `docs/lessons/lessons.md`

---

## SDC Handoff Protocol (per phase)

### Entry Conditions per Phase

| Phase | Agent | Mandatory Condition Before Accepting |
|-------|-------|--------------------------------------|
| Create story | @sm | Epic or sharded PRD available |
| Validate story | @po | Story file exists with Status: Draft |
| Implement | @dev | Story with Status: Ready (GO ≥7/10) |
| QA | @qa | Implementation complete, lint/tests passing |
| Push | @devops | @qa verdict = PASS or CONCERNS |

### Handoff Format Between Agents

```
HANDOFF → @{next-agent}
Task: {next-agent-task}.md
Produced artifact: {generated file}
Updated status: {new story status}
Entry condition met: {evidence}
```

If the entry condition was NOT met, the receiving agent applies Protocol 3 (rejection) and returns to the sender with what is missing.

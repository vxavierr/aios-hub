# ADR-008: 6 Human Checkpoints

**Status:** Approved
**Date:** 2026-02-20
**Decision Makers:** Aria (Architect), Orion (AIOS Master), User
**Supersedes:** N/A

---

## Context

O Clone Lab v1.0 é totalmente automatizado, sem pontos de intervenção humana. Isto pode levar a clones de baixa qualidade sendo produzidos sem detecção até o deploy final, desperdiçando recursos e potencialmente gerando clones inadequados.

### Problem Statement

- Clones de baixa qualidade podem passar despercebidos
- Sem validação humana, erros sistêmicos se propagam
- Usuários não têm controle sobre qualidade intermediária
- Falta de "human-in-the-loop" para decisões críticas
- Dificuldade em corrigir rumo cedo no processo

---

## Decision

Implementar 6 checkpoints obrigatórios onde humanos validam progresso e qualidade antes de prosseguir para a próxima fase do pipeline.

### Checkpoint Locations

```
EXTRACT ──▶ [CP-1] ──▶ ANALYZE ──▶ [CP-2] ──▶ SYNTHESIZE ──▶ [CP-3]
                                                            │
DEPLOY ◀── [CP-6] ◀── Extended ◀── [CP-5] ◀── MANIFEST ◀── [CP-4]
                            Testing
```

### The 6 Checkpoints

| ID | Nome | Trigger | Propósito |
|----|------|---------|-----------|
| **CP-1** | Source Validation | After Extract | Validar qualidade e cobertura das fontes |
| **CP-2** | Analysis Review | After Analyze | Revisar acurácia dos traits detectados |
| **CP-3** | DNA Approval | After Synthesize | Aprovar perfil de personalidade sintetizado |
| **CP-4** | Prompt Testing | After Manifest | Validar prompts gerados |
| **CP-5** | Clone Acceptance | After Initial Deploy | Aceitar clone para uso |
| **CP-6** | Fidelity Confirmation | After Extended Testing | Confirmar fidelidade de longo prazo |

### Architecture Changes

```
packages/validation/
├── src/
│   ├── checkpoints/
│   │   ├── checkpoint.interface.ts
│   │   ├── checkpoint-1-source.ts
│   │   ├── checkpoint-2-analysis.ts
│   │   ├── checkpoint-3-dna.ts
│   │   ├── checkpoint-4-prompt.ts
│   │   ├── checkpoint-5-acceptance.ts
│   │   └── checkpoint-6-fidelity.ts
│   └── manager/
│       └── checkpoint-manager.ts
```

### Checkpoint Structure

```typescript
interface Checkpoint {
  id: string;                    // "CP-1" to "CP-6"
  name: string;
  trigger: PipelinePhase;
  questions: CheckpointQuestion[];
  passCriteria: string;
  escalationPath: string;
  timeout: Duration;             // Max wait for human input
}

interface CheckpointResult {
  checkpointId: string;
  passed: boolean;
  humanResponse: HumanResponse;
  timestamp: Date;
  nextAction: 'proceed' | 'escalate' | 'rollback';
}
```

---

## Checkpoint Details

### CP-1: Source Validation
**Trigger:** After Extraction Phase
**Questions:**
- Are sources diverse enough?
- Is content volume sufficient?
- Are there any red flags in sources?

**Pass Criteria:** Human approves source collection
**Escalation:** Return to extraction with guidance

### CP-2: Analysis Review
**Trigger:** After Analysis Phase
**Questions:**
- Do detected traits match expectations?
- Are there missing dimensions?
- Is confidence level acceptable?

**Pass Criteria:** Human confirms analysis direction
**Escalation:** Add specific content or adjust analyzers

### CP-3: DNA Approval
**Trigger:** After Synthesis Phase
**Questions:**
- Does DNA capture the essence?
- Are values and beliefs accurate?
- Is fidelity score justified?

**Pass Criteria:** Human approves DNA profile
**Escalation:** Manual DNA adjustments

### CP-4: Prompt Testing
**Trigger:** After Manifest Phase
**Questions:**
- Do test responses match original style?
- Is the voice authentic?
- Are there hallucinations?

**Pass Criteria:** Human approves prompt quality
**Escalation:** Prompt refinement iteration

### CP-5: Clone Acceptance
**Trigger:** After Initial Deployment
**Questions:**
- Is clone ready for intended use case?
- Are there any safety concerns?
- Is performance acceptable?

**Pass Criteria:** Human accepts clone
**Escalation:** Return to appropriate phase

### CP-6: Fidelity Confirmation
**Trigger:** After Extended Testing
**Questions:**
- Does clone maintain personality over time?
- Are edge cases handled correctly?
- Is user satisfaction high?

**Pass Criteria:** Human confirms ongoing fidelity
**Escalation:** Clone retirement or retraining

---

## Consequences

### Positive
- Quality assurance garantido
- Early detection de problemas
- Human-in-the-loop para decisões críticas
- Maior confiança no resultado final
- Capacidade de ajuste de rumo

### Negative
- Menor velocidade de processamento
- Dependência de disponibilidade humana
- Possível bottleneck no pipeline
- Mais complexidade no sistema

### Mitigations
- Timeout configurável por checkpoint
- Modo "auto-approve" para clones de baixo risco
- Notificações assíncronas para humanos
- Dashboard de checkpoints pendentes
- Bypass com aprovação explícita (auditado)

---

## CLI Integration

```bash
# Interactive mode (default) - pauses at checkpoints
clone-lab create ./sources --interactive

# Auto mode - skip checkpoints (requires --force)
clone-lab create ./sources --auto --force

# Resume from checkpoint
clone-lab resume --checkpoint CP-3

# Checkpoint status
clone-lab status --checkpoints
```

---

## Related ADRs

- ADR-007: 63 Validation Tasks System
- ADR-009: Meta-Cognition Layer

---

## Change Log

| Date | Description |
|------|-------------|
| 2026-02-20 | Initial approval |

---

*Approved by: User, Aria (Architect), Orion (AIOS Master)*

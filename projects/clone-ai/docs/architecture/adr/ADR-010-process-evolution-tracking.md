# ADR-010: Process Evolution Tracking

**Status:** Approved
**Date:** 2026-02-20
**Decision Makers:** Aria (Architect), Orion (AIOS Master), User
**Supersedes:** N/A

---

## Context

Sistemas auto-evolutivos precisam de rastreabilidade completa para:
- Entender o que mudou e por que mudou
- Avaliar o impacto de cada mudança
- Permitir rollback seguro
- Gerar aprendizado institucional

O Clone Lab v1.0 não possui nenhum mecanismo de tracking de evolução.

### Problem Statement

- Sem histórico de mudanças no sistema
- Impossível saber por que uma decisão foi tomada
- Não há capacidade de rollback
- Aprendizado é perdido entre sessões
- Sem visibilidade da evolução do sistema

---

## Decision

Implementar sistema completo de Process Evolution Tracking com:

1. **Evolution Log** - Todas as mudanças registradas
2. **Impact Tracking** - Resultados de cada mudança
3. **Rollback Capability** - Reversão segura
4. **Monthly Evolution Reports** - Relatórios periódicos

### Architecture

```
meta/
├── evolution-log/
│   ├── changes/              # Individual change records
│   │   ├── 2026-02/
│   │   │   ├── CHG-2026-02-20-001.yaml
│   │   │   └── ...
│   │   └── index.yaml        # Change index
│   ├── snapshots/            # System state snapshots
│   │   ├── v1.0.0.yaml
│   │   ├── v1.1.0.yaml
│   │   └── ...
│   └── rollback/             # Rollback scripts
│       └── ...
├── improvement-log/          # Learning history
│   └── learnings.yaml
└── reports/
    └── monthly/
        ├── 2026-01.md
        └── 2026-02.md
```

### Data Structures

```typescript
interface EvolutionChange {
  id: string;                  // CHG-YYYY-MM-DD-NNN
  timestamp: Date;
  type: 'add' | 'remove' | 'modify' | 'optimize';
  category: 'mind' | 'task' | 'checkpoint' | 'pipeline' | 'constitution';
  target: string;              // What was changed
  reason: string;              // Why it was changed
  autoApplied: boolean;        // Was this auto-applied?
  approvedBy?: string;         // Human approver if required
  beforeState: any;            // State before change
  afterState: any;             // State after change
  impact?: ImpactAssessment;   // Measured impact (filled later)
  rollbackScript: string;      // Path to rollback script
}

interface ImpactAssessment {
  changeId: string;
  measuredAt: Date;
  observationPeriod: Duration; // How long we observed
  metrics: {
    fidelityDelta: number;     // Change in average fidelity
    efficiencyDelta: number;   // Change in processing time
    errorRateDelta: number;    // Change in error rate
    humanInterventionDelta: number;
  };
  verdict: 'positive' | 'neutral' | 'negative' | 'inconclusive';
  recommendation: 'keep' | 'rollback' | 'monitor';
}

interface EvolutionSnapshot {
  version: string;
  timestamp: Date;
  components: {
    minds: MindConfig[];
    tasks: TaskConfig[];
    checkpoints: CheckpointConfig[];
    constitution: ConstitutionVersion;
  };
  metrics: SystemMetrics;
  changes: string[];           // Change IDs since last snapshot
}
```

---

## Rollback System

### Rollback Capability

```typescript
interface RollbackManager {
  // Create restore point before change
  createRestorePoint(change: EvolutionChange): RestorePoint;

  // Rollback to specific change (undo that change and all after)
  rollbackTo(changeId: string): Promise<RollbackResult>;

  // Rollback single change (if independent)
  rollbackSingle(changeId: string): Promise<RollbackResult>;

  // List rollbackable changes
  listRollbackable(): EvolutionChange[];

  // Verify rollback safety
  verifyRollbackSafety(changeId: string): SafetyCheck;
}
```

### Rollback Rules

```yaml
# Safe to rollback (independent changes)
- Single task weight adjustments
- Mind prompt optimizations
- Checkpoint threshold changes
- Configuration value updates

# Requires cascade rollback (dependent changes)
- Mind addition/removal (affects orchestration)
- Task category changes (affects validation)
- Pipeline phase modifications

# Cannot rollback (irreversible)
- Clone data deletions
- Audit log entries
- Constitution violations logged
```

---

## Monthly Evolution Reports

### Report Structure

```markdown
# Clone Lab Evolution Report - {Month} {Year}

## Executive Summary
- Total changes: {N}
- Auto-applied: {N} ({X}%)
- Human-approved: {N} ({X}%)
- Rollbacks: {N}
- Net fidelity change: {+/-X}%

## Key Changes

### Positive Impact
| Change | Impact | Recommendation |
|--------|--------|----------------|
| ... | ... | ... |

### Negative Impact / Rolled Back
| Change | Reason | Learning |
|--------|--------|----------|
| ... | ... | ... |

## System Health
- Average fidelity: {X}%
- Validation pass rate: {X}%
- Human intervention rate: {X}%

## Recommendations for Next Month
1. ...
2. ...

## Pending Human Approval
- {N} changes awaiting approval
```

---

## Consequences

### Positive
- Auditabilidade completa do sistema
- Capacidade de rollback seguro
- Aprendizado institucional preservado
- Visibilidade da evolução temporal
- Base para meta-cognição efectiva

### Negative
- Overhead de logging
- Storage de histórico crescente
- Complexidade adicional no sistema
- Manutenção do sistema de tracking

### Mitigations
- Compressão de snapshots antigos
- Retention policy configurável
- Async logging para não impactar performance
- Indexed search para queries rápidas

---

## Implementation

### Storage Strategy

```yaml
# Retention Policy
evolution_log:
  recent_changes: 90 days      # Full detail
  older_changes: 2 years       # Summary only
  snapshots: 10 versions       # Keep last 10

# Compression
  compress_after: 30 days
  format: gzip

# Indexing
  index_fields:
    - timestamp
    - type
    - category
    - impact.verdict
```

### CLI Commands

```bash
# View evolution history
clone-lab evolution history [--since DATE] [--category CAT]

# View specific change
clone-lab evolution show CHG-2026-02-20-001

# Rollback a change
clone-lab evolution rollback CHG-2026-02-20-001

# Generate report
clone-lab evolution report --monthly

# View system state at point in time
clone-lab evolution snapshot v1.2.0
```

---

## Related ADRs

- ADR-009: Meta-Cognition Layer (consumer of this tracking)

---

## Change Log

| Date | Description |
|------|-------------|
| 2026-02-20 | Initial approval |

---

*Approved by: User, Aria (Architect), Orion (AIOS Master)*

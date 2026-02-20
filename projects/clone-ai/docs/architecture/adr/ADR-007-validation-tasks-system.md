# ADR-007: 63 Validation Tasks System

**Status:** Approved
**Date:** 2026-02-20
**Decision Makers:** Aria (Architect), Orion (AIOS Master), User
**Supersedes:** N/A

---

## Context

O Clone Lab v1.0 utiliza apenas um "fidelity score" agregado (0-100) para validar a qualidade dos clones. Esta abordagem esconde problemas específicos, não oferece granularidade para melhorias direcionadas, e não permite identificar quais dimensões da personalidade precisam de atenção.

### Problem Statement

- Fidelity score único esconde problemas específicos
- Não há visibilidade de quais dimensões falharam
- Impossível fazer melhorias direcionadas
- Sem base para auto-otimização do sistema
- Dificuldade em explicar por que um clone tem baixa fidelidade

---

## Decision

Implementar sistema de 63 validation tasks organizadas em 7 categorias, cada task com critérios específicos de pass/fail e pontuação individual.

### Task Categories

| Categoria | Tasks | Foco |
|-----------|-------|------|
| **Extraction** | 10 | Qualidade e cobertura das fontes |
| **Behavioral** | 12 | Padrões de comportamento |
| **Values** | 8 | Valores e crenças |
| **Cognitive** | 11 | Arquitetura cognitiva |
| **Synthesis** | 9 | Coerência do DNA |
| **Implementation** | 7 | Viabilidade técnica |
| **Quality** | 6 | QA final do clone |

### Architecture Changes

```
packages/validation/
├── src/
│   ├── tasks/
│   │   ├── extraction/
│   │   │   ├── EX-001-source-diversity.ts
│   │   │   ├── EX-002-content-volume.ts
│   │   │   └── ... (10 tasks)
│   │   ├── behavioral/
│   │   │   ├── BH-001-response-pattern.ts
│   │   │   └── ... (12 tasks)
│   │   ├── values/
│   │   ├── cognitive/
│   │   ├── synthesis/
│   │   ├── implementation/
│   │   └── quality/
│   ├── registry/
│   │   └── task-registry.ts
│   └── executor/
│       └── task-executor.ts
└── package.json
```

### Task Structure

```typescript
interface ValidationTask {
  id: string;              // e.g., "EX-001"
  category: TaskCategory;
  name: string;
  description: string;
  weight: number;          // 1-5
  execute(context: ValidationContext): TaskResult;
}

interface TaskResult {
  taskId: string;
  passed: boolean;
  score: number;           // 0-100
  details: string;
  recommendations: string[];
}
```

---

## Consequences

### Positive
- Visibilidade granular de problemas
- Capacidade de melhorias direcionadas
- Base para auto-otimização (sistema sabe onde falhou)
- Melhor explicabilidade para usuários
- Identificação de padrões de falha

### Negative
- Maior overhead de processamento
- Necessidade de manutenção das tasks
- Mais complexidade no código
- Tempo de execução maior

### Mitigations
- Execução paralela de tasks independentes
- Cache de resultados intermediários
- Tasks configuráveis (ativar/desativar)
- Threshold ajustável por categoria

---

## Task List (Summary)

### Extraction (10 tasks)
- EX-001: Source diversity check
- EX-002: Content volume sufficiency
- EX-003: Format normalization quality
- EX-004: Metadata completeness
- EX-005: Temporal coverage
- EX-006: Language consistency
- EX-007: Duplicate detection
- EX-008: Quality scoring
- EX-009: Chunk coherence
- EX-010: Source credibility

### Behavioral (12 tasks)
- BH-001: Response pattern consistency
- BH-002: Emotional trigger mapping
- BH-003: Decision pattern detection
- BH-004: Risk tolerance assessment
- BH-005: Communication style markers
- BH-006: Social interaction patterns
- BH-007: Conflict resolution style
- BH-008: Learning style indicators
- BH-009: Motivation drivers
- BH-010: Stress response patterns
- BH-011: Creativity expression
- BH-012: Habitual behaviors

### Values (8 tasks)
- VL-001: Core value extraction
- VL-002: Value hierarchy mapping
- VL-003: Belief consistency check
- VL-004: Ethical boundary detection
- VL-005: Priority inference
- VL-006: Worldview patterns
- VL-007: Value conflict detection
- VL-008: Value-behavior alignment

### Cognitive (11 tasks)
- CG-001: Reasoning style detection
- CG-002: Mental model mapping
- CG-003: Problem-solving approach
- CG-004: Knowledge structure analysis
- CG-005: Thinking speed patterns
- CG-006: Abstraction level preference
- CG-007: Analogy usage patterns
- CG-008: Counterfactual thinking
- CG-009: Bias detection
- CG-010: Expertise domain mapping
- CG-011: Learning curve modeling

### Synthesis (9 tasks)
- SY-001: Trait coherence check
- SY-002: Paradox resolution
- SY-003: DNA completeness
- SY-004: Cross-domain consistency
- SY-005: Temporal stability
- SY-006: Context sensitivity
- SY-007: Edge case handling
- SY-008: Fidelity score calculation
- SY-009: Version compatibility

### Implementation (7 tasks)
- IM-001: Prompt token efficiency
- IM-002: Provider compatibility
- IM-003: Response quality benchmark
- IM-004: Latency optimization
- IM-005: Error handling coverage
- IM-006: Session persistence
- IM-007: Resource utilization

### Quality (6 tasks)
- QA-001: Clone response accuracy
- QA-002: Style matching score
- QA-003: Knowledge retrieval accuracy
- QA-004: Conversation flow naturalness
- QA-005: Edge case handling
- QA-006: Long-term consistency

---

## Related ADRs

- ADR-006: Mind-Based Architecture
- ADR-008: 6 Human Checkpoints
- ADR-009: Meta-Cognition Layer

---

## Change Log

| Date | Description |
|------|-------------|
| 2026-02-20 | Initial approval |

---

*Approved by: User, Aria (Architect), Orion (AIOS Master)*

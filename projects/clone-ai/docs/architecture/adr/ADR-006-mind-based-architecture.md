# ADR-006: Mind-Based Architecture

**Status:** Approved
**Date:** 2026-02-20
**Decision Makers:** Aria (Architect), Orion (AIOS Master), User
**Supersedes:** N/A

---

## Context

O Clone Lab v1.0 utiliza analyzers genéricos baseados na interface `IAnalyzer` sem personalidade ou especialização profunda. A análise comparativa com o Pipeline Alan Nicolas v4.0 demonstrou que agentes com personas bem definidas produzem resultados mais coerentes, confiáveis e explicáveis.

### Problem Statement

- Analyzers atuais não têm especialização por dimensão da personalidade
- Falta de personas dificulta a explicabilidade dos resultados
- Não há coordenação clara entre diferentes tipos de análise
- Resultados são genéricos e sem profundidade especializada

---

## Decision

Adotar arquitetura baseada em 8 "Minds" (Agentes Analíticos) com personas inspiradas em especialistas reais, cada um responsável por uma dimensão específica da personalidade.

### The 8 Minds

| Mind | Inspiração | Responsabilidade |
|------|------------|------------------|
| **Tim** | Tim Ferriss | Extração base e curadoria de fontes |
| **Daniel** | Daniel Kahneman | Padrões comportamentais e vieses cognitivos |
| **Brene** | Brené Brown | Valores, crenças e vulnerabilidades |
| **Barbara** | Barbara Oakley | Arquitetura cognitiva e estilos de pensamento |
| **Charlie** | Charlie Munger | Síntese, paradoxos e modelos mentais |
| **Constantin** | - | Implementação técnica e viabilidade |
| **Quinn** | James Clear | Quality Assurance e consistência |
| **Victoria** | - | Viabilidade prática e trade-offs |

### Architecture Changes

```
packages/minds/
├── src/
│   ├── base/
│   │   └── mind.interface.ts      # IMind interface
│   ├── tim/
│   │   └── extraction-mind.ts
│   ├── daniel/
│   │   └── behavioral-mind.ts
│   ├── brene/
│   │   └── values-mind.ts
│   ├── barbara/
│   │   └── cognitive-mind.ts
│   ├── charlie/
│   │   └── synthesis-mind.ts
│   ├── constantin/
│   │   └── implementation-mind.ts
│   ├── quinn/
│   │   └── qa-mind.ts
│   └── victoria/
│       └── feasibility-mind.ts
└── package.json
```

---

## Consequences

### Positive
- Análise mais profunda e especializada por dimensão
- Melhor explicabilidade dos resultados (cada mind tem expertise clara)
- Orquestração clara entre dimensões da personalidade
- Personas facilitam entendimento por humanos
- Base para sistema de auto-evolução (minds podem aprender)

### Negative
- Maior complexidade de implementação inicial
- Necessidade de coordenação entre minds
- Mais código para manter
- Curva de aprendizado para desenvolvedores

### Mitigations
- Interface comum `IMind` padroniza implementação
- Orchestrator package gerencia coordenação
- Documentação clara de cada mind
- Templates para adicionar novos minds

---

## Implementation Notes

1. Criar interface `IMind` com métodos: `analyze()`, `validate()`, `synthesize()`
2. Implementar cada mind como classe separada
3. Criar `MindOrchestrator` para coordenar execução
4. Migrar analyzers existentes para minds correspondentes
5. Atualizar CLI para usar novo sistema

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

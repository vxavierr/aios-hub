# Frontend/UX Specification - Synkra AIOS HUB

> **Document Type:** Frontend/UX Analysis
> **Generated:** 2026-02-20
> **Workflow:** Brownfield Discovery - Phase 3
> **Agent:** @ux-design-expert

---

## 1. Executive Summary

O Synkra AIOS HUB é primariamente um **framework CLI-first**. O frontend é secundário e consiste de:

1. **Health Dashboard** - Dashboard React para visualização de health checks
2. **Squad Templates** - Configurações de squads (não-UI)

### Status: CLI First Architecture

Conforme a Constitution (Artigo I), **toda funcionalidade DEVE funcionar via CLI antes de qualquer UI**. O Health Dashboard é uma camada de **observabilidade**, não de controle.

---

## 2. Health Dashboard

### 2.1 Tech Stack

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | ^18.2.0 | UI Framework |
| React DOM | ^18.2.0 | React rendering |
| React Router DOM | ^6.20.0 | Routing |
| Recharts | ^2.10.0 | Charts/Visualization |
| Vite | ^7.3.1 | Build tool |
| ESLint | ^8.54.0 | Linting |

### 2.2 Directory Structure

```
.aios-core/scripts/diagnostics/health-dashboard/
├── index.html              # Entry point
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── README.md               # Documentation
├── public/                 # Static assets
└── src/
    ├── main.jsx            # React entry
    ├── App.jsx             # Main component
    ├── components/         # Reusable components
    │   ├── AutoFixLog.css
    │   ├── DomainCard.css
    │   ├── HealthScore.css
    │   ├── IssuesList.css
    │   ├── TechDebtList.css
    │   └── shared/
    │       ├── Card.css
    │       ├── Chart.css
    │       ├── Header.css
    │       └── StatusBadge.css
    ├── hooks/              # Custom hooks
    ├── pages/              # Page components
    │   ├── Dashboard.css
    │   └── DomainDetail.css
    └── styles/             # Global styles
        ├── App.css
        └── index.css
```

### 2.3 Components Inventory

| Componente | Tipo | Propósito |
|------------|------|-----------|
| App | Page | Main application container |
| Dashboard | Page | Main dashboard view |
| DomainDetail | Page | Domain-specific details |
| AutoFixLog | Component | Auto-fix history log |
| DomainCard | Component | Domain summary card |
| HealthScore | Component | Health score display |
| IssuesList | Component | List of issues |
| TechDebtList | Component | Technical debt list |
| Card | Shared | Reusable card container |
| Chart | Shared | Chart wrapper |
| Header | Shared | Page header |
| StatusBadge | Shared | Status indicator |

### 2.4 Features

- **Health Score Visualization** - Score visual do sistema
- **Domain Cards** - Cards por domínio (repository, services, deployment)
- **Issues List** - Lista de problemas identificados
- **Auto-Fix Log** - Histórico de correções automáticas
- **Tech Debt List** - Lista de débitos técnicos

---

## 3. Squad System (Non-UI)

### 3.1 Marketing Performance Squad

**Localização:** `squads/marketing-performance/`

| Diretório | Conteúdo |
|-----------|----------|
| agents/ | Agentes do squad |
| checklists/ | Checklists de validação |
| config/ | Configurações |
| data/ | Dados do squad |
| scripts/ | Scripts de automação |
| tasks/ | Tasks específicas |
| templates/ | Templates |
| tools/ | Ferramentas |
| workflows/ | Workflows do squad |

### 3.2 Squad Configuration

```yaml
# squad.yaml (estrutura esperada)
name: marketing-performance
description: Marketing automation squad
agents:
  - content-creator
  - seo-optimizer
  - social-media-manager
```

---

## 4. Design System (Not Implemented)

### 4.1 Current State

- **Design Tokens:** Não implementados
- **Component Library:** Componentes isolados no Health Dashboard
- **Theme System:** Não implementado
- **Accessibility (a11y):** Não auditado

### 4.2 CSS Architecture

| Arquivo | Propósito |
|---------|-----------|
| index.css | Global styles |
| App.css | App-level styles |
| Component.css | Component-specific styles |

**Observação:** CSS é component-based (um CSS por componente), mas não há sistema de design tokens ou variáveis CSS centralizadas.

---

## 5. Débitos Técnicos Identificados (Frontend/UX Level)

### 5.1 CRITICAL

| ID | Débito | Área | Impacto |
|----|--------|------|---------|
| UX-001 | Sem design system/tokens | Design | Inconsistência visual |
| UX-002 | Sem testes de UI | QA | Regressões não detectadas |

### 5.2 HIGH

| ID | Débito | Área | Impacto |
|----|--------|------|---------|
| UX-003 | Sem audit de acessibilidade | A11y | Potencial não-compliance |
| UX-004 | Sem tema dark/light | UX | Preferência do usuário |
| UX-005 | Health Dashboard não tem CI/CD | DevOps | Builds não automatizados |

### 5.3 MEDIUM

| ID | Débito | Área | Impacto |
|----|--------|------|---------|
| UX-006 | Sem responsividade mobile | Mobile | UX ruim em dispositivos móveis |
| UX-007 | Sem storybook/component catalog | Docs | Dificulta descoberta de componentes |
| UX-008 | CSS duplicado entre componentes | Código | DRY violation |

### 5.4 LOW

| ID | Débito | Área | Impacto |
|----|--------|------|---------|
| UX-009 | Sem loading states | UX | Feedback visual ausente |
| UX-010 | Sem error boundaries | UX | Erros não tratados graciosamente |

---

## 6. Pontos de Melhoria de UX

### 6.1 Quick Wins

1. **Adicionar CSS Variables** para cores e espaçamentos
2. **Implementar loading states** nos componentes
3. **Adicionar error boundaries** no React
4. **Auditar acessibilidade** com ferramentas automatizadas

### 6.2 Short-term

1. **Criar Design Tokens** básicos (colors, spacing, typography)
2. **Implementar tema dark** (já que é dashboard de dev)
3. **Adicionar testes de UI** com Testing Library
4. **Configurar CI/CD** para o dashboard

### 6.3 Long-term

1. **Criar Storybook** para documentação de componentes
2. **Implementar Design System** completo
3. **Adicionar PWA support** para uso offline
4. **Internacionalização (i18n)** se necessário

---

## 7. Constitution Alignment

### 7.1 CLI First ✅

O Health Dashboard respeita a Constitution:
- É uma camada de **observabilidade** (visualização)
- Não controla nem toma decisões
- Funcionalidade completa via CLI existe

### 7.2 Observability Hierarchy

```
CLI (Máxima) → Observability (Secundária) → UI (Terciária)
                    ↑
            Health Dashboard está aqui
```

---

## 8. Próximos Passos (Brownfield Discovery)

- [x] **FASE 1:** System Architecture
- [x] **FASE 2:** Database (Pulado - sem DB no HUB)
- [x] **FASE 3:** Frontend/UX (este documento)
- [ ] **FASE 4:** Consolidation DRAFT (@architect)
- [ ] **FASE 5-7:** Specialist Validation
- [ ] **FASE 8:** Final Assessment
- [ ] **FASE 9:** Executive Report
- [ ] **FASE 10:** Epic + Stories

---

*Generated by @ux-design-expert | Brownfield Discovery Phase 3*
*Synkra AIOS v4.2.13*

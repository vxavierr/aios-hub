# Product Requirements Document (PRD)
## Hub Multi-Projeto AIOS

**Version:** 1.0
**Author:** Morgan (@pm) + João
**Date:** 2026-02-19
**Status:** Draft

---

## 1. Goals and Background Context

### Goals

- **G1:** Transformar o workspace AIOS em um Hub central que orquestra múltiplos projetos isolados
- **G2:** Permitir visibilidade global de todos os projetos e seus estados
- **G3:** Manter memória persistente e contextual entre projetos usando o sistema AIOS existente
- **G4:** Capacitar o AIOS Master a acionar agentes de qualquer projeto a partir do Hub
- **G5:** Facilitar a criação de novos projetos com AIOS isolado dentro do workspace
- **G6:** Suportar workflows e squads globais para tarefas cross-domain
- **G7:** Preparar integração com serviços externos (ads, redes sociais, APIs)

### Background Context

O usuário João utiliza o Synkra AIOS como framework de desenvolvimento assistido por IA. Atualmente, o workspace é um único projeto AIOS. Com o crescimento da demanda por múltiplos projetos e tarefas diversas, surge a necessidade de um **Hub central** que permita:

1. **Organização** — Projetos isolados em `projects/{nome}` com seus próprios `.aios-core/`
2. **Visibilidade** — O Hub mantém contexto de todos os projetos (status, stories ativas, épics)
3. **Orquestração** — O AIOS Master pode navegar e acionar agentes de qualquer projeto
4. **Memória** — Padrões, decisões e aprendizados são compartilhados via sistema AIOS existente
5. **Expansibilidade** — Workflows globais, squads, e integrações externas no futuro

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-19 | 1.0 | Initial PRD creation | Morgan (@pm) + João |

---

## 2. Requirements

### Functional Requirements

**FR1:** O Hub DEVE escanear a pasta `projects/` e detectar projetos AIOS válidos (com `.aios-core/`)

**FR2:** O Hub DEVE registrar projetos detectados no `entity-registry.yaml` como entidades tipo `project`

**FR3:** O Hub DEVE manter um `project-status.yaml` consolidado com status de todos os projetos

**FR4:** O AIOS Master DEVE poder listar todos os projetos com seus status

**FR5:** O AIOS Master DEVE poder acionar agentes de projetos específicos via comando `*switch-project {nome}` ou similar

**FR6:** O Hub DEVE executar um script de sincronização na ativação do AIOS Master para atualizar contexto

**FR7:** O script de sincronização DEVE ler o `project-status.yaml` de cada projeto e consolidar no Hub

**FR8:** O Hub DEVE usar `learned-patterns.yaml` para armazenar padrões globais e preferências do usuário

**FR9:** O Hub DEVE usar `docs/sessions/` para handoffs e contexto de sessão (sistema já existente)

**FR10:** O comando `*create-project {nome}` DEVE criar um novo projeto com AIOS isolado em `projects/{nome}/`

**FR11:** O Hub DEVE suportar projetos em diferentes estados: `active`, `paused`, `archived`

**FR12:** O Hub DEVE exibir no greeting do AIOS Master um resumo dos projetos ativos

**FR13:** O Hub DEVE suportar **Workflows** globais que não pertencem a um projeto específico

**FR14:** O Hub DEVE suportar **Squads** globais para tarefas cross-domain

**FR15:** O Hub DEVE poder usar MCPs configurados para integrações externas

**FR16:** O Hub DEVE suportar tarefas ad-hoc sem necessidade de criar um projeto formal

**FR17:** O Hub DEVE ter um sistema de **Templates** para workflows comuns

**FR18:** O Hub DEVE permitir clonar/configurar "agentes de IA personalizados" para tarefas específicas

### Non-Functional Requirements

**NFR1:** O script de sincronização DEVE completar em menos de 5 segundos para 10 projetos

**NFR2:** O sistema DEVE ser compatível com a infraestrutura AIOS existente (entity-registry, project-status, sessions)

**NFR3:** O Hub NÃO DEVE modificar arquivos de projetos sem comando explícito do usuário

**NFR4:** O sistema DEVE funcionar em Windows (ambiente atual do usuário)

**NFR5:** O registro de projetos DEVE seguir o schema do entity-registry.yaml existente

**NFR6:** A memória do Hub DEVE ser persistida em arquivos (YAML/Markdown), não em memória volátil

---

## 3. Technical Assumptions

### Repository Structure
- **Monorepo** com pasta `projects/` contendo subprojetos

### Service Architecture
- **CLI-first** (conforme Constitution AIOS)
- Scripts Node.js para sincronização
- YAML para configuração e registry

### Testing Requirements
- Unit tests para `sync-projects.js`
- Integration tests para fluxo de criação de projeto
- Manual testing para fluxo de ativação

### Technical Stack
- **Runtime:** Node.js 18+
- **Format:** YAML (entity-registry, project-status, config)
- **Scripts:** JavaScript (ESM)
- **Integration:** unified-activation-pipeline.js

---

## 4. Epic List

| Epic | Title | Goal | Fase |
|------|-------|------|------|
| **1** | Foundation & Registry | Estabelecer estrutura de pastas, registry de projetos e script de sincronização | MVP |
| **2** | Hub Commands | Implementar comandos do AIOS Master para listar, criar e trocar projetos | MVP |
| **3** | Cross-Project Memory | Integrar memória global via learned-patterns e sistema de sessions | MVP |
| **4** | Activation Integration | Integrar sync-projects.js no activation pipeline do AIOS Master | MVP |
| **5** | Global Workflows & Squads | Suportar workflows e squads no nível do Hub para tarefas cross-domain | Fase 2 |
| **6** | External Integrations | Configurar MCPs e integrações para ads, redes sociais, APIs externas | Fase 3 |

---

## 5. Epic Details

### Epic 1: Foundation & Registry

**Goal:** Estabelecer a estrutura de pastas, o registry de projetos no entity-registry.yaml, e o script de sincronização que detecta e registra projetos automaticamente.

#### Story 1.1: Criar Estrutura de Pastas do Hub

**As a** João (Hub Owner),
**I want** uma estrutura de pastas organizada para o Hub,
**So that** eu tenha um local claro para projetos, workflows e recursos globais.

**Acceptance Criteria:**
1. Pasta `projects/` criada para projetos isolados
2. Pasta `workflows/` criada para workflows globais do Hub
3. Pasta `squads/` criada para squads globais (já existe, verificar)
4. Arquivo `.aios/project-status.yaml` criado para status do Hub
5. Estrutura documentada no README do Hub

**Executor:** @dev
**Quality Gate:** @architect

---

#### Story 1.2: Script de Sincronização de Projetos

**As a** AIOS Master,
**I want** um script que escaneie `projects/` e atualize o entity-registry,
**So that** eu tenha visibilidade atualizada de todos os projetos.

**Acceptance Criteria:**
1. Script `sync-projects.js` criado em `.aios-core/scripts/`
2. Script detecta pastas com `.aios-core/` como projetos válidos
3. Script adiciona/atualiza entidades tipo `project` no `entity-registry.yaml`
4. Script lê `project-status.yaml` de cada projeto e consolida no Hub
5. Script completa em < 5 segundos para 10 projetos
6. Unit tests para o script

**Executor:** @dev
**Quality Gate:** @architect

---

#### Story 1.3: Schema de Project no Entity Registry

**As a** AIOS Developer,
**I want** um schema definido para entidades tipo `project`,
**So that** o registry tenha estrutura consistente.

**Acceptance Criteria:**
1. Schema documentado para entidades `project` no entity-registry
2. Campos obrigatórios: `path`, `aiosCore`, `status`, `lastActivity`
3. Campos opcionais: `techStack`, `activeStory`, `activeEpic`, `description`
4. Script de validação para garantir conformidade

**Executor:** @architect
**Quality Gate:** @dev

---

### Epic 2: Hub Commands

**Goal:** Implementar comandos no AIOS Master para listar, criar, e trocar contexto entre projetos.

#### Story 2.1: Comando *list-projects

**As a** João,
**I want** um comando para listar todos os projetos com seus status,
**So that** eu tenha visibilidade rápida do meu workspace.

**Acceptance Criteria:**
1. Comando `*list-projects` adicionado ao AIOS Master
2. Lista mostra: nome, status, última atividade, story/epic ativo
3. Suporta filtros: `--status active|paused|archived`
4. Output em tabela formatada

**Executor:** @dev
**Quality Gate:** @architect

---

#### Story 2.2: Comando *create-project

**As a** João,
**I want** um comando para criar novos projetos com AIOS isolado,
**So that** eu possa iniciar novos projetos rapidamente.

**Acceptance Criteria:**
1. Comando `*create-project {nome}` adicionado ao AIOS Master
2. Cria pasta `projects/{nome}/`
3. Inicializa `.aios-core/` com configuração básica
4. Cria `project-status.yaml` inicial
5. Registra projeto no entity-registry via sync-projects.js
6. Pergunta template: greenfield, brownfield, ou custom

**Executor:** @dev
**Quality Gate:** @architect

---

#### Story 2.3: Comando *switch-project

**As a** AIOS Master,
**I want** um comando para mudar contexto para um projeto específico,
**So that** eu possa operar dentro de um projeto isolado.

**Acceptance Criteria:**
1. Comando `*switch-project {nome}` adicionado ao AIOS Master
2. Carrega contexto do projeto (AIOS config, stories, status)
3. Exibe greeting com contexto do projeto
4. Comandos subsequentes operam no contexto do projeto
5. Comando `*hub` para voltar ao contexto do Hub

**Executor:** @dev
**Quality Gate:** @architect

---

#### Story 2.4: Comando *project-status

**As a** João,
**I want** ver o status detalhado de um projeto específico,
**So that** eu entenda o estado atual do trabalho.

**Acceptance Criteria:**
1. Comando `*project-status {nome}` mostra detalhes do projeto
2. Inclui: epic ativo, story ativa, últimos commits, blockers
3. Sem argumentos, mostra status do projeto atual (se em projeto)

**Executor:** @dev
**Quality Gate:** @architect

---

### Epic 3: Cross-Project Memory

**Goal:** Integrar memória global usando learned-patterns.yaml, entity-registry, e sistema de sessions para contexto persistente entre projetos.

#### Story 3.1: Memória Global em learned-patterns.yaml

**As a** AIOS Master,
**I want** armazenar padrões e preferências globais,
**So that** eu aprenda com o uso e melhore ao longo do tempo.

**Acceptance Criteria:**
1. `learned-patterns.yaml` estruturado para categorias: `preferences`, `patterns`, `lessons`
2. AIOS Master pode ler/escrever padrões globais
3. Padrões incluem: preferências de código, workflows favoritos, atalhos
4. Script de merge para combinar padrões de projetos no Hub

**Executor:** @dev
**Quality Gate:** @architect

---

#### Story 3.2: Contexto de Sessão Cross-Project

**As a** AIOS Master,
**I want** manter contexto quando troco de projeto,
**So that** eu não perca o fio da meada.

**Acceptance Criteria:**
1. `session-state.json` do Hub rastreia projeto atual
2. Histórico de trocas de projeto preservado
3. Ao voltar para um projeto, contexto é restaurado
4. Handoffs em `docs/sessions/` incluem projeto de origem

**Executor:** @dev
**Quality Gate:** @architect

---

#### Story 3.3: Workspace Memory Document

**As a** João,
**I want** um documento de memória do workspace,
**So that** eu tenha uma visão narrativa do meu trabalho.

**Acceptance Criteria:**
1. Arquivo `workspace-memory.md` criado em `.aios-core/data/`
2. Seções: Contexto Global, Projetos Ativos, Decisões, Padrões, Lições
3. Atualizado automaticamente pelo sync-projects.js
4. Legível e editável manualmente pelo usuário

**Executor:** @dev
**Quality Gate:** @architect

---

### Epic 4: Activation Integration

**Goal:** Integrar sync-projects.js no activation pipeline do AIOS Master para que o contexto seja atualizado automaticamente na ativação.

#### Story 4.1: Hook de Sync na Ativação

**As a** AIOS Master,
**I want** que o sync de projetos rode automaticamente na minha ativação,
**So that** eu sempre tenha contexto atualizado.

**Acceptance Criteria:**
1. `unified-activation-pipeline.js` chama `sync-projects.js` antes do greeting
2. Sync roda de forma não-bloqueante (async)
3. Erros de sync não impedem ativação (graceful degradation)
4. Log de sync registrado para debug

**Executor:** @dev
**Quality Gate:** @architect

---

#### Story 4.2: Greeting Enriquecido com Hub Context

**As a** AIOS Master,
**I want** meu greeting mostrar contexto do Hub,
**So that** o usuário entenda o estado do workspace.

**Acceptance Criteria:**
1. Greeting mostra: número de projetos, projetos ativos, projeto atual
2. Indica se há projetos com blockers ou pendências
3. Mostra última atividade do workspace
4. Formato adaptativo (minimal se 0 projetos, detalhado se vários)

**Executor:** @dev
**Quality Gate:** @architect

---

#### Story 4.3: Comando *sync Manual

**As a** João,
**I want** um comando para forçar sincronização manual,
**So that** eu possa atualizar contexto sob demanda.

**Acceptance Criteria:**
1. Comando `*sync` força execução do sync-projects.js
2. Mostra output do sync em tempo real
3. Reporta projetos adicionados/removidos/atualizados

**Executor:** @dev
**Quality Gate:** @architect

---

### Epic 5: Global Workflows & Squads (Fase 2)

**Goal:** Suportar workflows e squads no nível do Hub para tarefas cross-domain que não pertencem a um projeto específico.

#### Story 5.1: Workflows Globais do Hub

**As a** João,
**I want** criar workflows que operam no nível do Hub,
**So that** eu possa automatizar tarefas cross-project.

**Acceptance Criteria:**
1. Pasta `workflows/` no Hub reconhecida pelo AIOS
2. Workflows globais podem ser executados pelo AIOS Master
3. Workflow de exemplo: content-creation.yaml
4. Workflows podem acessar contexto de múltiplos projetos

**Executor:** @dev
**Quality Gate:** @architect

---

#### Story 5.2: Squads Globais

**As a** AIOS Master,
**I want** definir squads que operam no Hub,
**So that** eu tenha agentes especializados para tarefas comuns.

**Acceptance Criteria:**
1. Squads em `squads/` podem ser ativadas no contexto do Hub
2. Squad de exemplo: content-squad (writer + editor + reviewer)
3. Squads podem usar MCPs configurados no Hub
4. Comando `*activate-squad {nome}` no AIOS Master

**Executor:** @dev
**Quality Gate:** @architect

---

#### Story 5.3: Templates de Workflow

**As a** João,
**I want** templates prontos para workflows comuns,
**So that** eu não precise criar do zero.

**Acceptance Criteria:**
1. Templates em `.aios-core/templates/workflows/`
2. Templates incluem: content-creation, research, data-analysis
3. Comando `*create-workflow --from-template {template}`
4. Templates documentados com exemplos de uso

**Executor:** @dev
**Quality Gate:** @architect

---

### Epic 6: External Integrations (Fase 3)

**Goal:** Configurar MCPs e integrações para conectar o Hub com serviços externos como Google Ads, Meta Ads, redes sociais, e APIs.

#### Story 6.1: MCP Configuration Hub-Level

**As a** @devops,
**I want** configurar MCPs no nível do Hub,
**So that** todos os projetos possam usar integrações compartilhadas.

**Acceptance Criteria:**
1. MCPs globais configurados em `.claude/mcp.json` do Hub
2. MCPs disponíveis para AIOS Master e projetos filhos
3. Documentação de MCPs suportados: Playwright, EXA, Apify
4. Comando `*list-mcps` no AIOS Master

**Executor:** @devops
**Quality Gate:** @architect

---

#### Story 6.2: Integração com Google/Meta Ads

**As a** João,
**I want** acessar minhas contas de ads via Hub,
**So that** eu possa criar planejamentos e relatórios.

**Acceptance Criteria:**
1. MCP ou API para Google Ads configurável
2. MCP ou API para Meta Ads configurável
3. Workflow de exemplo: ads-report.yaml
4. Comando `*ads status` para resumo de campanhas

**Executor:** @dev
**Quality Gate:** @architect

---

#### Story 6.3: Scrapping de Redes Sociais

**As a** João,
**I want** fazer scrapping de minhas contas em redes sociais,
**So that** eu possa analisar engajamento e conteúdo.

**Acceptance Criteria:**
1. Integração com Apify Actors para scrapping
2. Suporte para: Instagram, LinkedIn, Twitter/X, TikTok
3. Workflow de exemplo: social-audit.yaml
4. Output em formato estruturado (JSON/Markdown)

**Executor:** @dev
**Quality Gate:** @architect

---

#### Story 6.4: AI Clones / Custom Agents

**As a** João,
**I want** criar agentes de IA personalizados,
**So that** eu tenha assistentes especializados para tarefas específicas.

**Acceptance Criteria:**
1. Template para criar custom agents
2. Agentes podem ter prompts e conhecimentos específicos
3. Comando `*create-agent {nome}` no AIOS Master
4. Agentes personalizados listados em `custom-agents/`

**Executor:** @dev
**Quality Gate:** @architect

---

## 6. Summary

### Stories por Fase

| Fase | Epic | Stories | Prioridade |
|------|------|---------|------------|
| **MVP** | Epic 1 | 1.1, 1.2, 1.3 | Alta |
| **MVP** | Epic 2 | 2.1, 2.2, 2.3, 2.4 | Alta |
| **MVP** | Epic 3 | 3.1, 3.2, 3.3 | Alta |
| **MVP** | Epic 4 | 4.1, 4.2, 4.3 | Alta |
| **Fase 2** | Epic 5 | 5.1, 5.2, 5.3 | Média |
| **Fase 3** | Epic 6 | 6.1, 6.2, 6.3, 6.4 | Baixa |

### Total: 17 Stories

---

## 7. Next Steps

1. **@architect:** Revisar PRD e definir arquitetura técnica
2. **@architect:** Criar documento de arquitetura em `docs/architecture/`
3. **@sm:** Criar stories formais a partir deste PRD
4. **@dev:** Implementar MVP (Epics 1-4)

---

*Document generated by Morgan (@pm) - Product Manager*
*Synkra AIOS Framework*

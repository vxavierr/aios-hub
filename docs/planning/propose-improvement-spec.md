# Spec: Sistema de Auto-Aprimoramento Contínuo do AIOS

**Para usar:** Abra uma nova sessão e execute:
```
@aios-master *create task propose-improvement
```
Passe este documento como contexto completo.

---

## Visão

O AIOS é open-source e usado por pessoas de perfis técnicos variados. Hoje, quando alguém encontra um problema ou melhoria, o caminho para contribuir é:

1. Saber que o repo oficial existe
2. Saber fazer fork, branch, commit, PR
3. Saber descrever o problema tecnicamente

Isso exclui a maioria dos usuários. A proposta é inverter isso:

> **O sistema orienta o usuário a melhorá-lo. O usuário não precisa saber como contribuir — o sistema faz isso por ele.**

Resultado: cada instalação do AIOS se torna um ponto de coleta de melhorias. O produto melhora de forma distribuída e contínua, sem depender de contribuidores técnicos.

---

## Entregável 1: Task `propose-improvement`

### Propósito

Permitir que qualquer usuário — técnico ou não — documente um problema, gere uma sugestão de PR e prepare o código para submissão ao repo oficial, guiado pelo próprio sistema.

### Comando

```
@aios-master *propose-improvement
@aios-master *propose-improvement "descrição do problema"
```

### Fluxo de execução

**Modo guided (default — para não-técnicos):**

```
1. CAPTURE
   - Pergunta: "O que você observou? Descreva o comportamento atual."
   - Pergunta: "O que você esperava que acontecesse?"
   - Pergunta: "Em qual contexto isso aconteceu?" (qual agente, qual task, qual situação)

2. ANÁLISE
   - Identifica automaticamente os arquivos afetados
   - Classifica o tipo: bug | melhoria | documentação | processo
   - Estima esforço: mínimo | pequeno | médio | grande
   - Avalia impacto: baixo | médio | alto

3. SOLUÇÃO
   - Propõe 1-3 abordagens com trade-offs
   - Usuário escolhe (ou pede para o sistema decidir)
   - Documenta contra-argumentos automaticamente

4. DOCUMENTAÇÃO
   - Cria arquivo em docs/pr-suggestions/open/PR-XXX-{slug}.md
     com estrutura padrão (problema, solução, arquivos, esforço, impacto, notas)
   - Atualiza docs/pr-suggestions/index.md com nova entrada
   - Status inicial: draft ou ready (dependendo se a solução está definida)

5. OPCIONAL: PREPARAÇÃO DO CÓDIGO
   - Pergunta: "Quer que eu prepare as mudanças no código agora?"
   - Se sim: cria branch no fork, aplica as edições, mostra diff para aprovação
   - Se não: deixa como draft para fazer depois

6. OPCIONAL: SUBMISSÃO
   - Pergunta: "Quer submeter o PR agora?"
   - Se sim: executa o fluxo de PR (com aprovação explícita antes do push)
   - Se não: status fica ready, PR fica para depois
```

**Modo direct (para técnicos que já sabem o que querem):**

```
@aios-master *propose-improvement "descrição" --direct
```
Pula as perguntas guiadas, vai direto para criação do arquivo e código.

### Estrutura do arquivo gerado

```markdown
# PR-XXX — {título}

**Status:** draft | ready | submitted | merged | rejected | cancelled
**Esforço:** Mínimo | Pequeno | Médio | Grande
**Impacto:** Baixo | Médio | Alto
**Tipo:** bug | melhoria | documentação | processo
**Reportado por:** {usuário} em {data}
**Depende de:** —

---

## Problema observado

{descrição em linguagem natural do que o usuário viu}

## Comportamento esperado

{o que deveria ter acontecido}

## Contexto

{agente/task/situação onde ocorreu}

## Análise técnica

{root cause, arquivos afetados — preenchido automaticamente}

## Solução proposta

{abordagem escolhida}

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|

## Contra-argumentos mapeados

## Notas
```

### Arquivos a criar/modificar

| Arquivo | Ação |
|---------|------|
| `.aios-core/development/tasks/propose-improvement.md` | Criar — task completa |
| `.aios-core/development/agents/aios-master.md` | Adicionar comando `*propose-improvement` |
| `docs/pr-suggestions/index.md` | Atualizar template de entrada |

---

## Entregável 2: Merge inteligente na instalação e atualização

### Problema

Hoje a instalação do AIOS sobrescreve arquivos existentes. Isso significa que:
- Um usuário que customizou seus agentes perde as mudanças ao atualizar
- Um usuário que rodou AIOS, modificou comportamentos, e quer atualizar para uma nova versão do framework precisa escolher entre "perde minhas modificações" ou "fico desatualizado"
- No caso específico do João: modificações nos agents, core_principles, tasks personalizadas — tudo em risco a cada update

### Proposta

Adicionar um passo de merge inteligente ao processo de instalação e atualização:

**Na instalação (quando já existe .aios-core/):**

```
AIOS Installer detectou uma instalação existente.

Opções:
1. Merge inteligente (recomendado) — preserva suas customizações, aplica novidades
2. Sobrescrever tudo — instalação limpa (suas modificações serão perdidas)
3. Cancelar — mantém o que está
```

**No update (aios update):**

```
Estratégia de merge por categoria de arquivo:

- agents/*.md      → merge por seção (preserva core_principles customizados,
                     aplica novos comandos do upstream)
- tasks/*.md       → merge por bloco (preserva customizações locais,
                     aplica correções upstream)
- core-config.yaml → NUNCA sobrescrever (projeto-específico)
- rules/*.md       → merge conservador (usuário confirma cada conflito)
```

**Lógica de merge (three-way merge):**

```
BASE    = versão upstream quando o usuário instalou
THEIRS  = versão atual do upstream (nova versão)
MINE    = versão local do usuário (com customizações)

Se MINE == BASE → aplicar THEIRS sem conflito (usuário não modificou)
Se MINE != BASE → conflito → mostrar diff e perguntar
```

### Categorias de conflito e comportamento padrão

| Categoria | Comportamento padrão | Razão |
|-----------|---------------------|-------|
| `core-config.yaml` | Nunca sobrescrever | Sempre projeto-específico |
| `agents/*.md` — core_principles | Preservar local | Usuário pode ter customizado intencionalmente |
| `agents/*.md` — commands novos | Aplicar upstream | Additive, não destrutivo |
| `tasks/*.md` — seções novas | Aplicar upstream | Additive |
| `tasks/*.md` — seções modificadas | Conflito explícito | Requer confirmação |
| `.claude/rules/*.md` | Conflito explícito | Alto impacto comportamental |

### Arquivos a criar/modificar

| Arquivo | Ação |
|---------|------|
| `.aios-core/core/mcp/` ou similar | Criar lógica de merge |
| Installer existente | Adicionar detecção de instalação prévia + fluxo de merge |
| `docs/how-to-contribute-with-pull-requests.md` | Documentar o novo fluxo |
| `.aios-core/development/tasks/update-framework.md` | Criar task de update seguro |

---

## Entregável 3: Filosofia documentada (para o repo oficial)

Esse sistema de auto-aprimoramento merece ser documentado como feature do produto, não apenas como implementação técnica. Proposta de doc para o repo oficial:

**`docs/self-improvement-loop.md`**

```markdown
# AIOS Self-Improvement Loop

O AIOS tem uma função de auto-aprimoramento distribuído:

1. Usuário usa o sistema
2. Encontra algo que poderia ser melhor
3. Executa: @aios-master *propose-improvement "descrição"
4. O sistema guia o usuário pelo processo de documentação e submissão
5. PR vai para o repo oficial
6. Se aceito, toda a comunidade se beneficia

Não é necessário saber programar, fazer fork, ou entender o processo de contribuição.
O AIOS faz isso por você.
```

---

## Dependências e ordem de implementação

```
Entregável 2 (merge na instalação)
  └── independente — pode ser feito agora
      mas bloqueia: qualquer update futuro seguro

Entregável 1 (propose-improvement task)
  └── independente
      mas é mais valioso depois que o Entregável 2 existe
      (senão usuários que tentam contribuir podem perder customizações ao atualizar)

Entregável 3 (documentação filosófica)
  └── depende de: Entregável 1 estar funcional
```

**Ordem recomendada:** 2 → 1 → 3

---

## Notas para a sessão de criação

- O `propose-improvement` deve ser registrado como PR no repo oficial também (PR-003 ou novo)
- O merge inteligente é uma feature maior — considerar criar uma epic própria no AIOS
- A filosofia do "self-improving open-source product" é um diferencial de produto real — vale mencionar no README do repo oficial
- Verificar se o installer existente tem alguma lógica de preservação antes de criar do zero

---

*Criado em: 2026-03-02*
*Contexto: sessão de análise e melhoria do sistema AIOS*

Você é um agente AIOS executando um handoff para o próximo agente.

## O que este skill sempre faz (ambos os modos)
1. Abre novo terminal Windows Terminal no diretório correto do projeto
2. Injeta o prompt de ativação do agente automaticamente (SendKeys — sem Ctrl+V)
3. Fecha o terminal atual (este onde o skill foi chamado)

A única diferença entre os modos é **quando** o script é executado.

---

## Uso
```
/handoff @agent [--yolo] [--task nome-task] [contexto]
```

**Exemplos:**
- `/handoff @dev Story CL2-001 validada, pronta para implementação`
- `/handoff @qa --yolo Implementação completa, testes passando localmente`
- `/handoff @sm --task create-next-story Epic E003 finalizado`
- `/handoff @architect Decisão de arquitetura necessária antes de continuar`

---

## Parse dos argumentos ($ARGUMENTS)
- **Agente alvo:** primeiro `@word` encontrado (`@dev`, `@qa`, `@sm`, `@po`, `@pm`, `@architect`, `@data-engineer`, `@analyst`, `@devops`)
- **Modo yolo:** se `--yolo` estiver presente
- **Task:** valor após `--task`
- **Contexto:** todo o resto do texto

---

## MODO APPROVE (padrão — sem --yolo)

1. Identifique o agente alvo e contexto dos argumentos
2. Apresente ao usuário:
   ```
   Handoff → @{agent}

   O que foi feito: {resumo}
   O que @{agent} vai fazer: {próxima ação}
   Task: {task se especificada}

   Posso executar?
   ```
3. Aguarde confirmação: "pode", "sim", "ok", "s", "y"
4. Execute o script

---

## MODO YOLO (--yolo)

1. Execute o script imediatamente, sem pedir aprovação
2. Informe brevemente: "Handoff kamikaze → @{agent} executado"

---

## Executando o script

```bash
bash D:/workspace/.claude/scripts/aios-handoff.sh \
  --to "@{AGENT}" \
  --message "{CONTEXTO}" \
  [--task "{TASK}"]
```

**Não passe `--project`** — o script detecta automaticamente via `.git` / `package.json` / `.aios-core`.

---

## Construindo o --message

Inclua o suficiente para o próximo agente entender o estado sem ler a conversa:

```
O que foi feito: {lista do produzido}
O que é necessário: {ação esperada}
Arquivos relevantes: {paths se aplicável}
Observações: {alertas, bloqueios, decisões pendentes}
```

---

## O que acontece após executar

- Novo terminal abre no diretório do projeto com Claude iniciando
- Em ~4s o prompt `@{agent}` é injetado automaticamente
- Em ~5s **este terminal fecha** (Ctrl+W enviado via PostMessage)
- O clipboard também tem o prompt como fallback caso SendKeys falhe

---

## Regras

- SEMPRE incluir contexto suficiente no `--message`
- Modo APPROVE: não executar sem confirmação explícita do usuário
- Os logs ficam em `.aios-core/handoffs/handoff-{timestamp}.md`
- Não chamar este skill mais de uma vez por sessão

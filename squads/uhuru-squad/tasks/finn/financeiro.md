# Task: Processo Financeiro Mensal

**Agente:** @finn
**Comando:** `*financeiro {mês}`
**Frequência:** Mensal

---

## Objetivo

Executar o processo financeiro do mês — confirmar investimentos no Operant, verificar notas fiscais e enviar email de fechamento para o time financeiro.

---

## Inputs

- `{mês}` — mês/ano de referência (ex: "jan/2026")
- Relatórios de gasto confirmados das plataformas
- Acesso ao Operant

---

## Execução

### Passo 1 — Consolidar investimentos do mês

Para cada cliente:
1. Abrir planilha de controle de budget
2. Confirmar gasto real vs. gasto planejado por canal
3. Calcular total investido no mês

Tabela de fechamento:
```
{cliente} | Meta: R$ {real} / R$ {planejado} | Google: R$ {real} / R$ {planejado} | Total: R$ {real}
```

### Passo 2 — Registrar no Operant

1. Acessar Operant
2. Lançar os investimentos de cada cliente por plataforma
3. Confirmar que os valores batem com os comprovantes das plataformas

### Passo 3 — Verificar Notas Fiscais

Verificar se as NFs das plataformas foram recebidas:
- Meta Ads: verificar faturamento no Business Manager
- Google Ads: verificar faturas no Google Ads Billing
- LinkedIn: verificar faturas no LinkedIn Campaign Manager

Se NF não recebida → registrar como pendente.

### Passo 4 — Email para Financeiro

Redigir email de fechamento do mês:

```
Assunto: Fechamento de Investimentos em Mídia — {mês}

Equipe Financeiro,

Segue o fechamento dos investimentos em mídia paga do mês de {mês}:

{tabela de gastos por cliente e canal}

Total investido: R$ {total_geral}

NFs recebidas: {lista}
NFs pendentes: {lista}

[Anexar comprovantes de gasto das plataformas]

Qualquer dúvida, estou à disposição.
Att,
```

### Passo 5 — Arquivar

- Salvar comprovantes de gasto em pasta do Google Drive
- Registrar fechamento no Notion como concluído

---

## Outputs

- [ ] Tabela de fechamento por cliente/canal
- [ ] Lançamentos no Operant confirmados
- [ ] NFs verificadas e pendências documentadas
- [ ] Email enviado ao financeiro
- [ ] Arquivamento no Google Drive

---

## Tom e padrões de escrita

**Tom geral:** formal, preciso, auditável. O processo financeiro gera documentos que podem ser revisados pelo time financeiro ou pelo cliente — cada número deve ser rastreável à fonte.

**Sempre:**
- Valores sempre em R$ com 2 casas decimais
- Mostrar real vs. planejado com desvio em R$ e %: "R$ 3.280,45 / R$ 3.240,00 (+1,2%)"
- Identificar a fonte de cada número: "Fonte: Meta Ads Manager > Billing > Fev/2026"
- Listar NFs com número, data de emissão e status (recebida/pendente)
- Email de fechamento deve ser autocontido — o financeiro não deveria precisar abrir outra ferramenta para entender

**Nunca:**
- Arredondar valores no fechamento financeiro — centavos importam
- Enviar email sem verificar que os números do Operant batem com as plataformas
- Omitir NFs pendentes — flagar explicitamente com prazo estimado de recebimento
- Misturar meses de referência — se uma NF é de janeiro mas chegou em fevereiro, registrar corretamente

---

## Comportamento do agente

**Se algum valor no Operant não bater com a plataforma (diferença > R$ 5):**
→ PARAR. Investigar a causa (câmbio, taxa, lançamento duplicado). Não enviar email com discrepância.

**Se uma NF não foi recebida após 10 dias do fechamento:**
→ Incluir alerta no email: "NF pendente: Meta Ads — Fev/2026. Solicitar ao suporte da plataforma."

**Se o cliente tem múltiplas contas (PRODOM_):**
→ Consolidar em tabela única com subtotal por conta + total geral. Cada linha com o nome do empreendimento.

**Se é o primeiro fechamento de um cliente novo:**
→ Verificar se os dados de faturamento (CNPJ, razão social) estão corretos antes de enviar.

---

## Exemplo Real

> Fechamento financeiro Fevereiro/2026.

---

```
💰 Fechamento Financeiro — Fevereiro/2026

━━━ TABELA DE FECHAMENTO ━━━

Cliente      | Meta Ads              | Google Ads             | LinkedIn        | Total
OCP_         | R$ 3.180,22 / R$ 3.000 (+6,0%) | R$ 2.240,18 / R$ 2.000 (+12,0%) | —              | R$ 5.420,40
ASM_         | R$ 780,50 / R$ 800 (-2,4%)     | R$ 695,30 / R$ 700 (-0,7%)      | —              | R$ 1.475,80
BDG_         | R$ 1.520,00 / R$ 1.500 (+1,3%) | R$ 980,45 / R$ 1.000 (-2,0%)   | R$ 500,00 / R$ 500 (0%) | R$ 3.000,45
PRODOM_      | R$ 620,00 / R$ 600 (+3,3%)     | —                               | —              | R$ 620,00

TOTAL GERAL: R$ 10.516,65

━━━ OPERANT ━━━
- OCP_: ✅ Lançado (conferido com plataformas — diferença R$ 0)
- ASM_: ✅ Lançado (conferido — diferença R$ 0)
- BDG_: ✅ Lançado (conferido — diferença R$ 0)
- PRODOM_: ✅ Lançado (conferido — diferença R$ 0)

━━━ NOTAS FISCAIS ━━━

NF                          | Nº           | Emissão    | Status
Meta Ads — Fev/2026        | 2026-02-4821 | 01/03/2026 | ✅ Recebida
Google Ads — Fev/2026      | INV-4492031  | 03/03/2026 | ✅ Recebida
LinkedIn Ads — Fev/2026    | LI-88291     | 05/03/2026 | ⏳ Pendente (estimativa: até 10/03)

━━━ EMAIL ENVIADO ━━━

Assunto: Fechamento de Investimentos em Mídia — Fevereiro/2026
Destinatário: financeiro@uhuru.com.br
Enviado em: 05/03/2026 às 10:15
Anexos: comprovantes de gasto Meta + Google + LinkedIn

⚠️ NF pendente: LinkedIn Ads — Fev/2026. Estimativa de recebimento: até 10/03.

Arquivado em: Google Drive > /Clientes/Fechamentos/2026-02/
```

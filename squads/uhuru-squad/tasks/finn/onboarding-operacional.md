# Task: Setup Operacional de Novo Cliente

**Agente:** @finn
**Comando:** `*onboarding-operacional {cliente}`
**Frequência:** Sob demanda (onboarding de novo cliente)
**Workflow:** `*new-client` — Step 2

---

## Objetivo

Configurar toda a infraestrutura operacional e financeira para o novo cliente — pastas, planilhas, acessos às plataformas.

---

## Inputs

- `{cliente}` — prefixo do cliente (ex: OCP_)
- Briefing de onboarding (@flux/*onboarding-identificacao)
- Canais confirmados (Meta, Google, LinkedIn)

---

## Execução

### Passo 1 — Google Drive

Criar estrutura de pastas:
```
/Clientes/{nome_cliente}/
├── Criativos/
│   ├── Aprovados/
│   └── Em produção/
├── Relatórios/
├── Comprovantes/
│   └── {ano}-{mês}/
└── Contratos/
```

### Passo 2 — Planilha de controle de budget

Na planilha principal do Google Sheets:
1. Criar nova aba com nome: `{PREFIX_} — {nome_cliente}`
2. Configurar colunas: Data | Meta Ads | Google Ads | LinkedIn | Total | Obs
3. Inserir budget diário meta por canal (conforme plano de mídia)
4. Inserir fórmulas de pace e alertas

### Passo 3 — Acessos às plataformas

**Meta Ads:**
- [ ] Conta de anúncios compartilhada com a Uhuru (Business Manager)
- [ ] Pixel instalado no site do cliente
- [ ] Acesso confirmado ao Meta Ads Manager

**Google Ads:**
- [ ] Conta vinculada ao MCC da Uhuru (ID: 4043314752)
- [ ] Tag de conversão instalada
- [ ] Acesso confirmado ao Google Ads

**LinkedIn (se aplicável):**
- [ ] Conta de anúncios compartilhada
- [ ] Insight Tag instalada
- [ ] Acesso confirmado ao Campaign Manager

### Passo 4 — Notion

- [ ] Página do cliente criada no Notion
- [ ] Seções: Briefing | Planos de Mídia | Relatórios | Otimizações | Leads
- [ ] Dados do briefing migrados para a página

### Passo 5 — Operant

- [ ] Cliente cadastrado no Operant
- [ ] Dados de faturamento preenchidos (CNPJ, razão social)
- [ ] Canais vinculados

---

## Output

```
✅ Setup operacional concluído — {PREFIX_} ({nome_cliente})

Google Drive: /Clientes/{nome_cliente}/ ✅
Planilha de budget: aba "{PREFIX_}" criada ✅
Meta Ads: acesso {✅/⏳ pendente}
Google Ads: acesso {✅/⏳ pendente}
LinkedIn: {✅/⏳ pendente/N/A}
Notion: página criada ✅
Operant: cadastrado ✅

Pendências: {lista ou "nenhuma"}

→ Próximo: @flux/*estrategia {PREFIX_} + @nova/*onboarding-tracking {PREFIX_}
```

---

## Outputs

- [ ] Pasta no Google Drive criada
- [ ] Aba na planilha de budget criada
- [ ] Acessos às plataformas solicitados/confirmados
- [ ] Página no Notion criada
- [ ] Cliente cadastrado no Operant
- [ ] Pendências documentadas (se houver)

---

## Tom e padrões de escrita

**Tom geral:** checklist, operacional, zero ambiguidade. Setup é binário: feito ou não feito.

**Sempre:**
- Usar ✅ / ⏳ / ❌ para status de cada item
- Listar pendências com responsável e prazo
- Confirmar que acessos funcionam (testar login, não apenas solicitar)

**Nunca:**
- Marcar acesso como "confirmado" sem testar
- Avançar para estratégia sem planilha de budget criada — @finn precisa dela para *alocar

---

## Comportamento do agente

**Se o cliente demora para compartilhar acesso às plataformas:**
→ Registrar como pendência com data. Não bloquear as outras etapas que não dependem de acesso.

**Se o cliente não tem conta de anúncios criada:**
→ Criar conta dentro do Business Manager da Uhuru (Meta) ou vincular nova conta ao MCC (Google). Documentar IDs.

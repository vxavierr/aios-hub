# Task: Normalizar Leads

**Agente:** @nova
**Comando:** `*normalizar-leads {cliente} [arquivo.csv]`
**Frequência:** Semanal, antes de *leads

---

## Objetivo

Receber o CSV de leads exportado do CRM/plataforma de captura do cliente, descartar colunas irrelevantes, limpar os dados e produzir um dataset limpo e pronto para qualificação pela task *leads.

---

## Clientes com leads ativos

| Cliente | Status | CRM/Fonte | Observação |
|---------|--------|-----------|-----------|
| OCP_ | ativo | RD Station (RD Marketing) | Configurado e detalhado abaixo |
| ASM_ | inativo | — | Sem geração de leads ainda |
| BDG_ | em config | — | Adicionar mapeamento de colunas quando ativar |
| PRODOM_ | em config | — | Adicionar mapeamento de colunas quando ativar |

**Quando um novo cliente ativar leads:** duplicar a seção de mapeamento de colunas do OCP_ abaixo, adaptar os nomes das colunas conforme o CSV do novo CRM, e atualizar a tabela acima.

---

## Inputs

- `{cliente}` — código do cliente (ver tabela acima)
- `[arquivo.csv]` — CSV exportado do CRM do cliente (fornecido pelo usuário)

**Se o arquivo não for fornecido → PERGUNTAR antes de continuar.**
**Se cliente não tiver leads ativos → informar e orientar a configurar o mapeamento.**

---

## Mapeamento de colunas por cliente

### OCP_ (Ocupacional) — RD Station

O arquivo vem do **RD Station (RD Marketing)** com o nome padrão:
`OCP__ Leads LP Comercial - RD MARKETING.csv`

Contém **21 colunas**. A maioria é ruído ou já está decodificada em outras colunas.

---

## Passo 1 — Colunas a manter vs descartar

### ✅ Manter (campos relevantes para qualificação)

| Coluna original | Campo padrão | Observação |
|----------------|-------------|-----------|
| Data | data_conversao | Data/hora da conversão |
| Nome | nome | Nome do lead |
| E-mail | email | Email preenchido |
| Empresa | empresa | Campo livre — frequentemente informal |
| CNPJ | cnpj | Quase sempre vazio, usar quando disponível |
| Cargo | cargo | Quase sempre vazio, usar quando disponível |
| Tamanho do seu time? | tamanho_time | Campo de qualificação crítico |
| Estágio do Lead | estagio | Ex: Lead, Pré Qualificação |
| Campanha | campanha | Ex: [uhu][ads]comercial-search-conversao |
| Content | conteudo | Ex: seguranca, saude-ocupacional, imagem-b |
| Medium | midia | feed, search, pmax, cpc |
| Source | origem | facebook, google |
| Evento (última conversão) | evento | Ex: comercial, uhu-whatsapp-comercial |

### ❌ Descartar (ruído ou redundante)

| Coluna | Motivo |
|--------|--------|
| Origem do Lead | UTM base64 — já decodificado em Source/Medium/Campanha/Content |
| Tamanho do seu time? (2) | Duplicata da coluna anterior |
| Term | Pouco relevante para qualificação |
| Etapa do Funil | Quase sempre vazio |
| Motivo da Perda | Quase sempre vazio |
| Como quero ser contatado? | Quase sempre vazio |
| Atualizado | Redundante com Data |
| Contador | Sempre 1, sem valor analítico |

---

## Passo 2 — Limpeza dos dados

**Datas:**
- Padronizar `data_conversao` para `DD/MM/YYYY HH:MM`

**Nome:**
- Trim de espaços extras (ex: "Silvanele jacinta soares pimenta " → "Silvanele Jacinta Soares Pimenta")
- Capitalizar corretamente

**Email:**
- Converter para minúsculas
- Classificar domínio: `corporativo` (não é gmail/hotmail/yahoo/outlook) ou `pessoal`

**Empresa:**
- Trim e capitalização básica
- Marcar como `[SUSPEITO]` quando:
  - Empresa com apenas 1 palavra sem sentido (ex: "Prada", "Universo", "Rural", "Lêo")
  - Empresa com caracteres aleatórios (ex: "Ksjsjwowlkxnq")
  - Emojis no nome (ex: "Livre camisetas 👕")
  - Nome pessoal no campo empresa (ex: "Leandro Apolinário", "Renan")
  - "Nem um", "Eu não tei", "Nenhuma" ou similares

**Tamanho do time:**
- Padronizar para categoria: `1-10` | `11-50` | `51-100` | `101-300` | `300+` | `não informado`

**CNPJ:**
- Se preenchido: manter como texto, remover formatação (deixar só números: 14 dígitos)
- Se vazio: manter como vazio (será tratado na qualificação)

**Campanha:**
- Extrair label limpo removendo prefixo `[uhu][ads]`:
  - `[uhu][ads]comercial-search-conversao` → `comercial-search`
  - `[uhu][ads]comercial-pmax-conversao` → `comercial-pmax`
  - `[uhu][ads]comercial-conversao-estatico` → `comercial-estatico`

---

## Passo 3 — Validação básica

- [ ] Total de linhas processadas registrado
- [ ] Período coberto identificado (menor e maior data_conversao)
- [ ] Quantidade de empresas marcadas como `[SUSPEITO]`
- [ ] Quantidade com CNPJ preenchido vs vazio
- [ ] Distribuição por tamanho_time calculada
- [ ] Distribuição por origem (facebook vs google) calculada

---

## Output

Entregar o dataset normalizado no seguinte formato:

```
📋 LEADS NORMALIZADOS — OCP_ | {período}

Total de leads: {n}
Período: {data_min} a {data_max}
Empresas suspeitas (flag): {n} ({%})
CNPJ disponível: {n} ({%})
Por origem: Google {n} ({%}) | Meta {n} ({%})
Por tamanho do time:
  1-10:    {n} ({%})
  11-50:   {n} ({%})
  51-100:  {n} ({%})
  101-300: {n} ({%})
  300+:    {n} ({%})
  N/A:     {n} ({%})

[TABELA DE LEADS NORMALIZADOS]
(campos: data_conversao | nome | email | dominio_email | empresa | empresa_flag | cnpj | cargo | tamanho_time | origem | midia | campanha | conteudo | evento | estagio)
```

- [ ] Dataset de leads normalizados entregue
- [ ] Resumo estatístico incluído
- [ ] Empresas suspeitas flagadas
- [ ] Pronto para *leads

---

## Schema padrão de saída (todos os clientes)

Independente do CRM de origem, o dataset normalizado DEVE ter estas colunas:

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| data_conversao | DD/MM/YYYY HH:MM | sim |
| nome | texto | sim |
| email | texto (minúsculas) | sim |
| dominio_email | corporativo / pessoal | sim |
| empresa | texto | sim |
| empresa_flag | [OK] / [SUSPEITO] | sim |
| cnpj | 14 dígitos ou vazio | não |
| cargo | texto ou vazio | não |
| tamanho_time | 1-10/11-50/51-100/101-300/300+/não informado | não |
| origem | facebook/google/linkedin/organico | sim |
| midia | feed/search/pmax/cpc/etc | sim |
| campanha | label limpo (sem prefixo) | sim |
| conteudo | texto ou vazio | não |
| evento | texto ou vazio | não |
| estagio | Lead/Pré Qualificação/etc | não |

---

## Como adicionar um novo cliente

1. Exportar um CSV de amostra do CRM do novo cliente
2. Mapear as colunas do CSV para o schema padrão acima
3. Duplicar a seção "OCP_ (Ocupacional) — RD Station" acima e adaptar:
   - Nome do cliente e CRM
   - Tabela de colunas a manter com os nomes corretos do CSV
   - Tabela de colunas a descartar
   - Regras de limpeza específicas (ex: prefixo de campanha diferente)
4. Atualizar a tabela "Clientes com leads ativos" no topo para `ativo`
5. Criar task `leads-{CLIENTE}.md` com critérios de qualificação do negócio do novo cliente
6. Atualizar `ciclo-semanal.yaml` → `leads_status` para o novo cliente

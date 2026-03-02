# Task: Normalizar Leads — OCP_ (Ocupacional)

**Agente:** @nova
**Comando:** `*normalizar-leads {cliente} [arquivo.csv]`
**Frequência:** Semanal, antes de *leads
**Aplicável:** OCP_ (outros clientes sem leads ativos por enquanto)

---

## Objetivo

Receber o CSV de leads exportado do RD Marketing / RD Station da Ocupacional, descartar colunas irrelevantes, limpar os dados e produzir um dataset limpo e pronto para qualificação pela task *leads.

---

## Sobre o CSV de Leads da Ocupacional

O arquivo vem do **RD Station (RD Marketing)** com o nome padrão:
`OCP__ Leads LP Comercial - RD MARKETING.csv`

Contém **21 colunas**. A maioria é ruído ou já está decodificada em outras colunas.

---

## Inputs

- `{cliente}` — deve ser OCP_ para esta task
- `[arquivo.csv]` — CSV exportado do RD Station (fornecido pelo usuário)

**Se o arquivo não for fornecido → PERGUNTAR antes de continuar.**
**Se cliente não for OCP_ → informar que leads ainda não estão ativos para este cliente.**

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

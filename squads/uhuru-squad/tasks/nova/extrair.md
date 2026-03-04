# Task: Extrair Dados das Plataformas (Automatizado)

**Agente:** @nova
**Comando:** `*extrair {cliente} {plataforma} {período}`
**Frequência:** Semanal (Big Numbers) ou sob demanda

---

## Objetivo

Extrair dados de performance das plataformas de anúncios via API e retornar um dataset estruturado no schema padrão — pronto para `*analisar` direto, sem necessidade de `*normalizar`.

Para CSVs manuais (LinkedIn ou quando API falha) → usar `*normalizar` separadamente.

---

## Configurações e Credenciais

### Google Ads
- **Config:** `D:/workspace/.google-ads/google-ads.yaml`
- **Biblioteca:** `google-ads` (gRPC) — `import google.ads.googleads.client as gc`
- **MCC (login_customer_id):** `4043314752`

| Cliente | customer_id | Tipo |
|---------|------------|------|
| OCP_ (Ocupacional) | `1792983925` | single |
| ASM_ (AssisteMed) | `7809585552` | single |
| BDG_ (Grupo BDG) | — conta nao criada | single |
| PRODOM_ (PRO DOMO) | multi-conta (9 empreendimentos) | multi |

**PRODOM_ — IDs por empreendimento (Google Ads):**

| Empreendimento | customer_id |
|---------------|------------|
| Momentum Residence | `8191944396` |
| Versato Residence | `8883689425` |
| Orb. Residence | `8268657335` |
| Omnium Residence | `4710522596` |
| Luxus Garden | `6138451264` |
| Station Tower | `6969424044` |
| Pulse Estoril | `1504245027` |
| Province di Martini | `6621202829` |
| Evidence Tower | `6034478025` |

### Meta Ads
- **Config:** `D:/workspace/.meta-ads/meta-ads.yaml`
- **Biblioteca:** `requests` (Graph API REST)
- **Endpoint base:** `https://graph.facebook.com/v19.0/`
- **⚠️ Token expira ~60 dias** — renovar em https://developers.facebook.com/tools/explorer/

| Cliente | account_id | Tipo |
|---------|-----------|------|
| OCP_ (Ocupacional) | `act_731712541845783` | single |
| ASM_ (AssisteMed) | `act_730670408450980` | single |
| BDG_ (Grupo BDG) | — conta nao criada | single |
| PRODOM_ (PRO DOMO) | multi-conta (9 empreendimentos) | multi |

**PRODOM_ — IDs por empreendimento (Meta Ads):**

| Empreendimento | account_id |
|---------------|-----------|
| Momentum Residence | `act_556262111077243` |
| Versato Residence | `act_651257333020336` |
| Orb. Residence | `act_833478355504504` |
| Omnium Residence | `act_448925148090159` |
| Luxus Garden | `act_866005048806156` |
| Station Tower | `act_970652531633268` |
| Pulse Estoril | `act_1051723046407931` |
| Province di Martini | `act_974147657934374` |
| Evidence Tower | `act_938738281474555` |

---

## Inputs

- `{cliente}` — código do cliente: OCP_, ASM_, BDG_, PRODOM_
- `{plataforma}` — google | meta | all
- `{período}` — ex: `"2026-02-24 a 2026-03-02"` ou `"semana-passada"` ou `"fevereiro"`

**Se cliente ou período não forem informados → PERGUNTAR antes de continuar.**

Atalhos de período aceitos:
- `semana-passada` → segunda a domingo da semana anterior
- `esta-semana` → segunda até hoje
- `mes-passado` → mês calendário anterior
- `YYYY-MM-DD a YYYY-MM-DD` → período customizado

---

## Passo 1 — Validar inputs

1. Cliente existe na tabela de IDs? → Se não: alertar e parar
2. account_id / customer_id do cliente está preenchido? → Se null: alertar, informar que precisa ser cadastrado
3. Período é válido e não está no futuro? → Se inválido: perguntar
4. Plataforma `all`? → Executar Google + Meta em sequência

---

## Passo 2 — Extração Google Ads

Gerar e executar o script Python abaixo, adaptando `CLIENTE`, `DATE_START` e `DATE_END`.

O script lida automaticamente com conta única (OCP_, ASM_) e múltiplas contas (PRODOM_):

```python
import sys, io, yaml
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import google.ads.googleads.client as gc

cfg    = yaml.safe_load(open('D:/workspace/.google-ads/google-ads.yaml'))
client = gc.GoogleAdsClient.load_from_storage('D:/workspace/.google-ads/google-ads.yaml')
ga_svc = client.get_service('GoogleAdsService')

CLIENTE    = '{OCP_ | ASM_ | BDG_ | PRODOM_}'
DATE_START = '{YYYY-MM-DD}'
DATE_END   = '{YYYY-MM-DD}'

# Resolver contas do cliente
cliente_cfg = cfg['accounts'][CLIENTE]
if cliente_cfg['type'] == 'single':
    contas = [{'id': cliente_cfg['id'], 'name': cliente_cfg['name']}]
else:
    contas = cliente_cfg['ids']

QUERY = f"""
    SELECT
        campaign.name,
        ad_group.name,
        ad_group_ad.ad.name,
        segments.date,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpm,
        metrics.average_cpc,
        metrics.cost_micros,
        metrics.conversions,
        metrics.cost_per_conversion
    FROM ad_group_ad
    WHERE segments.date BETWEEN '{DATE_START}' AND '{DATE_END}'
      AND metrics.impressions > 0
    ORDER BY campaign.name, segments.date
"""

print("conta|campanha|conjunto|anuncio|data|impressoes|cliques|ctr|cpm|cpc|investimento|conversoes|cpa")

for conta in contas:
    if not conta['id']:
        print(f"# AVISO: {conta.get('name', CLIENTE)} sem customer_id — pulando")
        continue
    try:
        rows = list(ga_svc.search(customer_id=conta['id'], query=QUERY))
        for r in rows:
            print("|".join([
                conta['name'],
                r.campaign.name,
                r.ad_group.name,
                r.ad_group_ad.ad.name or "",
                r.segments.date,
                str(r.metrics.impressions),
                str(r.metrics.clicks),
                f"{r.metrics.ctr:.4f}",
                f"{r.metrics.average_cpm / 1e6:.2f}",
                f"{r.metrics.average_cpc / 1e6:.2f}",
                f"{r.metrics.cost_micros / 1e6:.2f}",
                f"{r.metrics.conversions:.1f}",
                f"{r.metrics.cost_per_conversion / 1e6:.2f}" if r.metrics.conversions > 0 else "0"
            ]))
    except Exception as e:
        print(f"# ERRO {conta['name']}: {e}")
```

**Erros comuns Google Ads:**
- `AuthenticationError` → refresh_token expirado. Informar João para renovar OAuth.
- `QuotaError` → limite de requisições. Aguardar e tentar novamente.
- `customer_id not found` → ID errado na tabela. Verificar no Google Ads Manager.

---

## Passo 3 — Extração Meta Ads

Gerar e executar o script Python abaixo, adaptando `CLIENTE`, `DATE_START` e `DATE_END`.

O script lida automaticamente com clientes de conta única (OCP_, ASM_) e múltiplas contas (PRODOM_), iterando sobre todas e consolidando:

```python
import sys, io, yaml, requests, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

cfg         = yaml.safe_load(open('D:/workspace/.meta-ads/meta-ads.yaml'))
ACCESS_TOKEN = cfg['access_token']
API_VERSION  = cfg['api_version']
CLIENTE      = '{OCP_ | ASM_ | BDG_ | PRODOM_}'
DATE_START   = '{YYYY-MM-DD}'
DATE_END     = '{YYYY-MM-DD}'

# Resolver contas do cliente
cliente_cfg = cfg['accounts'][CLIENTE]
if cliente_cfg['type'] == 'single':
    contas = [{'id': cliente_cfg['id'], 'name': cliente_cfg['name']}]
else:
    contas = cliente_cfg['ids']

def get_conversions(actions):
    if not actions:
        return 0
    for a in actions:
        if a['action_type'] in ('lead', 'onsite_conversion.lead_grouped', 'offsite_conversion.fb_pixel_lead'):
            return float(a['value'])
    return 0

def get_cpa(cost_per_action, spend, conversions):
    if cost_per_action:
        for a in cost_per_action:
            if a['action_type'] in ('lead', 'onsite_conversion.lead_grouped', 'offsite_conversion.fb_pixel_lead'):
                return float(a['value'])
    return float(spend) / conversions if conversions > 0 else 0

FIELDS = ",".join([
    "campaign_name","adset_name","ad_name",
    "date_start","date_stop",
    "impressions","clicks","ctr","cpm","cpc","spend",
    "actions","cost_per_action_type","reach","frequency"
])

print("conta|campanha|conjunto|anuncio|data_inicio|data_fim|impressoes|cliques|ctr|cpm|cpc|investimento|conversoes|cpa|alcance|frequencia")

for conta in contas:
    if not conta['id']:
        print(f"# AVISO: {conta.get('name', CLIENTE)} sem account_id — pulando")
        continue

    url = f"https://graph.facebook.com/{API_VERSION}/{conta['id']}/insights"
    params = {
        "fields": FIELDS,
        "time_range": json.dumps({"since": DATE_START, "until": DATE_END}),
        "level": "ad",
        "time_increment": 1,
        "limit": 500,
        "access_token": ACCESS_TOKEN
    }

    resp = requests.get(url, params=params)
    data = resp.json()

    if "error" in data:
        print(f"# ERRO {conta['name']}: {data['error']['message']}")
        continue

    for row in data.get("data", []):
        conv = get_conversions(row.get("actions"))
        cpa  = get_cpa(row.get("cost_per_action_type"), row.get("spend", 0), conv)
        print("|".join([
            conta['name'],
            row.get("campaign_name", ""),
            row.get("adset_name", ""),
            row.get("ad_name", ""),
            row.get("date_start", ""),
            row.get("date_stop", ""),
            row.get("impressions", "0"),
            row.get("clicks", "0"),
            f"{float(row.get('ctr', 0)):.4f}",
            f"{float(row.get('cpm', 0)):.2f}",
            f"{float(row.get('cpc', 0)):.2f}",
            f"{float(row.get('spend', 0)):.2f}",
            f"{conv:.1f}",
            f"{cpa:.2f}",
            row.get("reach", "0"),
            f"{float(row.get('frequency', 0)):.2f}"
        ]))
```

**Erros comuns Meta Ads:**
- `OAuthException` / código 190 → Token expirado. Renovar em https://developers.facebook.com/tools/explorer/ e atualizar `D:/workspace/.meta-ads/meta-ads.yaml`.
- `account_id inválido` → Verificar o `act_` na tabela acima.
- `(#10)` Permission error → Token não tem permissão `ads_read`. Regenerar com esse escopo.

---

## Passo 4 — Montar dataset de saída

Após rodar os scripts, consolidar os dados e apresentar no formato:

```
📥 EXTRAÇÃO CONCLUÍDA — {cliente} | {plataforma} | {período}

Fonte: {Google Ads API | Meta Graph API}
Período: {data_inicio} a {data_fim}
Linhas extraídas: {n}
Campanhas: {lista}
Conjuntos: {n únicos}
Anúncios: {n únicos}

Schema: campanha | conjunto | anuncio | data | impressoes | cliques | ctr | cpm | cpc | investimento | conversoes | cpa

[DADOS EM TABELA]

⚠️ Alertas: {nenhum | descrição de anomalias encontradas}
✅ Pronto para *analisar
```

---

## Passo 5 — Alertas automáticos

Antes de entregar, verificar:

- [ ] Alguma campanha ativa sem impressões no período? → alertar
- [ ] Investimento zerado em campanha que deveria estar rodando? → alertar
- [ ] CPA acima de 2x a média histórica? → alertar
- [ ] Token Meta expira em menos de 7 dias? → alertar com link de renovação

---

## Comportamento em casos especiais

**Se `account_id` for null na config:**
→ "O cliente {X} não tem `account_id` cadastrado para {plataforma}. Peça ao João o ID da conta no Ads Manager e adicione em `D:/workspace/.meta-ads/meta-ads.yaml`."

**Se o período for muito longo (> 90 dias):**
→ "Período de {n} dias pode demorar e atingir limite de requisições. Confirma que quer extrair tudo de uma vez?"

**Se nenhum dado retornar (0 linhas):**
→ Não entregar tabela vazia. Verificar se o filtro de período está correto e se as campanhas estavam ativas. Informar ao usuário.

**Se `plataforma = all`:**
→ Executar Google primeiro, depois Meta. Entregar os dois datasets separados com cabeçalho identificando a fonte. Não misturar em uma tabela só.

---

## Output

- [ ] Dataset extraído com schema padrão
- [ ] Alertas de anomalia identificados
- [ ] Pronto para `*analisar` (sem necessidade de `*normalizar`)

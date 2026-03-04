# Task: Setup de Tracking de Novo Cliente

**Agente:** @nova
**Comando:** `*onboarding-tracking {cliente}`
**Frequência:** Sob demanda (onboarding de novo cliente)
**Workflow:** `*new-client` — Step 5

---

## Objetivo

Configurar e validar todo o rastreamento de conversões do novo cliente — pixels, tags, eventos e primeira extração de dados.

---

## Inputs

- `{cliente}` — prefixo do cliente (ex: OCP_)
- Acessos às plataformas confirmados (@finn/*onboarding-operacional)
- URL do site/landing page do cliente

---

## Execução

### Passo 1 — Meta Pixel

1. Verificar se o Pixel está instalado no site do cliente
   - Usar Meta Pixel Helper (extensão Chrome) para validar
2. Se não instalado → fornecer código ao cliente ou configurar via Google Tag Manager
3. Configurar eventos de conversão:
   - `Lead` — formulário preenchido
   - `Contact` — clique no WhatsApp (se aplicável)
   - `PageView` — automático
4. Testar: disparar evento teste e confirmar no Events Manager

### Passo 2 — Google Tag (gtag.js / GTM)

1. Verificar se a tag global está instalada
   - Usar Google Tag Assistant para validar
2. Configurar conversões:
   - Conversão primária: formulário / WhatsApp / telefone
   - Conversão secundária: page view de páginas-chave
3. Vincular ao Google Ads como ação de conversão
4. Testar: disparar conversão teste e confirmar no Google Ads > Conversões

### Passo 3 — LinkedIn Insight Tag (se aplicável)

1. Instalar Insight Tag no site
2. Configurar conversão (URL-based ou event-based)
3. Testar: confirmar no Campaign Manager > Conversions

### Passo 4 — Planilha de leads

1. Configurar planilha/CRM para receber leads:
   - Se usa RD Station → configurar export CSV
   - Se usa formulário simples → configurar Google Sheets como destino
2. Verificar que os campos mínimos estão sendo capturados: nome, email, telefone, empresa
3. Configurar UTM params nas URLs de destino:
   - `utm_source={plataforma}`
   - `utm_medium=cpc`
   - `utm_campaign={nome_campanha}`

### Passo 5 — Primeira extração

1. Executar `*extrair {cliente} all` para validar que os dados estão chegando
2. Se falhar → documentar causa e usar CSV manual como fallback
3. Registrar IDs de conta no mapeamento de `extrair.md`:
   - Meta Account ID
   - Google Ads Customer ID
   - LinkedIn Account ID (se aplicável)

---

## Output

```
📊 Tracking configurado — {PREFIX_}

Meta Pixel: {✅ instalado e testado / ⏳ pendente}
- Eventos: Lead ✅ | Contact ✅ | PageView ✅
- Teste: {data} — evento disparado e confirmado no Events Manager

Google Tag: {✅ instalado e testado / ⏳ pendente}
- Conversão primária: {tipo} ✅
- Teste: {data} — conversão confirmada no Google Ads

LinkedIn: {✅ / N/A}

Planilha de leads: {✅ configurada / ⏳ pendente}
- Destino: {RD Station / Google Sheets}
- UTMs: configuradas ✅

Primeira extração (*extrair): {✅ sucesso / ❌ falha — usar CSV}
- Meta Account ID: {id}
- Google Customer ID: {id}

Pendências: {lista ou "nenhuma"}
```

---

## Outputs

- [ ] Meta Pixel instalado e eventos testados
- [ ] Google Tag instalada e conversões configuradas
- [ ] LinkedIn Insight Tag (se aplicável)
- [ ] Planilha/CRM de leads configurada
- [ ] UTM params configurados
- [ ] Primeira extração executada com sucesso
- [ ] IDs de conta registrados em extrair.md

---

## Tom e padrões de escrita

**Tom geral:** técnico, preciso, orientado a validação. Tracking errado = dados errados = decisões erradas. Cada item precisa ser TESTADO, não apenas configurado.

**Sempre:**
- Testar cada pixel/tag ANTES de marcar como concluído
- Registrar data do teste e evidência (screenshot ou log)
- Documentar IDs de conta para uso em *extrair

**Nunca:**
- Marcar tracking como "configurado" sem testar disparo de evento
- Assumir que o GTM está instalado sem verificar
- Pular UTM params — sem UTMs, a atribuição de leads fica impossível

---

## Comportamento do agente

**Se o site do cliente não aceita scripts (Wix, plataformas fechadas):**
→ Verificar se a plataforma tem integração nativa com Meta/Google. Documentar limitação.

**Se o cliente usa CRM diferente de RD Station:**
→ Adaptar a configuração de planilha de leads para o CRM do cliente. Documentar o fluxo de export.

**Se a primeira extração falhar:**
→ Documentar o erro. Configurar fallback CSV manual e registrar na configuração de *extrair.

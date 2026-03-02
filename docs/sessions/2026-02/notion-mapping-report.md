# Mapeamento do Notion - Uhuru Comunicação
## Data: 2026-02-20

---

## 📊 PÁGINAS DOS FAVORITOS (3 DATABASES)

### 1. Ocupacional
**URL:** `https://www.notion.so/uhuru-comunicacao/Ocupacional-a9adbad0564948369cbbaf0ec544f066`

**Propriedades (20):**
| Nome | Tipo |
|------|------|
| Ocupacional | select |
| Links Externos | text |
| ads.google.com | text |
| adsmanager.facebook.com | text |
| LinkedIn Campaign Manager | text |
| Relatórios | text |
| Dia a Dia | text |
| Sistema | text |
| Resumo do Mês | text |
| Resumo do Ano | text |
| Controle de Orçamento | text |
| Visitas ao perfil | text |
| Engajamento | text |
| Comercial Pmax | text |
| Comercial Search | text |
| Experimentos | text |
| Campanhas | text |

**Views (3):**
- Resumo
- Experimentos
- Timeline

---

### 2. AssisteMed
**URL:** `https://www.notion.so/uhuru-comunicacao/AssisteMed-7f240474e6d048109947206900b0312b`

**Propriedades (16):**
| Nome | Tipo |
|------|------|
| AssisteMed | select |
| Links Externos | text |
| ads.google.com | text |
| adsmanager.facebook.com | text |
| Relatórios | text |
| Looker Studio OCP :: Campanha Comercial | text |
| Dia a Dia | text |
| Sistema | text |
| Resumo do Mês | text |
| Resumo do Ano | text |
| Controle de Orçamento | text |
| Experimentos | text |
| Campanhas | text |

**Views (3):**
- Resumo
- Experimentos
- Timeline

---

### 3. C.A.S.A.
**URL:** `https://www.notion.so/uhuru-comunicacao/C-A-S-A-1d6dbafb030280c682a2ff8c758db28b`

**Status:** ⚠️ Nenhuma propriedade detectada - precisa inspeção manual

---

## 📊 SUB-DATABASES DESCOBERTAS

### Home da Mídia
**URL:** `https://www.notion.so/uhuru-comunicacao/Home-da-M-dia-4c1316fb406744538bb159ea13851cd2`

| Propriedade | Tipo |
|-------------|------|
| Nome | text |
| Responsável | text |
| Cliente | text |
| Prazo | text |
| Status | text |

### Página da Uhuru (Database de Clientes)
**URL:** `https://www.notion.so/uhuru-comunicacao/2f47c4525b1946d0beb940d793526bf7`

| Propriedade | Tipo |
|-------------|------|
| Cliente | text |
| Atendimento | text |
| Anotações | text |
| Categorias de serviço | text |
| Data do contrato | text |
| E-mail de contato | text |
| Número de telefone | text |
| Status | text |
| Contato | text |
| Escopo | text |
| Instagram | text |
| LP Campanha | text |
| Linkedin | text |
| Site | text |

### OCP_Controle de Orçamento
**URL:** `https://www.notion.so/uhuru-comunicacao/OCP_Controle-de-Or-amento-1f6dc0a840ac42ecae54e19cc3d6da7b`

| Propriedade | Tipo |
|-------------|------|
| Campanha mãe | text |
| Campanha por canal | text |
| Objetivo | text |
| Início | text |
| Término | text |
| Invest. Líquido | text |
| Valor Gasto | text |
| Saldo | text |
| Orçamento Diário | text |
| % | text |
| Proj. de Verba | text |
| PI Operand | text |

---

## 🔗 RELAÇÕES IDENTIFICADAS

### Padrão de Nomenclatura por Cliente:
| Prefixo | Cliente | Plataformas |
|---------|---------|-------------|
| OCP_ | Ocupacional | Meta Ads, Google Ads, LinkedIn |
| ASM_ | AssisteMed | Meta Ads, Google Ads |
| ORI_ | Orizonti | - |
| CIN_ | Cineart | - |
| SER_ | Sercon | - |
| CASA_ | C.A.S.A. | Meta Ads |

### Estrutura Recorrente:
```
{PREFIX}_Campanhas
{PREFIX}_Otimizações
{PREFIX}_Parametrização de URLs
{PREFIX}_Controle de Orçamento
{PREFIX}_Background
```

---

## 🔧 FONTES DE DADOS EXTERNAS

- Google Ads (`ads.google.com`)
- Meta Ads Manager (`adsmanager.facebook.com`)
- LinkedIn Campaign Manager
- Looker Studio

---

## 📋 PRÓXIMOS PASSOS

1. [ ] Investigar database C.A.S.A. (manualmente)
2. [ ] Mapear relations entre databases
3. [ ] Identificar rollups e fórmulas
4. [ ] Mapear databases de Campanhas/Otimizações
5. [ ] Criar agentes de extração

---

*Gerado automaticamente via Playwright + CDP*
*Comet Browser - Perfil: João (Uhuru)*
*Porta de Debug: 9222*

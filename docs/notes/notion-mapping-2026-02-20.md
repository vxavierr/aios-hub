# Mapeamento Completo - Notion Uhuru

> Extraído automaticamente via CDP do Comet em 2026-02-20

---

## 📊 RESUMO EXECUTIVO

### Databases Principais (Favoritos)
| Database | Prefixo | Plataformas | Status |
|----------|---------|-------------|--------|
| Ocupacional | OCP_ | Meta Ads, Google Ads, LinkedIn | ✅ Mapeado |
| AssisteMed | ASM_ | Meta Ads, Google Ads | ✅ Mapeado |
| C.A.S.A. | CASA_ | Meta Ads | ✅ Mapeado |

### Sub-databases Descobertas
| Database | Colunas | Tipo |
|----------|---------|------|
| Home da Mídia | 5 | Database |
| OCP_Controle de Orçamento | 12 | Database |
| Página da Uhuru | 15 | Database |

---

## 📊 DATABASE 1: Ocupacional

**URL:** `notion.so/uhuru-comunicacao/Ocupacional-a9adbad0564948369cbbaf0ec544f066`

### Links Externos
- ads.google.com
- adsmanager.facebook.com
- LinkedIn Campaign Manager

### Estrutura Interna
| Seção | Conteúdo |
|-------|----------|
| **Dia a Dia** | OCP_Campanhas, OCP_Otimizações, OCP_Parametrização URLs, OCP_Controle Orçamento |
| **Sistema** | OCP_Background |
| **Dashboards** | Resumo Mês, Resumo Ano, Controle Orçamento |
| **KPIs** | Visitas perfil, Engajamento, Comercial Pmax, Comercial Search |
| **Experimentos** | Backlog → Na fila → Em andamento → Em Análise → Concluído |
| **Campanhas** | Timeline visual |

---

## 📊 DATABASE 2: AssisteMed

**URL:** `notion.so/uhuru-comunicacao/AssisteMed-7f240474e6d048109947206900b0312b`

### Links Externos
- ads.google.com
- adsmanager.facebook.com

### Estrutura Interna
| Seção | Conteúdo |
|-------|----------|
| **Dia a Dia** | ASM_Campanhas, ASM_Otimizações, ASM_Parametrização URLs, ASM_Controle Orçamento |
| **Sistema** | ASM_Background |
| **Relatórios** | ASM - Acompanhamento performance, Looker Studio |
| **Experimentos** | Backlog → Na fila → Em andamento → Em Análise → Concluído |
| **Campanhas** | Timeline visual |

---

## 📊 DATABASE 3: C.A.S.A.

**URL:** `notion.so/uhuru-comunicacao/C-A-S-A-1d6dbafb030280c682a2ff8c758db28b`

### Links Externos
- adsmanager.facebook.com

### Estrutura Interna
| Seção | Conteúdo |
|-------|----------|
| **Dia a Dia** | OCP_Campanhas, OCP_Otimizações, OCP_Parametrização URLs, CASA_Controle Orçamento |
| **Sistema** | CASA_Background |
| **Registros** | Nova Campanha (por canal), Nova Otimização |

### Sub-database: Tarefas
| Propriedade | Tipo |
|-------------|------|
| Nome | Text |
| Descrição | Text |
| Responsável | Person |
| Cliente | Relation |
| Campanha | Relation |
| Prazo | Date |
| Status | Select |

---

## 📊 DATABASE: Home da Mídia

**URL:** `notion.so/uhuru-comunicacao/Home-da-M-dia-4c1316fb406744538bb159ea13851cd2`

| Propriedade | Tipo |
|-------------|------|
| Nome | Text |
| Responsável | Person |
| Cliente | Relation |
| Prazo | Date |
| Status | Select |

---

## 📊 DATABASE: OCP_Controle de Orçamento

**URL:** `notion.so/uhuru-comunicacao/OCP_Controle-de-Or-amento-1f6dc0a840ac42ecae54e19cc3d6da7b`

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| Campanha mãe | Text | Campanha principal |
| Campanha por canal | Text | Variação por canal (Meta, Google, etc.) |
| Objetivo | Select | Objetivo da campanha |
| Início | Date | Data início |
| Término | Date | Data término |
| Invest. Líquido | Number | Investimento planejado |
| Valor Gasto | Number | Valor já consumido |
| Saldo | Number | Saldo restante |
| Orçamento Diário | Number | Budget diário |
| % | Number | Percentual gasto |
| Proj. de Verba | Formula | Projeção |
| PI Operand | Text | ID do Pixel/Operand |

---

## 📊 DATABASE: ASM_Controle de Orçamento

**URL:** `notion.so/uhuru-comunicacao/ASM_Controle-de-Or-amento-bac0e90c7b4c4bf9a86779767403ed07`

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| Campanha mãe | Text | Campanha principal |
| Campanha por canal | Text | Variação por canal |
| Mês | Select | Mês de referência |
| Canal | Select | LinkedIn, Meta, Google |
| Objetivo | Select | Awareness, Conversão, etc. |
| Início | Date | Data início |
| Término | Date | Data término |
| Investimento | Number | Investimento total |
| Valor Gasto | Number | Valor já gasto |
| Saldo | Number | Saldo restante |
| Orçamento Diário | Number | Budget diário |
| % | Number | Percentual gasto |
| Proj. de Verba | Formula | Projeção |

**Views:** Visão Geral, Fevereiro

---

## 📊 DATABASE: Página da Uhuru

**URL:** `notion.so/uhuru-comunicacao/2f47c4525b1946d0beb940d793526bf7`

| Propriedade | Tipo |
|-------------|------|
| Cliente | Text |
| Atendimento | Person |
| Anotações | Text |
| Categorias de serviço | Multi-select |
| Data do contrato | Date |
| E-mail de contato | Email |
| Número de telefone | Phone |
| Status | Select |
| Contato | Text |
| Escopo | Text |
| Instagram | URL |
| LP Campanha | URL |
| Linkedin | URL |
| Site | URL |

---

## 🔗 Padrões Identificados

### Nomenclatura
| Prefixo | Cliente |
|---------|---------|
| OCP_ | Ocupacional |
| ASM_ | AssisteMed |
| CASA_ | C.A.S.A. |

### Template de Estrutura
```
[CLIENTE] (Home)
├── Links Externos (plataformas)
├── Relatórios
├── Dia a Dia/
│   ├── [PREFIXO]_Campanhas
│   ├── [PREFIXO]_Otimizações
│   ├── [PREFIXO]_Parametrização de URLs
│   └── [PREFIXO]_Controle de Orçamento
├── Sistema/
│   └── [PREFIXO]_Background
├── Dashboards (Mês/Ano)
├── Experimentos (Kanban)
└── Campanhas (Timeline)
```

---

## 🎯 Próximos Passos

1. [ ] Mapear relations entre databases
2. [ ] Identificar rollups e fórmulas
3. [ ] Criar agentes de extração
4. [ ] Definir sincronização com Meta/Google Ads

---

## 🔧 Setup Técnico

### Comet com Debugging
```bash
"C:\Users\lenovo\AppData\Local\Perplexity\Comet\Application\comet.exe" --profile-directory="Profile 1" --remote-debugging-port=9222
```

### Scripts Disponíveis
- `comet-scan.js` - Scan de página via WebSocket
- `map-subdbs.js` - Mapeamento de sub-databases

---

*Mapeamento gerado automaticamente pelo AIOS Master*
*Data: 2026-02-20*

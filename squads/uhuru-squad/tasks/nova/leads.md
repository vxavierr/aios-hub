# Task: Qualificação e Análise de Leads — OCP_ (Ocupacional)

**Agente:** @nova
**Comando:** `*leads OCP_`
**Frequência:** Semanal, após *normalizar-leads
**Aplicável:** OCP_ — Ocupacional (saúde ocupacional + segurança do trabalho, Minas Gerais)

---

## Contexto do Negócio

A Ocupacional vende serviços de **saúde ocupacional e segurança do trabalho** para empresas em **Minas Gerais**. Os serviços incluem: PCMSO, PGR (antigo PPRA), ASO, e-Social, CIPA, laudos de NR.

O lead ideal é uma empresa com funcionários que operam em ambientes com risco ocupacional real — indústrias, construção, transporte, alimentação, saúde, etc. — e que ainda não tem esses programas ou precisa renovar.

---

## Inputs

- Dataset normalizado de leads (output de *normalizar-leads)
- Cada lead deve ter: nome, email, empresa, cnpj, tamanho_time, cargo, origem, campanha

**Se o dataset não estiver disponível → PERGUNTAR antes de continuar.**

---

## Processo de qualificação por lead

Para **cada lead** no dataset, executar:

### Passo 1 — Verificar dados básicos

**Empresa suspeita/vazia:**
- Se `empresa_flag == [SUSPEITO]` ou empresa vazia → marcar como `⚠️ INCONCLUSIVO` e registrar motivo
- Não descarta automaticamente — ainda tenta pesquisar pelo email/CNPJ se disponível

**CNPJ disponível:**
- Se CNPJ preenchido → prioridade: pesquisar dados do CNPJ (próximo passo)
- Se CNPJ vazio → usar nome da empresa para pesquisa

---

### Passo 2 — Pesquisa da empresa

Pesquisar a empresa usando as ferramentas disponíveis:

1. **Se tiver CNPJ:** buscar no Receita Federal / sites de consulta CNPJ
   - Verificar: razão social, CNAE principal + secundários, situação (ativa/baixada/suspensa), porte (MEI/ME/EPP/Demais), município/estado

2. **Se não tiver CNPJ:** buscar pelo nome da empresa + "MG" no Google
   - Tentar identificar: atividade principal, localização, porte estimado

3. **Se empresa claramente fake** (ex: "Ksjsjwowlkxnq", "Prada", emoji no nome) → classificar direto como `❌ DESQUALIFICADO` com motivo "Dados inválidos — possível spam"

---

### Passo 3 — Aplicar critérios de qualificação

#### ✅ QUALIFICADOS — empresas que precisam de saúde ocupacional

| Categoria | Exemplos | Observação |
|-----------|---------|-----------|
| Indústria | Fabricação de alimentos, metal, químico, gráfico, têxtil, plástico | Alto risco — PCMSO e PGR obrigatórios |
| Construção civil | Obras, acabamentos, instalações hidráulicas, gesso, pintura | Exposição constante a riscos |
| Transporte e logística | Carga, perigosos, armazéns, logística | Risco físico + e-Social |
| Saúde e veterinária | Clínicas, veterinárias, ambulatórios, farmácias | Agentes biológicos |
| Alimentação | Padarias, restaurantes, frigoríficos, agroindústria | Risco térmico, biológico, ergonômico |
| Coleta e resíduos | Limpeza urbana, resíduos sólidos, ambiental | Agentes químicos e biológicos |
| Comércio de risco | Distribuidoras com carga, autopeças, pneus, GLP | Risco físico e ergonômico |
| Serviços técnicos | Manutenção industrial, ensaios técnicos, refrigeração, elétrica | Exposição a riscos específicos |
| Órgãos públicos | Câmaras, prefeituras com celetistas | Obrigação legal |
| Associações com empregados | Associações com funcionários em atividade de risco | Avaliar atividade real |

**Localização:** Preferência por empresas em MG (BH, Contagem, Betim, Vespasiano, municípios do interior). Empresas fora de MG → **desqualificar por localização**.

**Status de operação:** Empresa ativa. Se baixada, suspensa ou cancelada → desqualificar.

#### ❌ DESQUALIFICADOS — não são público-alvo

| Motivo | Exemplos |
|--------|---------|
| Fora de MG | São Paulo, Rio de Janeiro, Paraná, Goiás, etc. |
| Atividade intelectual/baixo risco | Escritórios contábeis, agências de marketing, consultorias de TI, educação |
| Empresa fechada/baixada | Cancelada ou inativa na Receita Federal |
| MEI com risco mínimo | Varejo simples, artesanato, bicicletas sem colaboradores |
| Concorrente | Outra empresa de medicina do trabalho / SST |
| Associação de moradores | Sem empregados com risco ocupacional |
| Estudante ou autônomo | Não é empresa |
| Dados completamente inválidos | Nome de pessoa famosa, marca de luxo, emojis, sem sentido |

#### ⚠️ INCONCLUSIVO — não foi possível determinar

- Empresa não encontrada na pesquisa
- Nome muito genérico sem CNPJ (ex: "Segurança", "Rural", "Silva e Freitas")
- Email pessoal com empresa suspeita e sem CNPJ
- Informações insuficientes para decidir com segurança

---

### Passo 4 — Montar registro do lead

**Formato para qualificados:**

```
**{N}. {Nome da Empresa}** ({cargo do contato, se disponível})

- **Segmento:** {atividade principal}
- **CNPJ:** {XX.XXX.XXX/XXXX-XX} (válido)
- **Localização:** {cidade/estado}
- **Tamanho:** {tamanho_time}
- **Necessidade identificada:** {PCMSO | PGR | e-Social | ASO | etc.}
- **Canal:** {Search | PMax | Meta Feed | etc.}
- **Status:** ✅ Altamente qualificado | ✅ Qualificado
```

**Formato para desqualificados:**

```
**{N}. {Nome da Empresa}**

- **Segmento:** {atividade identificada}
- **CNPJ:** {se disponível}
- **Motivo:** {razão objetiva da desqualificação}
- **Status:** ❌ Desqualificado
```

**Formato para inconclusivos:**

```
**{N}. {Nome ou dado disponível}**

- **Motivo:** {o que não foi possível verificar}
- **Status:** ⚠️ Inconclusivo
```

---

## Output

```
---
🔍 ANÁLISE DE LEADS — OCP_ | {período}
---

📊 RESUMO

Total analisado: {n}
✅ Qualificados: {n} ({%})
   - Altamente qualificados: {n}
   - Qualificados: {n}
❌ Desqualificados: {n} ({%})
⚠️ Inconclusivos: {n} ({%})

Principais motivos de desqualificação:
- {motivo}: {n} leads
- {motivo}: {n} leads

Padrões observados:
- {insight sobre perfil dos leads — segmentos recorrentes, origem que converte melhor, etc.}

---

## ✅ LEADS QUALIFICADOS ({n})

{registros formatados}

---

## ❌ LEADS DESQUALIFICADOS ({n})

{registros formatados}

---

## ⚠️ INCONCLUSIVOS ({n})

{registros formatados}

---

💡 OBSERVAÇÕES PARA O TIME

{máximo 3 observações acionáveis baseadas nos leads desta semana}
Ex: "Alta concentração de leads de padarias/alimentação — segmento respondendo bem ao PMax"
Ex: "3 leads com email @gmail + empresa genérica sem CNPJ — possível ajuste de formulário"
```

- [ ] Todos os leads analisados individualmente
- [ ] Pesquisa de CNPJ/empresa realizada para cada um
- [ ] Veredicto explícito para cada lead
- [ ] Resumo estatístico incluído
- [ ] Observações acionáveis entregues

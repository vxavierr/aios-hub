# Task: Compilar Insights do Período

**Agente:** @sage
**Comando:** `*insights {cliente} [{período}]`
**Frequência:** Mensal

---

## Objetivo

Compilar os principais aprendizados, padrões e recomendações do período — transformando dados em insights estratégicos acionáveis.

---

## Inputs

- `{cliente}` — código do cliente
- Big Numbers (@nova/*analisar)
- Diagnóstico de criativos (@nova/*diagnostico)
- Otimizações registradas no período (@finn/Notion)

---

## Execução

### Formato dos insights

```
💡 Insights — {cliente} | {período}

O QUE FUNCIONOU:
1. {insight} → porque {razão} → repetir em {próxima ação}
2. {insight}
3. {insight}

O QUE NÃO FUNCIONOU:
1. {insight} → porque {razão} → ajustar em {próxima ação}

TENDÊNCIAS IDENTIFICADAS:
- {tendência de mercado ou do cliente}

RECOMENDAÇÕES PARA O PRÓXIMO PERÍODO:
1. {ação concreta para @flux}
2. {ação concreta para @nova}
3. {ação concreta para @finn}
```

---

## Outputs

- [ ] Insights documentados no Notion
- [ ] Recomendações direcionadas a cada agente
- [ ] Input para *relatorio e *apresentar

---

## Tom e padrões de escrita

**Tom geral:** estratégico, orientado a ação. Cada insight DEVE ter uma ação concreta vinculada. Sem insight "solto" — se não tem ação, não é insight, é observação.

**Formato obrigatório por insight:**
```
{Insight} → {Causa/Porque} → {Ação concreta} (@agente)
```

**Sempre:**
- Basear insights em dados reais do período — nunca inventar ou extrapolar sem evidência
- Nomear campanhas, criativos, keywords ou públicos específicos com seus números individuais
- Direcionar cada recomendação ao agente responsável: @flux (estratégia), @nova (análise), @finn (budget/bid)
- Limitar a no máximo 5 insights totais (3 funcionou + 2 não funcionou) — priorizar os mais impactantes
- Incluir pelo menos 1 tendência confirmada por 2+ semanas de dados
- Separar "funcionou" de "não funcionou" — nunca misturar num mesmo insight

**Nunca:**
- Usar linguagem vaga sem números: "performance melhorou", "resultado razoável", "levemente abaixo"
- Repetir informação que já está no relatório sem agregar interpretação nova
- Listar mais de 3 recomendações — o time não vai executar 10 coisas, foca nas 3 que importam
- Inventar tendência com base em 1 semana de dados — precisa de 2+ semanas para confirmar padrão
- Atribuir causa sem evidência: "provavelmente por causa de X" → se não tem dado, dizer que não tem

---

## Comportamento do agente

**Se não tiver dados de diagnóstico de criativos (@nova/*diagnostico):**
→ Informar que insights sobre criativos ficam limitados. Não inventar análise de criativos sem dados.

**Se o período analisado tiver menos de 7 dias:**
→ Alertar no cabeçalho: "⚠️ Período curto ({n} dias) — tendências podem não ser confiáveis."

**Se houver divergência entre dados de plataformas diferentes:**
→ Flagar a divergência explicitamente. Não tentar reconciliar números que não batem.

**Se nenhum insight negativo for encontrado:**
→ Não forçar. Registrar "Sem pontos negativos relevantes no período" e focar nas oportunidades.

**Se @nova/*analisar não foi executado:**
→ PARAR. Insights dependem da análise de campanhas. Solicitar execução antes de continuar.

---

## Exemplo Real

> Baseado no histórico real de análises OCP_ (Ocupacional).
> Use como referência de formato, profundidade e tom esperados.

---

💡 Insights — OCP_ | Fevereiro/2026

---

O QUE FUNCIONOU:

1. **Meta Feed com criativos estáticos entregou CPL 41% abaixo da média geral** → O público OCP_ responde melhor a imagens diretas com CTA claro do que vídeos ou carrosséis → Criar 3 novos estáticos no mesmo formato para março (@flux/*briefing)

2. **Termo de busca "sst betim" converteu a R$ 5,03 (CPA 10x menor que média)** → Termos geolocalizados (cidade + serviço) têm intenção altíssima e concorrência baixa → Expandir para "medicina do trabalho contagem", "sst vespasiano", "ocupacional belo horizonte" (@finn/*otimizar)

3. **PMax concentrou 97% do investimento em Search quando budget apertou** → O algoritmo priorizou conversões sobre awareness automaticamente → Comportamento esperado, não intervir — manter budget atual e monitorar (@finn/*monitorar)

---

O QUE NÃO FUNCIONOU:

1. **Keyword broad "medicina do trabalho" perdeu 60% do volume com CPA +71%** → Saturação do leilão em termo genérico + concorrentes locais aumentando lances → Restringir para correspondência de frase ou reduzir lance em 20% (@finn/*otimizar)

2. **Vídeos no Meta rodaram 3 semanas sem gerar leads significativos** → Formato não encaixou com o público de saúde ocupacional neste estágio do funil → Pausar vídeos atuais e testar 1 vídeo curto (<15s) com depoimento de cliente (@flux/*briefing)

---

TENDÊNCIAS IDENTIFICADAS:

- **Termos geolocalizados com CPA consistentemente menor** — confirmado em 3 semanas consecutivas (semanas 03/02, 10/02, 17/02). Padrão robusto.
- **Criativos estáticos superam vídeos para conversão no Meta** — padrão de 4 semanas. Vídeos geram visualizações mas não leads.

---

RECOMENDAÇÕES PARA O PRÓXIMO PERÍODO:

1. **@flux** — Criar briefing para 3 novos criativos estáticos (imagem direta + CTA) baseados nos campeões do mês
2. **@finn** — Adicionar "sst betim" como KW exata + expandir 5 variações geolocalizadas
3. **@nova** — Configurar alerta de frequência >3 nos criativos Meta para detecção precoce de fadiga

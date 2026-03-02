# Proposta de Desenvolvimento
## App Nativo — Transfer Online

---

**Para:** Fernando
**De:** João
**Data:** Março de 2026
**Validade:** 15 dias

---

## Contexto

O Transfer Online já possui um sistema web completo desenvolvido no Base44, com funcionalidades para motoristas, passageiros, fornecedores, administradores e um sistema de telemetria avançado. O objetivo desta proposta é **transformar esse sistema em um aplicativo nativo** disponível na App Store (iOS) e Google Play (Android), mantendo toda a infraestrutura atual do Base44 funcionando sem alterações.

---

## Solução Proposta

Utilizaremos **Capacitor**, tecnologia que transforma o código web existente em um app nativo real — disponível nas lojas, instalável no celular, com acesso a GPS em segundo plano, notificações push e telemetria de condução.

### Por que Capacitor e não React Native?

| Critério | Capacitor | React Native |
|---|---|---|
| Reaproveitamento do código existente | ✅ 100% do código atual | ❌ Reescrita completa |
| Tempo de entrega | 3–4 semanas | 3–4 meses |
| Quando você atualiza o web no Base44 | App atualiza com um build simples | Precisa replicar manualmente |
| Resultado nas lojas | App nativo real | App nativo real |
| GPS em background + telemetria | ✅ Sim | ✅ Sim |

**A vantagem central:** você continua desenvolvendo no Base44 normalmente. Quando quiser atualizar o app, é só fazer um build — o código é o mesmo. Não existem duas versões para manter.

---

## Como Fica a Divisão de Trabalho

Esta é uma das principais vantagens da solução: a separação é limpa e permanente.

### O que você (Fernando) faz — uma vez só

Implementar no Base44 a lógica de redirecionamento por perfil: quando o app abre, o sistema detecta automaticamente se é motorista, admin, fornecedor ou passageiro e leva o usuário direto para sua área. Isso é uma modificação pontual no código existente — você recebe o código exato para implementar, e não precisa alterar novamente no futuro.

### O que João faz — toda a camada nativa

Toda a infraestrutura nativa: configuração do Capacitor, GPS em segundo plano, notificações push, build automático via CI/CD, submissão nas lojas e manutenção contínua.

**Esses dois lados nunca entram em conflito.** Quando você exporta uma nova versão do Base44, os arquivos nativos (Android, iOS, configurações do Capacitor) não são afetados.

---

## O Que Será Entregue

### Perfis de Acesso (Role-based)

O app detecta automaticamente o perfil do usuário ao fazer login:

| Perfil | Destino no app |
|---|---|
| **Motorista** | Dashboard de viagens, aceitar/recusar corridas, navegação |
| **Passageiro/Usuário** | Solicitar transfer, acompanhar viagem, histórico |
| **Admin** | Painel administrativo completo |
| **Fornecedor** | Dashboard de fornecedor |

### Telemetria de Condução (já implementada no sistema)

O sistema de telemetria já está construído no seu código. O app nativo ativa o que estava esperando:

| Funcionalidade | Descrição |
|---|---|
| **Frenagem brusca** | Detectada por desaceleração via GPS |
| **Curvas acentuadas** | Detectadas por mudança brusca de direção |
| **Excesso de velocidade** | Comparado ao limite real da via (Google Roads API) |
| **Uso de celular ao volante** | Detectado por toque na tela em movimento |
| **Score de segurança** | Pontuação 0–100 por viagem |
| **Rastreamento de rota** | Replay completo da rota no mapa |
| **Ranking de motoristas** | Comparativo de desempenho |
| **Hotspots de incidentes** | Mapa de onde ocorrem mais eventos |

### GPS em Segundo Plano

O motorista pode minimizar o app durante a viagem — o rastreamento e a telemetria continuam funcionando normalmente. Isso é garantido pela camada nativa (Foreground Service no Android, Background Location no iOS).

### Push Notifications

Motorista recebe notificação mesmo com o app fechado: nova viagem disponível, cancelamento, mensagem do admin.

### Plataformas

- ✅ Android (Google Play Store)
- ✅ iOS (Apple App Store)

---

## O Que NÃO Está Incluído

- Desenvolvimento de novas funcionalidades no sistema web
- Redesign da interface
- Suporte ao painel do Base44
- Criação das contas nas lojas — ficam em seu nome (custos abaixo)
- Alterações no banco de dados ou funções serverless

---

## Prazo

| Semana | O que acontece |
|---|---|
| **Semana 1** | Setup Capacitor, GPS background, push notifications configurados |
| **Semana 2** | Build pipeline (Codemagic), testes em dispositivo real, ajustes de UX mobile |
| **Semana 3** | Submissão nas lojas, aguardar aprovação (Apple 1–3 dias, Google até 3 dias) |
| **Semana 4** | App disponível nas lojas + período de estabilização |

**Total: 3–4 semanas** do início ao app publicado.

> Pré-requisito: a modificação de roteamento no Base44 (descrita acima) precisa ser feita por você antes do início da Semana 2.

---

## Investimento

### Desenvolvimento (pagamento único)

**R$ 10.000**

| Parcela | Quando | Valor |
|---|---|---|
| 1ª parcela | Assinatura da proposta | R$ 5.000 |
| 2ª parcela | App aprovado nas lojas e disponível para download | R$ 5.000 |

### Custos de Infraestrutura *(por sua conta)*

| Item | Valor | Recorrência |
|---|---|---|
| Apple Developer Program | ~R$ 550 | Anual |
| Google Play Developer | ~R$ 130 | Taxa única |

> A conta Apple Developer precisa estar ativa antes do início da Semana 3.

---

## Manutenção Mensal

Após o lançamento, o app precisa ser mantido para continuar funcionando quando você atualiza o sistema, o iOS ou Android lança novas versões, ou as lojas exigem atualizações.

**Plano de Manutenção: R$ 700/mês**

| Incluído |
|---|
| Até 2 builds e submissões por mês (quando você atualizar o Base44 e quiser refletir no app) |
| Correção de bugs da camada nativa |
| Monitoramento de compatibilidade com novas versões de iOS e Android |
| Suporte via WhatsApp |

| Não incluído |
|---|
| Desenvolvimento de novas funcionalidades |
| Alterações no sistema web |
| Custos das contas das lojas |

> Funcionalidades fora do escopo são orçadas separadamente a R$ 150/hora.

---

## Condições Gerais

1. **Início imediato** após recebimento da 1ª parcela.
2. **Propriedade do código:** todo o código de configuração nativa desenvolvido passa a ser seu após pagamento integral.
3. **Acesso necessário:** repositório do código e contas das lojas. Acesso ao Base44 somente se necessário para debug.
4. **Reajuste do recorrente:** anualmente pelo IGPM.
5. **Cancelamento do recorrente:** com aviso de 30 dias.
6. **Escopo fechado:** qualquer funcionalidade não descrita aqui como incluída será orçada à parte.

---

## Por Que Fazer Tudo Agora

O foco imediato é o motorista — faz sentido. Mas a infraestrutura para suportar todos os perfis (motorista, passageiro, admin, fornecedor) **é montada uma única vez**. Adicionar passageiro e admin agora custa marginalmente mais no desenvolvimento (cerca de 15% do esforço total), mas evita:

- Uma nova rodada de revisão nas lojas
- Reteste completo do app
- Retrabalho na infraestrutura de roles

**A entrega será:** motorista com UX mobile priorizada, passageiro e admin funcionais. Quando você quiser destacar a experiência do passageiro em uma futura campanha, o app já está pronto.

---

## Próximos Passos

1. Assinatura desta proposta
2. Pagamento da 1ª parcela (R$ 5.000)
3. Você implementa o roteamento de perfis no Base44 (João envia o código exato — 15 minutos de trabalho)
4. Criação das contas Apple Developer e Google Play (ou compartilhamento das existentes)
5. Início imediato

---

**Dúvidas? Fico à disposição.**

João
[seu contato aqui]

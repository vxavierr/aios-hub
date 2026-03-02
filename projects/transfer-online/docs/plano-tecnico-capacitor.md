# Plano Técnico — App Nativo Transfer Online (Capacitor)

**Projeto:** Transfer Online
**Estratégia:** Capacitor wrapper sobre o codebase React existente
**Data:** Março 2026
**Versão:** 2.0

---

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────┐
│              APP NATIVO (iOS + Android)          │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │         Capacitor Shell (João)           │   │
│  │  - android/  ios/  capacitor.config.ts   │   │
│  │  - Plugins: GPS background, Push, etc.   │   │
│  │  - CI/CD: Codemagic (build sem Mac)      │   │
│  └──────────────┬───────────────────────────┘   │
│                 │ WebView                         │
│  ┌──────────────▼───────────────────────────┐   │
│  │      Código React/Base44 (Fernando)      │   │
│  │  - Todas as páginas existentes           │   │
│  │  - Telemetria, GPS, roles — já prontos   │   │
│  │  + RoleRouter (única adição — 1x só)     │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
└─────────────────────────────────────────────────┘
                       │
              Base44 SDK (cloud)
         Auth + Database + Functions
```

**Regra de ouro:**
- `android/`, `ios/`, `capacitor.config.ts` → **nunca são afetados por exports do Base44**
- `src/` → **Fernando continua desenvolvendo normalmente no Base44**
- Os dois lados vivem em paz, sem conflito

---

## Divisão de Responsabilidades

### Fernando faz (no Base44) — UMA VEZ SÓ

| O quê | Arquivo | Quando |
|---|---|---|
| Remover páginas de marketing | Ver seção abaixo | Antes do lançamento |
| Criar `AppEntry.jsx` (entry point) | `src/pages/AppEntry.jsx` | Antes do lançamento |
| Atualizar `mainPage` | `src/pages.config.js` | Junto com o item acima |

Só isso. Tudo mais que Fernando desenvolver no Base44 vai automaticamente para o app.

### João faz (Capacitor) — Todo o resto

| O quê | Onde |
|---|---|
| Setup Capacitor + plataformas | `capacitor.config.ts`, `android/`, `ios/` |
| Background GPS Android | Foreground Service via plugin |
| Background GPS iOS | `Info.plist` + entitlement |
| Push Notifications | Firebase (Android) + APNs (iOS) |
| Codemagic CI/CD | Build iOS sem Mac |
| Ícone, splash screen | Assets nativos |
| Submissão nas lojas | Play Store + App Store |
| Manutenção | Builds mensais |

---

## PARTE 1 — O que Fernando faz no Base44

### Contexto

O sistema de telemetria, GPS, detecção de frenagem brusca e curvas já está completamente implementado. O app possui também um site de marketing completo (`Inicio.jsx`) que **não faz parte do produto**. Precisa ser removido antes do lançamento, junto com todas as páginas e componentes exclusivos do site.

Além da limpeza, é necessário criar uma nova página de entrada (`AppEntry.jsx`) que roteia o usuário pelo perfil assim que ele abre o app.

---

### Passo 1 — Remover o site de marketing

**Prompt Exato para a IA do Base44:**

```
Preciso remover o site de marketing do projeto. Ele não faz parte do produto
e está gerando confusão. Execute as remoções abaixo com cuidado para não
quebrar nenhuma página funcional do sistema.

PASSO 1 — Deletar estas páginas (arquivos em src/pages/):
- Inicio.jsx          (landing page de marketing)
- CadastroInteresse.jsx  (formulário de interesse)
- Demonstracao.jsx    (página de demonstração)
- GerenciarSEO.jsx    (gestão de SEO do site)
- GerenciarTemas.jsx  (gestão de temas do site)

PASSO 2 — Deletar este componente:
- src/components/cms/ContentBlock.jsx
  (só era usado pela Inicio.jsx, não tem mais referências)

PASSO 3 — NÃO deletar (são usados pelo app):
- src/components/seo/MetaTags.jsx  (usado em 10+ páginas do app)
- src/components/seo/ (toda a pasta)
- Qualquer outra coisa não listada acima

PASSO 4 — Atualizar src/pages.config.js:
Remover os imports das páginas deletadas:
  - import CadastroInteresse from './pages/CadastroInteresse';
  - import Demonstracao from './pages/Demonstracao';
  - import GerenciarSEO from './pages/GerenciarSEO';
  - import GerenciarTemas from './pages/GerenciarTemas';
  - import Inicio from './pages/Inicio';

Remover as entradas correspondentes no objeto PAGES:
  - "CadastroInteresse": CadastroInteresse,
  - "Demonstracao": Demonstracao,
  - "GerenciarSEO": GerenciarSEO,
  - "GerenciarTemas": GerenciarTemas,
  - "Inicio": Inicio,

NÃO altere mais nada no pages.config.js por enquanto.
NÃO altere o mainPage ainda — isso será feito no próximo passo.

IMPORTANTE:
- Não remova nada que não esteja listado acima
- Não altere nenhuma outra página
- Não modifique o Layout.jsx
- Não remova nenhum import de MetaTags em outras páginas
```

---

### Passo 2 — Criar a página de entrada e atualizar o mainPage

**Prompt Exato para a IA do Base44:**

```
Agora preciso criar a página de entrada do app (AppEntry) e configurá-la
como página principal.

PASSO 1 — Criar o arquivo src/pages/AppEntry.jsx com exatamente este conteúdo:

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function AppEntry() {
  const navigate = useNavigate();

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['app-entry-user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    if (isLoading) return;

    if (!currentUser) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    if (currentUser.is_driver && currentUser.driver_id) {
      navigate('/DashboardMotoristaV2', { replace: true });
    } else if (currentUser.role === 'admin') {
      navigate('/AdminDashboard', { replace: true });
    } else if (currentUser.supplier_id) {
      navigate('/DashboardFornecedor', { replace: true });
    } else {
      navigate('/MinhasSolicitacoes', { replace: true });
    }
  }, [currentUser, isLoading, navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800
                      rounded-full animate-spin" />
    </div>
  );
}

PASSO 2 — Atualizar src/pages.config.js:

Adicionar o import (junto aos outros imports de páginas):
  import AppEntry from './pages/AppEntry';

Adicionar no objeto PAGES (em ordem alfabética):
  "AppEntry": AppEntry,

Alterar o mainPage:
  DE:  mainPage: "Inicio",
  PARA: mainPage: "AppEntry",

IMPORTANTE:
- Não altere mais nada no pages.config.js
- Não altere o Layout.jsx
- Não remova nenhuma outra página

COMO VERIFICAR SE FUNCIONOU:
1. Acesse o app sem estar logado → deve redirecionar para a tela de login do Base44
2. Faça login como motorista → deve ir direto para DashboardMotoristaV2
3. Faça login como admin → deve ir direto para AdminDashboard
4. Faça login como usuário comum → deve ir para MinhasSolicitacoes
```

---

### Como Fernando verifica que tudo funcionou

Após executar os Passos 1 e 2, testar no browser:

1. **Sem login** → deve aparecer a tela de login do Base44 (spinner breve, depois redirect)
2. **Login como motorista** → deve ir direto para `/DashboardMotoristaV2`
3. **Login como admin** → deve ir direto para `/AdminDashboard`
4. **Login como fornecedor** → deve ir direto para `/DashboardFornecedor`
5. **Login como usuário comum** → deve ir para `/MinhasSolicitacoes`
6. **O site antigo** (`Inicio.jsx`) não deve mais aparecer em nenhum cenário

---

## PARTE 2 — O que João faz (Capacitor)

### Fase 1 — Setup inicial (Dias 1–2)

**1.1 Instalar Capacitor**
```bash
cd D:/workspace/projects/transfer-online
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
npx cap init "Transfer Online" "com.transferonline.app" --web-dir dist
npx cap add android
npx cap add ios
```

**1.2 capacitor.config.ts**
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.transferonline.app',
  appName: 'Transfer Online',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'Default'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    Geolocation: {
      // Configurado via AndroidManifest e Info.plist
    }
  }
};

export default config;
```

**1.3 Instalar plugins**
```bash
npm install @capacitor/geolocation
npm install @capacitor/push-notifications
npm install @capacitor/splash-screen
npm install @capacitor/status-bar
npm install @capacitor/app
npm install @capacitor/network
```

**1.4 Validar build**
```bash
npm run build
npx cap sync
```

---

### Fase 2 — Background GPS (Dias 3–5)

Esta é a parte mais crítica. O `TelemetryTracker.jsx` já usa `navigator.geolocation.watchPosition` — o Capacitor intercepta isso e usa o GPS nativo automaticamente. O desafio é manter o GPS ativo quando o app está em background.

#### Android — Foreground Service

Adicionar em `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />

<!-- Dentro de <application>: -->
<service
    android:name="com.capacitorjs.plugins.geolocation.GeolocationForegroundService"
    android:foregroundServiceType="location"
    android:exported="false" />
```

Configurar o plugin para ativar o Foreground Service automaticamente quando em tracking:
```typescript
// No capacitor.config.ts, dentro de plugins:
Geolocation: {
  // Android ativa Foreground Service automaticamente quando background tracking ativo
}
```

No código web (já existe, mas garantir que está ativado):
```javascript
// TelemetryTracker.jsx já faz isso — funciona via Capacitor automaticamente
navigator.geolocation.watchPosition(callback, errorCallback, {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0
});
```

#### iOS — Background Location

Em `ios/App/App/Info.plist`, adicionar:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>O Transfer Online usa sua localização para rastrear viagens em andamento e garantir a segurança dos passageiros.</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>O Transfer Online precisa da sua localização em segundo plano durante viagens ativas para monitoramento de segurança.</string>

<key>UIBackgroundModes</key>
<array>
    <string>location</string>
</array>
```

Em Xcode, ativar a capability **Background Modes → Location updates**.

> **Atenção Apple:** Apps com background location passam por revisão mais rigorosa. A justificativa precisa ser clara: "motoristas de transfer precisam ter localização rastreada durante toda a viagem para segurança dos passageiros e telemetria de condução."

---

### Fase 3 — Push Notifications (Dias 4–5)

#### Android — Firebase Cloud Messaging

1. Criar projeto no [Firebase Console](https://console.firebase.google.com)
2. Adicionar app Android com package `com.transferonline.app`
3. Baixar `google-services.json` → colocar em `android/app/`
4. Adicionar em `android/build.gradle`:
```gradle
classpath 'com.google.gms:google-services:4.4.0'
```
5. Adicionar em `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

#### iOS — Apple Push Notification Service

1. No Apple Developer Portal: criar certificado APNs para o App ID
2. Em Xcode: ativar capability **Push Notifications**
3. No Firebase Console: adicionar iOS app e configurar APNs Key

#### Código web para receber notificações (adicionar em App.jsx ou componente global)

```javascript
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

// Chamar uma vez na inicialização do app
export async function initPushNotifications() {
  if (!Capacitor.isNativePlatform()) return;

  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== 'granted') return;

  await PushNotifications.register();

  PushNotifications.addListener('registration', async (token) => {
    // Salvar o token no perfil do usuário no Base44
    try {
      const user = await base44.auth.me();
      await base44.entities.Driver.update(user.driver_id, {
        push_token: token.value,
        push_platform: Capacitor.getPlatform()
      });
    } catch (e) {
      console.warn('Push token save failed:', e);
    }
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    // Usuário tocou na notificação — navegar para a página correta
    const data = notification.notification.data;
    if (data.trip_id) {
      window.location.href = `/DetalhesViagemMotoristaV2?id=${data.trip_id}`;
    }
  });
}
```

**Nota para Fernando:** Para disparar push notifications para motoristas, o Fernando precisará implementar a chamada no Base44 usando a função de integração `SendSMS` ou via Firebase API diretamente nas funções serverless.

---

### Fase 4 — CI/CD com Codemagic (sem Mac) (Dias 6–7)

**Por que Codemagic:**
- Plano free: 500 minutos/mês de build em máquinas macOS — suficiente para esse projeto
- Builds iOS sem precisar de Mac local
- Automatiza o processo: commit → build → distribui para testadores

**4.1 Setup**
1. Criar conta em [codemagic.io](https://codemagic.io)
2. Conectar o repositório GitHub
3. Criar arquivo `codemagic.yaml` na raiz do projeto:

```yaml
workflows:
  transfer-online-android:
    name: Android Build
    instance_type: mac_mini_m2
    environment:
      node: 20.0.0
      java: 17
    scripts:
      - name: Install dependencies
        script: npm install
      - name: Build web
        script: npm run build
      - name: Capacitor sync
        script: npx cap sync android
      - name: Build APK
        script: |
          cd android
          ./gradlew assembleRelease
    artifacts:
      - android/app/build/outputs/**/*.apk

  transfer-online-ios:
    name: iOS Build
    instance_type: mac_mini_m2
    environment:
      node: 20.0.0
      xcode: latest
      cocoapods: default
    scripts:
      - name: Install dependencies
        script: npm install
      - name: Build web
        script: npm run build
      - name: Capacitor sync
        script: npx cap sync ios
      - name: Build iOS
        script: |
          xcodebuild -workspace ios/App/App.xcworkspace \
            -scheme App \
            -configuration Release \
            -archivePath ios/App/App.xcarchive \
            archive
    artifacts:
      - ios/App/App.xcarchive/**
```

**4.2 Signing**
- Android: criar keystore (`keytool -genkey -v -keystore transfer-online.keystore`)
- iOS: certificados e provisioning profiles via Codemagic (interface gráfica, sem terminal)

---

### Fase 5 — Assets e Submissão (Dias 8–10)

**Assets necessários (Fernando fornece ou João cria):**
- Ícone 1024×1024px PNG (fundo sólido, sem transparência)
- Splash screen (gerado automaticamente pelo Capacitor a partir do ícone)
- Screenshots do app: mínimo 3 por plataforma em PT-BR
- Descrição do app (até 4.000 caracteres) para as lojas

**Google Play Store:**
1. Criar app no Play Console
2. Preencher ficha (descrição, categoria: Viagens e navegação)
3. Adicionar política de privacidade (obrigatória — URL pública)
4. Upload do AAB (Android App Bundle)
5. Submeter para revisão (horas a 3 dias)

**Apple App Store:**
1. Criar App ID no Developer Portal
2. Criar app no App Store Connect
3. Preencher ficha completa
4. Upload via Codemagic (Xcode Cloud ou Transporter)
5. Submeter para revisão (1–3 dias)

> A Apple rejeita apps que solicitam localização em background sem justificativa clara. Texto recomendado: *"Este app rastreia a localização do motorista durante viagens ativas para garantir a segurança dos passageiros e gerar relatórios de telemetria de condução."*

---

### Fase 6 — Checklist de QA

**Antes de submeter:**
- [ ] Login redireciona motorista para DashboardMotoristaV2
- [ ] Login redireciona admin para AdminDashboard
- [ ] Login redireciona passageiro para MinhasSolicitacoes
- [ ] Login redireciona fornecedor para DashboardFornecedor
- [ ] GPS funciona com app em background (Android)
- [ ] GPS funciona com app minimizado (iOS)
- [ ] Telemetria registra frenagem brusca, curva e excesso de velocidade
- [ ] Push notification chega com app fechado
- [ ] Toque na notificação abre a viagem correta
- [ ] Score de segurança aparece no painel do admin
- [ ] Safe area correta em iPhone com notch
- [ ] Teclado não cobre inputs em iOS
- [ ] App funciona com conexão instável (mensagem clara offline)

---

## Telemetria — O que já está pronto

O `TelemetryTracker.jsx` já detecta e registra automaticamente:

| Evento | Thresholds | Status |
|---|---|---|
| Frenagem brusca | Desaceleração > 15 km/h/s | ✅ Funcionando |
| Curva acentuada | Heading > 45° acima de 20 km/h | ✅ Funcionando |
| Excesso de velocidade | Via Google Roads API (limite real da via) | ✅ Funcionando |
| Uso de celular | Toque na tela acima de 10 km/h | ✅ Funcionando |
| Score de segurança | 100 pts (-5 frenagem, -3 curva, -10 excesso) | ✅ Funcionando |
| Rastreamento de rota | Breadcrumbs a cada 30s para replay | ✅ Funcionando |
| Ranking de motoristas | Por score médio | ✅ Funcionando |
| Hotspots de incidentes | Mapa de onde ocorreram eventos | ✅ Funcionando |

**O que o Capacitor adiciona:** Garante que o GPS continue coletando dados mesmo com o app em background (Foreground Service Android + Background Location iOS). O código de telemetria existente funciona sem modificação.

---

## Fluxo de Manutenção (Após Lançamento)

### Quando Fernando atualizar o Base44

```bash
# 1. Puxar código novo
git pull

# 2. Build
npm run build

# 3. Sync (apenas copia o build para android/ e ios/ — sem modificar configs)
npx cap sync

# 4. Push → Codemagic faz build automático → distribui nas lojas
git push origin main
```

Os arquivos de Capacitor (`capacitor.config.ts`, `android/`, `ios/`) nunca são tocados por esse processo.

### Quando precisa submeter nova versão nas lojas

- Fernando adicionou feature que usa nova permissão nativa → submit obrigatório
- Atualização maior do Capacitor → submit obrigatório
- Qualquer mudança só em código React → **NÃO precisa de novo submit** (Codemagic distribui OTA)

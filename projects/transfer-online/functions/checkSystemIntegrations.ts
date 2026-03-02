import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Autenticação Admin
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
       return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const results = [];

    // 1. Verificar WhatsApp (Z-API)
    const zApiUrl = Deno.env.get("EVOLUTION_API_URL");
    const zApiToken = Deno.env.get("EVOLUTION_API_KEY");
    const zApiInstance = Deno.env.get("EVOLUTION_INSTANCE_NAME");
    const zApiClientToken = Deno.env.get("EVOLUTION_CLIENT_TOKEN");

    if (zApiUrl && zApiToken && zApiInstance) {
        try {
            // Normalizar URL
            let baseUrl = zApiUrl.trim();
            while(baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
            
            // Construir URL de status da Z-API
            const statusUrl = `${baseUrl}/instances/${zApiInstance}/token/${zApiToken}/status`;
            
            const headers = { 'Content-Type': 'application/json' };
            if (zApiClientToken) headers['Client-Token'] = zApiClientToken;

            const response = await fetch(statusUrl, {
                method: 'GET',
                headers: headers
            });

            if (response.ok) {
                const data = await response.json();
                console.log("[CheckSystem] Z-API Response:", JSON.stringify(data));
                
                const isConnected = data.connected === true;
                
                results.push({
                    service: 'WhatsApp (Z-API)',
                    status: isConnected ? 'online' : 'warning',
                    details: `Instância: ${zApiInstance}, Conectado: ${isConnected}`,
                    last_check: new Date().toISOString()
                });
            } else {
                 results.push({
                    service: 'WhatsApp (Z-API)',
                    status: 'error',
                    details: `Erro HTTP ${response.status}: ${await response.text()}`,
                    last_check: new Date().toISOString()
                });
            }
        } catch (e) {
            results.push({
                service: 'WhatsApp (Z-API)',
                status: 'error',
                details: `Falha na conexão: ${e.message}`,
                last_check: new Date().toISOString()
            });
        }
    } else {
        results.push({
            service: 'WhatsApp (Z-API)',
            status: 'error',
            details: 'Configurações de ambiente ausentes (URL, Key ou Instance)',
            last_check: new Date().toISOString()
        });
    }

    // 2. Verificar Twilio (Voz/SMS)
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");

    if (twilioSid && twilioToken) {
        try {
            const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}.json`, {
                headers: {
                    'Authorization': `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                results.push({
                    service: 'Twilio (Voz/SMS)',
                    status: data.status === 'active' ? 'online' : 'warning',
                    details: `Conta: ${data.friendly_name} (${data.type}), Status: ${data.status}`,
                    last_check: new Date().toISOString()
                });
            } else {
                results.push({
                    service: 'Twilio (Voz/SMS)',
                    status: 'error',
                    details: `Erro de Autenticação ou Conta: ${response.status}`,
                    last_check: new Date().toISOString()
                });
            }
        } catch (e) {
             results.push({
                service: 'Twilio (Voz/SMS)',
                status: 'error',
                details: `Erro de conexão: ${e.message}`,
                last_check: new Date().toISOString()
            });
        }
    } else {
         results.push({
            service: 'Twilio (Voz/SMS)',
            status: 'warning',
            details: 'Credenciais não configuradas',
            last_check: new Date().toISOString()
        });
    }

    // 3. Verificar Email (Resend)
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
        // Validação simples: verificar se a chave existe e tem formato básico
        // Fazer chamada real poderia gastar quota ou enviar email indesejado
        // Vamos tentar listar domínios se possível, ou apenas confirmar config
        try {
             const response = await fetch('https://api.resend.com/domains', {
                headers: { 'Authorization': `Bearer ${resendKey}` }
            });
            
            if (response.ok) {
                 results.push({
                    service: 'Email (Resend)',
                    status: 'online',
                    details: 'API Acessível e Autenticada',
                    last_check: new Date().toISOString()
                });
            } else {
                 results.push({
                    service: 'Email (Resend)',
                    status: 'error',
                    details: `Erro API: ${response.status}`,
                    last_check: new Date().toISOString()
                });
            }
        } catch (e) {
             results.push({
                service: 'Email (Resend)',
                status: 'error',
                details: `Erro Conexão: ${e.message}`,
                last_check: new Date().toISOString()
            });
        }
    } else {
         results.push({
            service: 'Email (Resend)',
            status: 'warning',
            details: 'API Key não configurada',
            last_check: new Date().toISOString()
        });
    }

    // 4. Verificar Cron (Driver Reminders)
    try {
        const configs = await base44.asServiceRole.entities.AppConfig.filter({ config_key: 'last_reminder_check' });
        if (configs && configs.length > 0) {
            const lastCheck = new Date(configs[0].config_value);
            const now = new Date();
            const diffMinutes = (now - lastCheck) / (1000 * 60);
            
            let status = 'online';
            let details = `Última execução: ${lastCheck.toLocaleString('pt-BR')}`;

            // Se faz mais de 20 minutos que não roda (assumindo cron a cada 5-10 min)
            if (diffMinutes > 20) {
                status = 'warning';
                details += ` (Atrasado há ${Math.round(diffMinutes)} min)`;
            }

            results.push({
                service: 'Cron (Lembretes Motorista)',
                status: status,
                details: details,
                last_check: new Date().toISOString()
            });
        } else {
             results.push({
                service: 'Cron (Lembretes Motorista)',
                status: 'warning',
                details: 'Nenhum registro de execução encontrado ainda',
                last_check: new Date().toISOString()
            });
        }
    } catch (e) {
         results.push({
            service: 'Cron (Lembretes Motorista)',
            status: 'error',
            details: `Erro ao verificar config: ${e.message}`,
            last_check: new Date().toISOString()
        });
    }

    // 5. Verificar Google Maps
    const mapsKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (mapsKey) {
        results.push({
            service: 'Google Maps API',
            status: 'online', // Assumindo online se tem chave, teste real gastaria quota
            details: 'Chave configurada',
            last_check: new Date().toISOString()
        });
    } else {
         results.push({
            service: 'Google Maps API',
            status: 'error',
            details: 'Chave não configurada (Geocoding/Places podem falhar)',
            last_check: new Date().toISOString()
        });
    }

    return Response.json({ 
        success: true, 
        services: results,
        checked_at: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
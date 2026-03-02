import { createClientFromRequest } from 'npm:@base44/sdk@0.8.12';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { to, message } = body;

    console.log(`[sendWhatsAppMessage] Request recebido para: ${to}`);

    if (!to || !message) {
      console.error('[sendWhatsAppMessage] Campos obrigatórios faltando');
      return Response.json({ success: false, error: 'Telefone e mensagem são obrigatórios' }, { status: 400 });
    }

    const apiUrl = Deno.env.get('EVOLUTION_API_URL');
    const token = Deno.env.get('EVOLUTION_API_KEY');
    const instanceId = Deno.env.get('EVOLUTION_INSTANCE_NAME');
    const clientToken = Deno.env.get('EVOLUTION_CLIENT_TOKEN');

    if (!apiUrl || !token || !instanceId) {
      console.error('[sendWhatsAppMessage] Configurações de ambiente faltando');
      return Response.json({ success: false, error: 'Configurações de WhatsApp não encontradas' }, { status: 500 });
    }

    // URL Cleanup
    let baseUrl = apiUrl.trim();
    while(baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
    try {
      const urlObj = new URL(baseUrl);
      baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    } catch (e) {
      // ignore
    }

    // Format phone
    let formattedPhone = to.replace(/\D/g, '');
    
    // Lógica inteligente para internacionalização:
    // 1. Se o número original contém '+', assumimos que já possui DDI (seja 55 ou outro) e usamos como está.
    // 2. Se não contém '+', verificamos se começa com 55. Se não começar, assumimos que é um número local BR e adicionamos 55.
    if (!to.includes('+') && !formattedPhone.startsWith('55')) {
        formattedPhone = `55${formattedPhone}`;
    }

    const headers = { 'Content-Type': 'application/json' };
    if (clientToken) headers['Client-Token'] = clientToken;

    const zApiUrl = `${baseUrl}/instances/${instanceId}/token/${token}/send-text`;
    
    console.log(`[sendWhatsAppMessage] Enviando para URL: ${zApiUrl} (Phone: ${formattedPhone})`);

    const response = await fetch(zApiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        phone: formattedPhone,
        message: message
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[sendWhatsAppMessage] Erro HTTP ${response.status}:`, errorText);
      throw new Error(`Erro ao enviar WhatsApp: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('[sendWhatsAppMessage] Sucesso:', result);

    return Response.json({ success: true, message_id: result.key?.id, api_response: result });

  } catch (error) {
    console.error('[sendWhatsAppMessage] Erro Exception:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});
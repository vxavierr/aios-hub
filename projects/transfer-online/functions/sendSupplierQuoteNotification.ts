import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const requestBody = await req.json();
    const { quoteId } = requestBody;

    if (!quoteId) return Response.json({ success: false, error: 'quoteId obrigatório' }, { status: 400 });

    const quotes = await base44.asServiceRole.entities.QuoteRequest.list();
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return Response.json({ success: false, error: 'Cotação não encontrada' }, { status: 404 });
    if (!quote.supplier_id) return Response.json({ success: false, error: 'Fornecedor não associado' }, { status: 400 });

    const suppliers = await base44.asServiceRole.entities.Supplier.list();
    const supplier = suppliers.find(p => p.id === quote.supplier_id);
    if (!supplier) return Response.json({ success: false, error: 'Fornecedor não encontrado' }, { status: 404 });

    const apiUrl = Deno.env.get('EVOLUTION_API_URL');
    const token = Deno.env.get('EVOLUTION_API_KEY');
    const instanceId = Deno.env.get('EVOLUTION_INSTANCE_NAME');
    const clientToken = Deno.env.get('EVOLUTION_CLIENT_TOKEN');
    const baseUrl = Deno.env.get('BASE_URL') || 'https://seu-dominio.com';

    if (!apiUrl || !token || !instanceId) return Response.json({ success: false, error: 'Configuração do WhatsApp não encontrada' }, { status: 500 });

    let responseToken = quote.supplier_response_token;
    if (!responseToken) {
      responseToken = crypto.randomUUID();
      await base44.asServiceRole.entities.QuoteRequest.update(quoteId, {
        supplier_response_token: responseToken,
        supplier_request_sent_at: new Date().toISOString(),
        supplier_status: 'aguardando_resposta'
      });
    }

    const responseUrl = `${baseUrl}/SupplierQuoteResponse?quote=${quoteId}&token=${responseToken}`;
    const supplierPhone = supplier.phone_number.replace(/\D/g, '');
    const serviceTypeLabel = quote.service_type === 'one_way' ? 'Só Ida' : quote.service_type === 'round_trip' ? 'Ida e Volta' : 'Por Hora';

    let message = `📋 *NOVA SOLICITAÇÃO DE COTAÇÃO*\n\nOlá, ${supplier.name}!\n\nCotação: *${quote.quote_number}*\nTipo: *${serviceTypeLabel}*\nVeículo: *${quote.vehicle_type_name}*\n\n📍 *Origem:* ${quote.origin}\n📍 *Destino:* ${quote.destination || quote.origin}\n📅 *Data:* ${new Date(quote.date).toLocaleDateString('pt-BR')}\n🕐 *Horário:* ${quote.time}\n`;
    if (quote.service_type === 'round_trip') message += `🔄 *Retorno:* ${new Date(quote.return_date).toLocaleDateString('pt-BR')} às ${quote.return_time}\n`;
    if (quote.service_type === 'hourly') message += `⏱️ *Horas:* ${quote.hours}h\n`;
    message += `\n👥 *Passageiros:* ${quote.passengers}\n`;
    if (quote.distance_km > 0) message += `📏 *Distância Total:* ${quote.distance_km} km\n`;
    if (quote.notes) message += `\n💬 *Observações:* ${quote.notes}\n`;
    message += `\n🔗 *Responda aqui:*\n${responseUrl}\n\n⚠️ Por favor, informe o custo desta viagem através do link acima.`;

    // Robust URL construction
    let baseUrl = apiUrl.trim();
    while(baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
    
    try {
        const urlObj = new URL(baseUrl);
        baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    } catch (e) {
        console.warn("Invalid API URL format", e);
    }
    const zApiUrl = `${baseUrl}/instances/${instanceId}/token/${token}/send-text`;
    
    const headers = { 'Content-Type': 'application/json' };
    if (clientToken) headers['Client-Token'] = clientToken;

    const whatsappResponse = await fetch(zApiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ phone: supplierPhone, message: message })
    });

    const responseText = await whatsappResponse.text();
    if (!whatsappResponse.ok) {
        let errorDetail = responseText;
        try {
            const jsonError = JSON.parse(responseText);
            if (jsonError.error) {
                if (typeof jsonError.error === 'string') errorDetail = jsonError.error;
                else if (jsonError.error.message) errorDetail = jsonError.error.message;
            } else if (jsonError.message) errorDetail = jsonError.message;
        } catch(e) {}
        throw new Error(`Z-API Error: ${errorDetail}`);
    }

    return Response.json({ success: true, message: 'Notificação enviada ao fornecedor com sucesso' });

  } catch (error) {
    console.error('Erro ao enviar notificação ao fornecedor:', error);
    return Response.json({ success: false, error: error.message || 'Erro ao enviar notificação' }, { status: 500 });
  }
});
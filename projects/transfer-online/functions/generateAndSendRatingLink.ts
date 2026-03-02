import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { serviceRequestId, recipientEmail } = await req.json();

    if (!serviceRequestId) {
      return Response.json({ error: 'serviceRequestId é obrigatório' }, { status: 400 });
    }

    console.log(`[generateAndSendRatingLink] Iniciando para ID: ${serviceRequestId}`);

    // 1. Buscar a Viagem (Polimórfico)
    let request = null;
    let tripType = null; // 'service_request', 'supplier_own_booking', 'booking'

    // Tentar ServiceRequest
    const serviceRequests = await base44.asServiceRole.entities.ServiceRequest.filter({ id: serviceRequestId });
    if (serviceRequests && serviceRequests.length > 0) {
      request = serviceRequests[0];
      tripType = 'service_request';
    } else {
      // Tentar SupplierOwnBooking
      const ownBookings = await base44.asServiceRole.entities.SupplierOwnBooking.filter({ id: serviceRequestId });
      if (ownBookings && ownBookings.length > 0) {
        request = ownBookings[0];
        tripType = 'supplier_own_booking';
      } else {
        // Tentar Booking
        const bookings = await base44.asServiceRole.entities.Booking.filter({ id: serviceRequestId });
        if (bookings && bookings.length > 0) {
          request = bookings[0];
          tripType = 'booking';
        }
      }
    }

    if (!request) {
      return Response.json({ error: 'Viagem não encontrada' }, { status: 404 });
    }

    // Normalizar dados de contato
    let passengerEmail = recipientEmail;
    let passengerPhone = null;
    let passengerName = null;
    let driverLanguage = request.driver_language || 'pt';
    let tripNumber = null;

    if (tripType === 'service_request') {
      if (!passengerEmail) passengerEmail = request.passenger_email;
      passengerPhone = request.passenger_phone || request.requester_phone;
      passengerName = request.passenger_name;
      tripNumber = request.request_number;
    } else if (tripType === 'supplier_own_booking') {
      if (!passengerEmail) passengerEmail = request.passenger_email;
      passengerPhone = request.passenger_phone;
      passengerName = request.passenger_name;
      tripNumber = request.booking_number;
    } else if (tripType === 'booking') {
      if (!passengerEmail) passengerEmail = request.customer_email;
      passengerPhone = request.customer_phone;
      passengerName = request.customer_name;
      tripNumber = request.booking_number;
    }

    // 2. Gerar ou Reutilizar Token (Com verificação de race condition)
    // Recarregar a entidade para garantir que temos o token mais recente, caso tenha sido gerado milissegundos atrás por outra chamada
    let freshRequest = request;
    try {
        if (tripType === 'service_request') {
            const fresh = await base44.asServiceRole.entities.ServiceRequest.get(request.id);
            if (fresh) freshRequest = fresh;
        } else if (tripType === 'supplier_own_booking') {
            const fresh = await base44.asServiceRole.entities.SupplierOwnBooking.get(request.id);
            if (fresh) freshRequest = fresh;
        } else if (tripType === 'booking') {
            const fresh = await base44.asServiceRole.entities.Booking.get(request.id);
            if (fresh) freshRequest = fresh;
        }
    } catch (e) {
        console.warn('Erro ao recarregar entidade para verificação de token:', e);
    }

    let token = freshRequest.rating_link_token;
    let expiresAt = freshRequest.rating_link_expires_at ? new Date(freshRequest.rating_link_expires_at) : null;
    const now = new Date();

    // Se não tem token ou já expirou (ou vai expirar em menos de 24h), gera novo
    // Se o token existe e é válido, REUTILIZA para evitar invalidar links enviados anteriormente
    if (!token || !expiresAt || expiresAt < now) {
      token = crypto.randomUUID();
      // Validade de 7 dias
      expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const updateData = {
        rating_link_token: token,
        rating_link_expires_at: expiresAt.toISOString()
      };

      if (tripType === 'service_request') {
        await base44.asServiceRole.entities.ServiceRequest.update(serviceRequestId, updateData);
      } else if (tripType === 'supplier_own_booking') {
        await base44.asServiceRole.entities.SupplierOwnBooking.update(serviceRequestId, updateData);
      } else if (tripType === 'booking') {
        await base44.asServiceRole.entities.Booking.update(serviceRequestId, updateData);
      }

      // Verificação de persistência com Retry
      let verified = null;
      let attempts = 0;
      let persisted = false;

      while (attempts < 3 && !persisted) {
          await new Promise(r => setTimeout(r, 500)); // Esperar 500ms
          
          try {
            if (tripType === 'service_request') {
                verified = await base44.asServiceRole.entities.ServiceRequest.get(serviceRequestId);
            } else if (tripType === 'supplier_own_booking') {
                verified = await base44.asServiceRole.entities.SupplierOwnBooking.get(serviceRequestId);
            } else if (tripType === 'booking') {
                verified = await base44.asServiceRole.entities.Booking.get(serviceRequestId);
            }

            if (verified && verified.rating_link_token === token) {
                persisted = true;
                console.log(`[generateAndSendRatingLink] Token persistido com sucesso para ${tripType} ${serviceRequestId} (Tentativa ${attempts + 1})`);
            } else {
                console.warn(`[generateAndSendRatingLink] Token ainda não persistido na tentativa ${attempts + 1}. Retentando...`);
                // Tentar update novamente na última tentativa se ainda falhar
                if (attempts === 1) {
                     if (tripType === 'service_request') {
                        await base44.asServiceRole.entities.ServiceRequest.update(serviceRequestId, updateData);
                      } else if (tripType === 'supplier_own_booking') {
                        await base44.asServiceRole.entities.SupplierOwnBooking.update(serviceRequestId, updateData);
                      } else if (tripType === 'booking') {
                        await base44.asServiceRole.entities.Booking.update(serviceRequestId, updateData);
                      }
                }
            }
          } catch (e) {
              console.error(`[generateAndSendRatingLink] Erro na verificação de persistência:`, e);
          }
          attempts++;
      }

      if (!persisted) {
        console.error(`[generateAndSendRatingLink] ERRO CRÍTICO: Falha definitiva ao persistir token para ${tripType} ${serviceRequestId}`);
      }
    } else {
      console.log(`[generateAndSendRatingLink] Reutilizando token existente para ${tripType} ${serviceRequestId}`);
    }

    // 3. Criar Link
    const baseUrl = Deno.env.get('BASE_URL');
    const appUrl = baseUrl ? baseUrl.replace(/\/$/, '') : (req.headers.get('origin') || 'https://app.transferonline.com.br');
    const ratingLink = `${appUrl}/AvaliarViagem?token=${token}`;

    // 4. Definir Idioma e Conteúdo
    const lang = driverLanguage || 'pt';
    const safeId = request.id ? request.id.slice(-6) : '......';
    const displayId = tripNumber || safeId;
    
    const content = {
      pt: {
        subject: `Avalie sua viagem - TransferOnline #${displayId}`,
        title: "Avalie sua viagem com a TransferOnline",
        greeting: "Olá,",
        message: "Esperamos que sua viagem tenha sido excelente! Gostaríamos de ouvir sua opinião sobre o serviço prestado.",
        dateLabel: "Data:",
        originLabel: "Origem:",
        destLabel: "Destino:",
        buttonText: "Avaliar Viagem Agora",
        fallbackText: "Se o botão não funcionar, copie e cole o link abaixo no seu navegador:",
        signature: "Atenciosamente,<br/>Equipe TransferOnline",
        whatsappMessage: `🚗 *TransferOnline*\n\nOlá! Esperamos que sua viagem tenha sido excelente! ⭐\n\nPor favor, reserve um momento para avaliar sua experiência:\n\n👉 ${ratingLink}\n\nSua opinião é muito importante para nós!`
      },
      en: {
        subject: `Rate your trip - TransferOnline #${displayId}`,
        title: "Rate your trip with TransferOnline",
        greeting: "Hello,",
        message: "We hope you had an excellent trip! We would like to hear your feedback about the service provided.",
        dateLabel: "Date:",
        originLabel: "Origin:",
        destLabel: "Destination:",
        buttonText: "Rate Trip Now",
        fallbackText: "If the button doesn't work, copy and paste the link below into your browser:",
        signature: "Best regards,<br/>TransferOnline Team",
        whatsappMessage: `🚗 *TransferOnline*\n\nHello! We hope you had an excellent trip! ⭐\n\nPlease take a moment to rate your experience:\n\n👉 ${ratingLink}\n\nYour feedback is very important to us!`
      },
      es: {
        subject: `Califica tu viaje - TransferOnline #${displayId}`,
        title: "Califica tu viaje con TransferOnline",
        greeting: "Hola,",
        message: "¡Esperamos que tu viaje haya sido excelente! Nos gustaría conocer tu opinión sobre el servicio prestado.",
        dateLabel: "Fecha:",
        originLabel: "Origen:",
        destLabel: "Destino:",
        buttonText: "Calificar Viaje Ahora",
        fallbackText: "Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:",
        signature: "Atentamente,<br/>Equipo TransferOnline",
        whatsappMessage: `🚗 *TransferOnline*\n\n¡Hola! ¡Esperamos que tu viaje haya sido excelente! ⭐\n\nPor favor, tómate un momento para calificar tu experiencia:\n\n👉 ${ratingLink}\n\n¡Tu opinión es muy importante para nosotros!`
      }
    };

    const t = content[lang] || content.pt;

    const emailBody = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>${t.title}</h2>
        <p>${t.greeting}</p>
        <p>${t.message}</p>
        <p><strong>${t.dateLabel}</strong> ${request.date} ${request.time ? ' - ' + request.time : ''}</p>
        <p><strong>${t.originLabel}</strong> ${request.origin}</p>
        <p><strong>${t.destLabel}</strong> ${request.destination}</p>
        <br/>
        <a href="${ratingLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          ${t.buttonText}
        </a>
        <br/><br/>
        <p>${t.fallbackText}</p>
        <p>${ratingLink}</p>
        <br/>
        <p>${t.signature}</p>
      </div>
    `;

    // Verificação FINAL de persistência antes do envio
    let isTokenPersisted = false;
    try {
        let finalCheck = null;
        if (tripType === 'service_request') finalCheck = await base44.asServiceRole.entities.ServiceRequest.get(serviceRequestId);
        else if (tripType === 'supplier_own_booking') finalCheck = await base44.asServiceRole.entities.SupplierOwnBooking.get(serviceRequestId);
        else if (tripType === 'booking') finalCheck = await base44.asServiceRole.entities.Booking.get(serviceRequestId);

        if (finalCheck && finalCheck.rating_link_token === token) {
            isTokenPersisted = true;
        }
    } catch (e) {
        console.error('[generateAndSendRatingLink] Erro na verificação final:', e);
    }

    if (!isTokenPersisted) {
        throw new Error('Falha crítica: Token não foi persistido no banco de dados. Abortando envio para evitar link inválido.');
    }

    // 5. Enviar Email
    let emailSent = false;
    let emailError = null;
    
    if (passengerEmail) {
      try {
        await base44.integrations.Core.SendEmail({
          to: passengerEmail,
          subject: t.subject,
          body: emailBody,
          from_name: "TransferOnline"
        });
        emailSent = true;
      } catch (err) {
        console.warn('[generateAndSendRatingLink] Falha ao enviar e-mail:', err.message);
        emailError = err.message;
      }
    }

    // Log de Auditoria do Token (Para debug e rastreabilidade)
    try {
        const logNote = `Rating Token Generated: ${token}`;
        // Verificar se já existe log com este token para evitar duplicidade
        const existingLogs = await base44.asServiceRole.entities.TripStatusLog.filter({
            notes: { $contains: token } // Ajuste conforme capacidade de filtro, ou filtrar na memória se necessário. Assumindo suporte básico ou string exata se possível.
        });

        // Como filter com contains pode não ser suportado dependendo da versão, vamos apenas criar o log se for um novo token gerado nesta execução
        // Ou melhor, sempre criar para garantir que sabemos que foi solicitado.

        const logData = {
            status: 'rating_link_generated',
            timestamp: new Date().toISOString(),
            notes: logNote
        };

        if (tripType === 'service_request') logData.service_request_id = serviceRequestId;
        else if (tripType === 'supplier_own_booking') logData.supplier_own_booking_id = serviceRequestId;
        else if (tripType === 'booking') logData.booking_id = serviceRequestId;

        await base44.asServiceRole.entities.TripStatusLog.create(logData);
        console.log(`[generateAndSendRatingLink] Log de auditoria criado para token ${token}`);
    } catch (logError) {
        console.warn('[generateAndSendRatingLink] Falha ao criar log de auditoria do token:', logError);
    }

    // 6. Enviar WhatsApp (Z-API)
    let whatsappSent = false;
    let whatsappError = null;
    
    if (passengerPhone) {
      try {
        const apiUrl = Deno.env.get('EVOLUTION_API_URL');
        const apiKey = Deno.env.get('EVOLUTION_API_KEY');
        const instanceName = Deno.env.get('EVOLUTION_INSTANCE_NAME');
        const clientToken = Deno.env.get('EVOLUTION_CLIENT_TOKEN');

        if (apiUrl && apiKey && instanceName) {
          let phone = passengerPhone.replace(/\D/g, '');
          
          if (!phone.startsWith('55') && (phone.length === 10 || phone.length === 11)) {
            phone = '55' + phone;
          }

          console.log(`[generateAndSendRatingLink] Enviando WhatsApp (Z-API) para: ${phone}`);
          
          let baseUrl = apiUrl.trim();
          while(baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
          
          // Formato Z-API: /instances/{instanceId}/token/{token}/send-text
          const zApiUrl = `${baseUrl}/instances/${instanceName}/token/${apiKey}/send-text`;
          
          const headers = { 'Content-Type': 'application/json' };
          if (clientToken) headers['Client-Token'] = clientToken;

          const whatsappResponse = await fetch(zApiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
              phone: phone,
              message: t.whatsappMessage
            })
          });

          if (whatsappResponse.ok) {
            whatsappSent = true;
            console.log(`[generateAndSendRatingLink] WhatsApp enviado com sucesso para ${phone}`);
          } else {
            const errText = await whatsappResponse.text();
            whatsappError = `Status: ${whatsappResponse.status}. Resp: ${errText}`;
            console.error(`[generateAndSendRatingLink] Falha na API WhatsApp: ${whatsappError}`);
          }
        } else {
            whatsappError = 'Configurações de WhatsApp (EVOLUTION_*) incompletas';
            console.warn(whatsappError);
        }
      } catch (waError) {
        console.error('[generateAndSendRatingLink] Erro ao processar WhatsApp:', waError);
        whatsappError = waError.message;
      }
    }

    const success = emailSent || whatsappSent;
    let finalMessage = 'Link enviado com sucesso!';
    
    if (whatsappSent && !emailSent && emailError) {
      finalMessage = 'Enviado via WhatsApp (E-mail falhou)';
    } else if (!whatsappSent && emailSent) {
      finalMessage = 'Enviado via E-mail (WhatsApp não enviado)';
    } else if (!success) {
      finalMessage = 'Falha ao enviar por E-mail e WhatsApp';
      if (emailError) throw new Error(`Falha no envio: E-mail (${emailError}) | WhatsApp (${whatsappError})`);
      throw new Error('Falha no envio: Nenhum canal disponível ou erro desconhecido');
    }

    return Response.json({ 
      success: true, 
      message: finalMessage,
      whatsapp_sent: whatsappSent,
      email_sent: emailSent,
      email_error: emailError,
      whatsapp_error: whatsappError
    });

  } catch (error) {
    console.error('Erro ao gerar link de avaliação:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
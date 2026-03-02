import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
});

Deno.serve(async (req) => {
  console.log("=== Stripe Webhook Handler INICIADO ===");
  
  try {
    // Obter o corpo da requisição como texto (necessário para validação da assinatura)
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    console.log("Stripe Signature recebida:", signature ? "Presente" : "Ausente");

    if (!signature) {
      console.error("Assinatura do webhook ausente");
      return Response.json(
        { error: 'Assinatura do webhook ausente' },
        { status: 400 }
      );
    }

    // Validar a assinatura do webhook
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET não configurado");
      return Response.json(
        { error: 'Webhook secret não configurado' },
        { status: 500 }
      );
    }

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
      console.log("Evento do Stripe validado com sucesso:", event.type);
    } catch (err) {
      console.error('Erro ao validar assinatura do webhook:', err.message);
      return Response.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    const base44 = createClientFromRequest(req);

    // Processar evento de pagamento bem-sucedido
    if (event.type === 'checkout.session.completed' || event.type === 'payment_link.payment_completed') {
      console.log("Processando evento de pagamento concluído");
      
      const session = event.data.object;
      console.log("Sessão de pagamento:", session.id);
      console.log("Metadados:", session.metadata);

      // Verificar se é um pagamento de cotação
      if (session.metadata?.type === 'quote_payment') {
        const quoteRequestId = session.metadata.quote_request_id;
        const quoteNumber = session.metadata.quote_number;

        console.log("Pagamento de cotação detectado:", quoteNumber);

        if (!quoteRequestId) {
          console.error("quote_request_id não encontrado nos metadados");
          return Response.json({ received: true });
        }

        // Buscar a cotação
        const quoteRequests = await base44.asServiceRole.entities.QuoteRequest.list();
        const quoteRequest = quoteRequests.find(q => q.id === quoteRequestId);

        if (!quoteRequest) {
          console.error("Cotação não encontrada:", quoteRequestId);
          return Response.json({ received: true });
        }

        console.log("Cotação encontrada:", quoteRequest.quote_number);

        // Gerar número de reserva
        const bookingNumberResponse = await base44.asServiceRole.functions.invoke('generateBookingNumber');
        const bookingNumber = bookingNumberResponse.data.bookingNumber;

        console.log("Número de reserva gerado:", bookingNumber);

        // Criar a reserva a partir da cotação
        const bookingData = {
          booking_number: bookingNumber,
          service_type: quoteRequest.service_type,
          vehicle_type_id: quoteRequest.vehicle_type_id,
          vehicle_type_name: quoteRequest.vehicle_type_name,
          driver_language: quoteRequest.driver_language,
          origin: quoteRequest.origin,
          destination: quoteRequest.destination,
          date: quoteRequest.date,
          time: quoteRequest.time,
          return_date: quoteRequest.return_date,
          return_time: quoteRequest.return_time,
          hours: quoteRequest.hours,
          distance_km: quoteRequest.distance_km,
          duration_minutes: quoteRequest.duration_minutes,
          passengers: quoteRequest.passengers,
          customer_name: quoteRequest.customer_name,
          customer_email: quoteRequest.customer_email,
          customer_phone: quoteRequest.customer_phone,
          notes: quoteRequest.notes,
          total_price: quoteRequest.admin_quote_price,
          has_return: quoteRequest.service_type === 'round_trip',
          status: 'confirmada',
          payment_status: 'pago',
          payment_intent_id: session.payment_intent || session.id
        };

        console.log("Criando reserva com os dados da cotação...");
        const booking = await base44.asServiceRole.entities.Booking.create(bookingData);
        console.log("Reserva criada com sucesso:", booking.id);

        // Atualizar a cotação para status "convertido"
        await base44.asServiceRole.entities.QuoteRequest.update(quoteRequestId, {
          status: 'convertido',
          booking_id: booking.id,
          converted_at: new Date().toISOString()
        });
        console.log("Cotação atualizada para status 'convertido'");

        // Enviar notificações por e-mail
        try {
          console.log("Enviando e-mail de confirmação...");
          await base44.asServiceRole.functions.invoke('sendBookingEmail', {
            bookingId: booking.id
          });
          console.log("E-mail de confirmação enviado com sucesso");
        } catch (emailError) {
          console.error('Erro ao enviar e-mail de confirmação:', emailError);
        }

        // Enviar notificações por WhatsApp
        try {
          console.log("Enviando WhatsApp para o cliente...");
          await base44.asServiceRole.functions.invoke('sendWhatsAppBookingNotification', {
            bookingId: booking.id,
            recipientType: 'customer'
          });
          console.log("WhatsApp para cliente enviado");
        } catch (whatsappError) {
          console.error('Erro ao enviar WhatsApp para cliente:', whatsappError);
        }

        try {
          console.log("Enviando WhatsApp para o admin...");
          await base44.asServiceRole.functions.invoke('sendWhatsAppBookingNotification', {
            bookingId: booking.id,
            recipientType: 'admin'
          });
          console.log("WhatsApp para admin enviado");
        } catch (whatsappError) {
          console.error('Erro ao enviar WhatsApp para admin:', whatsappError);
        }

        console.log("Processamento da cotação concluído com sucesso!");
      }
      // Verificar se é um pagamento de reserva direta (NovaReserva)
      else if (session.metadata?.booking_id) {
        const bookingId = session.metadata.booking_id;
        const bookingNumber = session.metadata.booking_number;
        
        console.log("Pagamento de reserva direta detectado:", bookingNumber);
        
        // Buscar a reserva para garantir que existe e ter os dados atuais
        const bookings = await base44.asServiceRole.entities.Booking.list();
        const booking = bookings.find(b => b.id === bookingId);
        
        if (booking) {
            // Atualizar status da reserva (garantia via webhook)
            if (booking.status !== 'confirmada' || booking.payment_status !== 'pago') {
                console.log("Atualizando status da reserva via webhook...");
                await base44.asServiceRole.entities.Booking.update(bookingId, {
                    status: 'confirmada',
                    payment_status: 'pago',
                    payment_intent_id: session.payment_intent || session.id
                });
            }

            // Enviar WhatsApp para Admin (que estava faltando)
            try {
                console.log("Enviando WhatsApp para o admin (via webhook)...");
                await base44.asServiceRole.functions.invoke('sendWhatsAppBookingNotification', {
                    bookingId: bookingId,
                    recipientType: 'admin'
                });
                console.log("WhatsApp para admin enviado.");
            } catch (whatsappError) {
                console.error('Erro ao enviar WhatsApp para admin:', whatsappError);
            }

            // Enviar WhatsApp para Cliente (opcional, já que o email vai)
            try {
                console.log("Enviando WhatsApp para o cliente (via webhook)...");
                await base44.asServiceRole.functions.invoke('sendWhatsAppBookingNotification', {
                    bookingId: bookingId,
                    recipientType: 'customer'
                });
                console.log("WhatsApp para cliente enviado.");
            } catch (whatsappError) {
                console.error('Erro ao enviar WhatsApp para cliente:', whatsappError);
            }
            
            // Nota: O email já é enviado pelo frontend (BookingForm.js) no sucesso, 
            // mas seria ideal mover para cá para robustez. 
            // Por enquanto, focamos no WhatsApp que estava faltando.

            // CONVERTER PARA SERVICEREQUEST (DESATIVADO - Viagens particulares devem permanecer como Booking)
            /* 
            try {
                console.log("Convertendo Booking para ServiceRequest...");
                const conversionResponse = await base44.asServiceRole.functions.invoke('convertBookingToServiceRequest', {
                    bookingId: bookingId
                });
                console.log("Resultado da conversão:", conversionResponse.data);
            } catch (conversionError) {
                console.error('Erro ao converter Booking para ServiceRequest:', conversionError);
            }
            */

        } else {
            console.error("Reserva não encontrada para o ID:", bookingId);
        }
      }
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('ERRO CRÍTICO no webhook handler:', error);
    console.error('Stack trace:', error.stack);
    return Response.json(
      { error: error.message || 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
});
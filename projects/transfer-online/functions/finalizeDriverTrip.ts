import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Função utilitária para obter horário de Brasília
function getBrasiliaTime() {
  const now = new Date();
  const brasiliaTimeString = now.toLocaleString('en-US', { 
    timeZone: 'America/Sao_Paulo' 
  });
  return new Date(brasiliaTimeString);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const body = await req.json();
    const { 
      serviceRequestId, 
      token,
      hasAdditionalExpenses,
      additionalExpenses
    } = body;

    console.log('[finalizeDriverTrip] Iniciando finalização:', serviceRequestId);

    if (!serviceRequestId) {
      return Response.json({ 
        error: 'serviceRequestId é obrigatório' 
      }, { status: 400 });
    }

    let serviceRequest = null;
    let isOwnBooking = false;
    let isEventTrip = false;

    const serviceRequests = await base44.asServiceRole.entities.ServiceRequest.filter({ id: serviceRequestId });
    if (serviceRequests.length > 0) {
      serviceRequest = serviceRequests[0];
    } else {
      const bookings = await base44.asServiceRole.entities.SupplierOwnBooking.filter({ id: serviceRequestId });
      if (bookings.length > 0) {
        serviceRequest = bookings[0];
        isOwnBooking = true;
      } else {
        const eventTrips = await base44.asServiceRole.entities.EventTrip.filter({ id: serviceRequestId });
        if (eventTrips.length > 0) {
          serviceRequest = eventTrips[0];
          isEventTrip = true;
        }
      }
    }
    
    if (!serviceRequest) {
      return Response.json({ 
        error: 'Solicitação não encontrada' 
      }, { status: 404 });
    }

    // Validar token
    if (!token || serviceRequest.driver_access_token !== token) {
      return Response.json({ 
        error: 'Token inválido ou ausente' 
      }, { status: 403 });
    }

    // Validar status atual
    const validStatuses = ['chegou_destino', 'no_show'];
    if (!validStatuses.includes(serviceRequest.driver_trip_status)) {
      return Response.json({ 
        error: `Status inválido para finalização. Status atual: ${serviceRequest.driver_trip_status}` 
      }, { status: 400 });
    }

    // Usar horário de Brasília
    const now = getBrasiliaTime();
    const nowISO = now.toISOString();

    console.log('[finalizeDriverTrip] 🕐 Horário Brasília:', nowISO);

    const updateData = {
      driver_trip_status_updated_at: nowISO
    };

    // Se há despesas adicionais
    if (hasAdditionalExpenses && additionalExpenses && additionalExpenses.length > 0) {
      console.log('[finalizeDriverTrip] Processando despesas adicionais:', additionalExpenses.length);
      
      // Validar despesas
      for (const expense of additionalExpenses) {
        if (!expense.type || !['estacionamento', 'pedagio', 'hora_espera', 'outros'].includes(expense.type)) {
          return Response.json({ 
            error: 'Tipo de despesa inválido' 
          }, { status: 400 });
        }
        
        if (expense.type === 'hora_espera' && (!expense.quantity_minutes || expense.quantity_minutes < 1)) {
          return Response.json({ 
            error: 'Quantidade de minutos inválida para hora de espera' 
          }, { status: 400 });
        }
        
        if (expense.type !== 'hora_espera' && (!expense.value || expense.value <= 0)) {
          return Response.json({ 
            error: 'Valor inválido para despesa' 
          }, { status: 400 });
        }
        
        if (expense.type === 'outros' && !expense.description) {
          return Response.json({ 
            error: 'Descrição obrigatória para despesas do tipo "outros"' 
          }, { status: 400 });
        }
      }

      updateData.driver_reported_additional_expenses = additionalExpenses;
      updateData.status = 'aguardando_revisao_fornecedor';
      updateData.driver_trip_status = 'aguardando_confirmacao_despesas';
      updateData.supplier_billing_status = 'pendente_faturamento';

    } else {
      // Sem despesas adicionais, finalizar direto
      console.log('[finalizeDriverTrip] Finalizando sem despesas adicionais');
      
      updateData.status = 'concluida';
      updateData.driver_trip_status = 'finalizada';
      updateData.driver_reported_additional_expenses = [];
      updateData.supplier_approved_additional_expenses = [];
      updateData.total_additional_expenses_approved = 0;
      updateData.final_client_price_with_additions = serviceRequest.chosen_client_price;
      updateData.supplier_billing_status = 'pendente_faturamento';
    }

    if (isOwnBooking) {
      await base44.asServiceRole.entities.SupplierOwnBooking.update(serviceRequestId, updateData);
    } else if (isEventTrip) {
      const eventUpdateData = {
        driver_trip_status: updateData.driver_trip_status,
        driver_trip_status_updated_at: updateData.driver_trip_status_updated_at,
        driver_reported_additional_expenses: updateData.driver_reported_additional_expenses || []
      };

      // Mapear status geral
      if (updateData.status === 'concluida') {
        eventUpdateData.status = 'completed';
      }
      // Se for aguardando revisão, não alteramos o status principal do EventTrip (mantém dispatched/confirmed),
      // pois EventTrip não tem status 'aguardando_revisao'. O controle fica no driver_trip_status.

      await base44.asServiceRole.entities.EventTrip.update(serviceRequestId, eventUpdateData);
    } else {
      await base44.asServiceRole.entities.ServiceRequest.update(serviceRequestId, updateData);
    }

    // Registrar no log
    await base44.asServiceRole.entities.TripStatusLog.create({
      service_request_id: !isOwnBooking && !isEventTrip ? serviceRequestId : null,
      supplier_own_booking_id: isOwnBooking ? serviceRequestId : null,
      event_trip_id: isEventTrip ? serviceRequestId : null,
      status: updateData.driver_trip_status,
      notes: hasAdditionalExpenses 
        ? `Viagem finalizada com ${additionalExpenses?.length || 0} despesas adicionais reportadas` 
        : 'Viagem finalizada sem despesas adicionais',
      timestamp: nowISO
    });

    // Expirar link da timeline
    try {
      const filter = { status: 'active' };
      if (isOwnBooking) filter.supplier_own_booking_id = serviceRequestId;
      else if (isEventTrip) filter.event_trip_id = serviceRequestId;
      else filter.service_request_id = serviceRequestId;

      const activeTimelines = await base44.asServiceRole.entities.SharedTripTimeline.filter(filter);

      for (const timeline of activeTimelines) {
        // Define expiração para 10 minutos no futuro (tolerância)
        const expirationDate = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        await base44.asServiceRole.entities.SharedTripTimeline.update(timeline.id, {
          expires_at: expirationDate
          // Mantém status='active' por enquanto
        });
      }
    } catch (timelineError) {
      console.error('[finalizeDriverTrip] Erro ao expirar timeline:', timelineError);
    }

    // Enviar link de avaliação automaticamente se houver email do passageiro e a viagem foi finalizada ou aguardando confirmação
    if (serviceRequest.passenger_email && (updateData.driver_trip_status === 'finalizada' || updateData.driver_trip_status === 'aguardando_confirmacao_despesas')) {
      try {
        console.log('[finalizeDriverTrip] Enviando link de avaliação para:', serviceRequest.passenger_email);
        await base44.asServiceRole.functions.invoke('generateAndSendRatingLink', {
          serviceRequestId: serviceRequestId,
          recipientEmail: serviceRequest.passenger_email
        });
      } catch (ratingError) {
        console.error('[finalizeDriverTrip] Erro ao enviar link de avaliação:', ratingError);
        // Não falha a requisição principal se o envio do email falhar
      }
    }

    return Response.json({
      success: true,
      message: hasAdditionalExpenses 
        ? 'Viagem finalizada. Aguardando revisão do fornecedor.' 
        : 'Viagem finalizada com sucesso!',
      requires_supplier_review: hasAdditionalExpenses,
      brasilia_time: nowISO
    });

  } catch (error) {
    console.error('[finalizeDriverTrip] Erro:', error);
    return Response.json({
      error: error.message || 'Erro ao finalizar viagem'
    }, { status: 500 });
  }
});
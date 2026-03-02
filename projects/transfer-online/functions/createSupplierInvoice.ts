import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    console.log('[createSupplierInvoice] User:', user?.email, 'Supplier ID:', user?.supplier_id);
    
    if (!user || !user.supplier_id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { supplier_id, service_request_ids, period_start, period_end, external_reviewer_email } = body;

    console.log('[createSupplierInvoice] Request body:', { 
      supplier_id, 
      service_request_ids_count: service_request_ids?.length,
      period_start,
      period_end,
      external_reviewer_email
    });

    // Validações
    if (supplier_id !== user.supplier_id) {
      return Response.json({ error: 'Unauthorized to create invoice for this supplier' }, { status: 403 });
    }

    if (!service_request_ids || service_request_ids.length === 0) {
      return Response.json({ error: 'No service requests provided' }, { status: 400 });
    }

    if (!external_reviewer_email) {
      return Response.json({ error: 'Email do revisor externo é obrigatório' }, { status: 400 });
    }

    // Buscar dados do fornecedor
    const suppliers = await base44.asServiceRole.entities.Supplier.filter({ id: supplier_id });
    if (suppliers.length === 0) {
      return Response.json({ error: 'Fornecedor não encontrado' }, { status: 404 });
    }
    const supplier = suppliers[0];

    // Buscar as solicitações usando service role
    console.log('[createSupplierInvoice] Buscando solicitações (ServiceRequest)...');
    // Tentar buscar como ServiceRequest
    const requests = await base44.asServiceRole.entities.ServiceRequest.filter({
      id: { $in: service_request_ids },
      chosen_supplier_id: supplier_id,
      supplier_billing_status: 'pendente_faturamento',
      status: 'concluida'
    });

    // Buscar também SupplierOwnBookings (que podem estar misturadas na lista de IDs)
    console.log('[createSupplierInvoice] Buscando solicitações (SupplierOwnBooking)...');
    // Filtra IDs que não foram encontrados em requests para tentar buscar em own bookings
    const foundRequestIds = new Set(requests.map(r => r.id));
    const potentialOwnBookingIds = service_request_ids.filter(id => !foundRequestIds.has(id));
    
    let ownBookings = [];
    if (potentialOwnBookingIds.length > 0) {
      try {
        // Tenta buscar OwnBookings com os IDs restantes
        // Usar payment_status='pendente' e status='concluida'
        ownBookings = await base44.asServiceRole.entities.SupplierOwnBooking.filter({
          id: { $in: potentialOwnBookingIds },
          supplier_id: supplier_id,
          status: 'concluida',
          payment_status: 'pendente'
        });
      } catch (e) {
        console.error('[createSupplierInvoice] Erro ao buscar OwnBookings:', e);
      }
    }

    console.log('[createSupplierInvoice] ServiceRequests encontradas:', requests.length);
    console.log('[createSupplierInvoice] SupplierOwnBookings encontradas:', ownBookings.length);

    if (requests.length === 0 && ownBookings.length === 0) {
      return Response.json({ 
        error: 'Nenhuma solicitação válida encontrada. Verifique se as viagens estão concluídas e pendentes de faturamento.' 
      }, { status: 400 });
    }

    // Calcular total
    const totalRequests = requests.reduce((sum, r) => 
      sum + (r.chosen_supplier_cost || 0) + (r.total_additional_expenses_approved || 0), 0
    );
    
    const totalOwnBookings = ownBookings.reduce((sum, b) => 
      sum + (b.price || 0), 0 // OwnBooking usa 'price'
    );
    
    const total_amount = totalRequests + totalOwnBookings;

    console.log('[createSupplierInvoice] Total calculado:', total_amount);

    // Gerar número da fatura
    console.log('[createSupplierInvoice] Gerando número da fatura...');
    const invoiceNumberResponse = await base44.asServiceRole.functions.invoke('generateSupplierInvoiceNumber');
    const invoice_number = invoiceNumberResponse.data.invoiceNumber;

    console.log('[createSupplierInvoice] Número da fatura:', invoice_number);

    // Gerar token de revisão externa
    const external_review_token = crypto.randomUUID();

    // Criar fatura
    console.log('[createSupplierInvoice] Criando fatura...');
    const invoice = await base44.asServiceRole.entities.SupplierInvoice.create({
      invoice_number,
      supplier_id,
      related_service_requests_ids: requests.map(r => r.id),
      related_supplier_own_booking_ids: ownBookings.map(b => b.id),
      period_start,
      period_end,
      total_amount,
      status: 'aguardando_aprovacao_externa',
      external_reviewer_email,
      external_review_token,
      created_by_user_id: user.id
    });

    console.log('[createSupplierInvoice] Fatura criada:', invoice.id);

    // Atualizar status das solicitações (ServiceRequest)
    console.log('[createSupplierInvoice] Atualizando status das ServiceRequests...');
    for (const req of requests) {
      await base44.asServiceRole.entities.ServiceRequest.update(req.id, {
        supplier_billing_status: 'em_rascunho',
        supplier_invoice_id: invoice.id
      });
    }
    
    // Atualizar status das OwnBookings
    console.log('[createSupplierInvoice] Atualizando status das OwnBookings...');
    for (const booking of ownBookings) {
      try {
        // Atualizar para faturado e vincular invoice
        await base44.asServiceRole.entities.SupplierOwnBooking.update(booking.id, {
           supplier_invoice_id: invoice.id,
           payment_status: 'faturado'
        });
      } catch (e) {
        console.warn(`[createSupplierInvoice] Erro ao atualizar OwnBooking ${booking.id}`, e);
      }
    }

    // Enviar email de revisão externa
    console.log('[createSupplierInvoice] Enviando email de revisão externa...');
    try {
      await base44.asServiceRole.functions.invoke('sendExternalInvoiceReviewEmail', {
        invoice_id: invoice.id,
        reviewer_email: external_reviewer_email,
        supplier_name: supplier.name
      });
      console.log('[createSupplierInvoice] Email enviado com sucesso');
    } catch (emailError) {
      console.error('[createSupplierInvoice] Erro ao enviar email:', emailError);
      // Continuar mesmo se o email falhar, mas registrar o erro
    }

    console.log('[createSupplierInvoice] Processo concluído com sucesso');
    return Response.json({ success: true, invoice });
  } catch (error) {
    console.error('[createSupplierInvoice] Error:', error);
    console.error('[createSupplierInvoice] Error stack:', error.stack);
    return Response.json({ 
      error: error.message || 'Erro ao criar fatura',
      details: error.stack 
    }, { status: 500 });
  }
});
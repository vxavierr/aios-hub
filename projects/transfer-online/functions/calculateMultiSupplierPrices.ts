import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verificar autenticação
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Parse request body
    const {
      client_id,
      service_type,
      origin,
      destination,
      date,
      time,
      return_date,
      return_time,
      hours,
      additional_stops,
      driver_language
    } = await req.json();

    console.log('[calculateMultiSupplierPrices] Iniciando cálculo com parâmetros:', {
      client_id,
      service_type,
      origin,
      destination,
      date,
      time,
      driver_language
    });

    // Validações
    if (!client_id) {
      console.error('[calculateMultiSupplierPrices] client_id não fornecido');
      return Response.json({ 
        error: 'ID do cliente não fornecido',
        error_type: 'missing_client_id'
      }, { status: 400 });
    }

    if (!service_type || !origin || !date || !time) {
      console.error('[calculateMultiSupplierPrices] Campos obrigatórios faltando:', {
        service_type,
        origin,
        date,
        time
      });
      return Response.json({ 
        error: 'Campos obrigatórios faltando (tipo de serviço, origem, data ou horário)',
        error_type: 'missing_fields'
      }, { status: 400 });
    }

    // Buscar o cliente
    let client;
    try {
      client = await base44.asServiceRole.entities.Client.get(client_id);
      console.log('[calculateMultiSupplierPrices] Cliente encontrado:', {
        client_id: client.id,
        client_name: client.name,
        associated_supplier_ids: client.associated_supplier_ids,
        supplier_priority_order: client.supplier_priority_order
      });
    } catch (error) {
      console.error('[calculateMultiSupplierPrices] Erro ao buscar cliente:', error);
      return Response.json({ 
        error: 'Cliente não encontrado',
        error_type: 'client_not_found'
      }, { status: 404 });
    }

    if (!client) {
      console.error('[calculateMultiSupplierPrices] Cliente não encontrado para id:', client_id);
      return Response.json({ 
        error: 'Cliente não encontrado',
        error_type: 'client_not_found'
      }, { status: 404 });
    }

    // Verificar se o cliente tem fornecedores associados
    if (!client.associated_supplier_ids || client.associated_supplier_ids.length === 0) {
      console.warn('[calculateMultiSupplierPrices] Cliente não tem fornecedores associados:', client_id);
      return Response.json({ 
        error: 'Este cliente não possui fornecedores associados. Entre em contato com o administrador para configurar fornecedores para sua empresa.',
        error_type: 'no_suppliers_associated',
        client_name: client.name
      }, { status: 400 });
    }

    // Usar a ordem de prioridade do cliente, ou a lista de associados como fallback
    const supplierOrder = client.supplier_priority_order && client.supplier_priority_order.length > 0
      ? client.supplier_priority_order
      : client.associated_supplier_ids;

    console.log('[calculateMultiSupplierPrices] Ordem de fornecedores:', supplierOrder);

    // Buscar todos os fornecedores ativos associados
    const allSuppliers = await base44.asServiceRole.entities.Supplier.list();
    console.log('[calculateMultiSupplierPrices] Total de fornecedores no sistema:', allSuppliers.length);

    const clientSuppliers = allSuppliers.filter(s => 
      supplierOrder.includes(s.id) && s.active !== false
    );

    console.log('[calculateMultiSupplierPrices] Fornecedores ativos do cliente:', 
      clientSuppliers.map(s => ({ id: s.id, name: s.name }))
    );

    if (clientSuppliers.length === 0) {
      console.warn('[calculateMultiSupplierPrices] Nenhum fornecedor ativo encontrado para cliente:', client_id);
      return Response.json({ 
        error: 'Os fornecedores associados a este cliente estão inativos ou não foram encontrados. Entre em contato com o administrador.',
        error_type: 'no_active_suppliers',
        client_name: client.name
      }, { status: 400 });
    }

    // Calcular preços para cada fornecedor
    const supplierQuotes = [];

    for (const supplier of clientSuppliers) {
      try {
        console.log(`[calculateMultiSupplierPrices] Processando fornecedor: ${supplier.name} (${supplier.id})`);

        // Buscar veículos ativos e aprovados deste fornecedor
        const supplierVehicles = await base44.asServiceRole.entities.SupplierVehicleType.filter({
          supplier_id: supplier.id,
          active: true,
          approval_status: 'approved'
        });

        console.log(`[calculateMultiSupplierPrices] Veículos encontrados para ${supplier.name}:`, supplierVehicles.length);

        if (supplierVehicles.length === 0) {
          console.log(`[calculateMultiSupplierPrices] Fornecedor ${supplier.name} não tem veículos ativos`);
          continue;
        }

        // Para cada veículo do fornecedor, calcular o preço
        for (const vehicle of supplierVehicles) {
          try {
            console.log(`[calculateMultiSupplierPrices] Calculando preço para veículo: ${vehicle.name}`);

            // Invocar a função de cálculo de preço do fornecedor
            const priceResult = await base44.asServiceRole.functions.invoke('calculateSupplierPrice', {
              supplier_id: supplier.id,
              vehicle_type_id: vehicle.id,
              service_type,
              origin,
              destination,
              date,
              time,
              return_date,
              return_time,
              hours,
              additional_stops,
              driver_language: driver_language || 'pt'
            });

            console.log(`[calculateMultiSupplierPrices] Resultado do cálculo para ${vehicle.name}:`, {
              success: priceResult.data?.success,
              total_supplier_cost: priceResult.data?.total_supplier_cost
            });

            if (priceResult.data?.success && priceResult.data?.total_supplier_cost > 0) {
              // NO MÓDULO CORPORATIVO: NÃO APLICAR MARGEM
              // O preço do fornecedor É o preço final para o cliente
              const clientPrice = priceResult.data.total_supplier_cost;

              console.log(`[calculateMultiSupplierPrices] Cotação adicionada (SEM MARGEM):`, {
                supplier: supplier.name,
                vehicle: vehicle.name,
                supplier_cost: priceResult.data.total_supplier_cost,
                client_price: clientPrice
              });

              supplierQuotes.push({
                supplier_id: supplier.id,
                supplier_name: supplier.name,
                vehicle_type_id: vehicle.id,
                vehicle_name: vehicle.name,
                max_passengers: vehicle.max_passengers,
                max_luggage: vehicle.max_luggage,
                supplier_cost: priceResult.data.total_supplier_cost,
                margin_percentage: 0,
                margin_amount: 0,
                client_price: clientPrice,
                calculation_details: priceResult.data.calculation_details
              });
            }
          } catch (vehicleError) {
            console.error(`[calculateMultiSupplierPrices] Erro ao calcular preço para veículo ${vehicle.name}:`, vehicleError);
            // Continue para o próximo veículo
          }
        }
      } catch (supplierError) {
        console.error(`[calculateMultiSupplierPrices] Erro ao processar fornecedor ${supplier.name}:`, supplierError);
        // Continue para o próximo fornecedor
      }
    }

    console.log(`[calculateMultiSupplierPrices] Total de cotações geradas: ${supplierQuotes.length}`);

    // Ordenar por preço (menor primeiro)
    supplierQuotes.sort((a, b) => a.client_price - b.client_price);

    // Lógica de Contingência: Se nenhuma cotação foi gerada (ex: fora do raio), tentar fornecedor de contingência
    if (supplierQuotes.length === 0) {
      console.warn('[calculateMultiSupplierPrices] Nenhuma cotação padrão gerada. Tentando fornecedor de contingência.');
      
      const CONTINGENCY_SUPPLIER_ID = '690ceb8f1d259a877c7a1bc3';
      
      try {
        // Buscar fornecedor de contingência
        const contingencySupplier = await base44.asServiceRole.entities.Supplier.get(CONTINGENCY_SUPPLIER_ID);
        
        if (contingencySupplier && contingencySupplier.active !== false) {
          // Buscar veículos do fornecedor de contingência
          const contingencyVehicles = await base44.asServiceRole.entities.SupplierVehicleType.filter({
            supplier_id: CONTINGENCY_SUPPLIER_ID,
            active: true,
            approval_status: 'approved'
          });

          if (contingencyVehicles.length > 0) {
            console.log(`[calculateMultiSupplierPrices] Gerando cotações de contingência para ${contingencySupplier.name}`);
            
            for (const vehicle of contingencyVehicles) {
              // Adicionar cotação "Sob Consulta" (preço 0)
              supplierQuotes.push({
                supplier_id: contingencySupplier.id,
                supplier_name: contingencySupplier.name,
                vehicle_type_id: vehicle.id,
                vehicle_name: vehicle.name,
                max_passengers: vehicle.max_passengers,
                max_luggage: vehicle.max_luggage,
                supplier_cost: 0, // Indica sob consulta
                margin_percentage: 0,
                margin_amount: 0,
                client_price: 0, // Indica sob consulta
                calculation_details: {
                  is_contingency: true,
                  reason: 'out_of_range_fallback'
                },
                image_url: vehicle.image_url
              });
            }
          }
        }
      } catch (e) {
        console.error('[calculateMultiSupplierPrices] Erro ao processar contingência:', e);
      }

      // Se AINDA estiver vazio após tentar contingência, aí sim retorna erro
      if (supplierQuotes.length === 0) {
        return Response.json({
          error: 'Nenhum fornecedor disponível conseguiu calcular o preço para esta rota/serviço (nem contingência).',
          error_type: 'no_quotes_generated',
          client_name: client.name
        }, { status: 400 });
      }
    }

    console.log('[calculateMultiSupplierPrices] Sucesso! Retornando', supplierQuotes.length, 'cotações');

    return Response.json({
      success: true,
      supplier_quotes: supplierQuotes
    });

  } catch (error) {
    console.error('[calculateMultiSupplierPrices] Erro não tratado:', error);
    return Response.json({ 
      error: `Erro interno ao calcular preços: ${error.message}`,
      error_type: 'internal_error'
    }, { status: 500 });
  }
});
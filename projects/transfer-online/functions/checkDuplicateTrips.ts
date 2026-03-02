import { createClientFromRequest } from 'npm:@base44/sdk@0.8.12';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { passenger_user_id, passenger_email, date, time } = await req.json();

    if (!date) {
      return Response.json({ error: 'Data é obrigatória' }, { status: 400 });
    }

    if (!passenger_user_id && !passenger_email) {
      return Response.json({ error: 'Passageiro não identificado' }, { status: 400 });
    }

    // Construir query para ServiceRequest
    // Queremos viagens ativas (não canceladas/recusadas) na mesma data para o mesmo passageiro
    const query = {
      date: date,
      status: { "$nin": ["cancelada", "recusada", "cancelado"] }
    };

    // Adicionar filtro de passageiro
    // Se tiver ID, prioriza ID. Se não, tenta email.
    // O ideal seria verificar ambos com OR, mas a query simples não suporta OR complexo facilmente em um nível.
    // Vamos fazer duas queries se necessário ou filtrar em memória se o volume for baixo (por data é baixo).
    // Melhor: Filtrar por data primeiro (índice provável) e depois refinar em memória.
    
    // Buscar ServiceRequests na data
    const existingRequests = await base44.asServiceRole.entities.ServiceRequest.filter(query);

    const duplicates = existingRequests.filter(req => {
      // Verifica se é o mesmo passageiro
      const sameId = passenger_user_id && req.passenger_user_id === passenger_user_id;
      const sameEmail = passenger_email && req.passenger_email && 
                        req.passenger_email.toLowerCase() === passenger_email.toLowerCase();
      
      // Verifica se é o mesmo horário (se o horário foi fornecido)
      const sameTime = !time || req.time === time;

      return (sameId || sameEmail) && sameTime;
    });

    if (duplicates.length > 0) {
      const trip = duplicates[0];
      return Response.json({
        has_duplicate: true,
        trip: {
          origin: trip.origin,
          destination: trip.destination,
          time: trip.time,
          request_number: trip.request_number,
          status: trip.status
        },
        message: `⚠️ Atenção: Já existe uma viagem agendada para este passageiro nesta data (${date} às ${trip.time}).\nOrigem: ${trip.origin}\nDestino: ${trip.destination}`
      });
    }

    return Response.json({ has_duplicate: false });

  } catch (error) {
    console.error('[checkDuplicateTrips] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
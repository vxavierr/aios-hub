import { createClientFromRequest } from 'npm:@base44/sdk@0.8.12';

export default Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Esta função é pública, pois usa um token seguro na URL
    // Não requer autenticação de usuário (auth.me)

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return Response.json({ error: 'Token é obrigatório' }, { status: 400 });
    }

    // 1. Buscar em ServiceRequest (usando service role para bypass de permissão de leitura pública)
    const serviceRequests = await base44.asServiceRole.entities.ServiceRequest.filter({
      driver_access_token: token
    });

    let trip = null;
    let tripType = 'platform';

    if (serviceRequests.length > 0) {
      trip = serviceRequests[0];
    } else {
      // 2. Buscar em SupplierOwnBooking
      const ownBookings = await base44.asServiceRole.entities.SupplierOwnBooking.filter({
        driver_access_token: token
      });
      
      if (ownBookings.length > 0) {
        trip = ownBookings[0];
        tripType = 'own';
        // Normalizar campos para compatibilidade
        trip.request_number = trip.booking_number;
        // Garantir que paradas planejadas e adicionais sejam incluídas
        trip.planned_stops = trip.planned_stops || [];
        trip.additional_stops = trip.additional_stops || [];
      } else {
        // 3. Buscar em EventTrip (viagens de eventos)
        const eventTrips = await base44.asServiceRole.entities.EventTrip.filter({
          driver_access_token: token
        });
        
        if (eventTrips.length > 0) {
          trip = eventTrips[0];
          tripType = 'event';
          
          // Normalizar campos para compatibilidade com DetalhesViagemMotorista
          trip.request_number = trip.name || `EV-${trip.id.substring(0, 8)}`;
          trip.time = trip.start_time;
          trip.passengers = trip.passenger_count || 0;
          
          // Buscar passageiros do grupo para exibir informações
          try {
            const passengers = await base44.asServiceRole.entities.EventPassenger.filter({
              event_trip_id: trip.id
            });
            
            if (passengers && passengers.length > 0) {
              // Concatenar nomes dos passageiros
              trip.passenger_name = passengers.map(p => p.passenger_name).join(', ');
              
              // Priorizar contato do organizador ou primeiro com dados válidos
              const organizer = passengers.find(p => p.tags && (p.tags.includes('ORGANIZADORA') || p.tags.includes('ORGANIZADOR') || p.tags.includes('RESPONSAVEL')) && (p.passenger_phone || p.passenger_email));
              const firstWithPhone = passengers.find(p => p.passenger_phone && p.passenger_phone.length > 5);
              const firstWithEmail = passengers.find(p => p.passenger_email && p.passenger_email.includes('@'));

              trip.passenger_phone = organizer?.passenger_phone || firstWithPhone?.passenger_phone || passengers[0].passenger_phone || null;
              trip.passenger_email = organizer?.passenger_email || firstWithEmail?.passenger_email || passengers[0].passenger_email || null;
              
              // Guardar lista completa para referência
              trip.passengers_details = passengers.map(p => ({
                name: p.passenger_name,
                phone: p.passenger_phone,
                email: p.passenger_email,
                tags: p.tags || []
              }));

              // Agregar tags de todos os passageiros para exibir no topo
              const allTags = passengers.reduce((acc, p) => {
                if (p.tags && Array.isArray(p.tags)) {
                  p.tags.forEach(tag => {
                    if (!acc.includes(tag)) acc.push(tag);
                  });
                }
                return acc;
              }, []);
              trip.tags = allTags;

              // Coletar o primeiro número de voo e companhia de origem/destino dos passageiros do evento
              for (const p of passengers) {
                if (p.flight_number && (p.trip_type === 'IN' || p.trip_type === 'arrival') && !trip.event_origin_flight_number) {
                  trip.event_origin_flight_number = p.flight_number;
                  trip.event_origin_airline = p.airline;
                }
                if (p.flight_number && (p.trip_type === 'OUT' || p.trip_type === 'departure') && !trip.event_destination_flight_number) {
                  trip.event_destination_flight_number = p.flight_number;
                  trip.event_destination_airline = p.airline;
                }
                if (trip.event_origin_flight_number && trip.event_destination_flight_number) break;
              }
            } else {
              trip.passenger_name = 'Grupo';
              trip.passenger_email = null;
              trip.passenger_phone = null;
            }
          } catch (e) {
            console.warn('[getTripDetailsByToken] Erro ao buscar passageiros do evento:', e);
            trip.passenger_name = 'Grupo';
            trip.passenger_email = null;
            trip.passenger_phone = null;
          }
        } else {
          // 4. Buscar em Booking (Direct Booking)
          const bookings = await base44.asServiceRole.entities.Booking.filter({
            driver_access_token: token
          });

          if (bookings.length > 0) {
            trip = bookings[0];
            tripType = 'direct';
            trip.request_number = trip.booking_number;
            trip.passenger_name = trip.customer_name;
            trip.passenger_phone = trip.customer_phone;
            trip.passenger_email = trip.customer_email;
            trip.planned_stops = trip.planned_stops || [];
            trip.additional_stops = trip.additional_stops || [];
          }
        }
      }
    }

    if (!trip) {
      return Response.json({ error: 'Viagem não encontrada ou link inválido' }, { status: 404 });
    }

    // 4. Buscar dados do Cliente (se houver client_id)
    let clientData = null;
    if (trip.client_id) {
      try {
        const clients = await base44.asServiceRole.entities.Client.filter({ id: trip.client_id });
        if (clients.length > 0) {
          clientData = {
            name: clients[0].name,
          };
        }
      } catch (e) {
        console.warn('[getTripDetailsByToken] Erro ao buscar cliente:', e);
      }
    }

    // Retornar dados combinados
    return Response.json({
      success: true,
      trip: {
        ...trip,
        type: tripType
      },
      client: clientData
    });

  } catch (error) {
    console.error('[getTripDetailsByToken] Erro:', error);
    return Response.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
});
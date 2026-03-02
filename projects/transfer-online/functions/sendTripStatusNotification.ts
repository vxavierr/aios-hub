import { createClientFromRequest } from 'npm:@base44/sdk@0.8.11';
import { format } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        const { trip, newStatus, timelineUrl = null } = body;

        if (!trip || !newStatus) {
            return Response.json({ success: false, error: 'Dados da viagem ou novo status são obrigatórios.' }, { status: 400 });
        }

        const recipients = [];
        const tripNumber = trip.request_number || trip.booking_number || trip.name; // For EventTrip, use name
        const driverName = trip.driver_name;
        const driverPhone = trip.driver_phone;
        const vehicleInfo = trip.vehicle_model ? `${trip.vehicle_model} - ${trip.vehicle_plate}` : '';

        // 1. Passenger
        if (trip.passenger_email || trip.passenger_phone) {
            recipients.push({
                name: trip.passenger_name || 'Passageiro',
                email: trip.passenger_email,
                phone: trip.passenger_phone,
                role: 'passenger'
            });
        }

        // 2. Requester (for ServiceRequest)
        if (trip.requester_email || trip.requester_phone) {
            recipients.push({
                name: trip.requester_full_name || 'Solicitante',
                email: trip.requester_email,
                phone: trip.requester_phone,
                role: 'requester'
            });
        }

        // 3. Client Contact (for ServiceRequest or SupplierOwnBooking if client_id exists)
        if (trip.client_id) {
            const clients = await base44.asServiceRole.entities.Client.filter({ id: trip.client_id });
            if (clients.length > 0) {
                const client = clients[0];
                if (client.contact_person_email || client.contact_person_phone) {
                    recipients.push({
                        name: client.contact_person_name || 'Contato do Cliente',
                        email: client.contact_person_email,
                        phone: client.contact_person_phone,
                        role: 'client_contact'
                    });
                }
            }
        }

        const messages = {
            // 'a_caminho': Removido para evitar duplicação, pois generateSharedTimelineLink já envia esta notificação
            'chegou_origem': {
                subject: `✅ Motorista chegou ao ponto de partida da viagem ${tripNumber}!`, 
                emailBody: (recipientName, driverInfoHtml, driverNameHtml, driverPhoneHtml, vehicleInfoHtml, timelineLinkHtml) => `
                    <p>Olá <strong>${recipientName}</strong>,</p>
                    <p>O motorista <strong>${driverNameHtml}</strong> (carro ${vehicleInfoHtml}) chegou ao seu ponto de partida da viagem ${tripNumber}.</p>
                    ${timelineLinkHtml ? `<p>Acompanhe: <a href="${timelineUrl}">${timelineUrl}</a></p>` : ''}
                `,
                whatsappBody: (recipientName, driverInfoWhatsapp, timelineLinkWhatsapp) => `
                    ✅ *Motorista chegou ao ponto de partida da viagem ${tripNumber}!*
                    Olá *${recipientName}*,
                    O motorista *${driverName}* (carro ${vehicleInfo}) chegou ao seu ponto de partida.
                    ${timelineLinkWhatsapp ? `Acompanhe: ${timelineUrl}` : ''}
                `
            },
            'passageiro_embarcou': {
                subject: `🚀 Passageiro a bordo! Sua viagem ${tripNumber} está em andamento.`, 
                emailBody: (recipientName, driverInfoHtml, driverNameHtml, driverPhoneHtml, vehicleInfoHtml, timelineLinkHtml) => `
                    <p>Olá <strong>${recipientName}</strong>,</p>
                    <p>O passageiro embarcou na viagem ${tripNumber} com o motorista <strong>${driverNameHtml}</strong> (carro ${vehicleInfoHtml}).</p>
                    ${timelineLinkHtml ? `<p>Acompanhe o restante do trajeto: <a href="${timelineUrl}">${timelineUrl}</a></p>` : ''}
                `,
                whatsappBody: (recipientName, driverInfoWhatsapp, timelineLinkWhatsapp) => `
                    🚀 *Passageiro a bordo! Sua viagem ${tripNumber} está em andamento.*
                    Olá *${recipientName}*,
                    O passageiro embarcou na viagem ${tripNumber} com o motorista *${driverName}* (carro ${vehicleInfo}).
                    ${timelineLinkWhatsapp ? `Acompanhe o restante do trajeto: ${timelineUrl}` : ''}
                `
            },
            'chegou_destino': {
                subject: `🎉 Motorista chegou ao destino da viagem ${tripNumber}.`, 
                emailBody: (recipientName, driverInfoHtml, driverNameHtml, driverPhoneHtml, vehicleInfoHtml, timelineLinkHtml) => `
                    <p>Olá <strong>${recipientName}</strong>,</p>
                    <p>O motorista <strong>${driverNameHtml}</strong> (carro ${vehicleInfoHtml}) chegou ao destino da viagem ${tripNumber}.</p>
                    ${timelineLinkHtml ? `<p>Revise a viagem: <a href="${timelineUrl}">${timelineUrl}</a></p>` : ''}
                `,
                whatsappBody: (recipientName, driverInfoWhatsapp, timelineLinkWhatsapp) => `
                    🎉 *Motorista chegou ao destino da viagem ${tripNumber}.*
                    Olá *${recipientName}*,
                    O motorista *${driverName}* (carro ${vehicleInfo}) chegou ao destino da viagem ${tripNumber}.
                    ${timelineLinkWhatsapp ? `Revise a viagem: ${timelineUrl}` : ''}
                `
            },
            'finalizada': {
                subject: `✅ Viagem ${tripNumber} finalizada com sucesso!`, 
                emailBody: (recipientName, driverInfoHtml, driverNameHtml, driverPhoneHtml, vehicleInfoHtml, timelineLinkHtml) => `
                    <p>Olá <strong>${recipientName}</strong>,</p>
                    <p>A viagem ${tripNumber} foi finalizada com sucesso pelo motorista <strong>${driverNameHtml}</strong> (carro ${vehicleInfoHtml}).</p>
                    ${timelineLinkHtml ? `<p>Detalhes da viagem: <a href="${timelineUrl}">${timelineUrl}</a></p>` : ''}
                `,
                whatsappBody: (recipientName, driverInfoWhatsapp, timelineLinkWhatsapp) => `
                    ✅ *Viagem ${tripNumber} finalizada com sucesso!*
                    Olá *${recipientName}*,
                    A viagem ${tripNumber} foi finalizada com sucesso pelo motorista *${driverName}* (carro ${vehicleInfo}).
                    ${timelineLinkWhatsapp ? `Detalhes da viagem: ${timelineUrl}` : ''}
                `
            },
        };

        const notificationConfig = messages[newStatus];

        if (!notificationConfig) {
            return Response.json({ success: false, message: 'Nenhuma notificação configurada para este status.' });
        }

        const results = [];

        for (const recipient of recipients) {
            // Verificar se o destinatário é o passageiro e o status é 'passageiro_embarcou'
            // O passageiro não precisa ser notificado que ele mesmo embarcou (reduz redundância)
            if (newStatus === 'passageiro_embarcou' && recipient.role === 'passenger') {
                continue;
            }

            const recipientName = recipient.name;

            const driverInfoHtml = driverName && driverPhone && vehicleInfo ? `
                <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin-top: 20px;">
                    <p style="margin: 0; font-size: 14px; color: #047857;">
                        <strong>Seu Motorista:</strong> ${driverName}<br>
                        📞 ${driverPhone}<br>
                        🚗 ${vehicleInfo}
                    </p>
                </div>
            ` : '';
            const driverInfoWhatsapp = driverName && driverPhone && vehicleInfo ? `
                *Motorista:* ${driverName}
                📞 ${driverPhone}
                🚗 ${vehicleInfo}
            ` : '';
            
            const timelineLinkHtml = timelineUrl ? `<p style="margin-top: 15px;">Acompanhe em tempo real: <a href="${timelineUrl}">${timelineUrl}</a></p>` : '';
            const timelineLinkWhatsapp = timelineUrl ? `Acompanhe em tempo real: ${timelineUrl}` : '';

            // Send Email
            if (recipient.email) {
                try {
                    await base44.asServiceRole.integrations.Core.SendEmail({
                        to: recipient.email,
                        subject: notificationConfig.subject,
                        body: notificationConfig.emailBody(
                            recipientName,
                            driverInfoHtml,
                            driverName,
                            driverPhone,
                            vehicleInfo,
                            timelineLinkHtml
                        )
                    });
                    results.push({ recipient: recipient.email, type: 'email', status: 'sent' });
                } catch (e) {
                    console.error(`Erro ao enviar email para ${recipient.email}:`, e);
                    results.push({ recipient: recipient.email, type: 'email', status: 'error', error: e.message });
                }
            }

            // Send WhatsApp
            if (recipient.phone) {
                try {
                    await base44.asServiceRole.functions.invoke('sendWhatsAppMessage', { 
                        to: recipient.phone,
                        message: notificationConfig.whatsappBody(
                            recipientName,
                            driverInfoWhatsapp,
                            timelineLinkWhatsapp
                        )
                    });
                    results.push({ recipient: recipient.phone, type: 'whatsapp', status: 'sent' });
                } catch (e) {
                    console.error(`Erro ao enviar WhatsApp para ${recipient.phone}:`, e);
                    results.push({ recipient: recipient.phone, type: 'whatsapp', status: 'error', error: e.message });
                }
            }
        }

        return Response.json({ success: true, results });

    } catch (error) {
        console.error('[sendTripStatusNotification] Erro geral:', error);
        return Response.json({ success: false, error: error.message || 'Erro ao enviar notificações de status da viagem.' }, { status: 500 });
    }
});
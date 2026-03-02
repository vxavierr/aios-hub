import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
});

export default Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verificar autenticação
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificação de permissões expandida
    const email = user.email?.toLowerCase().trim() || '';
    const isSuperAdmin = email === 'fernandotransferonline@gmail.com';
    const isAdmin = user.role === 'admin';
    const isMaster = user.client_corporate_role === 'master' || user.client_corporate_role === 'admin_client';
    const isSupplierAdmin = user.supplier_role === 'manager' || user.supplier_role === 'admin';

    if (!isAdmin && !isSuperAdmin && !isMaster && !isSupplierAdmin) {
      return Response.json(
        { error: 'Acesso negado. Permissão insuficiente para processar reembolsos.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { bookingId, refundReason } = body;

    if (!bookingId) {
      return Response.json(
        { error: 'ID da reserva é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar dados da reserva usando service role
    console.log('Buscando reserva:', bookingId);
    const bookings = await base44.asServiceRole.entities.Booking.list();
    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) {
      return Response.json(
        { error: 'Reserva não encontrada' },
        { status: 404 }
      );
    }

    // Validar se a reserva pode ser reembolsada
    if (booking.payment_status !== 'pago') {
      return Response.json(
        { error: 'Esta reserva não pode ser reembolsada. Status do pagamento: ' + booking.payment_status },
        { status: 400 }
      );
    }

    if (!booking.payment_intent_id) {
      return Response.json(
        { error: 'ID do pagamento não encontrado na reserva' },
        { status: 400 }
      );
    }

    console.log('Processando reembolso para PaymentIntent:', booking.payment_intent_id);

    // Criar reembolso no Stripe
    const refund = await stripe.refunds.create({
      payment_intent: booking.payment_intent_id,
      reason: 'requested_by_customer',
      metadata: {
        booking_id: bookingId,
        booking_number: booking.booking_number,
        refund_reason: refundReason || 'Cancelamento pelo fornecedor'
      }
    });

    console.log('Reembolso criado no Stripe:', refund.id);

    // Atualizar status da reserva no Base44
    await base44.asServiceRole.entities.Booking.update(bookingId, {
      status: 'cancelada',
      payment_status: 'reembolsado',
      refund_id: refund.id,
      refund_date: new Date().toISOString(),
      refund_reason: refundReason || 'Cancelamento pelo fornecedor'
    });

    // Registrar Histórico da Viagem
    try {
      await base44.asServiceRole.entities.TripHistory.create({
        trip_id: bookingId,
        trip_type: 'Booking',
        event_type: 'Reembolso e Cancelamento',
        user_id: user.id,
        user_name: user.full_name || email,
        comment: `Reserva cancelada e reembolsada. Motivo: ${refundReason || 'Não informado'}`,
        details: {
           refund_id: refund.id,
           amount_refunded: refund.amount / 100,
           reason: refundReason
        }
      });
      console.log('Histórico de cancelamento registrado');
    } catch (histError) {
      console.error('Erro ao registrar histórico:', histError);
    }

    console.log('Reserva atualizada no Base44');

    // Enviar e-mail de notificação ao cliente
    try {
      await base44.asServiceRole.functions.invoke('sendBookingEmail', {
        bookingId: bookingId,
        recipientType: 'customer',
        emailType: 'cancellation_refund',
        refundReason: refundReason
      });
      console.log('E-mail de cancelamento enviado ao cliente');
    } catch (emailError) {
      console.error('Erro ao enviar e-mail:', emailError);
      // Não falhar a operação inteira se o e-mail falhar
    }

    return Response.json({
      success: true,
      message: 'Reembolso processado com sucesso',
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });

  } catch (error) {
    console.error('Erro ao processar reembolso:', error);
    return Response.json(
      { 
        error: error.message || 'Erro ao processar reembolso',
        details: error.type || 'unknown_error'
      },
      { status: 500 }
    );
  }
});
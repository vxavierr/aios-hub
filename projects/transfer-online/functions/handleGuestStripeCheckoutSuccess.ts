import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@^14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Public endpoint to verify session on success page

    const body = await req.json();
    const { session_id } = body;

    if (!session_id) {
        return Response.json({ error: 'Session ID required' }, { status: 400 });
    }

    // 1. Retrieve Session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
        return Response.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const bookingId = session.metadata.booking_id;
    if (!bookingId) {
        return Response.json({ error: 'No booking ID found in session metadata' }, { status: 404 });
    }

    // 2. Retrieve Booking
    // Use service role to update
    const booking = await base44.asServiceRole.entities.Booking.get(bookingId);

    if (!booking) {
        return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // 3. Update Booking Status (if not already updated by webhook)
    if (booking.payment_status !== 'pago') {
        await base44.asServiceRole.entities.Booking.update(bookingId, {
            status: 'confirmada',
            payment_status: 'pago',
            payment_intent_id: session.payment_intent
        });

        // 4. Send Emails
        try {
            await base44.asServiceRole.functions.invoke('sendBookingEmail', {
                bookingId: bookingId,
                recipientType: 'customer',
                emailType: 'confirmation'
            });

            await base44.asServiceRole.functions.invoke('sendBookingEmail', {
                bookingId: bookingId,
                recipientType: 'admin',
                emailType: 'new_booking_notification'
            });
        } catch (emailError) {
            console.error('Error sending confirmation emails:', emailError);
        }

        // 5. Convert to ServiceRequest (to appear in Supplier Dashboard)
        try {
            console.log("Convertendo Booking para ServiceRequest...");
            await base44.asServiceRole.functions.invoke('convertBookingToServiceRequest', {
                bookingId: bookingId
            });
        } catch (conversionError) {
            console.error('Error converting Booking to ServiceRequest:', conversionError);
        }
    }

    return Response.json({
        success: true,
        booking: {
            booking_number: booking.booking_number,
            origin: booking.origin,
            destination: booking.destination,
            date: booking.date,
            time: booking.time,
            customer_email: booking.customer_email
        }
    });

  } catch (error) {
    console.error('[handleGuestStripeCheckoutSuccess] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
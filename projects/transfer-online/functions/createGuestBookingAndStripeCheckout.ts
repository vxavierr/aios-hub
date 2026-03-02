import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@^14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Guest flow - no user authentication required for this specific endpoint
    // but we might want to check app connectivity or rate limits if possible.
    // For now, open to public use as it creates potential revenue.

    const body = await req.json();
    const { 
      serviceType, 
      vehicleTypeId, 
      formData, 
      driverLanguage,
      priceFromFrontend // Just for comparison/logging, we recalculate
    } = body;

    if (!formData.customer_email || !formData.customer_phone) {
        return Response.json({ error: 'Email and Phone are required' }, { status: 400 });
    }

    // 1. Recalculate Price
    const calcPayload = {
        service_type: serviceType,
        vehicle_type_id: vehicleTypeId,
        origin: formData.origin,
        destination: formData.destination,
        date: formData.date,
        time: formData.time,
        return_date: formData.return_date,
        return_time: formData.return_time,
        hours: formData.hours,
        driver_language: driverLanguage,
        is_internal_call: true
    };

    const priceResponse = await base44.asServiceRole.functions.invoke('calculateTransferPrice', calcPayload);
    
    if (!priceResponse.data || !priceResponse.data.success) {
        throw new Error(priceResponse.data?.error || 'Failed to calculate price');
    }

    const calculatedPrice = priceResponse.data.pricing.total_price;
    const calculationDetails = priceResponse.data.pricing.calculation_details;

    // 2. Create Temporary Booking
    const bookingNumberResponse = await base44.asServiceRole.functions.invoke('generateBookingNumber');
    const bookingNumber = bookingNumberResponse.data.bookingNumber;

    const vehicle = await base44.asServiceRole.entities.VehicleType.get(vehicleTypeId);

    const bookingData = {
        booking_number: bookingNumber,
        service_type: serviceType,
        vehicle_type_id: vehicle.id,
        vehicle_type_name: vehicle.name,
        driver_language: driverLanguage,
        origin: formData.origin,
        destination: formData.destination || formData.origin,
        date: formData.date,
        time: formData.time,
        passengers: formData.passengers || 1,
        customer_name: formData.customer_name || 'Guest User',
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        is_booking_for_other: false, // Default for guest
        notes: formData.notes,
        total_price: calculatedPrice,
        price_before_coupon: calculatedPrice, // No coupon support in guest flow v1
        status: 'pendente', // Will update to 'confirmada' after payment
        payment_status: 'aguardando',
        supplier_id: '690ceb8f1d259a877c7a1bc3', // Default Supplier (Transferonline Gestão)
        // Optional: Add specific flag or status for guest if needed, but 'pendente' + 'aguardando' is standard
        // We can use created_by to distinguish if needed, but for guests it might be empty or system
        // Let's rely on payment flow to confirm.
    };

    // Add extra fields based on service type
    if (serviceType === 'round_trip') {
        bookingData.return_date = formData.return_date;
        bookingData.return_time = formData.return_time;
        if (formData.return_origin_flight_number) bookingData.return_origin_flight_number = formData.return_origin_flight_number;
        if (formData.return_destination_flight_number) bookingData.return_destination_flight_number = formData.return_destination_flight_number;
    } else if (serviceType === 'hourly') {
        bookingData.hours = formData.hours;
    }
    
    if (formData.origin_flight_number) bookingData.origin_flight_number = formData.origin_flight_number;
    if (formData.destination_flight_number) bookingData.destination_flight_number = formData.destination_flight_number;

    // Additional data from calculation
    if (calculationDetails) {
        bookingData.distance_km = parseFloat(calculationDetails.supplier_total_distance_km || 0);
        bookingData.duration_minutes = parseInt(calculationDetails.supplier_duration_minutes || 0);
    }

    const booking = await base44.asServiceRole.entities.Booking.create(bookingData);

    // 3. Create Stripe Checkout Session
    // Use BASE_URL from secrets or construct from headers if not available
    let appUrl = Deno.env.get('BASE_URL') || req.headers.get('origin');
    
    if (!appUrl) {
        console.warn('BASE_URL not set and origin header missing. Defaulting to production URL.');
        appUrl = 'https://app.transferonline.com.br';
    }

    // Ensure protocol
    if (appUrl && !appUrl.startsWith('http://') && !appUrl.startsWith('https://')) {
        appUrl = 'https://' + appUrl;
    }

    // Remove trailing slash if present
    if (appUrl.endsWith('/')) {
        appUrl = appUrl.slice(0, -1);
    }
    
    console.log(`Creating Stripe session with URLs: Success=${appUrl}/BookingSuccessGuest, Cancel=${appUrl}/NovaReserva`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Transfer: ${serviceType === 'one_way' ? 'Só Ida' : serviceType === 'round_trip' ? 'Ida e Volta' : 'Por Hora'}`,
              description: `${vehicle.name} - ${formData.origin} -> ${formData.destination || 'N/A'}`,
            },
            unit_amount: Math.round(calculatedPrice * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/BookingSuccessGuest?from_guest_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/NovaReserva`,
      customer_email: formData.customer_email,
      metadata: {
        booking_id: booking.id,
        booking_number: booking.booking_number,
        service_type: serviceType
      },
    });

    return Response.json({ 
        url: session.url,
        booking_id: booking.id
    });

  } catch (error) {
    console.error('[createGuestBookingAndStripeCheckout] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
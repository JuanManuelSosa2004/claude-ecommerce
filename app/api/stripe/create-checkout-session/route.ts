import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { serviceId, bookedAt } = await request.json()

    if (!serviceId || !bookedAt) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    // Obtener servicio
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .eq('is_active', true)
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    // Crear booking pendiente
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        service_id: serviceId,
        booked_at: bookedAt,
        status: 'pending',
      })
      .select()
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Error al crear el turno' }, { status: 500 })
    }

    // Crear Stripe Checkout Session
    let session
    try {
      session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: service.name,
              description: service.description ?? undefined,
            },
            unit_amount: service.price_cents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: booking.id,
        service_id: serviceId,
        user_id: user.id,
        booked_at: bookedAt,
      },
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=1`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/servicios/${service.slug}?cancelled=1`,
      })
    } catch (stripeError) {
      // Si Stripe falla, eliminar el booking pendiente para no dejar basura en la DB
      await supabase.from('bookings').delete().eq('id', booking.id)
      console.error('Stripe error:', stripeError)
      return NextResponse.json({ error: 'Error al crear el pago' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('create-checkout-session error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

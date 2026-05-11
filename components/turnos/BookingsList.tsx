import type { Database } from '@/lib/supabase/types'

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  services: Pick<Database['public']['Tables']['services']['Row'], 'name' | 'price_cents' | 'duration_minutes' | 'slug'> | null
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confirmado', className: 'bg-green-100 text-green-700' },
  pending:   { label: 'Pendiente',  className: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Cancelado',  className: 'bg-red-100 text-red-700' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function BookingsList({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg mb-2">No tenés turnos próximos</p>
        <a href="/" className="text-sm underline underline-offset-4 hover:text-foreground transition-colors">
          Ver servicios disponibles
        </a>
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {bookings.map((booking) => {
        const status = STATUS_LABEL[booking.status] ?? STATUS_LABEL.pending
        const service = booking.services

        return (
          <li key={booking.id} className="border rounded-lg p-5 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <p className="font-medium">{service?.name ?? 'Servicio'}</p>
              <p className="text-sm text-muted-foreground capitalize">{formatDate(booking.booked_at)}</p>
              {service?.duration_minutes && (
                <p className="text-sm text-muted-foreground">{service.duration_minutes} min</p>
              )}
            </div>
            <div className="flex items-center gap-4 shrink-0">
              {service?.price_cents && (
                <span className="text-sm font-medium">
                  ${(service.price_cents / 100).toLocaleString('es-AR')}
                </span>
              )}
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}>
                {status.label}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

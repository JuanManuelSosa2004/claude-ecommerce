import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { BookingForm } from '@/components/turnos/BookingForm'

interface Service {
  id: string
  name: string
  description: string | null
  price_cents: number
  duration_minutes: number | null
  slug: string
  is_active: boolean
  created_at: string
}

interface Availability {
  id: string
  service_id: string
  day_of_week: number
  start_time: string
  end_time: string
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ServicioPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single() as { data: Service | null, error: unknown }

  if (!service) notFound()

  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('service_id', service.id) as { data: Availability[] | null, error: unknown }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h1 className="text-2xl font-semibold mb-3">{service.name}</h1>
            <p className="text-muted-foreground mb-6">{service.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Precio</span>
                <span className="font-medium">${(service.price_cents / 100).toLocaleString('es-AR')}</span>
              </div>
              {service.duration_minutes && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Duración</span>
                  <span className="font-medium">{service.duration_minutes} minutos</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">Elegí tu turno</h2>
            <BookingForm service={service} availability={availability ?? []} />
          </div>
        </div>
      </main>
    </>
  )
}
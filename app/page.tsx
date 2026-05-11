import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/shared/Navbar'
import { ServiceCard } from '@/components/servicios/ServiceCard'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('created_at')

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold mb-2">Nuestros servicios</h1>
          <p className="text-muted-foreground">Reservá tu turno en segundos, pagá online y listo.</p>
        </div>

        {services && services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No hay servicios disponibles por el momento.</p>
        )}
      </main>
    </>
  )
}

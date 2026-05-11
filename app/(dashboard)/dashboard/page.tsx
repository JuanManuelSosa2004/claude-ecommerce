import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/shared/Navbar'
import { BookingsList } from '@/components/turnos/BookingsList'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const now = new Date().toISOString()

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, services(name, price_cents, duration_minutes, slug)')
    .eq('user_id', user.id)
    .gte('booked_at', now)
    .in('status', ['pending', 'confirmed'])
    .order('booked_at', { ascending: true })

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-1">Mis turnos</h1>
        <p className="text-muted-foreground mb-8">Hola, {user.email}</p>
        <BookingsList bookings={bookings ?? []} />
      </main>
    </>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Database } from '@/lib/supabase/types'

type Service = Database['public']['Tables']['services']['Row']
type Availability = Database['public']['Tables']['availability']['Row']

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

interface Props {
  service: Service
  availability: Availability[]
}

export function BookingForm({ service, availability }: Props) {
  const router = useRouter()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)

  const availableDays = availability.map((a) => a.day_of_week)

  // Fecha mínima: mañana
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  // Verificar si la fecha elegida es un día disponible
  const selectedDayOfWeek = date
    ? (new Date(date + 'T12:00:00').getDay() + 6) % 7 // normaliza a 0=lunes
    : null

  const isDayAvailable = selectedDayOfWeek !== null && availableDays.includes(selectedDayOfWeek)

  // Horarios disponibles para el día seleccionado
  const availabilityForDay = availability.find(
    (a) => a.day_of_week === selectedDayOfWeek
  )

  function generateTimeSlots(start: string, end: string, durationMinutes: number): string[] {
    const slots: string[] = []
    const [startH, startM] = start.split(':').map(Number)
    const [endH, endM] = end.split(':').map(Number)
    let current = startH * 60 + startM
    const endTotal = endH * 60 + endM

    while (current + durationMinutes <= endTotal) {
      const h = Math.floor(current / 60).toString().padStart(2, '0')
      const m = (current % 60).toString().padStart(2, '0')
      slots.push(`${h}:${m}`)
      current += durationMinutes
    }
    return slots
  }

  const timeSlots =
    isDayAvailable && availabilityForDay
      ? generateTimeSlots(
          availabilityForDay.start_time,
          availabilityForDay.end_time,
          service.duration_minutes ?? 60
        )
      : []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !time) return

    setLoading(true)
    try {
      const bookedAt = new Date(`${date}T${time}:00-03:00`).toISOString()
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: service.id, bookedAt }),
      })
      const data = await res.json()
      if (data.url) router.push(data.url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="date">Fecha</Label>
        <Input
          id="date"
          type="date"
          min={minDate}
          value={date}
          onChange={(e) => { setDate(e.target.value); setTime('') }}
          required
        />
        {date && !isDayAvailable && (
          <p className="text-sm text-red-500">
            Ese día no hay atención. Días disponibles: {availableDays.map((d) => DAYS[d]).join(', ')}.
          </p>
        )}
      </div>

      {isDayAvailable && timeSlots.length > 0 && (
        <div className="space-y-1.5">
          <Label>Horario</Label>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                className={`py-2 rounded-md border text-sm transition-colors ${
                  time === slot
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted border-border'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={!date || !time || !isDayAvailable || loading}>
        {loading ? 'Redirigiendo...' : `Reservar — $${(service.price_cents / 100).toLocaleString('es-AR')}`}
      </Button>
    </form>
  )
}

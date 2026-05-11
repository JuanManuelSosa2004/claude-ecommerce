import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Database } from '@/lib/supabase/types'

type Service = Database['public']['Tables']['services']['Row']

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{service.name}</CardTitle>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>${(service.price_cents / 100).toLocaleString('es-AR')}</span>
          {service.duration_minutes && (
            <span>{service.duration_minutes} min</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {service.description}
        </p>
      </CardContent>
      <CardFooter>
        <Link href={`/servicios/${service.slug}`} className="w-full">
          <Button className="w-full">Reservar turno</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

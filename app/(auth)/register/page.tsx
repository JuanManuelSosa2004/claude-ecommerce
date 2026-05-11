'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { register } from '../actions'

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, {})

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>Completá tus datos para registrarte.</CardDescription>
      </CardHeader>

      <form action={action}>
        <CardContent className="space-y-4">
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state.success && (
            <p className="text-sm text-green-600">{state.success}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input id="full_name" name="full_name" type="text" required autoComplete="name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required autoComplete="new-password" minLength={6} />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending || !!state.success}>
            {pending ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="underline underline-offset-4">
              Iniciá sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

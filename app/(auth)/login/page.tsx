'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { login } from '../actions'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, {})

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>Ingresá tu email y contraseña para continuar.</CardDescription>
      </CardHeader>

      <form action={action}>
        <CardContent className="space-y-4">
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Ingresando...' : 'Ingresar'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            ¿No tenés cuenta?{' '}
            <Link href="/register" className="underline underline-offset-4">
              Registrate
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

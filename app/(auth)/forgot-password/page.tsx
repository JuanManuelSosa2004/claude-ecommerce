'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { forgotPassword } from '../actions'

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(forgotPassword, {})

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Recuperar contraseña</CardTitle>
        <CardDescription>Te enviamos un link para restablecer tu contraseña.</CardDescription>
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
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending || !!state.success}>
            {pending ? 'Enviando...' : 'Enviar link'}
          </Button>
          <Link href="/login" className="text-sm text-muted-foreground underline underline-offset-4 text-center">
            Volver al inicio de sesión
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}

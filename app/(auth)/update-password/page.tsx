'use client'

import { useActionState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updatePassword } from '../actions'

export default function UpdatePasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, {})

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Nueva contraseña</CardTitle>
        <CardDescription>Elegí una contraseña segura para tu cuenta.</CardDescription>
      </CardHeader>

      <form action={action}>
        <CardContent className="space-y-4">
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input id="password" name="password" type="password" required autoComplete="new-password" minLength={6} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirmá la contraseña</Label>
            <Input id="confirm_password" name="confirm_password" type="password" required autoComplete="new-password" minLength={6} />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Guardando...' : 'Guardar contraseña'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

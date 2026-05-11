'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthState = {
  error?: string
  success?: string
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  redirect('/dashboard')
}

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const fullName = formData.get('full_name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) return { error: error.message }

  return { success: 'Revisá tu email para confirmar tu cuenta.' }
}

export async function forgotPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/update-password`,
  })

  if (error) return { error: error.message }

  return { success: 'Te enviamos un link para restablecer tu contraseña.' }
}

export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = formData.get('password') as string
  const confirm = formData.get('confirm_password') as string

  if (password !== confirm) return { error: 'Las contraseñas no coinciden.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: error.message }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

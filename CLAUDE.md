# CLAUDE.md

> Este archivo le da contexto a Claude Code sobre el proyecto. Leelo al inicio de cada sesión.

---

## Proyecto

**Tipo:** Ecommerce de servicios y turnos  
**Estado:** Desde cero  
**Stack:** Next.js 15 · Supabase · Tailwind CSS · shadcn/ui · Stripe · Vercel

---

## Stack técnico

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Frontend | Next.js 15 (App Router) | Server Components por defecto |
| Estilos | Tailwind CSS + shadcn/ui | Componentes en `components/ui/` |
| Base de datos | Supabase (PostgreSQL) | RLS habilitado en todas las tablas |
| Auth | Supabase Auth | Proveedores: email/password + Google |
| Pagos | Stripe | Checkout Sessions + Webhooks |
| Deploy | Vercel | Variables de entorno en dashboard de Vercel |

---

## Estructura de carpetas

```
/
├── app/
│   ├── (public)/          # Rutas sin auth: home, catálogo, servicio/[slug]
│   ├── (auth)/            # Login, registro, recuperar contraseña
│   ├── (dashboard)/       # Rutas protegidas: mis turnos, perfil
│   ├── api/
│   │   ├── stripe/        # webhook/, create-checkout-session/
│   │   └── turnos/        # Lógica de reservas
│   └── layout.tsx
├── components/
│   ├── ui/                # shadcn/ui (no editar manualmente)
│   ├── servicios/         # Tarjetas, grillas, detalle
│   ├── turnos/            # Selector de fecha/hora, resumen
│   └── shared/            # Navbar, Footer, etc.
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # Cliente browser
│   │   ├── server.ts      # Cliente server (cookies)
│   │   └── types.ts       # Tipos generados de la DB
│   ├── stripe.ts          # Instancia de Stripe
│   └── utils.ts
├── supabase/
│   └── migrations/        # Migraciones SQL en orden cronológico
└── CLAUDE.md
```

---

## Base de datos (Supabase)

### Tablas principales del MVP

```sql
-- Servicios ofrecidos
services (
  id uuid PK,
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL,   -- siempre en centavos
  duration_minutes integer,       -- duración del turno
  slug text UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamptz
)

-- Disponibilidad horaria
availability (
  id uuid PK,
  service_id uuid FK → services,
  day_of_week integer,            -- 0=lunes … 6=domingo
  start_time time,
  end_time time
)

-- Turnos reservados
bookings (
  id uuid PK,
  user_id uuid FK → auth.users,
  service_id uuid FK → services,
  booked_at timestamptz,
  status text CHECK IN ('pending','confirmed','cancelled'),
  stripe_session_id text,
  stripe_payment_intent text,
  created_at timestamptz
)

-- Perfil de usuario
profiles (
  id uuid PK → auth.users,
  full_name text,
  phone text,
  avatar_url text,
  updated_at timestamptz
)
```

### Reglas RLS importantes

- `services`: lectura pública, escritura solo `service_role`
- `bookings`: usuario ve solo sus propios turnos (`user_id = auth.uid()`)
- `profiles`: usuario edita solo su propio perfil

---

## Flujo de pago (Stripe)

1. Usuario elige servicio + horario → llama a `/api/stripe/create-checkout-session`
2. Se crea una `Checkout Session` con `mode: 'payment'`
3. Metadata incluye: `service_id`, `booked_at`, `user_id`
4. On success → Stripe llama al webhook `/api/stripe/webhook`
5. Webhook actualiza `bookings.status` a `'confirmed'`
6. **Nunca confirmar un turno sin pasar por el webhook**

Variables de entorno necesarias:
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## Auth (Supabase)

- Usar `@supabase/ssr` para manejo de cookies en App Router
- El cliente server va en Server Components y Route Handlers
- El cliente browser va en Client Components con `'use client'`
- Middleware en `middleware.ts` protege rutas del grupo `(dashboard)`
- Al crear usuario → trigger crea fila en `profiles` automáticamente

---

## Convenciones de código

- **Lenguaje:** TypeScript estricto. Sin `any`.
- **Componentes:** Server Components por defecto. `'use client'` solo cuando sea necesario (interactividad, hooks).
- **Precios:** siempre en centavos (integer). Mostrar con `/ 100` al renderizar.
- **Fechas:** siempre UTC en la DB. Convertir a timezone local solo al mostrar.
- **Errores:** usar `try/catch` en todas las Server Actions y Route Handlers.
- **Nombres:** camelCase para variables/funciones, PascalCase para componentes, snake_case para columnas de DB.
- **Imports:** paths absolutos con `@/` (configurado en tsconfig).

---

## Comandos frecuentes

```bash
# Desarrollo
npm run dev

# Generar tipos de Supabase
npx supabase gen types typescript --project-id <ID> > lib/supabase/types.ts

# Nueva migración
npx supabase migration new <nombre_descriptivo>

# Stripe webhook local
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Deploy
git push origin main   # Vercel deploya automático desde main
```

---

## MCPs configurados

| MCP | Para qué usarlo |
|-----|----------------|
| `supabase` | Crear/editar tablas, escribir migraciones, consultar datos |
| `stripe` | Crear productos, precios, ver pagos |
| `github` | Commits, PRs, ver el historial |
| `vercel` | Ver deploys, logs, variables de entorno |

---

## MVP — Checklist

- [ ] Setup inicial: Next.js + Tailwind + shadcn/ui
- [ ] Supabase: crear tablas + RLS + trigger de perfil
- [ ] Auth: login, registro, middleware de protección
- [ ] Catálogo: página pública con grilla de servicios
- [ ] Detalle de servicio: descripción + selector de turno
- [ ] Checkout: integración Stripe Checkout Session
- [ ] Webhook: confirmar turno al recibir pago exitoso
- [ ] Dashboard usuario: ver mis turnos
- [ ] Deploy en Vercel con variables de entorno

---

## Notas para Claude Code

- Si necesitás crear una tabla nueva, primero escribí la migración SQL en `supabase/migrations/` y luego regenerá los tipos.
- Antes de escribir lógica de pagos, verificá que el webhook esté funcionando localmente con el Stripe CLI.
- Cuando trabajes con fechas y turnos, siempre considerá el timezone del usuario (Argentina = UTC-3).
- shadcn/ui: instalá componentes con `npx shadcn@latest add <componente>`, no los escribas a mano.

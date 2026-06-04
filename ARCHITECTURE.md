# Arquitectura del sistema — PulseGym (Documento técnico: nivel muy detallado)

Fecha: 2026-06-03

Propósito: proporcionar una guía técnica completa sobre la arquitectura, implementación, flujos de datos, seguridad, despliegue y operación de la aplicación PulseGym. Está orientado a desarrolladores frontend/backend, ingenieros de SRE y arquitectos.

Tabla de contenidos

- Resumen ejecutivo
- Objetivos y requisitos (funcionales y no funcionales)
- Visión general y diagramas
- Stack tecnológico y dependencias (versiones)
- Estructura del repositorio y responsabilidad de archivos
- Frontend (Next.js): páginas, componentes y flujo de sesión
- Backend y APIs (Next.js API Routes, acceso a Postgres)
- Modelo de datos: tablas, claves y relaciones (detallado)
- Contratos API sugeridos (endpoints, payloads, respuestas)
- Autenticación y autorización (Supabase + mapping)
- Auditoría y triggers
- Seguridad y hardening operativo
- Rendimiento y escalado (DB pooling, serverless)
- Observabilidad y runbook
- Despliegue, CI/CD y copias de seguridad
- Desarrollo local y pruebas
- Checklist de entrega y siguientes pasos

---

1) Resumen ejecutivo

- PulseGym es una aplicación SaaS multi-tenant para gestión de gimnasios: administración de gimnasios (tenants), usuarios y roles, membresías, pagos, rutinas, asistencia, progreso y comunidad.
- El frontend y servidor se sirven desde una aplicación Next.js (Pages Router). El stack usa TypeScript, React 18 y TailwindCSS.
- Persistencia principal: PostgreSQL. El repositorio contiene esquemas SQL para una instancia genérica (`db/schema.sql`) y una versión optimizada para Supabase (`supabase/schema.sql`).
- Auth: diseñado para integrarse con Supabase Auth (JWT). En desarrollo el repositorio soporta fallbacks locales (`lib/mockData.ts`).

2) Objetivos y requisitos

Funcionales (resumidos):

- Multi-tenant: aislar datos por `gym_id`.
- Gestión de usuarios y roles por tenant (RBAC).
- Gestión de membresías y pagos (MVP manual inicialmente).
- Routines/exercises/attendance/progress y comunidad.

No funcionales (NFR):

- Seguridad: no exponer claves sensibes en el cliente; proteger endpoints.
- Escalabilidad: poder crecer a cientos de gimnasios y decenas de miles de usuarios.
- Disponibilidad: health checks, backups periódicos.
- Observabilidad: logs, métricas y trazas.

3) Visión general y diagramas

Contexto (componentes principales):

```mermaid
flowchart LR
  Browser[Usuario (Navegador / Mobile)] -->|HTTPS| CDN[CDN/Edge Cache]
  CDN --> NextApp[Next.js (SSR/CSR) - Frontend & API Routes]
  NextApp -->|Server-side SQL| DB[(Postgres)]
  NextApp -->|Supabase SDK (Client)| Supabase[Supabase (Auth + Realtime + Storage)]
  NextApp -->|Service API| ThirdParty[Pasarelas / Integraciones / Storage]
  NextApp -->|LocalStorage| BrowserLocal[lib/auth.ts]
  NextApp -->|Fallback| Mock[lib/mockData.ts]
```

Componentes principales:

- Frontend (Next.js Pages Router): `pages/`, `components/`.
  - `pages/_app.tsx` inicializa `Layout` global.
  - Rutas dinámicas: `pages/[module]/[[...submodule]].tsx` y `pages/[role]/[module]/` indican un enrutado por módulos y roles.
- Componentes UI: `components/Layout.tsx`, `Header.tsx`, `Sidebar.tsx`, `KpiCard.tsx`.
- Cliente Supabase: `lib/supabaseClient.ts` — crea un cliente con `NEXT_PUBLIC_SUPABASE_*` o deja `supabase` en `null` y habilita fallbacks.
- Lógica de sesión simple en cliente: `lib/auth.ts` para `localStorage`.
- Mock y utilidades: `lib/mockData.ts` para desarrollo sin Supabase.
- Acceso a Postgres desde el servidor: `lib/serverDb.ts` (usa `pg.Pool`).
- Rutas API server-side: `pages/api/*` (ej. `pages/api/supabase-health.ts`).

4) Stack tecnológico y dependencias (conf. actual)

- Next.js 13.5.6 (framework web)
- React 18.2.0
- TypeScript 5.1.6 (dev)
- Tailwind CSS 3.4.7, PostCSS 8.4.24, Autoprefixer 10.4.14
- PostgreSQL (cliente `pg` ^8.21.0 y `@types/pg`)
- Supabase JS @supabase/supabase-js ^2.0.0 (client-side integration)

Se listan en [package.json](package.json).

5) Estructura del repositorio y archivos clave

- [package.json](package.json): scripts y dependencias.
- [env.example](env.example): variables de entorno mínimas (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`).
- [pages/_app.tsx](pages/_app.tsx): wrapper global de la app.
- [pages/index.tsx](pages/index.tsx), [pages/login.tsx](pages/login.tsx), [pages/dashboard.tsx](pages/dashboard.tsx): entradas principales.
- [pages/api/supabase-health.ts](pages/api/supabase-health.ts): endpoint health.
- [components/Layout.tsx](components/Layout.tsx), [components/Sidebar.tsx](components/Sidebar.tsx), [components/Header.tsx](components/Header.tsx), [components/KpiCard.tsx](components/KpiCard.tsx): UI.
- [lib/supabaseClient.ts](lib/supabaseClient.ts): inicialización Supabase (cliente). Usa NEXT_PUBLIC_*.
- [lib/serverDb.ts](lib/serverDb.ts): crea `pg.Pool` para uso server-side (usa `DATABASE_URL`).
- [lib/mockData.ts](lib/mockData.ts): datos y utilidades de fallback en desarrollo.
- [lib/auth.ts](lib/auth.ts): sesiones en `localStorage`.
- [db/schema.sql](db/schema.sql) y [supabase/schema.sql](supabase/schema.sql): definiciones SQL y triggers.

6) Frontend — detalles técnicos

- Router: Pages Router (no `app/` dir). Las páginas pueden usar renderizado al cliente (CSR) y renderizado en servidor con funciones server-side si se agregan (`getServerSideProps`). Actualmente el proyecto usa componentes y layouts típicos del Pages Router.
- Estrategias de renderizado: Preferir CSR para vistas interactivas (dashboards) y SSR para páginas que requieran datos sensibles o SEO. También puede aplicarse SSG/ISR para contenidos estáticos.
- Estado & sesiones:
  - `lib/auth.ts` guarda el objeto de sesión en `localStorage` bajo `pulsegym_session`.
  - Recomendación: para producción, usar cookies `HttpOnly` con refresh tokens o delegar sesiones al backend.
- Comunicación con backend:
  - Cliente -> Supabase (SDK) para operaciones de usuario y lectura/escritura si se quiere un modelo serverless.
  - Cliente -> Next.js API (`fetch('/api/...')`) cuando se necesita lógica de negocio que use credenciales servidor (p. ej. claves de servicio para operaciones privilegiadas).

Implementación actual relevante:

- `lib/supabaseClient.ts`:
  - Lee `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - Crea `supabase` con `createClient(url, key)` cuando están presentes.
  - Exporta `isSupabaseConfigured` y `loginFallback` (usa `lib/mockData.ts`).

- `lib/serverDb.ts`:
  - `getServerPool()` crea un `pg.Pool` usando `process.env.DATABASE_URL`.
  - Opciones: `ssl: { rejectUnauthorized: false }`, `max: 3`.

7) Backend y APIs — detalles técnicos

Estrategia actual:

- API routes en `pages/api/*` para lógica server-side. Están sujetas al runtime Node.js donde se despliegue Next.js.
- `lib/serverDb.ts` centraliza la creación del pool de Postgres. Implementación actual:

```ts
import { Pool } from 'pg'

let pool: Pool | null = null

export function getServerPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured')
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 3 })
  }
  return pool
}
```

Consideraciones:

- Si se despliega en entornos serverless (Vercel, Cloud Functions) hay que reutilizar el pool en el scope del módulo (como se hace) y limitar `max` para evitar abrir demasiadas conexiones. Para cargas más altas, usar PGBouncer o un pool gestionado.
- Para operaciones que requieren privilegios (escrituras administrativas, lecturas no públicas), usar una credencial server-only (`SUPABASE_SERVICE_ROLE_KEY`) y no exponerla en el cliente.

Health check endpoint:

- [pages/api/supabase-health.ts](pages/api/supabase-health.ts) realiza `select now(), current_database()` y devuelve estado. Útil para probes y alertas.

8) Modelo de datos — descripción por tabla (detallado)

Nota: hay dos esquemas en el repo (`db/schema.sql` y `supabase/schema.sql`). Ambos comparten las mismas entidades conceptuales; la versión `supabase/schema.sql` incluye nombres JSON ligeramente distintos para compatibilidad con herramientas Supabase.

- profiles / users
  - Propósito: perfil global del usuario. Se mapea a auth.users (Supabase) vía `auth_id`.
  - Columnas relevantes: `id uuid PK`, `auth_id uuid`, `full_name`/`name`, `email`, `role` (enum), `status`, `metadata jsonb`, `created_at`, `updated_at`.
  - Uso: referencia desde `gym_user_roles`, `memberships`, `payments`, `routines`.

- gyms
  - Propósito: entidad tenant.
  - Columnas: `id uuid PK`, `owner_id` FK -> profiles(id), `name`, `slug` UNIQUE, `logo`, `city`, `status` (`pending`, `active`, etc.), `plan_id` FK -> plans, `trial_ends_at`, `created_at`.
  - Uso: mayoría de tablas contienen `gym_id` para separación de datos.

- gym_user_roles
  - Propósito: RBAC por tenant.
  - Columnas: `id`, `gym_id` FK, `user_id` FK, `role` enum (`owner`,`trainer`,`member`), `permissions jsonb`, `status`, `created_at`.
  - Constraint: UNIQUE (gym_id, user_id).

- plans
  - Propósito: planes comerciales.
  - Columnas: `id`, `name`, `price` numeric(10,2), `limits`/`limits_json` JSONB, `features_json` JSONB, `status`.

- memberships
  - Propósito: suscripciones de usuario a un gym / plan.
  - Columnas: `id`, `gym_id`, `user_id`, `plan_name`, `start_date`, `end_date`, `status`, `created_at`.

- payments
  - Propósito: registros de pago (MVP manual).
  - Columnas: `id`, `gym_id`, `user_id`, `amount numeric(10,2)`, `method`, `due_date`, `paid_at`, `status`, `notes`, `created_at`.

- exercises, routines, routine_exercises
  - Propósito: biblioteca de ejercicios y rutinas.
  - Relaciones: `routine_exercises.routine_id` -> routines.id; `routine_exercises.exercise_id` -> exercises.id.

- attendance
  - Propósito: check-ins.
  - Columnas: `id`, `gym_id`, `user_id`, `checkin_at`, `source`.

- progress_logs
  - Propósito: logs de progreso (peso, medidas, fotos JSON).
  - Columnas: `id`, `gym_id`, `user_id`, `weight`, `measurements jsonb`, `photos jsonb`, `date`, `created_at`.

- community_posts
  - Propósito: posts dentro de un gym.
  - Columnas: `id`, `gym_id`, `user_id`, `body`, `media_url`, `status`, `created_at`.

- post_workout_surveys
  - Propósito: encuestas post-entrenamiento.
  - Columnas: `id`, `gym_id`, `user_id`, `routine_id`, `energy`, `difficulty`, `satisfaction`, `comments`, `created_at`.

- audit_logs
  - Propósito: registro de cambios (INSERT/UPDATE/DELETE).
  - Columnas: `id`, `actor_id`, `gym_id`, `action`, `entity`, `entity_id`, `before/after jsonb`, `created_at`.
  - Triggers: funciones `audit_changes()` o `log_audit()` insertan filas automáticamente.

Índices importantes (presentes en esquema):

- idx_gym_user_roles_gym (gym_user_roles.gym_id)
- idx_memberships_gym (memberships.gym_id)
- idx_payments_gym (payments.gym_id)
- idx_attendance_gym (attendance.gym_id)
- idx_progress_user (progress_logs.user_id)

9) Contratos API sugeridos (ejemplos)

Nota: el repositorio hoy incluye `pages/api/supabase-health.ts`. A continuación propongo un conjunto de endpoints REST/JSON para cubrir las operaciones principales. Cada endpoint debe validar JWT y privilegios.

- POST /api/auth/login
  - Request: { email: string, password: string }
  - Response (200): { ok: true, user: { id, name, email, role, gymId, token } }
  - Uso: delegar a Supabase Auth si está configurado; fallback a `lib/mockData.authenticate` en local.

- GET /api/gyms
  - Query params: ?mine=true
  - Response: [{ id, name, slug, status, plan_id, owner_id }]

- GET /api/gyms/:id/members
  - Response: lista de miembros con membership status.

- POST /api/gyms/:id/payments
  - Request: { user_id, amount, method, due_date }
  - Response: pago creado.

- GET /api/dashboard (protected)
  - Response: KPIs agregados para el rol del usuario (mrr, membersActive, revenueMonth, etc.)

Contrato de error (estándar):

{ ok: false, error: { code: string, message: string, details?: any } }

Implementación recomendada: centralizar verificación de JWT y claims en un helper `lib/apiHelpers.ts` que descifre y valide el token de Supabase (o verifique con `supabase.auth.api.getUser()` en server si se usa supabase admin).

10) Autenticación y autorización (detalles)

- Cliente: usa `@supabase/supabase-js` para signIn/signUp; tokens quedan en cliente y pueden enviarse como `Authorization: Bearer <jwt>` a API routes.
- Server: validar JWT en cada endpoint; obtener `sub` claim para identificar actor.
- Mapping: guardar `auth_id` en `profiles`/`users` para relacionar al usuario con registros de la app.
- Service role vs anon key:
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: para cliente (pública) — NO usar para operaciones privilegiadas.
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only): para operaciones administrativas (seeds, migraciones, acceso a tablas protegidas). Guardar en variables server-only (no exposure via NEXT_PUBLIC_).

11) Auditoría y triggers

- El esquema incluye funciones `audit_changes()` / `log_audit()` que registran cambios en `audit_logs`.
- En Supabase, se intenta leer `current_setting('request.jwt.claims', true)` para enlazar actor; esto requiere que la app pase las claims en el contexto de la conexión o que se use RLS / policies apropiadas.

12) Seguridad y hardening operativo (lista concreta)

- Secrets: almacenar `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_SECRET` (si se añade NextAuth) en el gestor de secretos del proveedor (Vercel secrets, Azure KeyVault, AWS Parameter Store).
- Evitar exponer `DATABASE_URL` o `SUPABASE_SERVICE_ROLE_KEY` en entornos cliente.
- Passwords: nunca almacenar contraseñas en texto. Usar Supabase Auth o bcrypt+argon2 si se gestiona internamente.
- RLS/Policies: habilitar Row Level Security en Supabase y escribir policies por tenant (`gym_id`) para limitar lecturas.
- TLS/HTTPS: forzar HTTPS en todas las comunicaciones.
- Headers: configurar Content Security Policy (CSP), Strict-Transport-Security, X-Frame-Options.
- Validar y sanear entradas en endpoints (use validator libs).
- Rate limiting y WAF para APIs públicas.
- Escaneo de dependencias (vulnerabilidades), y revisar `npm audit` periódicamente.

13) Rendimiento y escalado

- Connection pooling: la app usa `pg.Pool` con `max: 3`. En entornos con múltiples instancias, usar PGBouncer para multiplexar conexiones y evitar límite de conexiones en Postgres.
- Caching: usar CDN para activos estáticos, y cache de respuestas (SWR) o Redis para caches de lectura intensiva (dashboard KPIs).
- Paginación: endpoints list deben paginar (limit/offset o cursor-based).
- Indicadores: instrumentar latencia de endpoints y conteo de conexiones a DB.

14) Observabilidad, health y runbook

- Health check: [pages/api/supabase-health.ts](pages/api/supabase-health.ts) expone estado básico.
- Logs: centralizar logs estructurados (JSON) con niveles (INFO/WARN/ERROR). Exportar a un proveedor (Datadog, Logflare, CloudWatch).
- Errores: integrar Sentry o similar.
- Métricas: instrumentar endpoints críticos (latencia, error-rate), colas, uso de pool DB (active/idle connections).
- Runbook mínimo:
  1. Si `supabase-health` falla: comprobar `DATABASE_URL` y caídas de red a la DB.
  2. Si latencia DB alto: revisar queries lentas, índices y conteo de conexiones.
  3. Si auth falla: comprobar `NEXT_PUBLIC_SUPABASE_URL` y claves; validar clocks (si se usan JWTs con exp).

15) Despliegue y CI/CD

- Pipeline mínimo recomendado:
  1. tests unitarios
  2. build `next build`
  3. despliegue a staging
  4. migraciones DB (usar supabase CLI o migrator)
  5. smoke tests
  6. deploy to production

- Migraciones: usar `supabase db push` o `pg-migrate` para versionar cambios en SQL.
- Backups: activar snapshots y estrategias de retention en la base de datos.

16) Desarrollo local y pasos rápidos

Pasos básicos:

```bash
cp env.example .env.local
# rellenar variables
npm install
npm run dev
```

- Si `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` no están definidas, la app usa `lib/mockData.ts`.
- Para probar `lib/serverDb.ts` configurar `DATABASE_URL` hacia una instancia Postgres local o remota.

17) Ejemplos de queries y KPIs

- Miembros activos por gym:

```sql
SELECT g.id, g.name, COUNT(m.id) AS members_active
FROM gyms g
LEFT JOIN memberships m ON m.gym_id = g.id AND m.status = 'active'
GROUP BY g.id;
```

- Pagos pendientes:

```sql
SELECT * FROM payments WHERE status IN ('pending','due') AND due_date < now();
```

18) Checklist de entrega / hardening (prioridad alta)

- [ ] Eliminar cualquier contraseña en texto del schema/seed.
- [ ] Revisar exposiciones NEXT_PUBLIC_* y mover claves server-only a variables de entorno.
- [ ] Configurar RLS en Supabase y políticas por tenant.
- [ ] Añadir pruebas de integración para endpoints críticos.
- [ ] Instrumentar Sentry/logging y métricas.

19) Siguientes pasos sugeridos

- Validar conmigo si quieres que:
  - Genere un diagrama de despliegue más detallado (Mermaid o PNG).
  - Genere un OpenAPI/Swagger con los endpoints sugeridos.
  - Cree scripts de migración y seeds reproducibles.

---

Archivo generado: [ARCHITECTURE.md](ARCHITECTURE.md)

Si quieres, puedo ahora:

- Exportar los diagramas Mermaid a archivos PNG/SVG.
- Generar un OpenAPI YAML con los endpoints propuestos.
- Añadir tests básicos y un `docker-compose` de desarrollo.

Indica cuál prefieres y lo hago a continuación.

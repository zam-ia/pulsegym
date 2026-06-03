# PulseGym — Scaffold inicial

Scaffold inicial de PulseGym (Next.js + TypeScript + Tailwind). Incluye datos simulados mientras no haya cuenta en Supabase.

Pasos para ejecutar:

1. Instalar dependencias

```bash
npm install
```

2. Correr en modo desarrollo

```bash
npm run dev
```

Notas:
- Si configuras Supabase, agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`.
- En ausencia de variables de Supabase el sistema usa datos simulados en `lib/mockData.ts`.

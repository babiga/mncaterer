This file provides simple guidance when working with code in this repository.

## Project Overview

Mongolian National Caterer is a high-end catering platform built with Next.js 16. The platform serves customers booking catering services and has a separate dashboard for chefs, companies, and admins.

### Directory Structure

- `app/[locale]/` - Next.js App Router pages with i18n locale prefix
- `@/components/` - React components (ui/, layout/, sections/, auth/)
- `@/i18n/` - Internationalization config (next-intl)
- `lib/` - Shared utilities, services, validations, and Prisma client
- `prisma/` - Database schema and migrations
- `messages/` - Translation files (en.json, mn.json)
- `generated/prisma/` - Generated Prisma client (gitignored)

### Key Architectural Patterns

**Internationalization (next-intl)**

- Supported locales: `en`, `mn` (default: `en`)
- All routes are prefixed with locale: `/en/...`, `/mn/...`
- Use `Link`, `redirect`, `usePathname`, `useRouter` from `@/i18n/routing` instead of Next.js navigation
- Translation keys are namespaced (e.g., `Auth.login.title`)

**Database (Prisma + PostgreSQL)**

- Two distinct user models: `User` (customers) and `DashboardUser` (chefs, companies, admins)
- Prisma client initialized in `lib/prisma.ts` using the pg adapter
- Connection string from `DATABASE_URL` environment variable

**UI Components**

- Radix UI primitives with shadcn/ui patterns
- Styling: Tailwind CSS v4 with `cn()` utility from `lib/utils.ts`
- Class variance authority (cva) for component variants

**Form Validation**

- Zod schemas in `lib/validations/`
- React Hook Form with `@hookform/resolvers`

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NutriSensia is a Swiss-based personalized nutrition platform built with Next.js 14, offering online consultations with certified nutritionists (ASCA/RME), custom meal plans, and AI-powered nutritional recommendations. The application is GDPR-compliant with EU-West hosting.

## Claude Code Workflow

**IMPORTANT**: Claude Code must follow the standardized workflow defined in [docs/claude-workflow.md](docs/claude-workflow.md).

This workflow document defines:
- How to classify tasks by complexity (Trivial, Medium, Complex, Refactoring)
- When and how to use sub-agents (Explore, Plan, Bash, general-purpose)
- Step-by-step workflows for each complexity level
- Todo list management rules
- NutriSensia-specific patterns (pages, API routes, components, database)
- Quality checklists before finalizing features
- Templates for sub-agent prompts

**Default behavior**: Always follow the workflow in `docs/claude-workflow.md` unless explicitly instructed otherwise by the user. This ensures:
- Efficient use of context window via sub-agents
- Consistent code quality and patterns
- Proper exploration before implementation
- Systematic todo management
- User validation at key decision points

## Key Technologies

- **Frontend**: Next.js 14.2.32 (App Router), React 18.3.1, TypeScript 5.5.4
- **Styling**: Tailwind CSS 3.4.7 with extensive custom design system
- **Backend**: Supabase (PostgreSQL + Auth + Real-time + Storage)
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **i18n**: next-intl (French/English support)
- **Analytics**: Google Analytics with custom conversion tracking
- **Testing**: Vitest + Storybook with accessibility testing
- **Component Documentation**: Storybook with a11y addon

## Development Commands

### Essential Commands

```bash
npm run dev              # Start development server on port 3000
npm run dev:clean        # Kill port 3000, clear cache, and start dev
npm run dev:fast         # Dev with increased memory allocation
npm run build            # Production build
npm run start            # Production server
```

### Code Quality

```bash
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format with Prettier
npm run format:check     # Check formatting
npm run type-check       # TypeScript type checking
npm run quality          # Run all quality checks (lint + format + type-check)
```

### Testing & Documentation

```bash
npm run storybook        # Start Storybook on port 6006
npm run build-storybook  # Build Storybook
# Note: Test commands are configured via vitest.config.ts
```

### Utilities

```bash
npm run validate-env     # Validate environment variables
npm run setup            # Automated environment setup
```

## Architecture

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── [locale]/                # Internationalized routes (fr/en)
│   │   ├── layout.tsx           # Main locale layout with i18n provider
│   │   └── page.tsx             # Localized pages
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── admin/               # Admin-only endpoints
│   │   ├── protected/           # Protected endpoints
│   │   ├── public/              # Public endpoints
│   │   ├── analytics/           # Analytics tracking
│   │   ├── blog/                # Blog management
│   │   └── security/            # Security metrics
│   ├── layout.tsx               # Root layout (minimal for next-intl)
│   └── globals.css              # Global styles + Tailwind directives
├── components/
│   ├── ui/                      # Reusable UI components (Button, Card, etc.)
│   ├── forms/                   # Form components with validation
│   ├── landing/                 # Landing page sections
│   ├── blog/                    # Blog components
│   ├── admin/                   # Admin dashboard components
│   ├── analytics/               # Analytics & tracking components
│   ├── layout/                  # Header, Footer, etc.
│   └── examples/                # Example components
├── lib/
│   ├── supabase/               # Supabase client configuration
│   │   ├── client.ts           # Client-side Supabase
│   │   └── server.ts           # Server-side Supabase
│   ├── supabase.ts             # Main Supabase utilities & auth helpers
│   ├── store.ts                # Zustand global state
│   ├── schemas.ts              # Zod validation schemas
│   ├── contact-schemas.ts      # Contact form schemas
│   ├── analytics.ts            # Analytics utilities
│   ├── seo-config.ts           # SEO structured data
│   ├── mdx.ts                  # MDX processing for blog
│   └── feature-flags/          # Feature flag system
├── i18n/
│   ├── routing.ts              # Internationalization routing config
│   ├── navigation.ts           # Localized navigation utilities
│   └── request.ts              # Request-level i18n utilities
├── hooks/                       # Custom React hooks
├── middleware.ts                # Next.js middleware (i18n + security headers)
└── styles/                      # Additional style utilities
```

### App Router Architecture

This project uses Next.js 14 App Router with **internationalization via next-intl**:

- **Root layout** (`app/layout.tsx`): Minimal wrapper for next-intl compatibility
- **Locale layouts** (`app/[locale]/layout.tsx`): Main layout with NextIntlClientProvider, metadata, analytics, and SEO
- **Locale prefix**: French (fr) is default with no prefix, English (en) has `/en` prefix
- **Localized paths**: Defined in `src/i18n/routing.ts` (e.g., `/a-propos` for French, `/about` for English)

### Middleware

The middleware (`src/middleware.ts`) handles:

1. **Internationalization routing** via next-intl
2. **Security headers** (X-Frame-Options, X-Content-Type-Options, CSP, Referrer-Policy)
3. Runs on all routes except `/api/*`, `/_next/*`, static files, and `.well-known`

### Supabase Integration

Two database schemas coexist:

1. **Legacy schema** (`users`, `meals`, `meal_plans`): Defined in `src/lib/supabase.ts`
2. **New schema** (`profiles`): Auth profiles with roles (nutritionist/patient/admin)

**Authentication utilities** in `src/lib/supabase.ts`:

- `auth.signInWithPassword()`, `auth.signUp()`, `auth.signInWithGoogle()`
- `auth.getUser()`, `auth.getSession()`, `auth.signOut()`
- All functions return `{ data, error }` with French error messages
- `isSupabaseConfigured` flag checks if env vars are properly set

**Database utilities**:

- `db.users.*`, `db.meals.*`, `db.mealPlans.*` for legacy schema operations

### State Management

**Zustand store** (`src/lib/store.ts`):

- Global state: `user`, `isAuthenticated`, `isLoading`, `theme`
- Persisted to localStorage as `nutrisensia-store`
- Actions: `setUser()`, `setAuthenticated()`, `setLoading()`, `setTheme()`, `logout()`

### Design System

NutriSensia has a **comprehensive custom design system** in `tailwind.config.ts`:

**Color Palette**:

- Primary: `#2E7D5E` (green), `#1B4F3F` (dark), `#FAFBFC` (white)
- Secondary: Sage greens (`#4A9B7B`, `#E8F3EF`, `#B8D4C7`)
- Accent: Teal (`#00A693`), Mint (`#7FD1C1`), Orange (`#F4A261`), Gold (`#D4A574`)
- Functional: Success/Error/Warning/Info standard colors
- Sage scale: 50-900 for About page

**Typography**:

- Font: Inter, SF Pro Text, Roboto (system fallbacks)
- Sizes: `h1` (32px), `h2` (28px), `h3` (24px), `h4` (20px), `body-large`, `body`, `body-small`, `caption`, `button`, `link`, `label`
- All sizes include predefined line-height and letter-spacing

**Spacing**: Custom `2dp`, `4dp`, `8dp`, `12dp`, `16dp`, `24dp`, `32dp`, `48dp`, `64dp` scale

**Animations**: Custom durations (`standard`, `emphasis`, `micro`, `page`, `loading`) and timing functions

**Dark Mode**: Configured via `class` strategy with inverted color palette

### Forms & Validation

- **React Hook Form** for form state management
- **Zod schemas** defined in `src/lib/schemas.ts` and `src/lib/contact-schemas.ts`
- Form components in `src/components/forms/` include validation and error handling
- Use `@hookform/resolvers` for Zod integration

### Internationalization

**Supported locales**: French (fr, default), English (en)

- **Message files**: `messages/fr.json`, `messages/en.json`
- **Usage**: `useTranslations()` hook from next-intl
- **Navigation**: Use `Link` and `useRouter` from `@/i18n/navigation` for locale-aware routing

### Analytics & SEO

- **Google Analytics** integration with custom conversion tracking
- **Structured data** for organization, website, and services (Schema.org)
- **Cookie consent** banner with GDPR compliance
- **SEO config** in `src/lib/seo-config.ts` with meta tags and Open Graph

### Security Features

- **Role-based access control** (admin/nutritionist/patient)
- **MFA/2FA support** via Supabase
- **Content Security Policy** in middleware
- **Security headers** enforced
- **Security testing scripts** available (`npm run security-test`)

## Environment Variables

Required variables in `.env.local` (see `.env.example`):

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://nutrisensia.ch

# Google Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## Important Development Notes

### Build Configuration

- **TypeScript & ESLint checks are disabled during builds** (`next.config.js`)
- This is temporary for faster iterations; re-enable before production deploys
- `swcMinify: true` for optimized production builds
- MDX support enabled via `@next/mdx`

### Path Aliases

Use `@/*` for imports: `import { Button } from '@/components/ui/Button'`

### Styling Guidelines

1. Use Tailwind's custom design system classes (e.g., `text-h1`, `text-primary`, `spacing-16dp`)
2. Prefer utility classes over custom CSS
3. Use `clsx` or `tailwind-merge` for conditional classes
4. Dark mode: Use `dark:` prefix with class-based strategy

### Component Patterns

1. **UI Components**: Export from `src/components/ui/index.ts` for easy imports
2. **Forms**: Use React Hook Form + Zod, include accessibility labels
3. **Animations**: Use Framer Motion for page transitions and micro-interactions
4. **Accessibility**: Test with Storybook's a11y addon

### API Routes

- Place authenticated routes in `app/api/protected/`
- Admin-only routes in `app/api/admin/`
- Public routes in `app/api/public/`
- Always validate auth with Supabase server client

### Storybook

- Stories located alongside components: `ComponentName.stories.tsx`
- Accessibility testing enabled by default
- Run `npm run storybook` and test components in isolation

### Common Pitfalls

1. **Supabase not configured**: Check `isSupabaseConfigured` before using auth/db functions
2. **Locale routes**: Always use Link from `@/i18n/navigation`, not `next/link`
3. **Server vs Client Supabase**: Use `src/lib/supabase/server.ts` for server components/routes
4. **Environment variables**: Must start with `NEXT_PUBLIC_` for client-side access

## Documentation

Extensive documentation available in `docs/`:

- `onboarding.md` - New developer setup guide
- `troubleshooting.md` - Common issues and solutions
- `code-quality.md` - Code quality standards
- `git-workflow.md` - Git conventions
- `supabase-setup.md` - Supabase configuration
- `accessibility-guide.md` - Accessibility best practices
- `ui-components-guide.md` - Component usage guide
- `tailwind-usage.md` - Design system usage

## Git Workflow

- **Main branch**: Production-ready code
- **Feature branches**: `feature/feature-name`
- **Commit format**: Conventional commits (e.g., `feat:`, `fix:`, `docs:`)
- **Pre-commit hooks**: Lint-staged runs ESLint + Prettier on staged files via Husky

## Testing Strategy

- **Vitest**: Unit and integration tests
- **Storybook**: Component testing with visual regression
- **Playwright**: Browser-based testing (configured but minimal usage)
- **Accessibility**: axe-core integration via Storybook addon

## Feature Flags

Feature flag system located in `src/lib/feature-flags/`:

- Gradual rollout support
- Analytics integration
- Context-based flag evaluation

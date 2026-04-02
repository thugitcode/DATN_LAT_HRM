# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `yarn dev` - Start development server on port 4000
- `yarn build` - Build for production using RSBuild
- `yarn typecheck` - Run TypeScript type checking
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check formatting without writing
- `yarn deploy:dev` - Deploy to development environment

### Requirements
- Node.js >= 22.0.0 (managed via Volta)
- Yarn 1.22.22 package manager

## Architecture Overview

### Tech Stack
- **Build Tool**: RSBuild with TanStack Router plugin (autoCodeSplitting enabled)
- **Framework**: React 19 with TypeScript
- **Routing**: TanStack Router with file-based routing (`src/routes/`)
- **Forms**: React Hook Form + Zod validation (primary), TanStack Form exists but rarely used
- **Server State**: TanStack Query with IndexedDB persistence
- **UI**: Tailwind CSS v4 + HeroUI components + Mantine v8 (mixed usage)
- **Global State**: Zustand (drawers, layout, sidebar, confirm modals)
- **Auth**: Keycloak via `@react-keycloak/web`, JWT stored in localStorage
- **i18n**: i18next with namespace-based organization, Vietnamese (vi) default + English (en)

### Path Aliases
- `@/*` → `src/*`
- `@public/*` → `public/*`

### API Layer
- Single axios instance `hrmInstance` in `src/lib/axios.ts` (base: `{GATEWAY}hrm/api`)
- Auto-injects JWT Bearer token and `x-tenant-id` header from localStorage
- Runtime config via `window.GATEWAY` in `public/config/config.js`
- `normalizeAxiosError()` for standardized i18n-aware error handling

### Service Layer Pattern
- Base CRUD service: `src/services/base-api.service.ts` — abstract class with `getAll`, `getById`, `create`, `update`, `patch`, `delete`
- Feature services extend `BaseApiService` in `src/services/`
- Query options colocated in `src/services/query-options/` (feature-specific) and `src/query-options/` (shared)
- CRUD query hook factory: `createCrudHooks()` in `use-crud-query.ts` — generates `useList`, `useDetail`, `useCreate`, `useUpdate`, `useDelete` with auto cache invalidation

### Query Defaults
- staleTime: 3 min, gcTime: 10 min
- `DEFAULT_PAGE = 1`, `DEFAULT_LIMIT = 25`
- `PAGE_SIZE_OPTIONS = [5, 10, 20, 50]`

### Key Patterns

#### Feature Organization
Each feature under `src/features/` follows:
```
feature-name/
├── hooks/       # Data fetching, business logic
├── components/  # UI components, forms, tables
├── schemas/     # Zod validation schemas
├── types/       # TypeScript interfaces
├── constants/   # Static data
├── core/        # Main page components
└── feature-name.tsx  # Entry point
```

#### Form Pattern
- React Hook Form with `zodResolver` and `mode: 'onChange'`
- Reusable validators in `use-common-form.ts`: `input`, `email`, `phone`, `dateInput`, `timeSchema`, `dateRangeSchema`, etc.
- Form field components: `form-select`, `form-checkbox`, `form-date-picker`, `form-number-input`, `form-label` in `src/components/`

#### Select Options Hook Pattern
```typescript
export const use[Entity]Options: UseOptions<...> = () => {
  const { data } = useQuery(...);
  return {
    options: data?.data.map((item) => ({
      label: ..., value: item.ID, item, // full item attached
    })) ?? [],
  };
};
```

#### Drawer/Modal State
- Zustand store `useDrawer` manages all drawers via `DrawerType` enum
- `useConfirmStore` for confirmation modals

#### i18n Namespaces
- Defined in `src/i18n/constants.ts` as `NAMESPACES` object
- Usage: `const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT)`
- Translation files loaded via HTTP backend

### Naming Conventions
| Category | Pattern | Example |
|----------|---------|---------|
| Query Hooks | `use[Entity][Action]` | `useStaffList`, `useStaffDetail` |
| Select Options | `use[Entity]Options` | `useStaffOptions` |
| Form Hooks | `use[Entity]Form` | `useStaffForm` |
| Store Hooks | `use[Store]` | `useDrawer`, `useLayoutStore` |
| Service Classes | `[Entity]Service` | `StaffService` |
| Enums | `[Name]Enum` with UPPER_SNAKE values | `StaffStatusEnum` |

### Routing
- File-based routing in `src/routes/`
- **IMPORTANT**: `src/routeTree.gen.ts` is auto-generated — DO NOT edit manually
- `.lazy.tsx` suffix for code-split routes
- `_private.tsx` layout handles auth guards (redirects to `/login`)
- `_auth.tsx` layout for public authenticated pages
- Route structure: `/_private/admin/_dashboard/` is the main authenticated area

### Development Notes
- ESLint: unused vars warn with `^_` prefix ignore pattern
- Prettier auto-sorts imports via `@ianvs/prettier-plugin-sort-imports`
- Logger (`src/lib/logger.ts`): dev-only, no-ops in production; use `createLogger(prefix)` for prefixed instances
- Constants in `src/lib/constants.ts`: `catalogTypes`, `Message` object, `ALLOWED_TYPES` for file uploads
- Utility helpers in `src/lib/utils.ts`: `cn()`, `formatPhone()`, `formatDate()`, `convertDateToISO()`, `getFormFieldProps()`
- Currency formatting: `formatVND()` in `src/lib/helpers.ts`

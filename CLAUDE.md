# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `yarn dev` - Start development server on port 4000
- `yarn build` - Build for production using RSBuild
- `yarn preview` - Preview production build
- `yarn typecheck` - Run TypeScript type checking
- `yarn lint` - Run ESLint on codebase
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check code formatting
- `yarn deploy:dev` - Deploy to development environment

### Requirements
- Node.js >= 22.0.0 (managed via Volta)
- Yarn 1.22.22 package manager

## Architecture Overview

### Tech Stack
- **Build Tool**: RSBuild with React plugin and TanStack Router integration
- **Framework**: React 19 with TypeScript
- **Routing**: TanStack Router with file-based routing and auto-generated route tree
- **State Management**:
  - Zustand for global state
  - XState for complex state machines (registration flow)
  - TanStack Query for server state
- **UI Framework**: Mantine v8 (components, hooks, notifications, modals, charts, dates)
- **Forms**: TanStack Form with Zod validation
- **Authentication**: Keycloak via @react-keycloak/web
- **Styling**: PostCSS with Mantine preset

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components (tables, forms, etc.)
│   ├── forms/           # Form-specific components
│   ├── filters/         # Filter components
│   └── providers/       # React context providers
├── features/            # Feature-based modules
│   ├── register/        # Customer registration flow
│   ├── all-customers/   # Customer management
│   ├── dashboard-layout/ # Main layout
│   └── login/           # Authentication
├── hooks/               # Custom React hooks
│   ├── common/          # Generic hooks
│   └── select-options/  # Select option hooks
├── lib/                 # Utilities and configurations
├── query-options/       # TanStack Query options
├── routes/              # File-based routing structure
├── types/               # TypeScript type definitions
└── styles/              # Global styles
```

### Key Architectural Patterns

#### Authentication Flow
- Keycloak integration with automatic token management
- Route guards via `_private.tsx` for protected routes
- Auth context provides login state and token access

#### State Management Strategy
- **XState**: Complex flows (registration state machine)
- **Zustand**: Simple global state
- **TanStack Query**: Server state, caching, and synchronization
- **TanStack Form**: Form state with validation

#### Registration Flow
The registration feature uses XState for managing complex multi-step flow:
- Step-based progression with validation
- State persistence
- Different flows for satellite vs regular hospitals
- Form data managed across steps

#### Component Patterns
- Feature-based organization under `features/`
- Common components are reusable across features
- Form components follow consistent naming (`form-*`)
- Hook-based data fetching and business logic

#### Configuration Management
- Environment-specific config in `public/config/config.js`
- Runtime configuration via window globals
- Supports dev/prod environment switching

### Data Flow
1. Keycloak handles authentication and token management
2. TanStack Router manages navigation and route protection
3. TanStack Query handles API calls and caching
4. Forms use TanStack Form with Zod validation
5. Complex state flows use XState machines

### API Configuration
- Three API instances in `src/lib/axios.ts`:
  - `clinic40Api`: Authenticated requests with Keycloak token (clinic40/api)
  - `clinic40PublicApi`: Public endpoints without auth headers (clinic40-public/api)
  - `cis`: CIS API with Keycloak token (cis/api)
- Runtime configuration via `window.GATEWAY` in `public/config/config.js`
- Keycloak settings via `window.KEYCLOAK_URL` and `window.KEYCLOAK_REALM`

### Development Notes
- Uses path mappings: `@/*` for src imports, `@public/*` for public assets
- File-based routing with lazy loading (`.lazy.tsx` suffix for code splitting)
- **IMPORTANT**: `src/routeTree.gen.ts` is auto-generated - DO NOT edit manually
- PostCSS for styling with Mantine preset
- Strict TypeScript configuration with unused variable checking
- TanStack Query options defined in `src/query-options/` with type-safe patterns using `queryOptionsTable` helper
- Centralized form validators in hooks use Zod schemas
- Route protection: `_private.tsx` layout handles auth guards and redirects to `/login`
- XState machine selectors are defined alongside machines for type-safe state access

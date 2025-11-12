# Architecture Documentation

## Overview

This microSaaS template follows a modular architecture with clear separation of concerns and abstraction layers for external services.

## Core Principles

### 1. Abstraction Layers
All external services (database, authentication, payments) are abstracted behind interfaces:
- **Database**: `IDatabaseProvider` → `SupabaseDatabaseProvider`
- **Authentication**: `IAuthProvider` → `SupabaseAuthProvider`  
- **Payments**: `IPaymentProvider` → `StripePaymentProvider`

This design allows you to swap providers without changing your application code.

### 2. Modularity
Features are organized into self-contained modules in `/src/modules/`:
- Each module has its own types, services, and exports
- Modules communicate through the abstraction layer
- Modules can be developed and tested independently

### 3. Dependency Injection
The provider configuration system (`src/abstractions/config.ts`) allows runtime provider injection:

```typescript
import { initializeConfig } from '@/abstractions/config';
import { CustomDatabaseProvider } from './custom-db';

initializeConfig({
  providers: {
    database: new CustomDatabaseProvider(),
    // Other providers use defaults
  }
});
```

## Directory Structure

```
src/
├── abstractions/          # Provider interfaces and implementations
│   ├── database.ts        # IDatabaseProvider interface
│   ├── auth.ts           # IAuthProvider interface
│   ├── payment.ts        # IPaymentProvider interface
│   ├── supabase-database.ts
│   ├── supabase-auth.ts
│   ├── stripe-payment.ts
│   ├── config.ts         # Provider configuration
│   └── index.ts
│
├── modules/              # Feature modules
│   ├── user-management/
│   │   ├── types.ts
│   │   ├── service.ts
│   │   └── index.ts
│   ├── permissions/
│   │   ├── types.ts
│   │   ├── service.ts
│   │   └── index.ts
│   └── notifications/
│       ├── types.ts
│       ├── service.ts
│       ├── index.ts
│       └── README.md
│
├── components/           # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── index.ts
│
├── layouts/             # Page layouts
│   ├── AdminLayout.tsx
│   ├── UserLayout.tsx
│   └── index.ts
│
├── utils/               # Utilities
│   ├── validation.ts    # Zod schemas
│   ├── constants.ts
│   └── index.ts
│
└── app/                 # Next.js App Router
    ├── layout.tsx
    └── page.tsx
```

## Data Flow

### Example: User Creation

```
User Input → UI Component → Module Service → Abstraction Layer → Provider Implementation
    ↓
(Button)  → (UserService)  → (IAuthProvider) → (SupabaseAuthProvider)
    ↓                           ↓
(Form)       createUser()   → signUp()     → Supabase API
```

### Module Communication

Modules should NEVER directly import from other modules. Instead:

1. Use the abstraction layer (recommended)
2. Expose functionality through the config system
3. Use React Context for shared state

## Extension Points

### 1. Custom Providers

Create a new provider by implementing an interface:

```typescript
import { IDatabaseProvider } from '@/abstractions/database';

export class PostgresProvider implements IDatabaseProvider {
  async query<T>(table: string, filters?: Record<string, unknown>): Promise<T[]> {
    // Your implementation
  }
  // ... implement other methods
}
```

### 2. Custom Modules

Add new features by creating a module:

```
src/modules/analytics/
├── types.ts          # Type definitions
├── service.ts        # Business logic
└── index.ts          # Exports
```

### 3. Custom UI Sections

Extend layouts with custom sections:

```tsx
<AdminLayout extraSections={[
  <Link key="analytics" href="/analytics">Analytics</Link>
]}>
  {children}
</AdminLayout>
```

## Security Considerations

1. **Environment Variables**: All secrets in `.env.local` (never committed)
2. **Authentication**: JWT-based with Supabase
3. **Authorization**: Role-based access control via permissions module
4. **Validation**: Input validation using Zod schemas
5. **Webhooks**: Signature verification for Stripe webhooks

## Testing Strategy

### Unit Tests
- Test modules in isolation by mocking providers
- Use dependency injection to swap real providers with mocks

### Integration Tests
- Test provider implementations against real services (dev environment)
- Test module interactions through the abstraction layer

### Example Mock:

```typescript
const mockDb: IDatabaseProvider = {
  query: jest.fn().mockResolvedValue([]),
  getById: jest.fn(),
  // ... other methods
};

initializeConfig({
  providers: { database: mockDb }
});
```

## Performance Optimizations

1. **Code Splitting**: Modules loaded on-demand
2. **Type Safety**: TypeScript catches errors at compile time
3. **Build Optimization**: Next.js production build with Turbopack
4. **Bundle Size**: Tree-shaking removes unused code

## Implemented Modules

### Notifications Module

A flexible notification system with:
- **Admin Management**: CRUD interface for notification types at `/admin/notifications`
- **User Preferences**: User-specific preferences with fallback to defaults
- **Multi-Channel**: Support for email, SMS, and push notifications
- **Categories**: Organize notifications into logical groups (Account, Security, Marketing, etc.)
- **API Routes**: RESTful endpoints for admin and user operations

See `src/modules/notifications/README.md` for detailed documentation.

Database tables:
- `notification_types`: Defines available notification types
- `notification_preferences`: Stores user-specific preferences

Migration: `migrations/001_create_notifications_tables.sql`

## Future Enhancements

Areas for extension:
1. Add test infrastructure (Jest/Vitest)
2. Middleware for route protection and authentication
3. Additional modules (billing, analytics, etc.)
4. Error boundary components
5. Loading states and suspense boundaries
6. Internationalization (i18n)
7. Theme system for dark mode
8. Notification sending/delivery system (email service integration)

## Best Practices

1. **Always use abstractions**: Never import provider implementations directly in application code
2. **Keep modules independent**: Modules should not depend on each other
3. **Type everything**: Leverage TypeScript for type safety
4. **Document extension points**: Use comments to mark where customization is expected
5. **Follow conventions**: Maintain consistent directory structure and naming

## Getting Help

- Check the main README.md for setup instructions
- Review example implementations in existing modules
- See component examples for UI patterns
- Check .env.example for required configuration

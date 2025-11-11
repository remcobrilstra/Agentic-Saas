# Modular microSaaS Template

A reusable, production-ready foundation for building microSaaS applications with Next.js, TypeScript, and modular architecture.

## 🚀 Features

- **Modular Architecture**: Independent modules that can be easily extended or replaced
- **Abstraction Layers**: Swappable providers for auth (Supabase), database (Supabase), and payments (Stripe)
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Rapid UI development with utility-first CSS
- **Role-Based Access Control**: Built-in permissions system
- **Extensible UI**: Layouts with extension points for custom sections
- **Validation**: Zod schemas for data validation
- **Next.js 16**: Latest Next.js features with App Router

## 📁 Project Structure

```
src/
├── abstractions/       # Provider interfaces and implementations
│   ├── database.ts     # IDatabaseProvider interface
│   ├── auth.ts         # IAuthProvider interface
│   ├── payment.ts      # IPaymentProvider interface
│   ├── supabase-database.ts
│   ├── supabase-auth.ts
│   ├── stripe-payment.ts
│   └── config.ts       # Provider configuration system
├── modules/            # Core feature modules
│   ├── user-management/
│   └── permissions/
├── components/         # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Input.tsx
├── layouts/            # Page layouts
│   ├── AdminLayout.tsx
│   └── UserLayout.tsx
├── utils/              # Helper functions
│   ├── validation.ts
│   └── constants.ts
└── app/                # Next.js app directory
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for auth & database)
- Stripe account (for payments)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/remcobrilstra/Agentic-Saas.git
   cd Agentic-Saas
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Add your credentials to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

### Abstraction Layers

The template uses abstraction layers to allow easy replacement of underlying services:

#### Database Provider
```typescript
interface IDatabaseProvider {
  query<T>(table: string, filters?: Record<string, any>): Promise<T[]>;
  getById<T>(table: string, id: string): Promise<T | null>;
  insert<T>(table: string, data: Partial<T>): Promise<T>;
  update<T>(table: string, id: string, data: Partial<T>): Promise<T>;
  delete(table: string, id: string): Promise<void>;
}
```

#### Auth Provider
```typescript
interface IAuthProvider {
  signUp(params: SignUpParams): Promise<User>;
  signIn(params: SignInParams): Promise<AuthSession>;
  signOut(): Promise<void>;
  getUser(): Promise<User | null>;
  // ... more methods
}
```

#### Payment Provider
```typescript
interface IPaymentProvider {
  createCustomer(email: string, metadata?: Record<string, any>): Promise<string>;
  createSubscription(params: CreateSubscriptionParams): Promise<Subscription>;
  cancelSubscription(subscriptionId: string): Promise<Subscription>;
  // ... more methods
}
```

### Provider Configuration

Providers are configured centrally and can be replaced:

```typescript
import { initializeConfig } from '@/abstractions/config';
import { CustomDatabaseProvider } from './custom-db';

// Use custom provider
initializeConfig({
  providers: {
    database: new CustomDatabaseProvider(),
    // auth and payment will use defaults
  }
});
```

## 🔧 Extension Points

### Adding Custom UI Sections

Layouts support extension through the `extraSections` prop:

```tsx
<AdminLayout extraSections={[
  <Link key="custom" href="/custom">Custom Tab</Link>
]}>
  {/* page content */}
</AdminLayout>
```

### Creating New Modules

1. Create a new directory in `src/modules/`
2. Add `types.ts`, `service.ts`, and `index.ts`
3. Implement your module logic using the abstraction layers
4. Export from `index.ts`

Example module structure:
```
src/modules/my-module/
├── types.ts       # Type definitions
├── service.ts     # Business logic
└── index.ts       # Exports
```

### Replacing Providers

To use a different database, auth, or payment provider:

1. Implement the corresponding interface (e.g., `IDatabaseProvider`)
2. Update the configuration in `src/abstractions/config.ts`
3. All modules will automatically use the new provider

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🧪 Testing

The template is designed with testing in mind. Each module can be tested independently by mocking the providers.

## 🔐 Security Best Practices

- Environment variables for sensitive data
- JWT-based authentication with Supabase
- Webhook signature verification for Stripe
- Input validation with Zod schemas
- Role-based access control

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

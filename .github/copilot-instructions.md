
This document provides comprehensive guidelines for building a modular microSaaS template. The goal is to create a reusable foundation for multiple microSaaS applications, emphasizing modularity, extensibility, and abstraction layers to allow easy replacement of underlying services (e.g., Supabase for auth/database and Stripe for payments). The template should support rapid iteration by allowing independent development of modules, with a focus on reuse across projects.
The template will be a full-stack web application using:
* Backend/Database/Auth: Supabase (abstracted for replaceability).
* Payments: Stripe (abstracted for replaceability).
* Frontend Framework: Next.js (with React and TypeScript) for server-side rendering, API routes, and easy deployment. This choice enables modular UI components and pages that can be extended.
* Language: TypeScript for type safety and better maintainability.
* Styling: Tailwind CSS for rapid, modular UI design.
* Deployment Considerations: Designed for easy deployment on Vercel (Next.js-friendly), with environment variables for Supabase and Stripe keys.
* Architecture Principles:
    * Modularity: Break everything into independent modules (e.g., as separate directories or NPM packages if needed). Each module should have its own exports, tests, and documentation.
    * Extensibility: Use hooks, plugins, or configuration objects for extension points. For example, UI pages should have slots for custom components (e.g., via React children or props).
    * Abstractions: Hide Supabase and Stripe behind interfaces/abstract classes. Implement concrete classes for Supabase/Stripe, but design so they can be swapped (e.g., via dependency injection).
    * Security: Follow best practices – use HTTPS, secure cookies for sessions, input validation, and rate limiting.
    * Performance: Optimize for small bundle sizes; use lazy loading for non-core components.
    * Testing: Include unit/integration tests for each module using Jest/Vitest.
    * Documentation: Each module should have a README.md with usage examples.
Development Workflow
1. Setup Base Project:
    * Initialize a Next.js project: npx create-next-app@latest my-saas-template --typescript.
    * Install dependencies: npm install supabase/supabase-js stripe tailwindcss postcss autoprefixer @supabase/auth-ui-react.
    * Configure Tailwind: Follow official setup.
    * Set up environment variables: .env.local with SUPABASE_URL, SUPABASE_ANON_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.
    * Create a root README.md for the entire template, explaining setup, modules, and extension.
2. Abstraction Layers:
    * Database Abstraction: Create an interface IDatabaseProvider with methods like query(table: string, filters: any), insert(table: string, data: any), etc. Implement SupabaseDatabaseProvider that uses @supabase/supabase-js.
    * Auth Abstraction: Interface IAuthProvider with signUp, signIn, signOut, getUser, etc. Implement SupabaseAuthProvider.
    * Payment Abstraction: Interface IPaymentProvider with createSubscription, cancelSubscription, handleWebhook, etc. Implement StripePaymentProvider.
    * Use a config file or context to inject providers (e.g., via React Context or a singleton).
3. Modular Structure:
    * Project directory: /src
    *   /abstractions    # Interfaces and providers for DB, Auth, Payments
    *   /modules         # Core features (user mgmt, permissions, etc.)
    *   /components      # Reusable UI components (e.g., buttons, modals)
    *   /pages           # Next.js pages, modularized (e.g., /admin, /profile)
    *   /api             # API routes (e.g., for webhooks, protected endpoints)
    *   /utils           # Helpers, constants
    *   /tests           # Tests for modules
    * 
    * Each module in /modules should be self-contained: index.ts for exports, types.ts, services.ts, components.ts if UI-related.
    * For extensions: Each module should expose hooks like useExtendUserProfile(customFields: any) or config objects.
4. UI Design Principles:
    * Pages should be composable: Use layouts (e.g., AdminLayout, UserLayout) with slots for custom content.
    * Design for extension: Include props like extraSections: ReactNode[] for adding custom UI elements.
    * Responsiveness: Ensure mobile-friendly with Tailwind.
    * Accessibility: Use ARIA attributes where needed.
    * Theming: Support light/dark mode via Tailwind.
5. Security and Best Practices:
    * Auth: Use Supabase’s auth with JWT; protect routes with middleware.
    * Permissions: Implement role-based access (e.g., admin, user) via database fields.
    * Webhooks: Secure Stripe webhooks with signature verification.
    * Data Validation: Use Zod for schemas.
    * Error Handling: Centralized error boundaries in React.
    * Logging: Console for dev; integrate Sentry later if needed.
6. Building Modules Independently:
    * Agents should focus on one module at a time, using the provided feature descriptions.
    * Each module must integrate with abstractions (not directly with Supabase/Stripe).
    * Test isolation: Mock providers for tests.
    * After building, ensure modules can be imported/exported cleanly.
7. Extension Setup:
    * For admin panel and user profile: Include placeholders like // Extension point: Add custom admin tabs here.
    * Allow overriding providers via config: e.g., appConfig.providers.database = new CustomDBProvider();.
8. Final Checks:
    * Ensure the template runs locally: npm run dev.
    * Verify modularity: Comment out a module and ensure the rest works.
    * Document how to extend: e.g., “To add a new feature, create a module and plug it into the admin panel via config.”
Focus on these instructions to stay aligned. Do not deviate into unrelated features unless explicitly needed for core functionality.

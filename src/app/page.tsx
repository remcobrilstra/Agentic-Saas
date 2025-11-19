import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Header } from '@/components';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Unified Header */}
      <Header showDashboardLink={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Modular microSaaS Template
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A reusable foundation for building microSaaS applications with
            abstracted auth, database, and payment providers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>🏗️ Modular Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Built with independent modules that can be easily extended or
                replaced. Each module has its own exports, tests, and
                documentation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔐 Auth Abstraction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Authentication is abstracted behind IAuthProvider. Currently
                using Supabase, but can be easily swapped for any auth
                provider.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💳 Payment Abstraction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Payment processing through IPaymentProvider. Currently using
                Stripe, but designed for easy replacement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🗄️ Database Abstraction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Database operations via IDatabaseProvider. Currently using
                Supabase, but any database can be plugged in.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎨 Tailwind CSS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Rapid UI development with Tailwind CSS. Includes reusable
                components and responsive layouts.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔒 Role-Based Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Built-in permissions module with role-based access control for
                admin, user, and guest roles.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <h2 className="text-2xl font-bold text-card-foreground mb-4">
            Architecture Overview
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">📁 Directory Structure:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code className="bg-muted px-2 py-1 rounded">/src/abstractions</code> - Provider interfaces and implementations</li>
                <li><code className="bg-muted px-2 py-1 rounded">/src/modules</code> - Core features (user management, permissions)</li>
                <li><code className="bg-muted px-2 py-1 rounded">/src/components</code> - Reusable UI components</li>
                <li><code className="bg-muted px-2 py-1 rounded">/src/layouts</code> - Page layouts (AdminLayout, UserLayout)</li>
                <li><code className="bg-muted px-2 py-1 rounded">/src/utils</code> - Helper functions and constants</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">🚀 Getting Started:</h3>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Copy <code className="bg-muted px-2 py-1 rounded">.env.example</code> to <code className="bg-muted px-2 py-1 rounded">.env.local</code></li>
                <li>Add your Supabase and Stripe credentials</li>
                <li>Run <code className="bg-muted px-2 py-1 rounded">npm run dev</code> to start development</li>
                <li>Extend modules or add new ones as needed</li>
              </ol>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="https://github.com/remcobrilstra/Agentic-Saas"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

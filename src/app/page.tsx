import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Login link */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">microSaaS</h2>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link 
                href="/auth/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Modular microSaaS Template
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Architecture Overview
          </h2>
          <div className="space-y-4 text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📁 Directory Structure:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code className="bg-gray-100 px-2 py-1 rounded">/src/abstractions</code> - Provider interfaces and implementations</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">/src/modules</code> - Core features (user management, permissions)</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">/src/components</code> - Reusable UI components</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">/src/layouts</code> - Page layouts (AdminLayout, UserLayout)</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">/src/utils</code> - Helper functions and constants</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🚀 Getting Started:</h3>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Copy <code className="bg-gray-100 px-2 py-1 rounded">.env.example</code> to <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code></li>
                <li>Add your Supabase and Stripe credentials</li>
                <li>Run <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code> to start development</li>
                <li>Extend modules or add new ones as needed</li>
              </ol>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="https://github.com/remcobrilstra/Agentic-Saas"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

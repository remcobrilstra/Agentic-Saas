# Authentication Module

This module provides authentication functionality using the abstraction layer, allowing for easy provider replacement.

## Features

- Email/password authentication
- OAuth sign-in (Google, Microsoft, Apple)
- Multi-Factor Authentication (MFA) with TOTP
- User registration with automatic role assignment
- Password reset functionality
- Profile management

## Usage

### AuthService

The `AuthService` class provides all authentication operations:

```typescript
import { AuthService } from '@/modules/auth';

const authService = new AuthService();

// Register a new user
const user = await authService.register({
  email: 'user@example.com',
  password: 'securepassword',
  firstName: 'John',
  lastName: 'Doe',
});

// Login with email/password
const user = await authService.login({
  email: 'user@example.com',
  password: 'securepassword',
});

// Login with OAuth
const { url } = await authService.loginWithOAuth('google');
// Redirect user to the URL

// Get current user
const currentUser = await authService.getCurrentUser();

// Logout
await authService.logout();

// Request password reset
await authService.requestPasswordReset('user@example.com');
```

### React Context

Use the `AuthContext` for state management in your React components:

```typescript
import { useAuth, useUser } from '@/contexts';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Or just get the user
  const user = useUser();
  
  // Login
  await login('user@example.com', 'password');
  
  // Logout
  await logout();
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.email}</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

## Default Role

All new users are automatically assigned the `'user'` role. The role is stored in the user's metadata and can be used for authorization checks.

## OAuth Providers

The following OAuth providers are supported:
- Google
- Microsoft (Azure AD)
- Apple

To enable OAuth providers, you need to configure them in your Supabase dashboard:
1. Go to Authentication > Providers
2. Enable and configure each provider
3. Set the redirect URL to `{YOUR_APP_URL}/auth/callback`

## Multi-Factor Authentication (MFA)

MFA can be enabled by users on their profile page. The implementation uses TOTP (Time-based One-Time Password) which works with authenticator apps like:
- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password

### MFA Flow

1. User clicks "Enable 2FA" on profile page
2. QR code is displayed for scanning with authenticator app
3. User enters verification code from app
4. MFA is enabled and required for future logins

## Email Verification

Supabase automatically sends email verification when users sign up. You can configure the email template in your Supabase dashboard.

## Protected Routes

Pages that require authentication should check the auth state and redirect if not authenticated:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';

export default function ProtectedPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  return <div>Protected content</div>;
}
```

## Extension Points

The authentication module is built on the abstraction layer, making it easy to:

1. **Replace the auth provider**: Implement `IAuthProvider` with a different backend
2. **Add custom user fields**: Extend the `metadata` object in signup
3. **Add custom authentication flows**: Extend `AuthService` with new methods
4. **Customize UI components**: The login/register pages are separate components

## Testing

To test authentication without a real Supabase instance, mock the auth provider:

```typescript
import { initializeConfig } from '@/abstractions/config';

const mockAuth = {
  signUp: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getUser: jest.fn(),
  // ... other methods
};

initializeConfig({
  providers: {
    auth: mockAuth,
    // ... other providers
  },
});
```

## Security Considerations

- Passwords are never stored in plain text (handled by Supabase)
- Sessions use JWT tokens with expiration
- MFA adds an extra layer of security
- OAuth reduces password exposure
- Email verification prevents unauthorized registrations
- All API calls use HTTPS in production

## Environment Variables

Required environment variables (set in `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

/**
 * Application Constants
 */

export const APP_NAME = 'microSaaS Template';
export const APP_VERSION = '0.1.0';

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
} as const;

export const DEFAULT_USER_ROLE = ROLES.USER;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  INCOMPLETE: 'incomplete',
  TRIALING: 'trialing',
} as const;

export const API_ROUTES = {
  AUTH: {
    SIGN_UP: '/api/auth/signup',
    SIGN_IN: '/api/auth/signin',
    SIGN_OUT: '/api/auth/signout',
    REFRESH: '/api/auth/refresh',
  },
  USERS: {
    LIST: '/api/users',
    GET: (id: string) => `/api/users/${id}`,
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
  },
  PAYMENTS: {
    WEBHOOK: '/api/payments/webhook',
    CREATE_CHECKOUT: '/api/payments/checkout',
    CREATE_PORTAL: '/api/payments/portal',
  },
} as const;

/**
 * Permissions Module Types
 */

export type Role = 'admin' | 'user' | 'guest';

export type Permission = 
  | 'user:read'
  | 'user:write'
  | 'user:delete'
  | 'admin:access'
  | 'subscription:manage';

export interface RolePermissions {
  [role: string]: Permission[];
}

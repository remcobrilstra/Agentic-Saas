/**
 * Permissions Service
 * 
 * Provides role-based access control functionality.
 */

import { Role, Permission, RolePermissions } from './types';

const DEFAULT_PERMISSIONS: RolePermissions = {
  admin: ['user:read', 'user:write', 'user:delete', 'admin:access', 'subscription:manage'],
  user: ['user:read', 'subscription:manage'],
  guest: ['user:read'],
};

export class PermissionsService {
  private permissions: RolePermissions;

  constructor(customPermissions?: RolePermissions) {
    this.permissions = customPermissions || DEFAULT_PERMISSIONS;
  }

  /**
   * Check if a role has a specific permission
   */
  hasPermission(role: Role, permission: Permission): boolean {
    const rolePermissions = this.permissions[role] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Get all permissions for a role
   */
  getRolePermissions(role: Role): Permission[] {
    return this.permissions[role] || [];
  }

  /**
   * Add a permission to a role
   */
  addPermission(role: Role, permission: Permission): void {
    if (!this.permissions[role]) {
      this.permissions[role] = [];
    }
    if (!this.permissions[role].includes(permission)) {
      this.permissions[role].push(permission);
    }
  }

  /**
   * Remove a permission from a role
   */
  removePermission(role: Role, permission: Permission): void {
    if (this.permissions[role]) {
      this.permissions[role] = this.permissions[role].filter(p => p !== permission);
    }
  }

  /**
   * Check if a user has access to a resource
   */
  async checkAccess(_userId: string, _permission: Permission): Promise<boolean> {
    // In a real implementation, this would fetch the user's role from the database
    // For now, we'll return true for demonstration
    // This is an extension point where you can add custom logic
    return true;
  }
}

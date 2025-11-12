/**
 * usePermission Hook
 * 
 * Hook to check if the current user has a specific permission based on their role.
 */

'use client';

import { useAuth } from '@/contexts';
import { PermissionsService } from '@/modules/permissions';
import { Permission, Role } from '@/modules/permissions/types';

const permissionsService = new PermissionsService();

export function usePermission(permission: Permission): boolean {
  const { user } = useAuth();
  
  if (!user) {
    return false;
  }
  
  const role = user.role as Role;
  return permissionsService.hasPermission(role, permission);
}

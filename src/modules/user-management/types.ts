/**
 * User Management Module Types
 */

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface UpdateProfileParams {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface CreateUserParams {
  email: string;
  password: string;
  role?: string;
  firstName?: string;
  lastName?: string;
}

'use client';

/**
 * User Form Component
 * 
 * Form for creating and editing users.
 */

import React, { useState, useEffect } from 'react';
import { Input, Button } from '@/components';

export interface UserFormData {
  email: string;
  password?: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export function UserForm({ initialData, onSubmit, onCancel, isEditing = false }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    email: initialData?.email || '',
    password: '',
    role: initialData?.role || 'user',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email || '',
        password: '',
        role: initialData.role || 'user',
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
      });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isEditing && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
        disabled={isEditing}
        required
      />

      {!isEditing && (
        <Input
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={errors.password}
          required
        />
      )}

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1">
          Role
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => handleChange('role', e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground bg-background"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && <p className="mt-1 text-sm text-destructive">{errors.role}</p>}
      </div>

      <Input
        label="First Name"
        type="text"
        value={formData.firstName}
        onChange={(e) => handleChange('firstName', e.target.value)}
      />

      <Input
        label="Last Name"
        type="text"
        value={formData.lastName}
        onChange={(e) => handleChange('lastName', e.target.value)}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
}

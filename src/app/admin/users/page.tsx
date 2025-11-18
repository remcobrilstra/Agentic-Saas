'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/layouts';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal, UserForm, UserFormData } from '@/components';
import { useAuth } from '@/contexts';
import { usePermission } from '@/hooks';
import { UserManagementService } from '@/modules/user-management';
import { UserProfile } from '@/modules/user-management/types';

// Helper function to format dates
const formatDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return '-';
    }
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '-';
  }
};

export default function UsersManagement() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const hasAdminAccess = usePermission('admin:access');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const projectKey = supabaseUrl ? supabaseUrl.split('https://')[1]?.split('.supabase.co')[0] || '' : '';

  // State for users data
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  
  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    const userService = new UserManagementService();
    try {
      setIsLoadingUsers(true);
      setError(null);
      
      const result = await userService.listUsersWithPagination({
        page: currentPage,
        pageSize,
        search: searchDebounce || undefined,
      });
      
      setUsers(result.data);
      setTotalPages(result.totalPages);
      setTotalUsers(result.total);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [currentPage, pageSize, searchDebounce]);

  // Fetch users when dependencies change
  useEffect(() => {
    if (isAuthenticated && hasAdminAccess) {
      fetchUsers();
    }
  }, [isAuthenticated, hasAdminAccess, fetchUsers]);

  // Redirect if not authenticated or doesn't have admin access
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/admin/users');
    } else if (!isLoading && isAuthenticated && !hasAdminAccess) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, hasAdminAccess, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or no admin access
  if (!isAuthenticated || !hasAdminAccess) {
    return null;
  }

  // Handle create user
  const handleCreateUser = async (data: UserFormData) => {
    const userService = new UserManagementService();
    try {
      if (!data.password) {
        throw new Error('Password is required');
      }
      
      await userService.createUser({
        email: data.email,
        password: data.password,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      
      setIsCreateModalOpen(false);
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error creating user:', err);
      alert('Failed to create user. Please try again.');
      throw err;
    }
  };

  // Handle edit user
  const handleEditUser = async (data: UserFormData) => {
    if (!selectedUser) return;
    
    const userService = new UserManagementService();
    try {
      await userService.updateProfile(selectedUser.id, {
        firstName: data.firstName,
        lastName: data.lastName,
      });
      
      setIsEditModalOpen(false);
      setSelectedUser(null);
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user. Please try again.');
      throw err;
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    const userService = new UserManagementService();
    try {
      await userService.deleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user. Please try again.');
    }
  };

  // Open edit modal
  const openEditModal = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">
              Manage user accounts, roles, and permissions.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              Add New User
            </Button>
            <a
              href={`https://supabase.com/dashboard/project/${projectKey}/auth/users?sortBy=id`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Manage in Supabase
            </a>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Users ({totalUsers})</CardTitle>
              <div className="flex items-center gap-4">
                <Input
                  type="text"
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            
            {isLoadingUsers ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-600">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No users found. {searchQuery && 'Try adjusting your search.'}
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-gray-900">{user.email}</td>
                        <td className="py-4 px-4 text-gray-600">
                          {user.firstName || user.lastName 
                            ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                            : '-'}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => openEditModal(user)}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="danger"
                              onClick={() => openDeleteModal(user)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2 px-4">
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New User"
      >
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setIsCreateModalOpen(false)}
          isEditing={false}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        title="Edit User"
      >
        {selectedUser && (
          <UserForm
            initialData={{
              email: selectedUser.email,
              role: selectedUser.role,
              firstName: selectedUser.firstName,
              lastName: selectedUser.lastName,
            }}
            onSubmit={handleEditUser}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
            }}
            isEditing={true}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        title="Delete User"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteUser}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to delete user{' '}
          <strong>{selectedUser?.email}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </AdminLayout>
  );
}

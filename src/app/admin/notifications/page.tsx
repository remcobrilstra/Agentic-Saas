/**
 * Admin Notifications Management Page
 * 
 * CRUD interface for notification types
 */

'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/layouts';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Spinner, Badge, Alert } from '@/components';
import { NotificationType } from '@/modules/notifications';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<NotificationType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabledByDefault: true,
    channel: 'email' as 'email' | 'sms' | 'push',
    category: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/notifications');
      const data = await response.json();
      setNotifications(data.notificationTypes || []);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (notification?: NotificationType) => {
    if (notification) {
      setEditingNotification(notification);
      setFormData({
        name: notification.name,
        description: notification.description || '',
        enabledByDefault: notification.enabledByDefault,
        channel: notification.channel,
        category: notification.category,
      });
    } else {
      setEditingNotification(null);
      setFormData({
        name: '',
        description: '',
        enabledByDefault: true,
        channel: 'email',
        category: '',
      });
    }
    setIsModalOpen(true);
    setError('');
    setMessage('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNotification(null);
    setFormData({
      name: '',
      description: '',
      enabledByDefault: true,
      channel: 'email',
      category: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (editingNotification) {
        // Update existing
        const response = await fetch(`/api/admin/notifications/${editingNotification.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to update notification type');
        }

        setMessage('Notification type updated successfully');
      } else {
        // Create new
        const response = await fetch('/api/admin/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to create notification type');
        }

        setMessage('Notification type created successfully');
      }

      await loadNotifications();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification type?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification type');
      }

      setMessage('Notification type deleted successfully');
      await loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notification Types</h1>
            <p className="text-gray-600 mt-2">
              Manage notification types for the application
            </p>
          </div>
          <Button onClick={() => handleOpenModal()} variant="primary">
            Add Notification Type
          </Button>
        </div>

        {message && (
          <Alert variant="success">
            {message}
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <Spinner size="lg" className="mb-4" />
            <p className="text-muted-foreground mt-4">Loading...</p>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Notification Types</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No notification types found. Create one to get started.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Channel
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Default
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {notifications.map((notification) => (
                        <tr key={notification.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {notification.name}
                              </div>
                              {notification.description && (
                                <div className="text-sm text-gray-500">
                                  {notification.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              {notification.category}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {notification.channel}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {notification.enabledByDefault ? (
                              <Badge variant="success">
                                Enabled
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                Disabled
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleOpenModal(notification)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingNotification ? 'Edit Notification Type' : 'Add Notification Type'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Name"
                  type="text"
                  placeholder="e.g., Account Updates"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of this notification"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <Input
                  label="Category"
                  type="text"
                  placeholder="e.g., Account, Marketing, Security"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Channel
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value as 'email' | 'sms' | 'push' })}
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="push">Push Notification</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enabledByDefault"
                    checked={formData.enabledByDefault}
                    onChange={(e) => setFormData({ ...formData, enabledByDefault: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enabledByDefault" className="ml-2 block text-sm text-gray-700">
                    Enabled by default
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="secondary" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingNotification ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

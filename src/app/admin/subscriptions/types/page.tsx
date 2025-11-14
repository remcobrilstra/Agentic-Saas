'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/layouts';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components';
import { useAuth } from '@/contexts';
import { usePermission } from '@/hooks';
import { SubscriptionsService, SubscriptionType, CreateSubscriptionTypeInput } from '@/modules/subscriptions';

const subscriptionsService = new SubscriptionsService();

export default function AdminSubscriptionTypesPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const hasAdminAccess = usePermission('admin:access');
  const [subscriptionTypes, setSubscriptionTypes] = useState<SubscriptionType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingType, setEditingType] = useState<SubscriptionType | null>(null);
  const [formData, setFormData] = useState<CreateSubscriptionTypeInput>({
    name: '',
    description: '',
    marketing_points: [],
    feature_flags: {},
    quota_limits: {},
    price_monthly: 0,
    price_annual: 0,
    stripe_monthly_id: '',
    stripe_annual_id: '',
  });
  const [marketingPoint, setMarketingPoint] = useState('');
  const [featureFlagKey, setFeatureFlagKey] = useState('');
  const [featureFlagValue, setFeatureFlagValue] = useState(true);
  const [quotaLimitKey, setQuotaLimitKey] = useState('');
  const [quotaLimitValue, setQuotaLimitValue] = useState(0);

  // Redirect if not authenticated or doesn't have admin access
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/admin/subscriptions/types');
    } else if (!isLoading && isAuthenticated && !hasAdminAccess) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, hasAdminAccess, router]);

  // Fetch subscription types
  const fetchTypes = async () => {
    try {
      const types = await subscriptionsService.getSubscriptionTypes();
      setSubscriptionTypes(types);
    } catch (error) {
      console.error('Failed to fetch subscription types:', error);
    } finally {
      setIsLoadingTypes(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && hasAdminAccess) {
      fetchTypes();
    }
  }, [isAuthenticated, hasAdminAccess]);

  const handleCreateType = async () => {
    try {
      await subscriptionsService.createSubscriptionType(formData);
      setShowCreateModal(false);
      resetForm();
      await fetchTypes();
    } catch (error) {
      console.error('Failed to create subscription type:', error);
      alert('Failed to create subscription type');
    }
  };

  const handleEditType = async () => {
    if (!editingType) return;
    try {
      await subscriptionsService.updateSubscriptionType(editingType.id, formData);
      setShowEditModal(false);
      setEditingType(null);
      resetForm();
      await fetchTypes();
    } catch (error) {
      console.error('Failed to update subscription type:', error);
      alert('Failed to update subscription type');
    }
  };

  const handleDeleteType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription type?')) return;
    try {
      await subscriptionsService.deleteSubscriptionType(id);
      await fetchTypes();
    } catch (error) {
      console.error('Failed to delete subscription type:', error);
      alert('Failed to delete subscription type');
    }
  };

  const openEditModal = (type: SubscriptionType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      marketing_points: type.marketing_points || [],
      feature_flags: type.feature_flags,
      quota_limits: type.quota_limits,
      price_monthly: type.price_monthly || 0,
      price_annual: type.price_annual || 0,
      stripe_monthly_id: type.stripe_monthly_id || '',
      stripe_annual_id: type.stripe_annual_id || '',
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      marketing_points: [],
      feature_flags: {},
      quota_limits: {},
      price_monthly: 0,
      price_annual: 0,
      stripe_monthly_id: '',
      stripe_annual_id: '',
    });
    setMarketingPoint('');
    setFeatureFlagKey('');
    setFeatureFlagValue(true);
    setQuotaLimitKey('');
    setQuotaLimitValue(0);
  };

  const addMarketingPoint = () => {
    if (marketingPoint.trim()) {
      setFormData({
        ...formData,
        marketing_points: [...(formData.marketing_points || []), marketingPoint.trim()],
      });
      setMarketingPoint('');
    }
  };

  const removeMarketingPoint = (index: number) => {
    setFormData({
      ...formData,
      marketing_points: (formData.marketing_points || []).filter((_, i) => i !== index),
    });
  };

  const addFeatureFlag = () => {
    if (featureFlagKey.trim()) {
      setFormData({
        ...formData,
        feature_flags: { ...formData.feature_flags, [featureFlagKey.trim()]: featureFlagValue },
      });
      setFeatureFlagKey('');
      setFeatureFlagValue(true);
    }
  };

  const removeFeatureFlag = (key: string) => {
    const newFlags = { ...formData.feature_flags };
    delete newFlags[key];
    setFormData({ ...formData, feature_flags: newFlags });
  };

  const addQuotaLimit = () => {
    if (quotaLimitKey.trim()) {
      setFormData({
        ...formData,
        quota_limits: { ...formData.quota_limits, [quotaLimitKey.trim()]: quotaLimitValue },
      });
      setQuotaLimitKey('');
      setQuotaLimitValue(0);
    }
  };

  const removeQuotaLimit = (key: string) => {
    const newLimits = { ...formData.quota_limits };
    delete newLimits[key];
    setFormData({ ...formData, quota_limits: newLimits });
  };

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

  const ModalForm = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      <Input
        label="Name"
        type="text"
        placeholder="Pro Plan"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
          placeholder="Perfect for professionals"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Monthly Price ($)"
          type="number"
          step="0.01"
          placeholder="29.00"
          value={formData.price_monthly || ''}
          onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) || 0 })}
        />
        <Input
          label="Annual Price ($)"
          type="number"
          step="0.01"
          placeholder="290.00"
          value={formData.price_annual || ''}
          onChange={(e) => setFormData({ ...formData, price_annual: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Stripe Monthly ID"
          type="text"
          placeholder="price_xxx_monthly"
          value={formData.stripe_monthly_id || ''}
          onChange={(e) => setFormData({ ...formData, stripe_monthly_id: e.target.value })}
        />
        <Input
          label="Stripe Annual ID"
          type="text"
          placeholder="price_xxx_annual"
          value={formData.stripe_annual_id || ''}
          onChange={(e) => setFormData({ ...formData, stripe_annual_id: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Marketing Points</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Add a feature point"
            value={marketingPoint}
            onChange={(e) => setMarketingPoint(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMarketingPoint())}
          />
          <Button variant="secondary" onClick={addMarketingPoint}>Add</Button>
        </div>
        <div className="space-y-1">
          {(formData.marketing_points || []).map((point, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-sm">{point}</span>
              <button onClick={() => removeMarketingPoint(idx)} className="text-red-600 text-sm">Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Feature Flags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            placeholder="feature_name"
            value={featureFlagKey}
            onChange={(e) => setFeatureFlagKey(e.target.value)}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={featureFlagValue ? 'true' : 'false'}
            onChange={(e) => setFeatureFlagValue(e.target.value === 'true')}
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
          <Button variant="secondary" onClick={addFeatureFlag}>Add</Button>
        </div>
        <div className="space-y-1">
          {Object.entries(formData.feature_flags).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-sm">{key}: {value ? 'Enabled' : 'Disabled'}</span>
              <button onClick={() => removeFeatureFlag(key)} className="text-red-600 text-sm">Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quota Limits</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            placeholder="quota_name"
            value={quotaLimitKey}
            onChange={(e) => setQuotaLimitKey(e.target.value)}
          />
          <input
            type="number"
            className="w-24 px-3 py-2 border border-gray-300 rounded-md"
            placeholder="1000"
            value={quotaLimitValue}
            onChange={(e) => setQuotaLimitValue(parseInt(e.target.value) || 0)}
          />
          <Button variant="secondary" onClick={addQuotaLimit}>Add</Button>
        </div>
        <div className="space-y-1">
          {Object.entries(formData.quota_limits).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-sm">{key}: {value}</span>
              <button onClick={() => removeQuotaLimit(key)} className="text-red-600 text-sm">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Types</h1>
            <p className="text-gray-600 mt-2">
              Manage subscription plans and pricing.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => router.push('/admin/subscriptions')}>
              ← Back to Subscriptions
            </Button>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Add Subscription Type
            </Button>
          </div>
        </div>

        {isLoadingTypes ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Loading subscription types...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subscriptionTypes.map((type) => (
              <Card key={type.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{type.name}</CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => openEditModal(type)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteType(type.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                      <p className="text-sm text-gray-600">{type.description || 'No description'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Pricing</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Monthly: </span>
                          <span className="font-medium">${type.price_monthly?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Annual: </span>
                          <span className="font-medium">${type.price_annual?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    </div>

                    {type.marketing_points && type.marketing_points.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Features</h4>
                        <ul className="space-y-1">
                          {type.marketing_points.map((point, idx) => (
                            <li key={idx} className="flex items-start text-sm text-gray-600">
                              <svg
                                className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Feature Flags</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(type.feature_flags).map(([key, value]) => (
                          <span
                            key={key}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              value
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {key}: {value ? 'Yes' : 'No'}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Quota Limits</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(type.quota_limits).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-600">{key}: </span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoadingTypes && subscriptionTypes.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">No subscription types found.</p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create Your First Subscription Type
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4">Create Subscription Type</h2>
              <ModalForm />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => { setShowCreateModal(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleCreateType}>
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4">Edit Subscription Type</h2>
              <ModalForm />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => { setShowEditModal(false); setEditingType(null); resetForm(); }}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleEditType}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

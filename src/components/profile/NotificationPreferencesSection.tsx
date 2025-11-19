/**
 * Notification Preferences Section
 * 
 * Displays and manages user notification preferences
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components';
import { UserNotificationPreference } from '@/modules/notifications';

interface NotificationPreferencesSectionProps {
  userId: string;
}

export function NotificationPreferencesSection({ userId }: NotificationPreferencesSectionProps) {
  const [preferences, setPreferences] = useState<UserNotificationPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/notification-preferences?userId=${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load preferences');
      }
      
      setPreferences(data.preferences || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (notificationId: string, currentValue: boolean) => {
    // Optimistically update UI
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.notificationType.id === notificationId
          ? { ...pref, enabled: !currentValue }
          : pref
      )
    );
    
    setUpdatingIds((prev) => new Set(prev).add(notificationId));

    try {
      const response = await fetch('/api/user/notification-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          notificationId,
          preference: !currentValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preference');
      }
    } catch (err) {
      // Revert on error
      setPreferences((prev) =>
        prev.map((pref) =>
          pref.notificationType.id === notificationId
            ? { ...pref, enabled: currentValue }
            : pref
        )
      );
      setError(err instanceof Error ? err.message : 'Failed to update preference');
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    }
  };

  // Group preferences by category
  const groupedPreferences = preferences.reduce((acc, pref) => {
    const category = pref.notificationType.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(pref);
    return acc;
  }, {} as Record<string, UserNotificationPreference[]>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-2">Loading preferences...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {preferences.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No notification types configured yet.
          </p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPreferences).map(([category, categoryPrefs]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="space-y-4">
                  {categoryPrefs.map((pref) => (
                    <div
                      key={pref.notificationType.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {pref.notificationType.name}
                        </p>
                        {pref.notificationType.description && (
                          <p className="text-sm text-muted-foreground">
                            {pref.notificationType.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          via {pref.notificationType.channel}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={pref.enabled}
                          onChange={() =>
                            handleToggle(pref.notificationType.id, pref.enabled)
                          }
                          disabled={updatingIds.has(pref.notificationType.id)}
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-primary-foreground after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary-foreground after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

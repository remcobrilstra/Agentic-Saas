/**
 * User Notification Preferences API
 * 
 * Get and update user notification preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/modules/notifications';

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from session/auth
    // For now, we'll get it from query params
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const preferences = await NotificationService.getUserNotificationPreferences(userId);
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Get user ID from session/auth
    const body = await request.json();
    const { userId, notificationId, preference } = body;
    
    if (!userId || !notificationId || preference === undefined) {
      return NextResponse.json(
        { error: 'userId, notificationId, and preference are required' },
        { status: 400 }
      );
    }
    
    const updatedPreference = await NotificationService.setUserNotificationPreference(
      userId,
      notificationId,
      preference
    );
    
    return NextResponse.json({ preference: updatedPreference });
  } catch (error) {
    console.error('Error updating notification preference:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preference' },
      { status: 500 }
    );
  }
}

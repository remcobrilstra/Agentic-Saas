/**
 * Admin Notification Types API
 * 
 * CRUD operations for notification types (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/modules/notifications';

export async function GET() {
  try {
    const notificationTypes = await NotificationService.getAllNotificationTypes();
    return NextResponse.json({ notificationTypes });
  } catch (error) {
    console.error('Error fetching notification types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification types' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin auth check here
    const body = await request.json();
    
    const notificationType = await NotificationService.createNotificationType({
      name: body.name,
      description: body.description,
      enabledByDefault: body.enabledByDefault,
      channel: body.channel || 'email',
      category: body.category,
    });
    
    return NextResponse.json({ notificationType }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification type:', error);
    return NextResponse.json(
      { error: 'Failed to create notification type' },
      { status: 500 }
    );
  }
}

/**
 * Admin Single Notification Type API
 * 
 * Get, update, and delete individual notification types (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/modules/notifications';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notificationType = await NotificationService.getNotificationTypeById(id);
    
    if (!notificationType) {
      return NextResponse.json(
        { error: 'Notification type not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ notificationType });
  } catch (error) {
    console.error('Error fetching notification type:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification type' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add admin auth check here
    const { id } = await params;
    const body = await request.json();
    
    const notificationType = await NotificationService.updateNotificationType(id, {
      name: body.name,
      description: body.description,
      enabledByDefault: body.enabledByDefault,
      channel: body.channel,
      category: body.category,
    });
    
    return NextResponse.json({ notificationType });
  } catch (error) {
    console.error('Error updating notification type:', error);
    return NextResponse.json(
      { error: 'Failed to update notification type' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add admin auth check here
    const { id } = await params;
    await NotificationService.deleteNotificationType(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification type:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification type' },
      { status: 500 }
    );
  }
}

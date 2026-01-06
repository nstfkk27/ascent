/**
 * n8n API: Chat Response Logging
 * Log automated chat responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateN8nApiKey } from '@/lib/n8n/auth';

export async function POST(request: NextRequest) {
  // Authenticate
  const authError = validateN8nApiKey(request);
  if (authError) return authError;

  try {
    const data = await request.json();

    const {
      platform,
      userId,
      userName,
      message,
      intent,
      response,
      automated = true,
      metadata = {},
    } = data;

    // Log the interaction
    // In production, you'd store this in a ChatLog table
    console.log('Chat interaction:', {
      platform,
      userId,
      userName,
      message,
      intent,
      response,
      automated,
      timestamp: new Date().toISOString(),
    });

    // TODO: Store in database
    // await prisma.chatLog.create({ ... })

    return NextResponse.json({
      success: true,
      logged: true,
      id: `CHAT-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }, { status: 201 });

  } catch (error) {
    console.error('n8n chat logging error:', error);
    return NextResponse.json(
      { error: 'Failed to log chat response' },
      { status: 500 }
    );
  }
}

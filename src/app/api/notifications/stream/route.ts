import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { notificationEvents } from '@/lib/notifications/events';

export const dynamic = 'force-dynamic';

// GET: SSE endpoint for real-time notifications
export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return new Response('Invalid token', { status: 401 });
  }

  const userId = payload.userId;
  const userType = payload.role === 'customer' ? 'customer' : 'user';

  console.log(`[SSE] New connection: ${userType}:${userId}`);

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial connection message
      const connectMessage = `data: ${JSON.stringify({ type: 'connected', userId, userType })}\n\n`;
      controller.enqueue(encoder.encode(connectMessage));

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`;
          controller.enqueue(encoder.encode(heartbeat));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Subscribe to notification events
      const unsubscribe = notificationEvents.subscribe(userType, userId, (event) => {
        try {
          const message = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(message));
          console.log(`[SSE] Sent notification to ${userType}:${userId}`);
        } catch (error) {
          console.error('[SSE] Error sending notification:', error);
        }
      });

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        console.log(`[SSE] Client disconnected: ${userType}:${userId}`);
        clearInterval(heartbeatInterval);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

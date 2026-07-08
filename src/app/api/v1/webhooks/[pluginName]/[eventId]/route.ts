import { NextRequest, NextResponse } from 'next/server';
import { networkService } from '@/core/services/NetworkService';

/**
 * POST /api/v1/webhooks/:pluginName/:eventId
 * 
 * Receives inbound webhooks and forwards them to the plugin's registered handler.
 * 
 * Headers:
 *   X-Webhook-Signature: HMAC-SHA256 signature (optional, verified if webhookSecret is configured)
 * 
 * Body: Any JSON payload
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pluginName: string; eventId: string }> }
) {
  try {
    const { pluginName, eventId } = await params;
    const signature = request.headers.get('x-webhook-signature') || undefined;

    // Check content length
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 512 * 1024) {
      return NextResponse.json(
        { error: 'Payload too large (max 512KB)' },
        { status: 413 }
      );
    }

    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const result = await networkService.receiveWebhook(pluginName, eventId, payload, signature);

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    const status = err.statusCode || 500;
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    return NextResponse.json(
      { error: err.message, code },
      { status }
    );
  }
}

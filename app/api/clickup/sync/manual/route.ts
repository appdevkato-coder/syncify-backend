import { NextResponse, NextRequest } from 'next/server';

const LIMIT = 2; // max calls
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const GAP_MS = 60 * 60 * 1000; // 1 hour mandatory gap

const rateLimitMap = new Map<string, { history: number[] }>();

export async function POST(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
  const now = Date.now();
  
  let userData = rateLimitMap.get(ip) || { history: [] };
  
  // Clean up history
  userData.history = userData.history.filter(ts => now - ts < WINDOW_MS);

  // Rule 1: 1 Hour Gap Check
  if (userData.history.length > 0) {
    const lastSync = Math.max(...userData.history);
    const timeSinceLast = now - lastSync;
    if (timeSinceLast < GAP_MS) {
      const waitMinutes = Math.ceil((GAP_MS - timeSinceLast) / (60 * 1000));
      return NextResponse.json(
        { 
          message: `Mandatory cooldown: Please wait ${waitMinutes} minutes before the next sync.`,
          success: false,
          error: 'Rate limit (GAP) exceeded'
        },
        { status: 429 }
      );
    }
  }

  // Rule 2: 24h Quota Check
  if (userData.history.length >= LIMIT) {
    return NextResponse.json(
      { 
        message: 'Daily quota exhausted (Max 2 syncs per 24H).',
        success: false,
        error: 'Rate limit (QUOTA) exceeded'
      },
      { status: 429 }
    );
  }
  
  // Log the sync attempt
  userData.history.push(now);
  rateLimitMap.set(ip, userData);

  const targetUrl = 'https://xl62bf1am0.execute-api.ap-south-1.amazonaws.com/dev/clickup/sync/manual';

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(
      { 
        message: 'Manual sync triggered successfully',
        success: response.ok,
        data: data 
      },
      { status: response.status }
    );
  } catch (error) {
    console.error('Error triggering manual sync:', error);
    return NextResponse.json(
      { 
        message: 'Failed to trigger manual sync',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

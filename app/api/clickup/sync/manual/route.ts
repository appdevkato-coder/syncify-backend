import { NextResponse } from 'next/server';

export async function POST() {
  const targetUrl = process.env.CLICKUP_SYNC_URL;

  if (!targetUrl) {
    return NextResponse.json(
      { success: false, message: 'Sync URL not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // You can pass body if needed, but the original curl just shows a simple POST
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

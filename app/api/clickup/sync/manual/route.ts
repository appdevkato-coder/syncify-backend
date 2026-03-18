import { NextResponse } from 'next/server';

export async function POST() {
  const targetUrl = 'https://xl62bf1am0.execute-api.ap-south-1.amazonaws.com/dev/clickup/sync/manual';

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

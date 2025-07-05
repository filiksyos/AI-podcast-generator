import { NextRequest, NextResponse } from 'next/server';
import { getVoices } from '@/lib/elevenlabs';
import type { VoicesResponse } from '@/types/podcast';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching voices from ElevenLabs...');
    
    const voicesResponse: VoicesResponse = await getVoices();
    
    if (!voicesResponse.success) {
      console.error('Failed to fetch voices:', voicesResponse.error);
      return NextResponse.json(
        { 
          success: false, 
          error: voicesResponse.error || 'Failed to fetch voices',
          voices: []
        },
        { status: 500 }
      );
    }

    console.log(`Successfully fetched ${voicesResponse.voices.length} voices`);
    
    return NextResponse.json({
      success: true,
      voices: voicesResponse.voices,
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
    
  } catch (error) {
    console.error('Error in voices API route:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        voices: []
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 
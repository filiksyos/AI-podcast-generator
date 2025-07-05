import { NextRequest, NextResponse } from 'next/server';
import { generateSpeech } from '@/lib/elevenlabs';
import { validateText } from '@/lib/utils';
import type { PodcastRequest, PodcastResponse } from '@/types/podcast';

export async function POST(request: NextRequest) {
  try {
    const body: PodcastRequest = await request.json();
    
    const { text, voice_id, settings } = body;
    
    // Validate input
    if (!text) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Text content is required',
          voice_used: { voice_id: '', name: '', category: '' },
          settings_used: { stability: 0.5, similarity_boost: 0.5, style: 0, use_speaker_boost: false, speed: 1.0 }
        },
        { status: 400 }
      );
    }
    
    if (!voice_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Voice ID is required',
          voice_used: { voice_id: '', name: '', category: '' },
          settings_used: { stability: 0.5, similarity_boost: 0.5, style: 0, use_speaker_boost: false, speed: 1.0 }
        },
        { status: 400 }
      );
    }
    
    // Validate text content
    const textValidation = validateText(text);
    if (!textValidation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: textValidation.error,
          voice_used: { voice_id: voice_id, name: '', category: '' },
          settings_used: { stability: 0.5, similarity_boost: 0.5, style: 0, use_speaker_boost: false, speed: 1.0 }
        },
        { status: 400 }
      );
    }
    
    console.log(`Generating podcast for voice ${voice_id} with ${text.length} characters`);
    
    // Generate speech using ElevenLabs
    const podcastResponse: PodcastResponse = await generateSpeech(text, voice_id, settings);
    
    if (!podcastResponse.success) {
      console.error('Failed to generate podcast:', podcastResponse.error);
      return NextResponse.json(
        {
          success: false,
          error: podcastResponse.error || 'Failed to generate podcast',
          voice_used: podcastResponse.voice_used,
          settings_used: podcastResponse.settings_used
        },
        { status: 500 }
      );
    }
    
    console.log('Successfully generated podcast audio');
    
    return NextResponse.json({
      success: true,
      audio_data: podcastResponse.audio_data,
      voice_used: podcastResponse.voice_used,
      settings_used: podcastResponse.settings_used,
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    console.error('Error in generate-podcast API route:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        voice_used: { voice_id: '', name: '', category: '' },
        settings_used: { stability: 0.5, similarity_boost: 0.5, style: 0, use_speaker_boost: false, speed: 1.0 }
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 
import type { Voice, GenerationSettings, VoicesResponse, PodcastResponse } from "@/types/podcast";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io';

if (!ELEVENLABS_API_KEY) {
  console.warn('ELEVENLABS_API_KEY not found in environment variables');
}

class ElevenLabsError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ElevenLabsError';
  }
}

async function makeElevenLabsRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  if (!ELEVENLABS_API_KEY) {
    throw new ElevenLabsError('ElevenLabs API key not configured', 500, 'CONFIG_ERROR');
  }

  const url = `${ELEVENLABS_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail?.message || errorData.message || errorMessage;
    } catch {
      // If we can't parse the error response, use the default message
    }
    
    throw new ElevenLabsError(errorMessage, response.status, 'API_ERROR');
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response;
}

export async function getVoices(): Promise<VoicesResponse> {
  try {
    const data = await makeElevenLabsRequest('/v1/voices');
    
    const voices: Voice[] = data.voices.map((voice: any) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      category: voice.category || 'general',
      description: voice.description,
      preview_url: voice.preview_url,
      labels: voice.labels || {},
      settings: voice.settings && {
        stability: voice.settings.stability || 0.5,
        similarity_boost: voice.settings.similarity_boost || 0.5,
        style: voice.settings.style || 0,
        use_speaker_boost: voice.settings.use_speaker_boost || false,
      },
    }));
    
    return {
      voices,
      success: true,
    };
  } catch (error) {
    console.error('Error fetching voices:', error);
    
    if (error instanceof ElevenLabsError) {
      return {
        voices: [],
        success: false,
        error: error.message,
      };
    }
    
    return {
      voices: [],
      success: false,
      error: 'Failed to fetch voices from ElevenLabs',
    };
  }
}

export async function generateSpeech(
  text: string,
  voiceId: string,
  settings: Partial<GenerationSettings> = {}
): Promise<PodcastResponse> {
  try {
    if (!text || text.trim().length === 0) {
      throw new ElevenLabsError('Text content is required', 400, 'VALIDATION_ERROR');
    }

    if (!voiceId) {
      throw new ElevenLabsError('Voice ID is required', 400, 'VALIDATION_ERROR');
    }

    const defaultSettings: GenerationSettings = {
      stability: 0.5,
      similarity_boost: 0.5,
      style: 0,
      use_speaker_boost: false,
      speed: 1.0,
    };

    const finalSettings = { ...defaultSettings, ...settings };

    const requestBody = {
      text: text.trim(),
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: finalSettings.stability,
        similarity_boost: finalSettings.similarity_boost,
        style: finalSettings.style,
        use_speaker_boost: finalSettings.use_speaker_boost,
      },
    };

    const response = await makeElevenLabsRequest(
      `/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new ElevenLabsError('Failed to generate speech', response.status);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    // Get voice information for the response
    const voicesResponse = await getVoices();
    const voice = voicesResponse.voices.find(v => v.voice_id === voiceId) || {
      voice_id: voiceId,
      name: 'Unknown Voice',
      category: 'general',
    };

    return {
      audio_data: base64Audio,
      voice_used: voice,
      settings_used: finalSettings,
      success: true,
    };
  } catch (error) {
    console.error('Error generating speech:', error);
    
    if (error instanceof ElevenLabsError) {
      return {
        voice_used: {
          voice_id: voiceId,
          name: 'Unknown Voice',
          category: 'general',
        },
        settings_used: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0,
          use_speaker_boost: false,
          speed: 1.0,
        },
        success: false,
        error: error.message,
      };
    }
    
    return {
      voice_used: {
        voice_id: voiceId,
        name: 'Unknown Voice',
        category: 'general',
      },
      settings_used: {
        stability: 0.5,
        similarity_boost: 0.5,
        style: 0,
        use_speaker_boost: false,
        speed: 1.0,
      },
      success: false,
      error: 'Failed to generate speech',
    };
  }
}

export async function getVoiceDetails(voiceId: string): Promise<Voice | null> {
  try {
    const data = await makeElevenLabsRequest(`/v1/voices/${voiceId}`);
    
    return {
      voice_id: data.voice_id,
      name: data.name,
      category: data.category || 'general',
      description: data.description,
      preview_url: data.preview_url,
      labels: data.labels || {},
      settings: data.settings && {
        stability: data.settings.stability || 0.5,
        similarity_boost: data.settings.similarity_boost || 0.5,
        style: data.settings.style || 0,
        use_speaker_boost: data.settings.use_speaker_boost || false,
      },
    };
  } catch (error) {
    console.error('Error fetching voice details:', error);
    return null;
  }
}

export async function getUserInfo(): Promise<any> {
  try {
    return await makeElevenLabsRequest('/v1/user');
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

// Utility function to check if API key is valid
export async function validateApiKey(): Promise<boolean> {
  try {
    await getUserInfo();
    return true;
  } catch {
    return false;
  }
} 
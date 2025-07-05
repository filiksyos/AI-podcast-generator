export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
  labels?: Record<string, string>;
  settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface GenerationSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
  speed: number;
}

export interface PodcastRequest {
  text: string;
  voice_id: string;
  settings?: Partial<GenerationSettings>;
}

export interface PodcastResponse {
  audio_url?: string;
  audio_data?: string; // base64 encoded audio
  duration?: number;
  voice_used: Voice;
  settings_used: GenerationSettings;
  success: boolean;
  error?: string;
}

export interface VoicesResponse {
  voices: Voice[];
  success: boolean;
  error?: string;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  isReady: boolean;
}

export interface GenerationState {
  isGenerating: boolean;
  progress?: number;
  stage?: 'preparing' | 'generating' | 'processing' | 'complete';
  error?: string;
}

export type AudioFormat = 'mp3' | 'wav' | 'ogg';

export interface AudioMetadata {
  format: AudioFormat;
  duration: number;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
}

export interface PodcastAudio {
  id: string;
  url: string;
  blob?: Blob;
  metadata: AudioMetadata;
  createdAt: Date;
  settings: GenerationSettings;
  voice: Voice;
  originalText: string;
} 
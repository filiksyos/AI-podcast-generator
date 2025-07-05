'use client';

import { useState } from 'react';
import { Mic, Settings, Volume2, Download, AlertCircle } from 'lucide-react';
import { cn, validateText, base64ToBlob, getAudioMetadata, generateFilename } from '@/lib/utils';
import VoiceSelector from './VoiceSelector';
import AudioPlayer from './AudioPlayer';
import { GenerationSpinner } from './LoadingSpinner';
import type { Voice, GenerationSettings, PodcastRequest, PodcastResponse, PodcastAudio, GenerationState } from '@/types/podcast';

export default function PodcastGenerator() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<PodcastAudio | null>(null);
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<GenerationSettings>({
    stability: 0.5,
    similarity_boost: 0.5,
    style: 0,
    use_speaker_boost: false,
    speed: 1.0,
  });

  const handleGenerate = async () => {
    if (!selectedVoice || !text.trim()) {
      return;
    }

    // Validate text
    const validation = validateText(text);
    if (!validation.isValid) {
      setGenerationState({
        isGenerating: false,
        error: validation.error,
      });
      return;
    }

    try {
      setGenerationState({
        isGenerating: true,
        stage: 'preparing',
        error: undefined,
      });

      const request: PodcastRequest = {
        text: text.trim(),
        voice_id: selectedVoice.voice_id,
        settings,
      };

      setGenerationState(prev => ({ ...prev, stage: 'generating' }));

      const response = await fetch('/api/generate-podcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data: PodcastResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate podcast');
      }

      setGenerationState(prev => ({ ...prev, stage: 'processing' }));

      // Convert base64 to blob and create audio object
      if (data.audio_data) {
        const audioBlob = base64ToBlob(data.audio_data);
        const audioUrl = URL.createObjectURL(audioBlob);
        
        try {
          const metadata = await getAudioMetadata(audioBlob);
          
          const podcastAudio: PodcastAudio = {
            id: Date.now().toString(),
            url: audioUrl,
            blob: audioBlob,
            metadata,
            createdAt: new Date(),
            settings: data.settings_used,
            voice: data.voice_used,
            originalText: text.trim(),
          };

          setGeneratedAudio(podcastAudio);
          setGenerationState({
            isGenerating: false,
            stage: 'complete',
          });
        } catch (metadataError) {
          console.error('Error getting audio metadata:', metadataError);
          
          // Create audio object without metadata
          const podcastAudio: PodcastAudio = {
            id: Date.now().toString(),
            url: audioUrl,
            blob: audioBlob,
            metadata: {
              format: 'mp3',
              duration: 0,
            },
            createdAt: new Date(),
            settings: data.settings_used,
            voice: data.voice_used,
            originalText: text.trim(),
          };

          setGeneratedAudio(podcastAudio);
          setGenerationState({
            isGenerating: false,
            stage: 'complete',
          });
        }
      } else {
        throw new Error('No audio data received');
      }
    } catch (error) {
      console.error('Error generating podcast:', error);
      setGenerationState({
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Failed to generate podcast',
      });
    }
  };

  const handleSettingChange = (key: keyof GenerationSettings, value: number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const canGenerate = selectedVoice && text.trim().length > 0 && !generationState.isGenerating;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text">
            AI Podcast Generator
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Transform your text into natural-sounding speech with ElevenLabs AI voices
        </p>
      </div>

      {/* Main Generator Interface */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Text Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Podcast Content
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text content for your podcast. You can include scripts, stories, educational content, or any text you'd like to convert to speech..."
              rows={10}
              className={cn(
                'w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg',
                'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                'placeholder-gray-500 dark:placeholder-gray-400',
                'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                'resize-none transition-colors'
              )}
            />
            <div className="flex justify-between items-center text-sm">
              <span className={cn(
                'text-gray-500 dark:text-gray-400',
                text.length > 5000 && 'text-red-500'
              )}>
                {text.length} / 5000 characters
              </span>
              {text.length > 0 && (
                <span className="text-gray-500 dark:text-gray-400">
                  ~{Math.ceil(text.length / 200)} words
                </span>
              )}
            </div>
          </div>

          {/* Voice Selection */}
          <VoiceSelector
            selectedVoice={selectedVoice}
            onVoiceSelect={setSelectedVoice}
          />

          {/* Settings Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>{showSettings ? 'Hide' : 'Show'} Advanced Settings</span>
            </button>
          </div>

          {/* Advanced Settings */}
          {showSettings && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Voice Settings</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stability: {settings.stability.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.stability}
                    onChange={(e) => handleSettingChange('stability', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower = more expressive, Higher = more stable</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Similarity: {settings.similarity_boost.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.similarity_boost}
                    onChange={(e) => handleSettingChange('similarity_boost', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">How closely to match the original voice</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Style: {settings.style.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.style}
                    onChange={(e) => handleSettingChange('style', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">Style exaggeration (higher = more stylized)</p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="speaker-boost"
                    checked={settings.use_speaker_boost}
                    onChange={(e) => handleSettingChange('use_speaker_boost', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="speaker-boost" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Speaker Boost
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={cn(
              'w-full p-4 rounded-lg font-semibold text-white transition-all duration-200',
              'flex items-center justify-center space-x-3',
              canGenerate
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                : 'bg-gray-400 cursor-not-allowed'
            )}
          >
            {generationState.isGenerating ? (
              <GenerationSpinner stage={generationState.stage} />
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                <span>Generate Podcast</span>
              </>
            )}
          </button>

          {/* Error Display */}
          {generationState.error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {generationState.error}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {generatedAudio ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Generated Podcast
              </h2>
              <AudioPlayer audio={generatedAudio} />
              
              {/* Generation Details */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-white">Generation Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Voice:</span>
                    <p className="font-medium">{generatedAudio.voice.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Generated:</span>
                    <p className="font-medium">{generatedAudio.createdAt.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Character Count:</span>
                    <p className="font-medium">{generatedAudio.originalText.length}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Format:</span>
                    <p className="font-medium">{generatedAudio.metadata.format.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Volume2 className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">No podcast generated yet</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Enter your text content and select a voice to generate your podcast
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
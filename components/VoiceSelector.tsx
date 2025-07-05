'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronDown, Volume2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import LoadingSpinner from './LoadingSpinner';
import type { Voice, VoicesResponse } from '@/types/podcast';

interface VoiceSelectorProps {
  selectedVoice?: Voice;
  onVoiceSelect: (voice: Voice) => void;
  className?: string;
}

export default function VoiceSelector({ 
  selectedVoice, 
  onVoiceSelect, 
  className 
}: VoiceSelectorProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  // Fetch voices on component mount
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/voices');
        const data: VoicesResponse = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch voices');
        }
        
        setVoices(data.voices);
        
        // Auto-select first voice if none selected
        if (!selectedVoice && data.voices.length > 0) {
          onVoiceSelect(data.voices[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch voices');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoices();
  }, [selectedVoice, onVoiceSelect]);

  const handleVoiceSelect = (voice: Voice) => {
    onVoiceSelect(voice);
    setIsOpen(false);
  };

  const playVoicePreview = async (voice: Voice) => {
    if (!voice.preview_url) return;
    
    try {
      setPlayingVoice(voice.voice_id);
      
      // Stop any currently playing audio
      const existingAudio = document.querySelector('audio[data-preview]') as HTMLAudioElement;
      if (existingAudio) {
        existingAudio.pause();
        existingAudio.remove();
      }
      
      // Create new audio element
      const audio = new Audio(voice.preview_url);
      audio.setAttribute('data-preview', 'true');
      
      audio.addEventListener('ended', () => {
        setPlayingVoice(null);
        audio.remove();
      });
      
      audio.addEventListener('error', () => {
        setPlayingVoice(null);
        audio.remove();
      });
      
      await audio.play();
    } catch (error) {
      console.error('Error playing voice preview:', error);
      setPlayingVoice(null);
    }
  };

  const getVoiceDescription = (voice: Voice) => {
    if (voice.description) return voice.description;
    
    // Generate description from labels
    const labels = voice.labels || {};
    const traits = Object.entries(labels)
      .filter(([key, value]) => value && key !== 'voice_id')
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    
    return traits || 'Professional voice';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'premade': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'cloned': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'professional': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'generated': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'default': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };
    
    return colors[category as keyof typeof colors] || colors.default;
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Voice Selection
        </label>
        <div className="flex items-center justify-center h-32 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
          <LoadingSpinner variant="spin" size="md" text="Loading voices..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('space-y-2', className)}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Voice Selection
        </label>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error loading voices: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-700 dark:text-red-300 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Voice Selection
      </label>
      
      <div className="relative">
        {/* Selected Voice Display */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
            'rounded-lg shadow-sm hover:shadow-md transition-shadow',
            'flex items-center justify-between group',
            isOpen && 'ring-2 ring-blue-500 border-blue-500'
          )}
        >
          <div className="flex items-center space-x-3">
            {selectedVoice && (
              <>
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedVoice.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedVoice.name}
                    </span>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      getCategoryColor(selectedVoice.category)
                    )}>
                      {selectedVoice.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {getVoiceDescription(selectedVoice)}
                  </p>
                </div>
              </>
            )}
          </div>
          <ChevronDown 
            className={cn(
              'w-5 h-5 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )} 
          />
        </button>

        {/* Voice List Dropdown */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {voices.map((voice) => (
              <div
                key={voice.voice_id}
                className={cn(
                  'p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer',
                  'border-b border-gray-200 dark:border-gray-600 last:border-b-0',
                  selectedVoice?.voice_id === voice.voice_id && 'bg-blue-50 dark:bg-blue-900/20'
                )}
                onClick={() => handleVoiceSelect(voice)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {voice.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {voice.name}
                        </span>
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          getCategoryColor(voice.category)
                        )}>
                          {voice.category}
                        </span>
                        {selectedVoice?.voice_id === voice.voice_id && (
                          <Check className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {getVoiceDescription(voice)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Voice Preview Button */}
                  {voice.preview_url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playVoicePreview(voice);
                      }}
                      disabled={playingVoice === voice.voice_id}
                      className={cn(
                        'p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600',
                        'transition-colors flex-shrink-0',
                        playingVoice === voice.voice_id && 'text-blue-500'
                      )}
                      title="Preview voice"
                    >
                      {playingVoice === voice.voice_id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Voice Count */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {voices.length} voices available
      </p>
    </div>
  );
} 
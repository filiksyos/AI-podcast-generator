'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { cn, formatDuration, downloadBlob, base64ToBlob, generateFilename } from '@/lib/utils';
import type { PodcastAudio, AudioPlayerState } from '@/types/podcast';

interface AudioPlayerProps {
  audio: PodcastAudio;
  className?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

export default function AudioPlayer({ 
  audio, 
  className,
  onTimeUpdate,
  onEnded
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isLoading: true,
    isReady: false,
  });

  // Initialize audio when component mounts or audio changes
  useEffect(() => {
    if (audioRef.current && audio.url) {
      const audioElement = audioRef.current;
      
      const handleLoadedMetadata = () => {
        setPlayerState(prev => ({
          ...prev,
          duration: audioElement.duration,
          isLoading: false,
          isReady: true,
        }));
      };

      const handleTimeUpdate = () => {
        const currentTime = audioElement.currentTime;
        setPlayerState(prev => ({ ...prev, currentTime }));
        onTimeUpdate?.(currentTime);
      };

      const handleEnded = () => {
        setPlayerState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
        onEnded?.();
      };

      const handleLoadStart = () => {
        setPlayerState(prev => ({ ...prev, isLoading: true, isReady: false }));
      };

      const handleCanPlay = () => {
        setPlayerState(prev => ({ ...prev, isLoading: false, isReady: true }));
      };

      const handleError = () => {
        setPlayerState(prev => ({ ...prev, isLoading: false, isReady: false }));
        console.error('Audio loading error');
      };

      audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.addEventListener('timeupdate', handleTimeUpdate);
      audioElement.addEventListener('ended', handleEnded);
      audioElement.addEventListener('loadstart', handleLoadStart);
      audioElement.addEventListener('canplay', handleCanPlay);
      audioElement.addEventListener('error', handleError);

      // Set audio source
      audioElement.src = audio.url;
      audioElement.load();

      return () => {
        audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioElement.removeEventListener('timeupdate', handleTimeUpdate);
        audioElement.removeEventListener('ended', handleEnded);
        audioElement.removeEventListener('loadstart', handleLoadStart);
        audioElement.removeEventListener('canplay', handleCanPlay);
        audioElement.removeEventListener('error', handleError);
      };
    }
  }, [audio.url, onTimeUpdate, onEnded]);

  const togglePlayPause = () => {
    if (!audioRef.current || !playerState.isReady) return;

    if (playerState.isPlaying) {
      audioRef.current.pause();
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    } else {
      audioRef.current.play().catch(console.error);
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setPlayerState(prev => ({ ...prev, currentTime: newTime }));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    audioRef.current.volume = newVolume;
    setPlayerState(prev => ({ ...prev, volume: newVolume }));
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (playerState.volume > 0) {
      audioRef.current.volume = 0;
      setPlayerState(prev => ({ ...prev, volume: 0 }));
    } else {
      audioRef.current.volume = 1;
      setPlayerState(prev => ({ ...prev, volume: 1 }));
    }
  };

  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    
    const newTime = Math.max(0, Math.min(playerState.duration, playerState.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setPlayerState(prev => ({ ...prev, currentTime: newTime }));
  };

  const handleDownload = () => {
    if (audio.blob) {
      const filename = generateFilename(audio.originalText, audio.voice.name);
      downloadBlob(audio.blob, filename);
    } else if (audio.url.startsWith('data:')) {
      // Handle base64 data URL
      const base64Data = audio.url.split(',')[1];
      const blob = base64ToBlob(base64Data);
      const filename = generateFilename(audio.originalText, audio.voice.name);
      downloadBlob(blob, filename);
    } else {
      // Handle regular URL
      const link = document.createElement('a');
      link.href = audio.url;
      link.download = generateFilename(audio.originalText, audio.voice.name);
      link.click();
    }
  };

  const progressPercentage = playerState.duration > 0 
    ? (playerState.currentTime / playerState.duration) * 100 
    : 0;

  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4',
      'border border-gray-200 dark:border-gray-700',
      className
    )}>
      <audio ref={audioRef} preload="metadata" />
      
      {/* Audio Info */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            Generated Podcast
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            Voice: {audio.voice.name}
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          title="Download audio"
        >
          <Download size={20} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="range"
            min="0"
            max={playerState.duration || 0}
            value={playerState.currentTime}
            onChange={handleSeek}
            disabled={!playerState.isReady}
            className="audio-progress w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div 
            className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg pointer-events-none"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{formatDuration(playerState.currentTime)}</span>
          <span>{formatDuration(playerState.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => skipTime(-10)}
            disabled={!playerState.isReady}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Skip back 10s"
          >
            <SkipBack size={20} />
          </button>
          
          <button
            onClick={togglePlayPause}
            disabled={!playerState.isReady || playerState.isLoading}
            className={cn(
              'p-3 rounded-full text-white transition-all duration-200',
              'bg-gradient-to-r from-blue-500 to-purple-500',
              'hover:from-blue-600 hover:to-purple-600',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'shadow-lg hover:shadow-xl transform hover:scale-105'
            )}
            title={playerState.isPlaying ? 'Pause' : 'Play'}
          >
            {playerState.isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : playerState.isPlaying ? (
              <Pause size={24} />
            ) : (
              <Play size={24} className="ml-0.5" />
            )}
          </button>
          
          <button
            onClick={() => skipTime(10)}
            disabled={!playerState.isReady}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Skip forward 10s"
          >
            <SkipForward size={20} />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title={playerState.volume > 0 ? 'Mute' : 'Unmute'}
          >
            {playerState.volume > 0 ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={playerState.volume}
            onChange={handleVolumeChange}
            className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
      </div>

      {/* Metadata */}
      {audio.metadata && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div>
              <span className="font-medium">Format:</span> {audio.metadata.format.toUpperCase()}
            </div>
            <div>
              <span className="font-medium">Duration:</span> {formatDuration(audio.metadata.duration)}
            </div>
            {audio.metadata.sampleRate && (
              <div>
                <span className="font-medium">Sample Rate:</span> {audio.metadata.sampleRate} Hz
              </div>
            )}
            {audio.metadata.channels && (
              <div>
                <span className="font-medium">Channels:</span> {audio.metadata.channels}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
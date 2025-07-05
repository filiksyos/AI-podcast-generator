import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AudioFormat, AudioMetadata } from "@/types/podcast";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:audio/mpeg;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function base64ToBlob(base64: string, mimeType: string = 'audio/mpeg'): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

export function getAudioMetadata(file: File | Blob): Promise<AudioMetadata> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    
    audio.addEventListener('loadedmetadata', () => {
      const metadata: AudioMetadata = {
        format: getAudioFormat(file),
        duration: audio.duration,
        channels: 2, // Default stereo
        sampleRate: 44100, // Default sample rate
      };
      
      URL.revokeObjectURL(url);
      resolve(metadata);
    });
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load audio metadata'));
    });
    
    audio.src = url;
  });
}

export function getAudioFormat(file: File | Blob): AudioFormat {
  if (file instanceof File) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'wav':
        return 'wav';
      case 'ogg':
        return 'ogg';
      case 'mp3':
      default:
        return 'mp3';
    }
  }
  
  // For Blob, try to determine from MIME type
  if (file.type.includes('wav')) return 'wav';
  if (file.type.includes('ogg')) return 'ogg';
  return 'mp3'; // Default to mp3
}

export function validateText(text: string): { isValid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: 'Text content is required' };
  }
  
  if (text.length > 5000) {
    return { isValid: false, error: 'Text content must be less than 5000 characters' };
  }
  
  if (text.length < 10) {
    return { isValid: false, error: 'Text content must be at least 10 characters' };
  }
  
  return { isValid: true };
}

export function sanitizeFilename(filename: string): string {
  // Remove or replace invalid filename characters
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

export function generateFilename(text: string, voiceName: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  const shortText = text.slice(0, 30).trim();
  const sanitizedText = sanitizeFilename(shortText);
  const sanitizedVoice = sanitizeFilename(voiceName);
  
  return `podcast_${sanitizedVoice}_${sanitizedText}_${timestamp}.mp3`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
} 
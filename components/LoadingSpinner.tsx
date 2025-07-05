'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spin' | 'dots' | 'pulse' | 'waveform';
  className?: string;
  text?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  variant = 'spin',
  className,
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'spin':
        return (
          <div className={cn(
            'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
            sizeClasses[size],
            className
          )} />
        );
        
      case 'dots':
        return (
          <div className={cn('flex space-x-1', className)}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  'loading-dot rounded-full bg-blue-600',
                  size === 'sm' ? 'w-1.5 h-1.5' : 
                  size === 'md' ? 'w-2 h-2' :
                  size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
                )}
              />
            ))}
          </div>
        );
        
      case 'pulse':
        return (
          <div className={cn(
            'animate-pulse rounded-full bg-blue-600',
            sizeClasses[size],
            className
          )} />
        );
        
      case 'waveform':
        return (
          <div className={cn('flex items-end space-x-1', className)}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  'waveform-bar bg-blue-600 rounded-sm',
                  size === 'sm' ? 'w-0.5' : 
                  size === 'md' ? 'w-1' :
                  size === 'lg' ? 'w-1.5' : 'w-2'
                )}
              />
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };

  if (text) {
    return (
      <div className={cn('flex items-center space-x-3', className)}>
        {renderSpinner()}
        <span className="text-sm text-gray-600 dark:text-gray-300 animate-pulse">
          {text}
        </span>
      </div>
    );
  }

  return renderSpinner();
}

// Individual components for specific use cases
export function AudioLoadingSpinner({ className }: { className?: string }) {
  return (
    <LoadingSpinner 
      variant="waveform" 
      size="md" 
      className={className}
      text="Processing audio..."
    />
  );
}

export function GenerationSpinner({ stage, className }: { 
  stage?: string;
  className?: string;
}) {
  const stageText = {
    'preparing': 'Preparing your content...',
    'generating': 'Generating speech...',
    'processing': 'Processing audio...',
    'complete': 'Almost done...',
  };

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      <LoadingSpinner variant="spin" size="lg" />
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {stage ? stageText[stage as keyof typeof stageText] || 'Processing...' : 'Processing...'}
        </p>
        <div className="flex justify-center mt-2">
          <LoadingSpinner variant="dots" size="sm" />
        </div>
      </div>
    </div>
  );
} 
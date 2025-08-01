import { ReactNode } from 'react';
import { useContentTransition } from '@/hooks/useContentTransition';

interface SkeletonWrapperProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function SkeletonWrapper({ 
  isLoading, 
  skeleton, 
  children, 
  delay = 200,
  className = ""
}: SkeletonWrapperProps) {
  const { shouldShowSkeleton, contentClassName } = useContentTransition({ 
    isLoading, 
    delay 
  });

  return (
    <div className={className}>
      {shouldShowSkeleton ? (
        <div className="content-transition">
          {skeleton}
        </div>
      ) : (
        <div className={contentClassName}>
          {children}
        </div>
      )}
    </div>
  );
}

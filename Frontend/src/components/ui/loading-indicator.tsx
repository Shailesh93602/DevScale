import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function LoadingIndicator({
  size = 'md',
  fullScreen = false,
  text,
  className,
  ...props
}: LoadingIndicatorProps) {
  const Wrapper = fullScreen ? 'div' : 'span';

  return (
    <Wrapper
      className={cn(
        'flex items-center justify-center gap-2',
        fullScreen && 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
        className,
      )}
      {...props}
    >
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </Wrapper>
  );
}

import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { Button } from './button';

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullPage?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading the content.',
  onRetry,
  fullPage = false,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 p-4 text-center',
        fullPage && 'min-h-[50vh]',
        className,
      )}
      {...props}
    >
      <AlertCircle className="h-12 w-12 text-destructive" />
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try again
        </Button>
      )}
    </div>
  );
}

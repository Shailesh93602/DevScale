import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { getInitials } from '@/lib/avatar';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  fallback?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  className,
  src,
  alt = '',
  fallback,
  size,
  ...props
}) => {
  const [hasError, setHasError] = React.useState(false);

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div className={cn(avatarVariants({ size }), className)} {...props}>
      {src && !hasError ? (
        <Image
          src={src}
          alt={alt}
          onError={handleError}
          className="h-full w-full object-cover"
          width={500}
          height={500}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted font-semibold text-muted-foreground">
          {fallback || getInitials(alt)}
        </div>
      )}
    </div>
  );
};

export default Avatar;

import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export function Badge({ className, variant = 'primary', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-blue-100 text-blue-800': variant === 'primary',
          'bg-gray-100 text-gray-800': variant === 'secondary',
          'border border-gray-200 bg-transparent': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}
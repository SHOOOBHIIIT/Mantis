'use client';

import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

export function Card({ className, hover, glow, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-bg-secondary border border-border-subtle rounded-2xl',
        hover && 'transition-all duration-300 hover:border-border-default hover:bg-bg-tertiary cursor-pointer',
        glow && 'hover:shadow-lg hover:shadow-brand-500/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 pt-6 pb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 pb-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-4 border-t border-border-subtle', className)} {...props}>
      {children}
    </div>
  );
}

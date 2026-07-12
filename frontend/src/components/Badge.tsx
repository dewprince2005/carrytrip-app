import React from 'react';
import { cn } from '../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'neutral';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className,
}) => {
  const baseStyles = 'inline-flex items-center font-display font-medium rounded-full border';

  const variants = {
    info: 'bg-brand-primary/5 text-brand-primary border-brand-primary/10',
    success: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/15',
    warning: 'bg-brand-accent/10 text-brand-accent border-brand-accent/15',
    neutral: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};

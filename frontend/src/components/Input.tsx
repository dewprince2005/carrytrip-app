import React from 'react';
import { cn } from '../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, icon, ...props }, ref) => {
    const uniqueId = React.useId();

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={uniqueId}
            className="text-xs font-display font-semibold text-brand-dark tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={uniqueId}
            ref={ref}
            type={type}
            className={cn(
              'w-full text-sm bg-white border border-slate-200 rounded-xl py-3 px-4 transition-all duration-200 placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-100',
              icon && 'pl-11',
              error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/5',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-rose-500 font-medium mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

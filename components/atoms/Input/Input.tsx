'use client';

import { type InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const baseStyles =
      'w-full px-3 py-2 bg-input-bg border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-send-button';
    const borderStyles = error
      ? 'border-red-500 focus:border-red-500'
      : 'border-send-button focus:border-send-button';

    return (
      <div className="space-y-1">
        {label && <label className="block text-sm font-medium text-black">{label}</label>}
        <input ref={ref} className={`${baseStyles} ${borderStyles} ${className}`} {...props} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {helperText && !error && <p className="text-gray-500 text-sm">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

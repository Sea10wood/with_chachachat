'use client';

import Input from '@/components/atoms/Input/Input';
import React from 'react';
import { type InputHTMLAttributes, forwardRef } from 'react';

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  helperText?: string;
  required?: boolean;
  className?: string;
  id: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    { label, error, helperText, required, className = '', id, ...props },
    ref
  ) => {
    return (
      <div className="space-y-1">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Input
          ref={ref}
          id={id}
          error={error}
          helperText={helperText}
          {...props}
          className={`w-full px-3 py-2 rounded-md focus:outline-none ${className}`}
        />
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;

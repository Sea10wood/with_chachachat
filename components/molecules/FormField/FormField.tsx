"use client";

import React from "react";
import { forwardRef, InputHTMLAttributes } from "react";
import Input from "@/components/atoms/Input/Input";

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  helperText?: string;
  required?: boolean;
  className?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, required, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Input
          ref={ref}
          error={error}
          helperText={helperText}
          {...props}
          className={`w-full px-3 py-2 rounded-md focus:outline-none ${className}`}
        />
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField; 
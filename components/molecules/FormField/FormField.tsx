"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import Input from "@/components/atoms/Input/Input";

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  helperText?: string;
  required?: boolean;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, required, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-black">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <Input
          ref={ref}
          error={error}
          helperText={helperText}
          {...props}
        />
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField; 
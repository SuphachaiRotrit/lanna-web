import React, { useState } from 'react';
import { useField } from 'formik';
import { AlertCircle, Eye, EyeOff, LucideIcon } from 'lucide-react';

interface ExtraCompactInputProps {
  label: string;
  icon: LucideIcon;
  type?: string;
  name: string;
  placeholder?: string;
}

export const ExtraCompactInput = ({ label, icon: Icon, type = 'text', ...props }: ExtraCompactInputProps) => {
  const [field, meta] = useField(props);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const hasError = meta.touched && meta.error;
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="mb-2.5">
      <label className="text-[12px] font-bold text-gray-500 mb-1 block ml-1 uppercase tracking-wider">
        {label}
      </label>
      
      <div className={`
        relative flex items-center transition-all duration-200 rounded-lg border
        ${isFocused ? 'border-[var(--color-brand)] bg-white ring-2 ring-brand/5' : 'border-gray-100 bg-gray-50/30'}
        ${hasError ? 'border-red-400 bg-red-50/5' : ''}
      `}>
        <div className={`pl-3.5 flex items-center ${isFocused ? 'text-brand' : 'text-gray-300'} ${hasError ? 'text-red-400' : ''}`}>
          <Icon size={14} />
        </div>
        
        <input 
          {...field} 
          {...props}
          type={inputType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent outline-none py-2 px-2.5 text-[13px] font-medium text-navy placeholder:text-gray-200"
        />

        {isPassword && (
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pr-3 text-gray-300 hover:text-brand"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      
      {hasError && (
        <p className="mt-1 text-[12px] font-bold text-red-500 flex items-center gap-1 px-1">
          <AlertCircle size={10} /> {meta.error}
        </p>
      )}
    </div>
  );
};

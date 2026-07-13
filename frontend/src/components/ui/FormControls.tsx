import React, { useState, useRef, useEffect } from 'react';
import { useFormikContext } from 'formik';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  label: string;
  value: string | number;
}

interface CommonProps {
  label?: string;
  name?: string;
  required?: boolean;
}

interface PremiumSelectProps extends CommonProps {
  options: Option[];
  placeholder?: string;
  className?: string;
  value?: string | number;
  onChange?: (e: { target: { value: string | number; name?: string } }) => void;
}

export const PremiumSelect: React.FC<PremiumSelectProps> = ({ label, options, required, name, placeholder, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const formik = useFormikContext<Record<string, unknown>>();

  // รองรับทั้ง Formik และ Standalone
  const field = name && formik ? formik.getFieldProps(name) : { value: props.value };
  const meta: { touched?: boolean; error?: string } = name && formik ? formik.getFieldMeta(name) : {};

  const isError = meta?.touched && meta?.error;
  const selectedOption = options.find(opt => opt.value === field.value);

  // ปิดเมนูเมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string | number) => {
    if (name && formik) {
      formik.setFieldValue(name, val);
    } else if (props.onChange) {
      props.onChange({ target: { value: val, name } });
    }
    setIsOpen(false);
  };

  return (
    <div className="w-full space-y-2" ref={containerRef}>
      {label && (
        <label className="block text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] ml-1">
          {label} {required && <span className="text-brand">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between bg-gray-50/50 border-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-navy transition-all duration-300 outline-none
            ${isOpen ? 'border-brand/30 bg-white shadow-xl shadow-brand/5 ring-4 ring-brand/5' : 'border-transparent hover:bg-gray-50'}
            ${isError ? 'border-red-100 bg-red-50/10' : ''}
            ${props.className}
          `}
        >
          <span className={selectedOption ? 'text-navy' : 'text-navy/30'}>
            {selectedOption ? selectedOption.label : (placeholder || 'เลือก...')}
          </span>
          <ChevronDown 
            size={18} 
            className={`text-navy/20 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand' : ''}`} 
            strokeWidth={3} 
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-navy/10 py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden transform-gpu">
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-100">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`
                    w-full flex items-center justify-between px-5 py-3 text-sm font-bold transition-all
                    ${field.value === opt.value 
                      ? 'bg-brand/10 text-brand' 
                      : 'text-navy/70 hover:bg-gray-50 hover:text-navy'}
                  `}
                >
                  {opt.label}
                  {field.value === opt.value && <Check size={16} strokeWidth={4} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isError && (
        <p className="text-[10px] font-black text-red-500 uppercase tracking-tighter ml-1 animate-in fade-in slide-in-from-top-1">
          {meta.error}
        </p>
      )}
    </div>
  );
};

interface PremiumInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'>, CommonProps {
  prefixIcon?: React.ReactNode;
}

export const PremiumInput: React.FC<PremiumInputProps> = ({ label, required, prefixIcon, name, ...props }) => {
  const formik = useFormikContext<Record<string, unknown>>();
  const field = name && formik ? formik.getFieldProps(name) : undefined;
  const meta: { touched?: boolean; error?: string } = (name && formik ? formik.getFieldMeta(name) : {}) as { touched?: boolean; error?: string };

  const isError = meta?.touched && meta?.error;

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-[10px] font-black text-navy/40 uppercase tracking-[0.2em] ml-1">
          {label} {required && <span className="text-brand">*</span>}
        </label>
      )}
      <div className="relative group">
        {prefixIcon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy/20 group-focus-within:text-brand transition-colors">
            {prefixIcon}
          </div>
        )}
        <input
          {...(field ?? {})}
          {...props}
          className={`
            w-full bg-gray-50/50 border-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-navy transition-all duration-300 outline-none
            ${prefixIcon ? 'pl-14' : ''}
            ${isError 
              ? 'border-red-100 text-red-900 focus:border-red-200 focus:bg-red-50/30' 
              : 'border-transparent focus:border-brand/30 focus:bg-white focus:shadow-xl focus:shadow-brand/5 group-hover:bg-gray-50'
            }
            ${props.className}
          `}
        />
      </div>
      {isError && (
        <p className="text-[10px] font-black text-red-500 uppercase tracking-tighter ml-1 animate-in fade-in slide-in-from-top-1">
          {meta.error}
        </p>
      )}
    </div>
  );
};

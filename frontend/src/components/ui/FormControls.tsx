import React, { useState, useRef, useEffect } from 'react';
import { useFormikContext } from 'formik';
import { ChevronDown, ChevronLeft, ChevronRight, Check, Search, CalendarDays } from 'lucide-react';
import { toBuddhistYear, THAI_MONTHS, THAI_WEEKDAYS_SHORT } from '@/lib/date';

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
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const formik = useFormikContext<Record<string, unknown>>();
  const filteredOptions = search ? options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase())) : options;

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
        setSearch('');
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
    setSearch('');
  };

  return (
    <div className="w-full space-y-2" ref={containerRef}>
      {label && (
        <label className="block text-[12px] font-black text-navy/40 uppercase ml-1">
          {label} {required && <span className="text-brand">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
          className={`
            w-full flex items-center justify-between bg-gray-100 border-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-navy transition-all duration-300 outline-none
            ${isOpen ? 'border-brand/30 bg-white shadow-xl shadow-brand/5 ring-4 ring-brand/5' : 'border-gray-200 hover:bg-gray-200'}
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
            {options.length > 6 && (
              <div className="relative px-3 pb-2 mb-1 border-b border-gray-50">
                <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="ค้นหา..."
                  className="w-full pl-8 pr-2 py-2 text-sm font-bold text-navy bg-gray-50/50 rounded-xl outline-none placeholder:text-navy/20"
                />
              </div>
            )}
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-100">
              {filteredOptions.length === 0 && (
                <p className="px-5 py-3 text-sm font-bold text-navy/30">ไม่พบรายการ</p>
              )}
              {filteredOptions.map((opt) => (
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
        <p className="text-[12px] font-black text-red-500 uppercase tracking-tighter ml-1 animate-in fade-in slide-in-from-top-1">
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
        <label className="block text-[12px] font-black text-navy/40 uppercase ml-1">
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
            w-full bg-gray-100 border-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-navy transition-all duration-300 outline-none
            ${prefixIcon ? 'pl-14' : ''}
            ${isError
              ? 'border-red-100 text-red-900 focus:border-red-200 focus:bg-red-50/30'
              : 'border-gray-200 focus:border-brand/30 focus:bg-white focus:shadow-xl focus:shadow-brand/5 group-hover:bg-gray-200'
            }
            ${props.className}
          `}
        />
      </div>
      {isError && (
        <p className="text-[12px] font-black text-red-500 uppercase tracking-tighter ml-1 animate-in fade-in slide-in-from-top-1">
          {meta.error}
        </p>
      )}
    </div>
  );
};

interface PremiumTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'>, CommonProps {}

export const PremiumTextarea: React.FC<PremiumTextareaProps> = ({ label, required, name, ...props }) => {
  const formik = useFormikContext<Record<string, unknown>>();
  const field = name && formik ? formik.getFieldProps(name) : undefined;
  const meta: { touched?: boolean; error?: string } = (name && formik ? formik.getFieldMeta(name) : {}) as { touched?: boolean; error?: string };

  const isError = meta?.touched && meta?.error;

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-[12px] font-black text-navy/40 uppercase ml-1">
          {label} {required && <span className="text-brand">*</span>}
        </label>
      )}
      <textarea
        {...(field ?? {})}
        {...props}
        className={`
          w-full bg-gray-100 border-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-navy transition-all duration-300 outline-none resize-none
          ${isError
            ? 'border-red-100 text-red-900 focus:border-red-200 focus:bg-red-50/30'
            : 'border-gray-200 focus:border-brand/30 focus:bg-white focus:shadow-xl focus:shadow-brand/5 hover:bg-gray-200'
          }
          ${props.className}
        `}
      />
      {isError && (
        <p className="text-[12px] font-black text-red-500 uppercase tracking-tighter ml-1 animate-in fade-in slide-in-from-top-1">
          {meta.error}
        </p>
      )}
    </div>
  );
};

const YEARS_PER_PAGE = 12;

interface YearPickerProps extends CommonProps {
  value?: number;
  onChange?: (year: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export const YearPicker: React.FC<YearPickerProps> = ({ label, required, value, onChange, min, max, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState(() => (value ?? toBuddhistYear(new Date().getFullYear())) - 5);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const years = Array.from({ length: YEARS_PER_PAGE }, (_, i) => rangeStart + i);

  return (
    <div className={`w-full space-y-2 ${className ?? ''}`} ref={containerRef}>
      {label && (
        <label className="block text-[12px] font-black text-navy/40 uppercase ml-1">
          {label} {required && <span className="text-brand">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsOpen((o) => !o);
            setRangeStart((value ?? toBuddhistYear(new Date().getFullYear())) - 5);
          }}
          className={`
            w-full flex items-center justify-between gap-2 bg-gray-100 border-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-navy transition-all duration-300 outline-none
            ${isOpen ? 'border-brand/30 bg-white shadow-xl shadow-brand/5 ring-4 ring-brand/5' : 'border-gray-200 hover:bg-gray-200'}
          `}
        >
          <span className="flex items-center gap-2">
            <CalendarDays size={16} className="text-navy/30" />
            {value ?? 'เลือกปี...'}
          </span>
          <ChevronDown
            size={18}
            className={`text-navy/20 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand' : ''}`}
            strokeWidth={3}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 z-50 w-72 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-navy/10 p-3 animate-in fade-in zoom-in-95 duration-200 transform-gpu">
            <div className="flex items-center justify-between px-1 pb-2 mb-2 border-b border-gray-50">
              <button
                type="button"
                onClick={() => setRangeStart((s) => s - YEARS_PER_PAGE)}
                className="p-1.5 rounded-lg hover:bg-gray-50 text-navy/40 hover:text-brand transition-colors"
              >
                <ChevronLeft size={16} strokeWidth={3} />
              </button>
              <span className="text-xs font-black text-navy/50 uppercase tracking-wider">
                {years[0]} - {years[years.length - 1]}
              </span>
              <button
                type="button"
                onClick={() => setRangeStart((s) => s + YEARS_PER_PAGE)}
                className="p-1.5 rounded-lg hover:bg-gray-50 text-navy/40 hover:text-brand transition-colors"
              >
                <ChevronRight size={16} strokeWidth={3} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {years.map((year) => {
                const disabled = (min !== undefined && year < min) || (max !== undefined && year > max);
                return (
                  <button
                    key={year}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onChange?.(year);
                      setIsOpen(false);
                    }}
                    className={`
                      py-2.5 rounded-xl text-sm font-bold transition-all
                      ${year === value
                        ? 'bg-brand text-white shadow-lg shadow-brand/20'
                        : disabled
                        ? 'text-navy/15 cursor-not-allowed'
                        : 'text-navy/70 hover:bg-brand/10 hover:text-brand'}
                    `}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface MiniSelectProps {
  value: number;
  options: { value: number; label: string }[];
  onChange: (value: number) => void;
  className?: string;
}

const MiniSelect: React.FC<MiniSelectProps> = ({ value, options, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className ?? ''}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={`
          flex items-center gap-1 whitespace-nowrap text-xs font-black rounded-lg pl-2.5 pr-1.5 py-1.5 outline-none transition-colors
          ${isOpen ? 'bg-brand/10 text-brand' : 'bg-gray-50 text-navy hover:bg-gray-100'}
        `}
      >
        {selected?.label}
        <ChevronDown size={12} strokeWidth={3} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand' : 'text-navy/30'}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 left-0 mt-1.5 max-h-52 w-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-100 bg-white border border-gray-100 rounded-xl shadow-xl shadow-navy/10 p-1 animate-in fade-in zoom-in-95 duration-150 transform-gpu">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`
                w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-colors
                ${opt.value === value ? 'bg-brand text-white' : 'text-navy/70 hover:bg-gray-50'}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const pad2 = (n: number) => String(n).padStart(2, '0');

interface ThaiDatePickerProps extends CommonProps {
  value?: string; // ISO yyyy-mm-dd
  onChange?: (value: string) => void;
  minYear?: number; // ปี ค.ศ.
  maxYear?: number; // ปี ค.ศ.
  className?: string;
}

export const ThaiDatePicker: React.FC<ThaiDatePickerProps> = ({ label, required, name, value, onChange, minYear, maxYear, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const formik = useFormikContext<Record<string, unknown>>();

  const field = name && formik ? formik.getFieldProps(name) : { value };
  const meta = (name && formik ? formik.getFieldMeta(name) : {}) as { touched?: boolean; error?: string };
  const isError = meta?.touched && meta?.error;

  const isoValue = (field.value as string) || '';
  const selectedDate = isoValue ? new Date(`${isoValue}T00:00:00`) : null;
  const today = new Date();

  const [viewYear, setViewYear] = useState(() => (selectedDate ?? today).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (selectedDate ?? today).getMonth());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openPicker = () => {
    const base = selectedDate ?? today;
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setIsOpen((o) => !o);
  };

  const commit = (isoDate: string) => {
    if (name && formik) {
      formik.setFieldValue(name, isoDate);
    } else {
      onChange?.(isoDate);
    }
    setIsOpen(false);
  };

  const changeMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewYear(y);
    setViewMonth(m);
  };

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const isSelected = (day: number) =>
    !!selectedDate && selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === day;
  const isToday = (day: number) =>
    today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

  const yearLow = Math.min(minYear ?? today.getFullYear() - 100, viewYear);
  const yearHigh = Math.max(maxYear ?? today.getFullYear(), viewYear);
  const yearOptions = Array.from({ length: yearHigh - yearLow + 1 }, (_, i) => yearHigh - i);

  const displayText = selectedDate
    ? `${pad2(selectedDate.getDate())}/${pad2(selectedDate.getMonth() + 1)}/${toBuddhistYear(selectedDate.getFullYear())}`
    : '';

  return (
    <div className={`w-full space-y-2 ${className ?? ''}`} ref={containerRef}>
      {label && (
        <label className="block text-[12px] font-black text-navy/40 uppercase ml-1">
          {label} {required && <span className="text-brand">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={openPicker}
          className={`
            w-full flex items-center gap-3 bg-gray-100 border-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-navy transition-all duration-300 outline-none text-left
            ${isOpen ? 'border-brand/30 bg-white shadow-xl shadow-brand/5 ring-4 ring-brand/5' : 'border-gray-200 hover:bg-gray-200'}
            ${isError ? 'border-red-100 bg-red-50/10' : ''}
          `}
        >
          <CalendarDays size={18} className="text-navy/20 shrink-0" />
          <span className={displayText ? 'text-navy' : 'text-navy/30'}>{displayText || 'วัน/เดือน/ปี พ.ศ.'}</span>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-[19rem] mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-navy/10 p-4 animate-in fade-in zoom-in-95 duration-200 transform-gpu">
            <div className="flex items-center justify-between gap-1.5 mb-3">
              <button type="button" onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg hover:bg-gray-50 text-navy/40 hover:text-brand transition-colors">
                <ChevronLeft size={16} strokeWidth={3} />
              </button>
              <div className="flex items-center gap-1.5">
                <MiniSelect
                  value={viewMonth}
                  onChange={setViewMonth}
                  options={THAI_MONTHS.map((m, i) => ({ value: i, label: m }))}
                />
                <MiniSelect
                  value={viewYear}
                  onChange={setViewYear}
                  options={yearOptions.map((y) => ({ value: y, label: String(toBuddhistYear(y)) }))}
                  className="w-20"
                />
              </div>
              <button type="button" onClick={() => changeMonth(1)} className="p-1.5 rounded-lg hover:bg-gray-50 text-navy/40 hover:text-brand transition-colors">
                <ChevronRight size={16} strokeWidth={3} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {THAI_WEEKDAYS_SHORT.map((d) => (
                <div key={d} className="text-center text-[11px] font-black text-navy/30 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => (
                day === null ? <div key={`empty-${i}`} /> : (
                  <button
                    key={day}
                    type="button"
                    onClick={() => commit(`${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`)}
                    className={`
                      aspect-square rounded-xl text-sm font-bold transition-all
                      ${isSelected(day)
                        ? 'bg-brand text-white shadow-lg shadow-brand/20'
                        : isToday(day)
                        ? 'text-brand bg-brand/10'
                        : 'text-navy/70 hover:bg-brand/10 hover:text-brand'}
                    `}
                  >
                    {day}
                  </button>
                )
              ))}
            </div>
          </div>
        )}
      </div>

      {isError && (
        <p className="text-[12px] font-black text-red-500 uppercase tracking-tighter ml-1 animate-in fade-in slide-in-from-top-1">
          {meta.error}
        </p>
      )}
    </div>
  );
};

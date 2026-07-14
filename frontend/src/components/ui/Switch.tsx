import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <span className="relative inline-flex items-center">
      <input
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span className="w-11 h-6 rounded-full bg-gray-200 peer-checked:bg-brand transition-colors duration-200" />
      <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5" />
    </span>
    {label && <span className="text-xs font-black text-navy uppercase tracking-widest">{label}</span>}
  </label>
);

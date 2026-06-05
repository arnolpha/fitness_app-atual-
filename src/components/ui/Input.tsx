import { ReactNode } from 'react';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export const Input = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  icon,
  disabled = false,
  className = '',
}: InputProps) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full bg-[#111111] border border-white/10 rounded-xl
            ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3.5
            text-sm text-white placeholder-white/20
            outline-none focus:border-green-500/50 transition-colors
            disabled:opacity-50
          `}
        />
      </div>
    </div>
  );
};
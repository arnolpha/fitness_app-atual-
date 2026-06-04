interface BadgeProps {
  label: string;
  variant?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
  size?: 'sm' | 'md';
}

const variants = {
  green: 'bg-green-500/10 text-green-400',
  yellow: 'bg-yellow-500/10 text-yellow-400',
  red: 'bg-red-500/10 text-red-400',
  blue: 'bg-blue-500/10 text-blue-400',
  gray: 'bg-white/5 text-white/40',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export const Badge = ({ label, variant = 'gray', size = 'md' }: BadgeProps) => {
  return (
    <span className={`inline-flex items-center font-bold rounded-lg ${variants[variant]} ${sizes[size]}`}>
      {label}
    </span>
  );
};
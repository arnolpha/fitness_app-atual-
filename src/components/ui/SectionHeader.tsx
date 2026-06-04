interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => {
  return (
    <div className="mb-8">
      {subtitle && (
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">
          {subtitle}
        </p>
      )}
      <h1 className="text-4xl font-black text-white leading-none">{title}</h1>
    </div>
  );
};
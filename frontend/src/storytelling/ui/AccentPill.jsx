export default function AccentPill({ tone = 'frontend', children }) {
  const toneClass =
    tone === 'contracts'
      ? 'border-purple-400/25 bg-purple-500/10 text-purple-200'
      : tone === 'oracle'
        ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'
        : 'border-sky-400/25 bg-sky-500/10 text-sky-200';

  return (
    <span
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-tight',
        toneClass,
      ].join(' ')}
    >
      {children}
    </span>
  );
}


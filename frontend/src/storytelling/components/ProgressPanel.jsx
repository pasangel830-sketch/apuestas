export default function ProgressPanel({ slides, activeIndex, onSelect }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Progreso</p>
      <p className="mt-2 line-clamp-2 text-sm font-semibold text-[var(--text-primary)]">
        {slides?.[activeIndex]?.title ?? '—'}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {(slides ?? []).map((s, i) => {
          const isActive = i === activeIndex;
          const dot =
            isActive && s.accent === 'contracts'
              ? 'bg-purple-400/80'
              : isActive && s.accent === 'oracle'
                ? 'bg-emerald-400/80'
                : isActive
                  ? 'bg-sky-400/80'
                  : 'bg-white/20 group-hover:bg-white/30';

          return (
            <button
              key={s.id ?? String(i)}
              type="button"
              className={[
                'group flex items-center gap-2 rounded-xl px-2 py-2 text-left transition hover:bg-white/5',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]',
                isActive ? 'bg-white/5' : 'bg-transparent',
              ].join(' ')}
              onClick={() => onSelect?.(i)}
            >
              <span className={['h-2.5 w-2.5 rounded-full', dot].join(' ')} aria-hidden="true" />
              <span
                className={[
                  'min-w-0 flex-1 truncate text-sm',
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]',
                ].join(' ')}
              >
                {s.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


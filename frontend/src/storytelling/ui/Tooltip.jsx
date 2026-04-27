import { AnimatePresence, motion } from 'framer-motion';
import { useId, useState } from 'react';

export default function Tooltip({ label, children, side = 'top' }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  const pos =
    side === 'bottom'
      ? 'top-full mt-2'
      : side === 'left'
        ? 'right-full mr-2'
        : side === 'right'
          ? 'left-full ml-2'
          : 'bottom-full mb-2';

  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <span
        tabIndex={0}
        aria-describedby={open ? id : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="outline-none"
      >
        {children}
      </span>

      <AnimatePresence>
        {open ? (
          <motion.span
            id={id}
            role="tooltip"
            className={[
              'pointer-events-none absolute z-20 w-max max-w-[260px] rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-xs text-[var(--text-secondary)] shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur',
              pos,
            ].join(' ')}
            initial={{ opacity: 0, y: side === 'bottom' ? -6 : 6, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: side === 'bottom' ? -6 : 6, filter: 'blur(6px)' }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            {label}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}


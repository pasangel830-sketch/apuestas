import { useCallback, useEffect, useRef } from 'react';

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function useStableCallback(fn) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  }, [fn]);
  return useCallback((...args) => ref.current?.(...args), []);
}

export default function SlideDeck({
  slides,
  activeIndex,
  onActiveIndexChange,
  className,
  children,
}) {
  const maxIndex = Math.max(0, (slides?.length ?? 1) - 1);
  const active = clamp(activeIndex ?? 0, 0, maxIndex);

  const setActive = useStableCallback((next) => {
    const n = clamp(next, 0, maxIndex);
    if (n === active) return;
    onActiveIndexChange?.(n);
  });

  const isTransitionLockedRef = useRef(false);
  const touchRef = useRef({ y0: 0, t0: 0, active: false });

  const goPrev = useStableCallback(() => setActive(active - 1));
  const goNext = useStableCallback(() => setActive(active + 1));

  const lockFor = useStableCallback((ms) => {
    isTransitionLockedRef.current = true;
    window.setTimeout(() => {
      isTransitionLockedRef.current = false;
    }, ms);
  });

  const handleKeyDown = useStableCallback((e) => {
    if (isTransitionLockedRef.current) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      lockFor(340);
      goNext();
    }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      lockFor(340);
      goPrev();
    }
    if (e.key === 'Home') {
      e.preventDefault();
      lockFor(340);
      setActive(0);
    }
    if (e.key === 'End') {
      e.preventDefault();
      lockFor(340);
      setActive(maxIndex);
    }
  });

  const handleTouchStart = useStableCallback((e) => {
    const t = e.touches?.[0];
    if (!t) return;
    touchRef.current = { y0: t.clientY, t0: Date.now(), active: true };
  });

  const handleTouchMove = useStableCallback((e) => {
    if (!touchRef.current.active) return;
    const t = e.touches?.[0];
    if (!t) return;
    const dy = t.clientY - touchRef.current.y0;
    if (Math.abs(dy) > 10) e.preventDefault(); // evita scroll del body durante swipe
  });

  const handleTouchEnd = useStableCallback((e) => {
    if (isTransitionLockedRef.current) return;
    if (!touchRef.current.active) return;
    const t = e.changedTouches?.[0];
    touchRef.current.active = false;
    if (!t) return;

    const dy = t.clientY - touchRef.current.y0;
    const dt = Math.max(1, Date.now() - touchRef.current.t0);
    const v = Math.abs(dy) / dt; // px/ms

    if (Math.abs(dy) < 44 && v < 0.25) return;
    lockFor(520);
    if (dy < 0) goNext();
    else goPrev();
  });

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div
      id="storytelling-deck-root"
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{ touchAction: 'pan-x' }}
    >
      <div className="relative grid gap-6">
        <div className="min-h-[520px] rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}


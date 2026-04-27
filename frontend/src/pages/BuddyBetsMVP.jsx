import { useEffect } from 'react';
import { motion } from 'framer-motion';
import BuddyBetsExploreSlide from '../buddybettsmvp/slides/BuddyBetsExploreSlide';

const PAGE_TITLE = 'BuddyBets App — MVP';

export default function BuddyBetsMVP() {
  useEffect(() => {
    const prev = document.title;
    document.title = PAGE_TITLE;
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-var(--header-h))] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_0%,rgba(59,130,246,0.14),transparent_55%),radial-gradient(ellipse_55%_45%_at_0%_40%,rgba(236,72,153,0.10),transparent_55%),radial-gradient(ellipse_45%_35%_at_100%_65%,rgba(34,197,94,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,10,15,0.55),rgba(10,10,15,0.92))]" />
      </div>

      <div className="relative mx-auto w-full max-w-[var(--content-max)] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <div className="min-h-[520px] rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:p-6">
          <motion.div style={{ opacity: 1, filter: 'blur(0px)', transform: 'none' }}>
            <BuddyBetsExploreSlide />
          </motion.div>
        </div>
      </div>
    </div>
  );
}


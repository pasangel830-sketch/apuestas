import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SlideDeck from '../storytelling/SlideDeck';
import IntroSlide from '../storytelling/slides/IntroSlide';
import ArchitectureSlide from '../storytelling/slides/ArchitectureSlide';
import SmartContractsSlide from '../storytelling/slides/SmartContractsSlide';
import ContractRelationsSlide from '../storytelling/slides/ContractRelationsSlide';
import FrontendInteractionSlide from '../storytelling/slides/FrontendInteractionSlide';
import PorraFlowSlide from '../storytelling/slides/PorraFlowSlide';
import OracleSlide from '../storytelling/slides/OracleSlide';
import ProgressPanel from '../storytelling/components/ProgressPanel';

const PAGE_TITLE = 'Web3 Storytelling Experience';

export default function Storytelling() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const prev = document.title;
    document.title = PAGE_TITLE;
    return () => {
      document.title = prev;
    };
  }, []);

  const slides = useMemo(
    () => [
      {
        id: 'intro',
        title: 'Introducción',
        accent: 'frontend',
        element: <IntroSlide />,
      },
      {
        id: 'architecture',
        title: 'Arquitectura general',
        accent: 'frontend',
        element: <ArchitectureSlide />,
      },
      {
        id: 'contracts',
        title: 'Smart contracts',
        accent: 'contracts',
        element: <SmartContractsSlide />,
      },
      {
        id: 'relations',
        title: 'Relación entre contratos',
        accent: 'contracts',
        element: <ContractRelationsSlide />,
      },
      {
        id: 'frontend',
        title: 'Interacción con el frontend',
        accent: 'frontend',
        element: <FrontendInteractionSlide />,
      },
      {
        id: 'flow',
        title: 'Flujo de la porra',
        accent: 'contracts',
        element: <PorraFlowSlide />,
      },
      {
        id: 'oracle',
        title: 'Oráculo',
        accent: 'oracle',
        element: <OracleSlide />,
      },
    ],
    [],
  );

  return (
    <div className="relative min-h-[calc(100vh-var(--header-h))] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_0%,rgba(59,130,246,0.12),transparent_55%),radial-gradient(ellipse_55%_45%_at_0%_40%,rgba(168,85,247,0.10),transparent_55%),radial-gradient(ellipse_45%_35%_at_100%_65%,rgba(34,197,94,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,10,15,0.6),rgba(10,10,15,0.92))]" />
      </div>

      <div className="relative mx-auto w-full max-w-[var(--content-max)] px-4 pt-6 sm:px-6 lg:px-8">
        <div className="sticky top-[calc(var(--header-h)+10px)] z-30">
          <ProgressPanel slides={slides} activeIndex={active} onSelect={setActive} />
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[var(--content-max)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="m-0 font-display text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Web3 Storytelling Experience
            </p>
            <h1 className="mt-2 line-clamp-2 text-balance font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Recorre el proceso paso a paso
            </h1>
          </div>

          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <motion.div
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-[var(--text-secondary)]"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              Scroll o swipe
            </motion.div>
          </div>
        </div>
      </div>

      <SlideDeck
        slides={slides}
        activeIndex={active}
        onActiveIndexChange={setActive}
        className="relative mx-auto w-full max-w-[var(--content-max)] px-4 pb-10 sm:px-6 lg:px-8"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slides[active]?.id ?? active}
            initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {slides[active]?.element}
          </motion.div>
        </AnimatePresence>
      </SlideDeck>
    </div>
  );
}


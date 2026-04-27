import { motion } from 'framer-motion';
import PorraTimeline from '../components/PorraTimeline';

export default function PorraFlowSlide() {
  return (
    <div className="grid gap-6">
      <div>
        <motion.h2
          className="m-0 text-balance font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          Flujo de la porra (paso a paso)
        </motion.h2>
        <p className="mt-3 max-w-[90ch] text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          Esta es la historia completa: desde crear/entrar y apostar, hasta que el oráculo publica el resultado y el
          contrato permite reclamar premios.
        </p>
      </div>

      <PorraTimeline />
    </div>
  );
}


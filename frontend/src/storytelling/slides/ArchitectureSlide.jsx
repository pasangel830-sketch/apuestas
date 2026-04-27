import { motion } from 'framer-motion';
import ArchitectureMap from '../components/ArchitectureMap';

export default function ArchitectureSlide() {
  return (
    <div className="grid gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <motion.h2
            className="m-0 text-balance font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            Arquitectura general (3 piezas)
          </motion.h2>
          <p className="mt-3 max-w-[80ch] text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            La experiencia completa se entiende como un bucle: el usuario interactúa desde el frontend, los contratos
            aplican reglas y guardan estado, y el oráculo aporta el dato externo necesario para resolver.
          </p>
        </div>
      </div>

      <ArchitectureMap />
    </div>
  );
}


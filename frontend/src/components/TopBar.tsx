import { useCallback, useEffect, useId, useMemo, useState, type MouseEvent } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { formatEther } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import ConnectWallet from './ConnectWallet';
import type { TopBarNavEntry } from '../types/nav';

function formatEtherRounded5(wei: bigint): string {
  const s = formatEther(wei);
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  return n.toFixed(5);
}

function HeaderEthBalance() {
  const { address, isConnected } = useAccount();
  const { data, refetch, isFetching } = useBalance({ address });
  const headingId = useId();

  if (!isConnected || !address) return null;

  return (
    <section
      className="topbar-balance flex max-w-[min(100%,11.5rem)] shrink-0 rounded-lg border border-emerald-500/25 bg-gradient-to-br from-emerald-950/50 via-emerald-900/20 to-green-950/30 px-2 py-1.5 shadow-[inset_0_1px_0_rgba(52,211,153,0.12)] sm:max-w-none sm:px-2.5"
      aria-labelledby={headingId}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
        <div className="min-w-0 flex-1">
          <p
            id={headingId}
            className="mb-0.5 truncate text-[0.625rem] font-semibold uppercase leading-none tracking-[0.08em] text-emerald-400/90 sm:text-[0.6875rem]"
          >
            TU SALDO
          </p>
          <p className="m-0 flex min-w-0 items-baseline gap-0.5 text-[0.8125rem] font-semibold leading-tight tabular-nums sm:text-sm">
            {data != null ? (
              <>
                <span className="truncate font-mono text-emerald-300">{formatEtherRounded5(data.value)}</span>
                <span className="shrink-0 font-semibold text-emerald-400/85">ETH</span>
              </>
            ) : (
              <span className="text-emerald-400/60" aria-busy="true">
                …
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-emerald-500/35 bg-emerald-950/40 text-emerald-300 transition hover:border-emerald-400/55 hover:bg-emerald-900/50 hover:text-emerald-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-wait disabled:opacity-60"
          aria-label="Actualizar saldo"
          title="Actualizar saldo"
          disabled={isFetching}
          onClick={() => refetch()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="3" y="3" width="26" height="26" rx="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 9h5.5a3.5 3.5 0 013.5 3.5c0 1.2-.6 2.25-1.5 2.87A4.2 4.2 0 0120.5 20H10V9zm3 3v4h2.5a1.5 1.5 0 000-3H13zm0 7v4h3.8a1.8 1.8 0 000-3.6H13z"
        fill="currentColor"
      />
    </svg>
  );
}

function NavEntryLink({
  entry,
  onItemActivate,
}: {
  entry: TopBarNavEntry;
  onItemActivate: () => void;
}) {
  if (entry.kind === 'route') {
    return (
      <NavLink
        to={entry.to}
        end={entry.end}
        onClick={onItemActivate}
        className={({ isActive }) =>
          [
            'nav-link-underline rounded px-1 py-2 text-sm font-medium transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]',
            isActive
              ? 'is-active text-[var(--text-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          ].join(' ')
        }
      >
        {entry.label}
      </NavLink>
    );
  }

  return (
    <a
      href="/"
      className={[
        'nav-link-underline rounded px-1 py-2 text-sm font-medium transition-colors',
        'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]',
      ].join(' ')}
      onClick={(e) => {
        entry.onActivate(e);
        onItemActivate();
      }}
    >
      {entry.label}
    </a>
  );
}

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  const handleAccederClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      setMenuOpen(false);
      if (location.pathname !== '/') {
        navigate('/', { state: { scrollToAcceder: true } });
      } else {
        document.getElementById('acceder-porra')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [location.pathname, navigate],
  );

  const navEntries: TopBarNavEntry[] = useMemo(
    () => [
      { kind: 'route', label: 'Inicio', to: '/', end: true },
      { kind: 'route', label: 'Crear porra', to: '/create' },
      { kind: 'route', label: 'Mis porras', to: '/my-porras' },
      { kind: 'action', label: 'Acceder por dirección', onActivate: handleAccederClick },
    ],
    [handleAccederClick],
  );

  useEffect(() => {
    // Sincronizar menú móvil con la ruta (p. ej. atrás/adelante del navegador).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cierre explícito al cambiar pathname
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <motion.header
      className="topbar-mesh sticky top-0 z-50 min-h-[var(--header-h)] border-b border-[var(--border)]"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto flex h-[var(--header-h)] max-w-[var(--content-max)] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="font-display flex shrink-0 items-center gap-2 rounded text-[var(--text-primary)] no-underline transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]"
        >
          <LogoIcon className="text-[var(--accent-blue)]" />
          <span className="text-base font-semibold tracking-tight sm:text-lg">BuddyBets</span>
        </Link>

        <nav
          className="hidden min-h-[44px] flex-1 items-center justify-center gap-8 md:flex"
          aria-label="Principal"
        >
          {navEntries.map((entry) => (
            <NavEntryLink key={entry.label} entry={entry} onItemActivate={() => {}} />
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <HeaderEthBalance />
          <ConnectWallet />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] md:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              {menuOpen ? (
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M6 6l12 12M18 6L6 18"
                />
              ) : (
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M4 7h16M4 12h16M4 17h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {menuOpen ? (
          <motion.nav
            id={menuId}
            key="mobile-nav"
            className="border-t border-[var(--border)] bg-[var(--bg-primary)] md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Principal móvil"
          >
            <div className="mx-auto flex max-w-[var(--content-max)] flex-col gap-1 px-4 py-3 sm:px-6">
              {navEntries.map((entry) => (
                <NavEntryLink
                  key={entry.label}
                  entry={entry}
                  onItemActivate={() => setMenuOpen(false)}
                />
              ))}
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

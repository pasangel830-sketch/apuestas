import { formatCountdown } from '../utils/time';

/**
 * Cuenta atrás hasta la hora de fin de partido en cadena (antes de poder iniciar resolución).
 */
export default function MatchEndCountdownCard({
  matchEndUnixSec,
  chainTimeEst,
  showPostMatchHint = true,
}) {
  if (matchEndUnixSec == null) return null;

  const secondsLeft =
    chainTimeEst != null ? matchEndUnixSec - chainTimeEst : null;
  const showSync = chainTimeEst == null;
  const displaySeconds = secondsLeft != null ? Math.max(0, secondsLeft) : null;
  const hasEnded = displaySeconds === 0;

  return (
    <section
      className="card betting-countdown-card"
      aria-labelledby="match-end-countdown-title"
      aria-live="polite"
    >
      <div className="betting-countdown-card__intro">
        <p className="betting-countdown-card__badge">Partido</p>
        <h2 id="match-end-countdown-title" className="betting-countdown-card__title">
          Cuenta atrás para finalización del partido
        </h2>
        <p className="betting-countdown-card__subtitle">
          Es el fin estimado del partido que se indicó al crear la porra; hasta entonces no se puede llamar a «Iniciar
          resolución» en cadena.
        </p>
        {showSync && (
          <p className="betting-countdown-card__sync">Sincronizando reloj con la cadena…</p>
        )}
      </div>

      {showSync || displaySeconds == null ? null : (
        <>
          <p
            className={`betting-countdown-card__timer${hasEnded ? ' betting-countdown-card__timer--ended' : ''}`}
            role="timer"
            aria-label={hasEnded ? 'Fin del partido alcanzado en cadena' : undefined}
          >
            {formatCountdown(displaySeconds)}
          </p>
          <p className="betting-countdown-card__deadline">
            Finalización del partido: {new Date(matchEndUnixSec * 1000).toLocaleString()}
          </p>
          <p className="betting-countdown-card__chain-hint">
            Hora estimada en cadena: {new Date(chainTimeEst * 1000).toLocaleString()}
          </p>
          {hasEnded && showPostMatchHint && (
            <p className="betting-countdown-card__ended-msg">
              El plazo estimado del partido ha pasado en la cadena. Cuando la fase lo permita, podrás iniciar la
              resolución.
            </p>
          )}
        </>
      )}
    </section>
  );
}

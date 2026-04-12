import { formatCountdown } from '../utils/time';

/**
 * Cuenta atrás hasta el cierre de apuestas en cadena. Al llegar a cero muestra 00:00:00 fijo (no oculta la tarjeta).
 * @param {boolean} [expectDeadline] — si true y aún no hay deadline, muestra tarjeta de carga (p. ej. tras crear porra).
 */
export default function BettingCountdownCard({ deadlineUnixSec, chainTimeEst, expectDeadline = false }) {
  if (deadlineUnixSec == null) {
    if (!expectDeadline) return null;
    return (
      <section className="card betting-countdown-card" aria-busy="true" aria-labelledby="betting-countdown-title">
        <div className="betting-countdown-card__intro">
          <p className="betting-countdown-card__badge">Apuestas</p>
          <h2 id="betting-countdown-title" className="betting-countdown-card__title">
            Tiempo restante para apostar
          </h2>
          <p className="betting-countdown-card__sync">Obteniendo cierre de apuestas desde la cadena…</p>
        </div>
      </section>
    );
  }

  const secondsLeft =
    chainTimeEst != null ? deadlineUnixSec - chainTimeEst : null;
  const hasEnded = secondsLeft != null && secondsLeft <= 0;
  const showSync = chainTimeEst == null;

  return (
    <section
      className="card betting-countdown-card"
      aria-labelledby="betting-countdown-title"
      aria-live="polite"
    >
      <div className="betting-countdown-card__intro">
        <p className="betting-countdown-card__badge">Apuestas</p>
        <h2 id="betting-countdown-title" className="betting-countdown-card__title">
          Tiempo restante para apostar
        </h2>
        <p className="betting-countdown-card__subtitle">
          Cuando llegue a cero no podrás enviar apuestas en cadena. Usa el tiempo que queda para apostar con tu wallet.
        </p>
        {showSync && (
          <p className="betting-countdown-card__sync">Sincronizando reloj con la cadena…</p>
        )}
      </div>

      {showSync ? null : hasEnded ? (
        <>
          <p
            className="betting-countdown-card__timer betting-countdown-card__timer--ended"
            aria-label="Cuenta atrás finalizada"
          >
            {formatCountdown(0)}
          </p>
          <p className="betting-countdown-card__ended-msg">
            Cierre de apuestas: el plazo ha terminado. Este aviso permanece visible para que sepas que ya no puedes
            apostar en cadena.
          </p>
        </>
      ) : (
        <>
          <p className="betting-countdown-card__timer" role="timer">
            {formatCountdown(secondsLeft)}
          </p>
          <p className="betting-countdown-card__deadline">
            Cierre de apuestas: {new Date(deadlineUnixSec * 1000).toLocaleString()}
          </p>
          <p className="betting-countdown-card__chain-hint">
            Hora estimada en cadena: {new Date(chainTimeEst * 1000).toLocaleString()}
          </p>
        </>
      )}
    </section>
  );
}

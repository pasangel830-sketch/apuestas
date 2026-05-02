import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAccount } from 'wagmi';

const heroContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.08 },
  },
};

const heroLogo = {
  hidden: {
    opacity: 0,
    scale: 0.78,
    filter: 'blur(18px) brightness(0.45)',
  },
  show: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px) brightness(1)',
    transition: { duration: 1.35, ease: [0.16, 1, 0.3, 1] },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
};

const heroItemReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.15 } },
};

function Home() {
  const reduceMotion = useReducedMotion();
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const [porraAddress, setPorraAddress] = useState('');

  useEffect(() => {
    if (location.state?.scrollToAcceder) {
      const t = setTimeout(() => {
        document.getElementById('acceder-porra')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        navigate(location.pathname, { replace: true, state: {} });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [location.state?.scrollToAcceder, navigate, location.pathname]);

  const handleIrAPorra = (e) => {
    e.preventDefault();
    const addr = porraAddress.trim();
    if (addr && addr.startsWith('0x') && addr.length >= 42) {
      navigate(`/porra/${addr}`);
    }
  };

  return (
    <div className="page home">
      <motion.section
        className="home-hero"
        aria-labelledby="home-hero-title"
        variants={
          reduceMotion
            ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.2 } } }
            : heroContainer
        }
        initial="hidden"
        animate="show"
      >
        <motion.h1 id="home-hero-title" className="home-hero__title" variants={reduceMotion ? heroItemReduced : heroItem}>
          BuddyBets
        </motion.h1>
        <motion.div
          className="home-hero__brand"
          variants={
            reduceMotion
              ? {
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { duration: 0.2 } },
                }
              : heroLogo
          }
        >
          <img
            src={`${import.meta.env.BASE_URL}buddy-betts-logo.png`}
            alt=""
            className="home-hero__logo"
            decoding="async"
            draggable={false}
          />
        </motion.div>
        <motion.p className="home-hero__badge" variants={reduceMotion ? heroItemReduced : heroItem}>
          Porras entre amigos
        </motion.p>
        <motion.p className="home-hero__subtitle" variants={reduceMotion ? heroItemReduced : heroItem}>
          Crea una porra privada para el próximo partido, invita a tu grupo y que gane quien acierte el
          resultado. Rápido, claro y pensado para compartir.
        </motion.p>
      </motion.section>

      <section className="home-how" aria-labelledby="home-how-title">
        <h2 id="home-how-title" className="home-section-title">
          Cómo funciona Crear porra
        </h2>
        <p className="home-how__intro">
          En unos minutos defines el partido, quién puede entrar y cuánto se apuesta. Cada amigo elige
          victoria local, empate o victoria visitante; cuando el partido se resuelve, los aciertos se
          reparten en cadena.
        </p>
        <ol className="home-steps">
          <li>
            <span className="home-steps__n">1</span>
            <span>
              <strong>Añade participantes</strong> (direcciones de wallet y un mote opcional) para que solo
              ellos puedan apostar.
            </span>
          </li>
          <li>
            <span className="home-steps__n">2</span>
            <span>
              <strong>Elige el partido</strong>, la cuota en ETH y las fechas de cierre de apuestas y fin del
              partido.
            </span>
          </li>
          <li>
            <span className="home-steps__n">3</span>
            <span>
              <strong>Despliega la porra</strong> y comparte el enlace o la dirección del contrato para que
              cada uno apueste antes del cierre.
            </span>
          </li>
        </ol>
        <div className="home-example" role="note">
          <p className="home-example__label">Ejemplo</p>
          <p>
            Ana crea una porra para el derbi del sábado con cuatro amigos, apuesta mínima 0,001&nbsp;ETH.
            Todos eligen resultado antes del pitido inicial; al terminar el partido, quienes acertaron
            pueden reclamar su parte del bote.
          </p>
        </div>
      </section>

      <section className="home-cta" aria-labelledby="home-cta-title">
        <div className="home-cta__inner">
          <h2 id="home-cta-title" className="home-cta__headline">
            ¿Listo para la próxima jornada?
          </h2>
          <p className="home-cta__text">
            Monta la porra en segundos y pásala al grupo: tú pones las reglas, ellos el pronóstico.
          </p>
          <Link to="/create" className="btn btn-primary home-cta__button">
            Crear porra
          </Link>
          {!isConnected && (
            <p className="home-cta__hint">Conecta tu wallet para desplegar la porra en la red.</p>
          )}
        </div>
      </section>

      <div className="home-secondary-actions">
        <Link to="/my-porras" className="btn btn-outline">
          Ver mis porras
        </Link>
      </div>

      <section className="card acceder-porra home-acceder" id="acceder-porra">
        <h2 className="home-acceder__title">¿Ya tienes una porra?</h2>
        <p className="hint">Pega la dirección del contrato (0x…) y entra directo.</p>
        <form onSubmit={handleIrAPorra} className="row acceder-form">
          <input
            type="text"
            value={porraAddress}
            onChange={(e) => setPorraAddress(e.target.value)}
            placeholder="0x…"
            className="acceder-input"
            aria-label="Dirección del contrato de la porra"
          />
          <button type="submit" className="btn btn-outline">
            Ir a la porra
          </button>
        </form>
      </section>
    </div>
  );
}

export default Home;

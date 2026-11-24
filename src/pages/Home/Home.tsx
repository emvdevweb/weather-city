import { Link } from "react-router";
import style from "./Home.module.css";

// Presenta el servicio y conduce al formulario de búsqueda meteorológica.
const Home = () => {
  return (
    <section className={style.hero} aria-labelledby="home-title">
      <article className={style.copy}>
        <p className={style.kicker}>El tiempo, ciudad por ciudad</p>
        <h1 id="home-title">Consulta el cielo antes de salir.</h1>
        <p className={style.intro}>
          Busca una ciudad para conocer sus condiciones actuales y el pronóstico
          de la semana.
        </p>
        <Link className={style.action} to="/weather">
          Buscar una ciudad
        </Link>
      </article>
      <svg
        aria-hidden="true"
        className={style.sky}
        focusable="false"
        viewBox="0 0 352 352"
      >
        <defs>
          <clipPath id="sky-clip">
            <circle cx="176" cy="176" r="175" />
          </clipPath>
        </defs>
        <circle
          cx="176"
          cy="176"
          r="175"
          fill="var(--white)"
          stroke="var(--line)"
        />
        <g clipPath="url(#sky-clip)">
          <circle cx="245" cy="91" r="63" fill="var(--sun)" />
          <path
            d="M-20 247 Q130 219 372 248 L372 372 -20 372Z"
            fill="var(--mist)"
            stroke="var(--blue)"
            transform="rotate(-8 176 247)"
          />
          <path
            d="M64 220h76a18 18 0 0 0 0-36 25 25 0 0 0-47-5 21 21 0 0 0-29 20 18 18 0 0 0 0 21Z"
            fill="var(--white)"
            stroke="var(--line)"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </section>
  );
};

export default Home;

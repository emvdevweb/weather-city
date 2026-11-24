import { Link } from "react-router";
import style from "./NotFound.module.css";

// Explica que la ruta no existe y ofrece volver al inicio.
const NotFound = () => {
  return (
    <section id={style.notFound}>
      <article>
        <h1>La página no existe</h1>
        <p>
          Tienes que volver <Link to="/">a la página principal</Link>
        </p>
      </article>
    </section>
  );
};
export default NotFound;

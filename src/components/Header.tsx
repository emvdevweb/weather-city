import { Link, NavLink } from "react-router";
import style from "./Header.module.css";

// Muestra la marca y la navegación principal, adaptadas a pantallas pequeñas.
const Header = () => (
  <header className={style.header}>
    <Link className={style.brand} to="/" aria-label="Weather City, inicio">
      <span aria-hidden="true" className={style.brandMark}>
        WC
      </span>
      <span>Weather City</span>
    </Link>
    <nav aria-label="Navegación principal" className={style.navigation}>
      <NavLink className={style.navLink} end to="/">
        Inicio
      </NavLink>
      <NavLink className={style.navLink} to="/weather">
        Buscar ciudad
      </NavLink>
    </nav>
  </header>
);

export default Header;

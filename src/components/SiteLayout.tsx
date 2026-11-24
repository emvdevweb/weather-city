import { Outlet } from "react-router";
import Footer from "./Footer";
import Header from "./Header";
import style from "./SiteLayout.module.css";

// Comparte encabezado, contenido de ruta y pie entre todas las páginas.
const SiteLayout = () => (
  <>
    <a className={style.skipLink} href="#main-content">
      Saltar al contenido
    </a>
    <div className={style.site}>
      <Header />
      <main className={style.main} id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  </>
);

export default SiteLayout;

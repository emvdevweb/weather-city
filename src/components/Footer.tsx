import style from "./Footer.module.css";

// Atribuye los datos meteorológicos a su proveedor.
const Footer = () => (
  <footer className={style.footer}>
    Datos del tiempo:{" "}
    <a href="https://open-meteo.com/" rel="noreferrer" target="_blank">
      Open-Meteo
    </a>
  </footer>
);

export default Footer;

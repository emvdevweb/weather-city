import { BrowserRouter, Route, Routes } from "react-router";
import SiteLayout from "./components/SiteLayout";
import Home from "./pages/Home/Home";
import Weather from "./pages/Weather/Weather";
import City from "./pages/City/City";
import NotFound from "./pages/NotFound/NotFound";

// Configura el router y agrupa las páginas bajo el diseño compartido.
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />} path="/">
          {/* La ruta hija activa se renderiza dentro del Outlet del layout. */}
          <Route index element={<Home />} />
          <Route path="weather" element={<Weather />} />
          <Route path="weather/:city" element={<City />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

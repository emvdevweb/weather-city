import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";
import FavoriteToggle from "../../components/FavoriteToggle";
import { searchLocations, type GeoLocation } from "../../services/openMeteo";
import { useFavoriteLocations } from "../../store/favoriteLocations";
import { getLocationName } from "../../utils/location";
import style from "./Weather.module.css";

// Zod define el contrato de validación del formulario.
// El objeto tiene una propiedad "city" porque así se enlaza con react-hook-form.
// trim normaliza los espacios y las reglas limitan la búsqueda entre 2 y 100 caracteres.
const citySearchSchema = z.object({
  city: z
    .string()
    .trim()
    .min(2, "Escribe al menos dos caracteres para buscar.")
    .max(100, "La búsqueda no puede superar los 100 caracteres."),
});

type CitySearchForm = z.infer<typeof citySearchSchema>;

// Gestiona la búsqueda de ciudades y permite elegir la ubicación correcta.
const Weather = () => {
  // Permite navegar al pronóstico de la ciudad seleccionada.
  const navigate = useNavigate();
  const favorites = useFavoriteLocations((state) => state.favorites);

  // Guarda las coincidencias que devuelve el servicio de geocodificación.
  const [locations, setLocations] = useState<GeoLocation[]>([]);

  // Indica si hay una búsqueda en curso.
  const [isLoading, setIsLoading] = useState(false);

  // Distingue una búsqueda sin resultados de la vista inicial.
  const [hasSearched, setHasSearched] = useState(false);

  // Muestra errores de validación o de conexión junto al formulario.
  const [errorMessage, setErrorMessage] = useState("");

  // Permite cancelar la petición anterior o detenerla al salir de la página.
  const searchController = useRef<AbortController | null>(null);

  // React Hook Form controla el campo, el envío y los errores de validación.
  // zodResolver convierte el esquema Zod en las reglas que usa useForm.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CitySearchForm>({
    resolver: zodResolver(citySearchSchema),
    defaultValues: {
      city: "",
    },
  });

  // Cancela la petición pendiente cuando se desmonta la página.
  useEffect(
    () => () => {
      searchController.current?.abort();
    },
    [],
  );

  // handleSubmit ejecuta primero Zod; onSubmit solo recibe datos validados.
  // El dato normalizado por Zod se usa como término de búsqueda.
  const onSubmit = handleSubmit(async ({ city: searchTerm }) => {
    searchController.current?.abort();
    const controller = new AbortController();
    searchController.current = controller;
    setErrorMessage("");
    setLocations([]);
    setHasSearched(false);
    setIsLoading(true);

    try {
      // Evita mostrar resultados antiguos si se inicia otra búsqueda.
      const matches = await searchLocations(searchTerm, controller.signal);
      setLocations(matches);
      setHasSearched(true);
    } catch (error) {
      if (!controller.signal.aborted) {
        setErrorMessage(
          error instanceof Error
            ? `No se pudo buscar la ciudad. ${error.message}`
            : "No se pudo buscar la ciudad. Inténtalo de nuevo.",
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  });

  // Abre el pronóstico usando el nombre completo de la ubicación seleccionada.
  const openLocation = (location: GeoLocation) => {
    navigate(`/weather/${encodeURIComponent(getLocationName(location))}`);
  };

  // Prioriza el error de Zod y conserva el mensaje de errores de conexión.
  const searchError = errors.city?.message ?? errorMessage;

  return (
    <section className={style.searchPage} aria-labelledby="weather-title">
      <header className={style.heading}>
        <p className={style.kicker}>Pronóstico local</p>
        <h1 id="weather-title">¿Qué ciudad quieres consultar?</h1>
        <p>Busca por nombre y elige la localidad correcta.</p>
      </header>

      <form className={style.form} onSubmit={onSubmit} role="search">
        <label htmlFor="city-search">Nombre de la ciudad</label>
        <fieldset aria-label="Búsqueda de ciudad" className={style.searchRow}>
          <input
            autoComplete="off"
            id="city-search"
            maxLength={100}
            {...register("city", {
              onChange: () => {
                setErrorMessage("");
              },
            })}
            placeholder="Por ejemplo, Valparaíso"
            type="search"
            aria-describedby={searchError ? "search-error" : "search-help"}
            aria-invalid={Boolean(searchError)}
          />
          <button disabled={isLoading} type="submit">
            {isLoading ? "Buscando…" : "Buscar"}
          </button>
        </fieldset>
        <p className={style.hint} id="search-help">
          Escribe al menos dos letras. Puedes incluir una región o un país.
        </p>
        {searchError && (
          <p className={style.error} id="search-error" role="alert">
            {searchError}
          </p>
        )}
      </form>

      {/* Permite volver a consultar las ubicaciones guardadas. */}
      <section
        aria-labelledby="favorites-title"
        className={style.favorites}
        id="favorites"
      >
        <h2 id="favorites-title">Ubicaciones favoritas</h2>
        {favorites.length === 0 ? (
          <p>
            Todavía no guardaste ubicaciones. Usa «Guardar» en una ciudad para
            encontrarla aquí.
          </p>
        ) : (
          <ul className={style.locationList}>
            {favorites.map((location) => (
              <li key={location.id}>
                <div className={style.locationRow}>
                  <button
                    className={style.locationButton}
                    onClick={() => openLocation(location)}
                    type="button"
                  >
                    <span>{getLocationName(location)}</span>
                    <span aria-hidden="true" className={style.chevron}>
                      ›
                    </span>
                  </button>
                  <FavoriteToggle location={location} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        aria-busy={isLoading}
        aria-label="Resultados de búsqueda"
        aria-live="polite"
        className={style.results}
      >
        {isLoading && <p role="status">Buscando ciudades…</p>}
        {hasSearched && locations.length === 0 && (
          <p role="status">
            No encontramos coincidencias. Prueba con otro nombre o agrega el
            país.
          </p>
        )}
        {locations.length > 0 && (
          <section aria-labelledby="results-title">
            <h2 id="results-title">Ciudades encontradas</h2>
            <ul className={style.locationList}>
              {locations.map((location) => (
                <li key={location.id}>
                  <div className={style.locationRow}>
                    <button
                      className={style.locationButton}
                      onClick={() => openLocation(location)}
                      type="button"
                    >
                      <span>{getLocationName(location)}</span>
                      <span aria-hidden="true" className={style.chevron}>
                        ›
                      </span>
                    </button>
                    <FavoriteToggle location={location} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </section>
    </section>
  );
};

export default Weather;

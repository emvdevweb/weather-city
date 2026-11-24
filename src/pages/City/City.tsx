import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  getForecast,
  searchLocations,
  toDailyForecasts,
  type ForecastResponse,
  type GeoLocation,
} from "../../services/openMeteo";
import FavoriteToggle from "../../components/FavoriteToggle";
import { getLocationName } from "../../utils/location";
import { describeWeatherCode } from "../../utils/weather";
import style from "./City.module.css";

// Normaliza tildes y mayúsculas para comparar nombres de localidades.
function normalize(value: string | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase();
}

// Escoge la coincidencia que corresponde a los datos guardados en la ruta.
function selectLocation(
  locations: GeoLocation[],
  requestedName: string,
): GeoLocation | undefined {
  const [name, admin1, country] = requestedName
    .split(",")
    .map((part) => part.trim());

  return (
    locations.find(
      (location) =>
        normalize(location.name) === normalize(name) &&
        (!admin1 || normalize(location.admin1) === normalize(admin1)) &&
        (!country || normalize(location.country) === normalize(country)),
    ) ?? locations[0]
  );
}

// Presenta la fecha del pronóstico en español y sin desfase horario.
function formatForecastDate(date: string): string {
  return new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

// Formatea una medida usando las convenciones numéricas del español.
function formatNumber(value: number): string {
  return new Intl.NumberFormat("es", {
    maximumFractionDigits: 1,
  }).format(value);
}

// Presenta la temperatura actual y sus medidas meteorológicas relacionadas.
function CurrentConditions({ forecast }: { forecast: ForecastResponse }) {
  const current = forecast.current;

  return (
    <section className={style.current} aria-labelledby="current-title">
      <h2 id="current-title">Ahora mismo</h2>
      <header className={style.currentReading}>
        <p className={style.temperature}>
          <span
            aria-label={`${Math.round(current.temperature_2m)} grados Celsius`}
          >
            {Math.round(current.temperature_2m)}°
          </span>
          <span className={style.unit}>C</span>
        </p>
        <p className={style.summary}>
          <span className={style.weatherDescription}>
            {describeWeatherCode(current.weather_code)}
          </span>
          <span className={style.localTime}>
            Hora local: {current.time.replace("T", " ")}
          </span>
        </p>
      </header>

      <ul className={style.conditions}>
        <li>
          <dl>
            <dt>Sensación térmica</dt>
            <dd>{Math.round(current.apparent_temperature)} °C</dd>
          </dl>
        </li>
        <li>
          <dl>
            <dt>Humedad</dt>
            <dd>{current.relative_humidity_2m} %</dd>
          </dl>
        </li>
        <li>
          <dl>
            <dt>Viento</dt>
            <dd>{formatNumber(current.wind_speed_10m)} km/h</dd>
          </dl>
        </li>
        <li>
          <dl>
            <dt>Precipitación reciente</dt>
            <dd>{formatNumber(current.precipitation)} mm</dd>
          </dl>
        </li>
      </ul>
    </section>
  );
}

// Carga la ciudad de la ruta y presenta sus condiciones actuales y siete días.
const City = () => {
  // Lee el nombre de la ciudad desde la ruta seleccionada.
  const { city } = useParams();

  // Conserva la ubicación encontrada para mostrar su nombre completo.
  const [location, setLocation] = useState<GeoLocation | null>(null);

  // Conserva la respuesta del pronóstico para renderizar sus medidas.
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);

  // Indica cuándo se están resolviendo la ciudad y sus datos meteorológicos.
  const [isLoading, setIsLoading] = useState(true);

  // Informa si la búsqueda de ciudad o el pronóstico fallan.
  const [errorMessage, setErrorMessage] = useState("");

  // Vuelve a cargar los datos si cambia el nombre de ciudad en la ruta.
  useEffect(() => {
    // Cancela ambas solicitudes si la ruta cambia o se cierra la página.
    const controller = new AbortController();

    // Busca las coordenadas y solicita el pronóstico correspondiente.
    async function loadCityWeather() {
      if (!city) {
        setErrorMessage("No se indicó el nombre de una ciudad.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");
      setForecast(null);

      try {
        // La ruta guarda el nombre; geocodificarlo recupera sus coordenadas.
        const matches = await searchLocations(city, controller.signal);
        const selected = selectLocation(matches, city);

        if (!selected) {
          setErrorMessage(
            "No encontramos esa ciudad. Vuelve a la búsqueda y elige otra coincidencia.",
          );
          return;
        }

        const weather = await getForecast(selected, controller.signal);
        if (!controller.signal.aborted) {
          setLocation(selected);
          setForecast(weather);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof Error
              ? `No se pudo cargar el pronóstico. ${error.message}`
              : "No se pudo cargar el pronóstico. Inténtalo de nuevo.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadCityWeather();
    return () => controller.abort();
  }, [city]);

  return (
    <section
      aria-busy={isLoading}
      aria-label="Pronóstico de la ciudad"
      className={style.cityPage}
    >
      {isLoading && (
        <p className={style.status} role="status">
          Cargando el tiempo de la ciudad…
        </p>
      )}

      {errorMessage && (
        <section aria-labelledby="city-error-title" className={style.error}>
          <h1 id="city-error-title">No pudimos mostrar el pronóstico</h1>
          <p role="alert">{errorMessage}</p>
          <Link to="/weather">Volver a buscar una ciudad</Link>
        </section>
      )}

      {location && forecast && (
        <>
          <header className={style.cityHeader}>
            <div className={style.cityHeading}>
              <div>
                <p className={style.kicker}>Pronóstico local</p>
                <h1>{location.name}</h1>
                <p>{getLocationName(location)}</p>
              </div>
              <FavoriteToggle location={location} />
            </div>
          </header>
          <CurrentConditions forecast={forecast} />
          <section aria-labelledby="week-title" className={style.week}>
            <h2 id="week-title">Pronóstico para siete días</h2>
            <ul className={style.forecastList}>
              {toDailyForecasts(forecast.daily).map((day, index) => (
                <li className={style.forecastDay} key={day.date}>
                  <h3>{index === 0 ? "Hoy" : formatForecastDate(day.date)}</h3>
                  <p>{describeWeatherCode(day.weatherCode)}</p>
                  <p className={style.highLow}>
                    <span
                      aria-label={`Máxima ${Math.round(day.temperatureMax)} grados`}
                    >
                      {Math.round(day.temperatureMax)}°
                    </span>
                    <span aria-hidden="true"> / </span>
                    <span
                      aria-label={`Mínima ${Math.round(day.temperatureMin)} grados`}
                    >
                      {Math.round(day.temperatureMin)}°
                    </span>
                  </p>
                  <p className={style.rain}>
                    Lluvia: {formatNumber(day.precipitation)} mm
                  </p>
                </li>
              ))}
            </ul>
          </section>
          <Link className={style.backLink} to="/weather">
            Buscar otra ciudad
          </Link>
        </>
      )}
    </section>
  );
};

export default City;

// Dirección del servicio que convierte nombres de ciudades en coordenadas.
const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Dirección del servicio que entrega condiciones y pronósticos meteorológicos.
const FORECAST_API_URL = "https://api.open-meteo.com/v1/forecast";

// Describe una localidad geocodificada y sus coordenadas.
export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
}

// Representa la lista de localidades opcional que devuelve la búsqueda.
export interface GeocodingResponse {
  results?: GeoLocation[];
}

// Describe las medidas meteorológicas actuales solicitadas a la API.
export interface CurrentWeather {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
}

// Contiene las series diarias incluidas en la respuesta del pronóstico.
export interface DailyWeatherResponse {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
}

// Agrupa las condiciones actuales, los datos diarios y la zona horaria.
export interface ForecastResponse {
  current: CurrentWeather;
  daily: DailyWeatherResponse;
  timezone: string;
}

// Representa un día de pronóstico listo para mostrar en la interfaz.
export interface DailyForecast {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  precipitation: number;
}

// Comprueba que un dato desconocido sea un objeto no nulo.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Valida los campos esenciales de una localidad recibida de la API.
function isGeoLocation(value: unknown): value is GeoLocation {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.latitude === "number" &&
    typeof value.longitude === "number"
  );
}

// Verifica que la respuesta de geocodificación contenga resultados válidos.
function isGeocodingResponse(value: unknown): value is GeocodingResponse {
  return (
    isRecord(value) &&
    (value.results === undefined ||
      (Array.isArray(value.results) && value.results.every(isGeoLocation)))
  );
}

// Comprueba que la respuesta actual contenga todas las medidas solicitadas.
function isCurrentWeather(value: unknown): value is CurrentWeather {
  return (
    isRecord(value) &&
    typeof value.time === "string" &&
    typeof value.temperature_2m === "number" &&
    typeof value.relative_humidity_2m === "number" &&
    typeof value.apparent_temperature === "number" &&
    typeof value.is_day === "number" &&
    typeof value.precipitation === "number" &&
    typeof value.weather_code === "number" &&
    typeof value.wind_speed_10m === "number"
  );
}

// Comprueba que las series diarias contengan fechas y medidas numéricas.
function isDailyWeather(value: unknown): value is DailyWeatherResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.time) &&
    Array.isArray(value.weather_code) &&
    Array.isArray(value.temperature_2m_max) &&
    Array.isArray(value.temperature_2m_min) &&
    Array.isArray(value.precipitation_sum) &&
    value.time.every((item) => typeof item === "string") &&
    value.weather_code.every((item) => typeof item === "number") &&
    value.temperature_2m_max.every((item) => typeof item === "number") &&
    value.temperature_2m_min.every((item) => typeof item === "number") &&
    value.precipitation_sum.every((item) => typeof item === "number")
  );
}

// Valida las secciones necesarias de una respuesta del pronóstico.
function isForecastResponse(value: unknown): value is ForecastResponse {
  return (
    isRecord(value) &&
    isCurrentWeather(value.current) &&
    isDailyWeather(value.daily) &&
    typeof value.timezone === "string"
  );
}

// Descarga JSON y convierte respuestas HTTP fallidas en errores explícitos.
async function getJson(url: URL, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`El servicio meteorológico respondió con el código ${response.status}.`);
  }

  return response.json();
}

// Busca localidades por nombre y devuelve coincidencias en español.
export async function searchLocations(
  name: string,
  signal?: AbortSignal,
): Promise<GeoLocation[]> {
  const url = new URL(GEOCODING_API_URL);
  url.search = new URLSearchParams({
    name,
    count: "6",
    language: "es",
    format: "json",
  }).toString();

  const response: unknown = await getJson(url, signal);

  if (!isGeocodingResponse(response)) {
    throw new Error("La respuesta de búsqueda no tiene el formato esperado.");
  }

  return response.results ?? [];
}

// Solicita las condiciones actuales y siete días de pronóstico para una localidad.
export async function getForecast(
  location: GeoLocation,
  signal?: AbortSignal,
): Promise<ForecastResponse> {
  const url = new URL(FORECAST_API_URL);
  url.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
    forecast_days: "7",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
    timezone: "auto",
  }).toString();

  const response: unknown = await getJson(url, signal);

  if (!isForecastResponse(response)) {
    throw new Error("El pronóstico recibido no tiene el formato esperado.");
  }

  return response;
}

// Combina las series paralelas de la API en objetos para cada día.
export function toDailyForecasts(data: DailyWeatherResponse): DailyForecast[] {
  return data.time.map((date, index) => ({
    date,
    weatherCode: data.weather_code[index],
    temperatureMax: data.temperature_2m_max[index],
    temperatureMin: data.temperature_2m_min[index],
    precipitation: data.precipitation_sum[index],
  }));
}

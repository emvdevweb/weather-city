import type { GeoLocation } from "../services/openMeteo";

// Une ciudad, región y país sin repetir partes con el mismo nombre.
export function getLocationName(location: GeoLocation): string {
  return [location.name, location.admin1, location.country]
    .filter((part): part is string => Boolean(part))
    .filter((part, index, parts) => parts.indexOf(part) === index)
    .join(", ");
}

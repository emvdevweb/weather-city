// Traduce los códigos meteorológicos WMO a descripciones en español.
export function describeWeatherCode(code: number): string {
  // Agrupa códigos WMO relacionados para ofrecer descripciones sencillas.
  if (code === 0) return "Despejado";
  if (code === 1) return "Mayormente despejado";
  if (code === 2) return "Parcialmente nublado";
  if (code === 3) return "Nublado";
  if (code === 45 || code === 48) return "Niebla";
  if ([51, 53, 55].includes(code)) return "Llovizna";
  if ([56, 57].includes(code)) return "Llovizna helada";
  if ([61, 63, 65].includes(code)) return "Lluvia";
  if ([66, 67].includes(code)) return "Lluvia helada";
  if (code === 71 || code === 73 || code === 75) return "Nieve";
  if (code === 77) return "Granos de nieve";
  if ([80, 81, 82].includes(code)) return "Chubascos";
  if (code === 85 || code === 86) return "Chubascos de nieve";
  if (code === 95) return "Tormenta";
  if (code === 96 || code === 99) return "Tormenta con granizo";

  return "Condición desconocida";
}

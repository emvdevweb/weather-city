# Weather City

Aplicación educativa para buscar ciudades y consultar el tiempo actual junto con
el pronóstico de los próximos siete días. La interfaz está en español y se puede
usar con teclado o pantalla táctil.

## Ejecutar el proyecto

Necesitas Node.js y npm instalados.

```sh
npm install
npm run dev
```

Para comprobar los tipos, crear la versión de producción y revisar el código:

```sh
npm run build
npm run lint
```

## Cómo funciona

1. La página de búsqueda envía el nombre escrito al servicio de geocodificación
   de Open-Meteo y presenta las coincidencias con su región y país.
2. Al elegir una ciudad, la aplicación busca de nuevo ese nombre completo y
   solicita las condiciones y el pronóstico con las coordenadas encontradas.
3. Las llamadas se hacen desde el navegador y no requieren una clave para este
   uso educativo.
4. Puedes guardar o quitar una ubicación como favorita desde los resultados o
   su pronóstico. La lista se conserva en LocalStorage de este navegador y
   dispositivo.

Las ubicaciones favoritas se gestionan con Zustand y se guardan bajo la clave
`weather-city-favorites` en LocalStorage.

El cliente y las interfaces que describen las respuestas están en
`src/services/openMeteo.ts`. Los nombres de las variables de las respuestas se
mantienen tal como los define la API; los tipos ayudan a detectar errores al
usarlos en las páginas. Los códigos de condición meteorológica WMO se convierten
a descripciones en español en `src/utils/weather.ts`.

`src/App.tsx` agrupa las páginas bajo `SiteLayout`; su `<Outlet />` muestra la
ruta seleccionada entre el `Header` y el `Footer` compartidos.

APIs utilizadas:

- [Geocoding API de Open-Meteo](https://geocoding-api.open-meteo.com/v1/search)
- [Forecast API de Open-Meteo](https://api.open-meteo.com/v1/forecast)

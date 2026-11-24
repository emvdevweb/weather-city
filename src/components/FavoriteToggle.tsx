import type { GeoLocation } from "../services/openMeteo";
import { getLocationName } from "../utils/location";
import { useFavoriteLocations } from "../store/favoriteLocations";
import style from "./FavoriteToggle.module.css";

// Muestra el estado actual y permite guardar o quitar una ubicación.
const FavoriteToggle = ({ location }: { location: GeoLocation }) => {
  const isFavorite = useFavoriteLocations((state) =>
    state.favorites.some((favorite) => favorite.id === location.id),
  );
  const toggleFavorite = useFavoriteLocations(
    (state) => state.toggleFavorite,
  );

  return (
    <button
      aria-label={`${isFavorite ? "Quitar" : "Guardar"} ${getLocationName(location)} ${isFavorite ? "de" : "en"} ubicaciones favoritas`}
      aria-pressed={isFavorite}
      className={`${style.toggle} ${isFavorite ? style.isFavorite : ""}`}
      onClick={() => toggleFavorite(location)}
      type="button"
    >
      <span aria-hidden="true">{isFavorite ? "★" : "☆"}</span>
      {isFavorite ? "Guardada" : "Guardar"}
    </button>
  );
};

export default FavoriteToggle;

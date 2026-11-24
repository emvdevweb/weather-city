import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { GeoLocation } from "../services/openMeteo";

interface FavoriteLocationsState {
  favorites: GeoLocation[];
  // Agrega o quita una ubicación según su identificador.
  toggleFavorite: (location: GeoLocation) => void;
}

// Mantiene las favoritas compartidas entre las páginas de la aplicación.
export const useFavoriteLocations = create<FavoriteLocationsState>()(
  persist(
    (set) => ({
      favorites: [],
      toggleFavorite: (location) =>
        set((state) => ({
          favorites: state.favorites.some(
            (favorite) => favorite.id === location.id,
          )
            ? state.favorites.filter(
                (favorite) => favorite.id !== location.id,
              )
            : [...state.favorites, location],
        })),
    }),
    {
      name: "weather-city-favorites",
      // Conserva la lista entre visitas y guarda solo las ubicaciones.
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ favorites: state.favorites }),
    },
  ),
);

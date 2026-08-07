import { useState, useEffect, useCallback } from 'react';
import { getFavorites, toggleFavorite, isFavorite } from '../lib/favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());

    const handler = () => setFavorites(getFavorites());
    window.addEventListener('favorites-changed', handler);
    return () => window.removeEventListener('favorites-changed', handler);
  }, []);

  const toggle = useCallback((productId: number) => {
    return toggleFavorite(productId);
  }, []);

  const check = useCallback((productId: number) => {
    return favorites.includes(productId);
  }, [favorites]);

  return { favorites, toggle, check, count: favorites.length };
}

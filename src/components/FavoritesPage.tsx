import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { getFavorites } from '../lib/favorites';
import FavoriteButton from './FavoriteButton';
import type { Product } from '../types';

interface BentoItem {
  gridClasses: string;
}

const BENTO_PATTERN: BentoItem[] = [
  { gridClasses: 'col-span-2 row-span-2' },
  { gridClasses: 'col-span-1 row-span-1' },
  { gridClasses: 'col-span-1 row-span-2' },
  { gridClasses: 'col-span-1 row-span-1' },
  { gridClasses: 'col-span-1 row-span-1' },
  { gridClasses: 'col-span-1 row-span-1' },
  { gridClasses: 'col-span-1 row-span-2' },
  { gridClasses: 'col-span-1 row-span-1' },
  { gridClasses: 'col-span-1 row-span-1' },
  { gridClasses: 'col-span-2 row-span-2' },
  { gridClasses: 'col-span-1 row-span-1' },
  { gridClasses: 'col-span-1 row-span-1' },
];

export default function FavoritesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    const ids = getFavorites();
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch cada producto por id
      const responses = await Promise.all(
        ids.map((id) => fetch(`${API_URL}/api/products/${id}`).then((r) => r.ok ? r.json() : null)),
      );
      setProducts(responses.filter(Boolean) as Product[]);
    } catch (err) {
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();

    const handler = () => loadFavorites();
    window.addEventListener('favorites-changed', handler);
    return () => window.removeEventListener('favorites-changed', handler);
  }, []);

  if (loading) {
    return (
      <div className="px-3 pt-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Mis Favoritos</h1>
        <div
          className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[240px] gap-2 md:gap-3"
          style={{ gridAutoFlow: 'dense' }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-xl bg-gray-200 animate-pulse ${BENTO_PATTERN[i % BENTO_PATTERN.length].gridClasses}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="px-3 pt-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Mis Favoritos</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <p className="text-gray-500">Aún no tienes favoritos</p>
          <p className="text-sm text-gray-400 mt-1">Toca el corazón en los cuadros que te gusten</p>
          <a href="/" className="mt-4 text-sm text-purple-600 font-medium hover:text-purple-700">
            Explorar cuadros
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 pt-6">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Mis Favoritos</h1>
      <div
        className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[240px] gap-2 md:gap-3"
        style={{ gridAutoFlow: 'dense' }}
      >
        {products.map((product, index) => {
          const item = BENTO_PATTERN[index % BENTO_PATTERN.length];
          const image = product.gallery[1] || product.gallery[0];
          const slug = product.title.replace(/\s+/g, '_') + '-' + product.id;

          return (
            <a
              key={product.id}
              href={`/cuadro/${slug}`}
              className={`group relative block rounded-xl overflow-hidden ${item.gridClasses}`}
            >
              <img
                src={image}
                alt={product.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              <div className="absolute top-2 right-2">
                <FavoriteButton productId={product.id} />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

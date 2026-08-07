import { useEffect, useRef, useState, useCallback } from 'react';
import { API_URL } from '../config';
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

const SKELETON_COUNT = 12;

function getLimit() {
  if (typeof window === 'undefined') return 20;
  return window.innerWidth < 768 ? 8 : 20;
}

interface Props {
  query: string;
  onClear: () => void;
}

export default function SearchResults({ query, onClear }: Props) {
  const [results, setResults] = useState<Product[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const limitRef = useRef(getLimit());

  // Carga inicial
  useEffect(() => {
    setInitialLoading(true);
    setResults([]);
    setHasMore(true);

    const controller = new AbortController();

    const search = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/products/search?q=${encodeURIComponent(query)}&limit=${limitRef.current}&offset=0`,
          { signal: controller.signal },
        );
        if (res.ok) {
          const data: Product[] = await res.json();
          setResults(data);
          if (data.length < limitRef.current) setHasMore(false);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error('Search error:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    search();
    return () => controller.abort();
  }, [query]);

  // Scroll infinito — usa offset, el backend cachea el embedding
  const fetchMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const offset = results.length;

    try {
      const res = await fetch(
        `${API_URL}/api/products/search?q=${encodeURIComponent(query)}&limit=${limitRef.current}&offset=${offset}`,
      );
      if (res.ok) {
        const data: Product[] = await res.json();
        if (data.length === 0) {
          setHasMore(false);
        } else {
          setResults((prev) => [...prev, ...data]);
          if (data.length < limitRef.current) setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching more:', err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [query, results.length]);

  // IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current && hasMore && !initialLoading) {
          fetchMore();
        }
      },
      { rootMargin: '300px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchMore, hasMore, initialLoading]);

  return (
    <div className="px-3 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClear}
            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-sm text-gray-500">
            Resultados para <span className="font-medium text-gray-900">"{query}"</span>
          </p>
        </div>
        {!initialLoading && (
          <span className="text-xs text-gray-400">{results.length} resultados</span>
        )}
      </div>

      {/* Skeleton inicial */}
      {initialLoading && (
        <div
          className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[240px] gap-2 md:gap-3"
          style={{ gridAutoFlow: 'dense' }}
        >
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div
              key={i}
              className={`rounded-xl bg-gray-200 animate-pulse ${BENTO_PATTERN[i % BENTO_PATTERN.length].gridClasses}`}
            />
          ))}
        </div>
      )}

      {/* Resultados */}
      {!initialLoading && results.length > 0 && (
        <div
          className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[240px] gap-2 md:gap-3"
          style={{ gridAutoFlow: 'dense' }}
        >
          {results.map((product, index) => {
            const item = BENTO_PATTERN[index % BENTO_PATTERN.length];
            const image = product.gallery[1] || product.gallery[0];
            const slug = product.title.replace(/\s+/g, '_') + '-' + product.id;

            return (
              <a
                key={product.id}
                href={`/cuadro/${slug}`}
                data-astro-reload
                className={`group relative block rounded-xl overflow-hidden ${item.gridClasses}`}
              >
                <img
                  src={image}
                  alt={product.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  style={{ viewTransitionName: `product-${product.id}` }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </a>
            );
          })}
        </div>
      )}

      {/* Sentinel + skeleton al cargar más */}
      {hasMore && !initialLoading && <div ref={sentinelRef} className="h-1" />}
      {loading && (
        <div
          className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[240px] gap-2 md:gap-3 mt-2"
          style={{ gridAutoFlow: 'dense' }}
        >
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div
              key={`skel-${i}`}
              className={`rounded-xl bg-gray-200 animate-pulse ${BENTO_PATTERN[i % BENTO_PATTERN.length].gridClasses}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

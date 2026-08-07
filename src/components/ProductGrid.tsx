import { useEffect, useRef, useState, useCallback } from 'react';
import { API_URL } from '../config';
import type { PaginatedResponse, Product } from '../types';
import FavoriteButton from './FavoriteButton';

function getLimit() {
  if (typeof window === 'undefined') return 20;
  return window.innerWidth < 768 ? 8 : 20;
}

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

// Cache en memoria a nivel de módulo — persiste entre navegaciones con View Transitions
let memoryCache: {
  products: Product[];
  page: number;
  hasMore: boolean;
  scrollY: number;
} | null = null;

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>(memoryCache?.products || []);
  const [hasMore, setHasMore] = useState(memoryCache?.hasMore ?? true);
  const [loading, setLoading] = useState(!memoryCache);

  const limitRef = useRef(getLimit());
  const pageRef = useRef(memoryCache?.page || 0);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Restaurar scroll si venimos del cache
  useEffect(() => {
    if (memoryCache && memoryCache.scrollY > 0) {
      setTimeout(() => window.scrollTo(0, memoryCache!.scrollY), 50);
    }
  }, []);

  // Guardar scroll antes de navegar (View Transitions)
  useEffect(() => {
    const saveState = () => {
      memoryCache = {
        products,
        page: pageRef.current,
        hasMore,
        scrollY: window.scrollY,
      };
    };

    // Astro View Transitions event
    document.addEventListener('astro:before-preparation', saveState);
    // Fallback para navegación normal
    window.addEventListener('beforeunload', saveState);

    return () => {
      document.removeEventListener('astro:before-preparation', saveState);
      window.removeEventListener('beforeunload', saveState);
    };
  }, [products, hasMore]);

  const fetchNextPage = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    const nextPage = pageRef.current + 1;

    try {
      const res = await fetch(
        `${API_URL}/api/products?page=${nextPage}&limit=${limitRef.current}`,
      );
      const json: PaginatedResponse = await res.json();

      if (json.data.length === 0) {
        setHasMore(false);
      } else {
        setProducts((prev) => [...prev, ...json.data]);
        pageRef.current = nextPage;
        setHasMore(nextPage < json.totalPages);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Carga inicial — solo si no hay cache
  useEffect(() => {
    if (memoryCache && memoryCache.products.length > 0) return;

    const load = async () => {
      loadingRef.current = true;
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/products?page=1&limit=${limitRef.current}`,
        );
        const json: PaginatedResponse = await res.json();
        if (json.data.length === 0) {
          setHasMore(false);
        } else {
          setProducts(json.data);
          pageRef.current = 1;
          setHasMore(1 < json.totalPages);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    };
    load();
  }, []);

  // IntersectionObserver para scroll infinito
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current && hasMore) {
          fetchNextPage();
        }
      },
      { rootMargin: '300px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasMore]);

  return (
    <div className="px-3">
      {/* Skeleton carga inicial */}
      {products.length === 0 && (
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

      {/* Grid */}
      {products.length > 0 && (
        <div
          className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[240px] gap-2 md:gap-3"
          style={{ gridAutoFlow: 'dense' }}
        >
          {products.map((product, index) => {
            const item = BENTO_PATTERN[index % BENTO_PATTERN.length];
            return (
              <ProductCard
                key={product.id}
                product={product}
                gridClasses={item.gridClasses}
              />
            );
          })}
        </div>
      )}

      {/* Sentinel */}
      {hasMore && <div ref={sentinelRef} className="h-1" />}

      {/* Skeleton al cargar más */}
      {loading && products.length > 0 && (
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

function ProductCard({ product, gridClasses }: { product: Product; gridClasses: string }) {
  const image = product.gallery[1] || product.gallery[0];
  const slug = product.title.replace(/\s+/g, '_') + '-' + product.id;

  return (
    <a
      href={`/cuadro/${slug}`}
      className={`group relative block rounded-xl overflow-hidden ${gridClasses}`}
    >
      <img
        src={image}
        alt={product.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        style={{ viewTransitionName: `product-${product.id}` }}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <FavoriteButton productId={product.id} />
      </div>
    </a>
  );
}

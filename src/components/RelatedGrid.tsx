import type { Product } from '../types';

interface BentoItem {
  gridClasses: string;
}

const BENTO_PATTERN: BentoItem[] = [
  { gridClasses: 'col-span-1 row-span-2' },
  { gridClasses: 'col-span-1 row-span-1' },
  { gridClasses: 'col-span-1 row-span-1' },
  { gridClasses: 'col-span-2 row-span-2' },
  { gridClasses: 'col-span-1 row-span-1' },
  { gridClasses: 'col-span-1 row-span-1' },
  { gridClasses: 'col-span-1 row-span-1' },
  { gridClasses: 'col-span-1 row-span-2' },
  { gridClasses: 'col-span-1 row-span-1' },
  { gridClasses: 'col-span-1 row-span-1' },
];

interface Props {
  products: Product[];
}

export default function RelatedGrid({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-3 auto-rows-[160px] md:auto-rows-[200px] gap-2 md:gap-3"
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
          </a>
        );
      })}
    </div>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

export interface Item {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  description?: string | null;
  categoryId?: number | null;
  userId?: number;
}

interface ItemCardProps {
  item: Item;
  rating?: number;
  reviews?: number;
  badge?: string;
}

// === DETERMINISTIC HASH RANDOM (SAFE) ===
function hashNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 100000;
  }
  return hash;
}

export default function ItemCard({
  item,
  rating,
  reviews,
  badge,
}: ItemCardProps) {
  const priceFormatter = useMemo(() => new Intl.NumberFormat('id-ID'), []);

  /* ================= BADGE ================= */
  const badgeOptions = useMemo(() => [
    { text: 'Diskon 50%', class: 'text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-950/40 border-red-200/50 dark:border-red-900/30' },
    { text: 'Terlaris', class: 'text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 border-amber-200/50 dark:border-amber-900/30' },
    { text: 'Baru Datang', class: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/50 dark:border-emerald-900/30' },
    { text: 'Promo Spesial', class: 'text-purple-600 dark:text-purple-400 bg-purple-50/80 dark:bg-purple-950/40 border-purple-200/50 dark:border-purple-900/30' },
    { text: 'Gratis Ongkir', class: 'text-sky-600 dark:text-sky-400 bg-sky-50/80 dark:bg-sky-950/40 border-sky-200/50 dark:border-sky-900/30' },
    { text: 'Stok Terbatas', class: 'text-orange-600 dark:text-orange-400 bg-orange-50/80 dark:bg-orange-950/40 border-orange-200/50 dark:border-orange-900/30' },
  ], []);

  const seed = useMemo(() => hashNumber(String(item.id)), [item.id]);

  /* ================= RANDOM (STABLE) ================= */
  const randomRating = useMemo(() => {
    if (rating !== undefined) return rating;
    return Number((4 + (seed % 10) / 10).toFixed(1));
  }, [rating, seed]);

  const randomReviews = useMemo(() => {
    if (reviews !== undefined) return reviews;
    return 50 + (seed % 450);
  }, [reviews, seed]);

  const randomBadge = useMemo(() => {
    if (badge) {
      return badgeOptions.find((b) => b.text === badge) ?? badgeOptions[0];
    }
    return badgeOptions[seed % badgeOptions.length];
  }, [badge, badgeOptions, seed]);

  /* ================= RENDER ================= */
  return (
    <Link href={`/items/${item.id}`} prefetch className="block w-full h-full">
      <div className="group h-full flex flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        
        {/* PRODUCT IMAGE SECTION */}
        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950 mb-3 flex items-center justify-center">
          <Image
            src={item.imageUrl || '/placeholder.png'}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-contain p-2"
          />
          {/* Absolute glassmorphic badge overlay */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md border ${randomBadge.class}`}
            >
              {randomBadge.text}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col grow">
          {/* TITLE */}
          <h3 className="text-xs sm:text-sm font-semibold text-slate-850 dark:text-slate-100 line-clamp-2 mb-1.5 grow group-hover:text-[#7D1972] dark:group-hover:text-fuchsia-400 transition-colors duration-200">
            {item.name}
          </h3>

          {/* SIMPLIFIED RATING */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <div className="flex items-center gap-0.5 text-amber-500">
              <svg className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.784.57-1.838-.196-1.539-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.287-3.967z" />
              </svg>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                {randomRating.toFixed(1)}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
              ({randomReviews} Ulasan)
            </span>
          </div>

          {/* PRICE + STOCK + BUTTON ACTION */}
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col mb-3">
              {randomBadge.text === 'Diskon 50%' ? (
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-base sm:text-lg font-black text-[#7D1972] dark:text-fuchsia-400">
                    Rp{priceFormatter.format(item.price)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 line-through">
                    Rp{priceFormatter.format(item.price * 2)}
                  </span>
                </div>
              ) : (
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Rp{priceFormatter.format(item.price)}
                </span>
              )}
              {/* Stock Warning */}
              <span className={`text-[10px] mt-1 font-semibold ${item.stock <= 5 ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500'}`}>
                {item.stock <= 5 ? `Sisa ${item.stock} stok!` : `Stok: ${item.stock}`}
              </span>
            </div>

            <div
              className="w-full text-center rounded-xl py-2 px-4
              text-xs sm:text-sm font-bold flex items-center justify-center gap-1
              bg-[#7D1972] text-white hover:bg-[#9E1E93] dark:bg-fuchsia-600 dark:hover:bg-fuchsia-500 transition duration-300 shadow-sm"
            >
              <span>Lihat Detail</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

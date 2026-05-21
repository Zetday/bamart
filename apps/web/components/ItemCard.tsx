'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Item } from '@prisma/client';
import { useState, useMemo } from 'react';

interface ItemCardProps {
  item: Item;
  rating?: number;
  reviews?: number;
  badge?: string;
}

export default function ItemCard({
  item,
  rating,
  reviews,
  badge,
}: ItemCardProps) {
  const priceFormatter = useMemo(() => new Intl.NumberFormat('id-ID'), []);

  /* ================= BADGE ================= */
  const badgeOptions = [
    { text: 'Diskon 50%', class: 'bg-red-200 text-red-800' },
    { text: 'Terlaris', class: 'bg-amber-200 text-amber-800' },
    { text: 'Baru Datang', class: 'bg-emerald-200 text-emerald-800' },
    { text: 'Promo Spesial', class: 'bg-violet-200 text-violet-800' },
    { text: 'Gratis Ongkir', class: 'bg-sky-200 text-sky-800' },
    { text: 'Stok Terbatas', class: 'bg-orange-200 text-orange-800' },
  ];

  /* ================= RANDOM (STABLE) ================= */
  const [randomRating] = useState(
    () => rating ?? Number((Math.random() * 1 + 4).toFixed(1))
  );

  const [randomReviews] = useState(
    () => reviews ?? Math.floor(Math.random() * 490) + 10
  );

  const [randomBadge] = useState(() => {
    if (badge) {
      return badgeOptions.find((b) => b.text === badge) ?? badgeOptions[0];
    }
    return badgeOptions[Math.floor(Math.random() * badgeOptions.length)];
  });

  /* ================= RATING ================= */
  const fullStars = Math.floor(randomRating);
  const hasHalfStar = randomRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  /* ================= RENDER ================= */
  return (
    <Link href={`/items/${item.id}`} prefetch className="block w-full h-full">
      <div className="h-full flex flex-col rounded-lg sm:rounded-xl border border-gray-200 bg-white p-2.5 sm:p-3 md:p-4 shadow-sm hover:shadow-lg transition-shadow duration-300">
        {/* IMAGE */}
        <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-100 mb-2 sm:mb-3">
          <Image
            src={item.imageUrl || '/placeholder.png'}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-contain transition-transform duration-300 lg:hover:scale-105"
          />
        </div>

        {/* CONTENT */}
        <div className="flex flex-col flex-grow">
          {/* BADGE */}
          <div className="mb-1.5 sm:mb-2">
            <span
              className={`inline-block rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 
              text-[9px] sm:text-[10px] md:text-xs font-semibold ${randomBadge.class}`}
            >
              {randomBadge.text}
            </span>
          </div>

          {/* NAME */}
          <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 line-clamp-2 mb-1.5 sm:mb-2 flex-grow">
            {item.name}
          </h3>

          {/* RATING */}
          <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-3 flex-wrap">
            <div className="flex items-center gap-0.5">
              {Array(fullStars)
                .fill(0)
                .map((_, i) => (
                  <svg
                    key={`full-${i}`}
                    className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.784.57-1.838-.196-1.539-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.287-3.967z" />
                  </svg>
                ))}

              {hasHalfStar && (
                <svg
                  className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <defs>
                    <linearGradient id={`half-${item.id}`}>
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="#D1D5DB" />
                    </linearGradient>
                  </defs>
                  <path
                    fill={`url(#half-${item.id})`}
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.784.57-1.838-.196-1.539-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.287-3.967z"
                  />
                </svg>
              )}

              {Array(emptyStars)
                .fill(0)
                .map((_, i) => (
                  <svg
                    key={`empty-${i}`}
                    className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.784.57-1.838-.196-1.539-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.287-3.967z" />
                  </svg>
                ))}
            </div>

            <p className="text-xs sm:text-sm font-medium text-gray-900">
              {randomRating.toFixed(1)}
            </p>

            <p className="text-xs text-gray-500">({randomReviews})</p>
          </div>

          {/* PRICE + BUTTON */}
          <div className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:items-center lg:justify-between mt-auto pt-3 border-t border-gray-100">
            <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
              Rp{priceFormatter.format(item.price)}
            </p>

            <div
              className="w-full lg:w-auto text-center rounded-md sm:rounded-lg
              min-h-[36px] sm:min-h-[40px]
              px-3 sm:px-4 py-2
              text-xs sm:text-sm md:text-base
              font-medium whitespace-nowrap
              bg-[#7D1972] text-white lg:hover:bg-[#9E1E93] transition"
            >
              Lihat
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

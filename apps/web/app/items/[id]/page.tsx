import prisma from '@/lib/prisma';
import Image from 'next/image';
import CheckoutBar from '@/components/Checkoutbar';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { IoArrowBackOutline } from 'react-icons/io5';

type RelatedItem = {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
};

// === DETERMINISTIC HASH RANDOM (SAFE) ===
function hashNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 100000;
  }
  return hash;
}

// === HALF STAR GENERATOR ===
function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return {
    fullStars: Array(full).fill('full'),
    halfStar: half,
    emptyStars: Array(empty).fill('empty'),
  };
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (isNaN(id) || id <= 0) return notFound();

  const item = await prisma.item.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
      imageUrl: true,
      description: true,
      categoryId: true,
      category: true,
      user: true,
    },
  });

  if (!item) return notFound();

  const [soldData, related] = await Promise.all([
    prisma.orderItem.aggregate({
      where: { itemId: id },
      _sum: { quantity: true },
    }),
    prisma.item.findMany({
      where: {
        id: { not: id },
        categoryId: item.categoryId ?? undefined,
      },
      take: 10,
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        imageUrl: true,
      },
    }),
  ]);

  const totalSold = soldData._sum.quantity ?? 0;

  const seed = hashNumber(String(item.id));
  const randomRating = 4 + (seed % 100) / 100;
  const randomReviews = 50 + (seed % 850);
  const stars = renderStars(randomRating);

  return (
    // ✅ PENTING: padding-bottom untuk mobile
    <div className="relative w-full max-w-[1400px] mx-auto px-4 md:px-8 py-6 pt-12 pb-[96px] sm:pb-[120px] lg:pb-0">
      {/* GRID */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ========== GALERI FOTO ========== */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div
              className="relative w-full h-[260px] sm:h-[320px] md:h-[380px] lg:h-[420px] 
              bg-gray-300 rounded-xl overflow-hidden pt-10"
            >
              <Link
                href="/items"
                className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur 
                px-3 py-1.5 rounded-full shadow text-[#7D1972] border border-[#7D1972]"
              >
                <IoArrowBackOutline size={20} />
              </Link>

              <Image
                src={item.imageUrl || '/placeholder.png'}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* ========== DETAIL PRODUK ========== */}
        <div>
          <h2 className="text-[#7D1972] font-bold text-2xl sm:text-3xl mb-2">
            Rp {item.price.toLocaleString('id-ID')}
          </h2>

          <h1 className="text-lg sm:text-xl font-semibold">{item.name}</h1>

          <div className="flex items-center gap-2 text-sm mt-1 text-yellow-500">
            {stars.fullStars.map((_, i) => (
              <span key={i}>★</span>
            ))}
            {stars.halfStar && <span>☆</span>}
            {stars.emptyStars.map((_, i) => (
              <span key={`e-${i}`} className="text-gray-300">
                ★
              </span>
            ))}
            <span className="text-gray-600 ml-1">
              {randomRating.toFixed(1)}
            </span>
            <span className="text-gray-500">Terjual {totalSold}</span>
          </div>

          <div className="border-t mt-4 pt-4 text-sm">
            <p className="font-semibold">Kategori:</p>
            <p className="text-gray-700 mb-4">
              {item.category?.name || 'UMKM Product'}
            </p>

            <p className="font-semibold">Deskripsi:</p>
            <p className="text-gray-600 leading-relaxed text-sm">
              {item.description || 'Tidak ada deskripsi.'}
            </p>

            <p className="font-semibold mt-4">Stok Tersedia:</p>
            <p className="text-gray-700">{item.stock} unit</p>
          </div>
        </div>

        {/* ========== TOKO ========== */}
        <div
          className="lg:col-span-1 md:col-span-2 w-full md:max-w-md lg:max-w-sm 
          border rounded-lg p-3 shadow-sm h-fit mx-auto lg:mx-0"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>

            <div className="leading-tight">
              <h3 className="font-semibold text-sm">{item.user.name}</h3>

              <p className="text-yellow-500 text-xs">
                ★ {randomRating.toFixed(1)} ({randomReviews})
              </p>
            </div>
          </div>

          <div className="mt-2 text-xs leading-tight text-gray-700">
            <p className="text-pink-600 flex items-center gap-1">
              📍 <span className="text-gray-500">Lokasi Toko</span>
            </p>

            <p className="font-semibold text-sm">Banjarmasin</p>
            <p className="text-gray-500">Melayani seluruh Indonesia</p>
          </div>
        </div>
      </div>

      {/* PRODUK SERUPA */}
      <h2 className="text-lg font-semibold mt-10 mb-3">
        Pelanggan lain juga telah melihat barang serupa
      </h2>

      <div className="flex gap-4 overflow-x-scroll scroll-smooth no-scrollbar pr-4 justify-start sm:justify-center">
        {related.map((r) => (
          <Link
            key={r.id}
            href={`/items/${r.id}`}
            className="min-w-[160px] sm:min-w-[180px] md:min-w-[200px] rounded-xl 
            overflow-hidden border shadow-sm bg-white flex-shrink-0"
          >
            <div className="relative h-32 bg-gray-200">
              <Image
                src={r.imageUrl || '/placeholder.png'}
                alt={r.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="bg-[#7D1972] p-3 text-white">
              <p className="text-sm font-semibold">{r.name}</p>
              <p className="text-sm mt-1">
                Rp {r.price.toLocaleString('id-ID')}
              </p>
              <p className="text-xs mt-1">{r.stock} stok</p>
            </div>
          </Link>
        ))}
      </div>

      {/* FIXED CHECKOUT BAR */}
      <CheckoutBar item={item} />
    </div>
  );
}

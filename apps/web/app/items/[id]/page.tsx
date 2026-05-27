import Image from 'next/image';
import CheckoutBar from '@/components/Checkoutbar';
import ItemCard from '@/components/ItemCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { IoArrowBackOutline } from 'react-icons/io5';

type RelatedItem = {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: number;
};

// === DETERMINISTIC HASH RANDOM (SAFE) ===
function hashNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 100000;
  }
  return hash;
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (isNaN(id) || id <= 0) return notFound();

  const apiBaseUrl = process.env.API_URL || 'http://localhost:8080';
  const itemRes = await fetch(`${apiBaseUrl}/api/items/${id}`, { cache: 'no-store' });
  if (!itemRes.ok) return notFound();
  const itemEnvelope = await itemRes.json();
  const item = itemEnvelope.data;

  if (!item) return notFound();

  const allRes = await fetch(`${apiBaseUrl}/api/items`, { cache: 'no-store' });
  const allEnvelope = await allRes.json();
  const allItems: RelatedItem[] = Array.isArray(allEnvelope.data)
    ? allEnvelope.data
    : Array.isArray(allEnvelope)
    ? allEnvelope
    : [];

  const related = allItems
    .filter((r) => r.id !== id && r.categoryId === item.categoryId)
    .slice(0, 10);

  const totalSold = item.sold ?? 0;

  const seed = hashNumber(String(item.id));
  const randomRating = 4 + (seed % 100) / 100;
  const randomReviews = 50 + (seed % 850);

  return (
    <div className="relative w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8 pt-20 sm:pt-20 pb-32 sm:pb-40 lg:pb-16 min-h-screen">
      {/* BREADCRUMB / BACK LINK */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-8 mt-2">
        <Link 
          href="/items" 
          className="hover:text-[#7D1972] transition-colors flex items-center gap-1.5 font-semibold text-[#7D1972] bg-white border border-gray-200 px-3.5 py-1.5 rounded-xl shadow-xs"
        >
          <IoArrowBackOutline size={16} /> Kembali ke Galeri
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-400 font-medium truncate max-w-[180px] sm:max-w-md">{item.name}</span>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mt-6">
        {/* ========== GALERI FOTO ========== */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 bg-white border border-gray-100 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col items-center justify-center">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white flex items-center justify-center">
              <Image
                src={item.imageUrl || '/placeholder.png'}
                alt={item.name}
                fill
                className="object-contain p-4 transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
            </div>
          </div>
        </div>

        {/* ========== DETAIL PRODUK & TOKO ========== */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            {/* BADGES */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-fuchsia-50 text-[#7D1972] rounded-full text-xs font-bold uppercase tracking-wider border border-fuchsia-100">
                {item.category || 'UMKM Banjarmasin'}
              </span>
              {item.stock > 0 ? (
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  item.stock > 5 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  Stok: {item.stock} Unit
                </span>
              ) : (
                <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-100">
                  Stok Habis
                </span>
              )}
            </div>

            {/* TITLE */}
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
              {item.name}
            </h1>

            {/* STATS */}
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 flex-wrap">
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-lg text-amber-600 font-semibold">
                <span className="text-base leading-none">★</span>
                <span>{randomRating.toFixed(1)}</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="hover:text-gray-800 transition cursor-pointer">{randomReviews} Ulasan</span>
              <span className="text-gray-300">|</span>
              <span>Terjual <span className="font-semibold text-gray-800">{totalSold}</span> produk</span>
            </div>

            {/* PRICE CARD */}
            <div className="bg-linear-to-r from-fuchsia-50/50 to-transparent border-l-4 border-[#7D1972] pl-4 py-3 mb-6">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Harga Terbaik</span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#7D1972]">
                Rp {item.price.toLocaleString('id-ID')}
              </h2>
            </div>

            <hr className="border-gray-200/80 mb-6" />

            {/* DESCRIPTION */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-900 text-base mb-3">Deskripsi Produk</h3>
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                {item.description || 'Tidak ada deskripsi lengkap untuk produk ini.'}
              </div>
            </div>

            {/* SELLER CARD */}
            <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-1.5">
                🏪 Informasi Penjual
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-[#7D1972] to-[#9c2292] text-white flex items-center justify-center font-extrabold text-lg shadow-sm shrink-0">
                    {item.seller ? item.seller.substring(0, 2).toUpperCase() : 'UM'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{item.seller || 'Seller UMKM'}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-yellow-500 mt-1">
                      <span>★</span>
                      <span className="font-semibold text-gray-700">{randomRating.toFixed(1)}</span>
                      <span className="text-gray-400">({randomReviews} Rating Toko)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col text-xs text-gray-500 border-t sm:border-t-0 sm:border-l border-gray-200/80 pt-3.5 sm:pt-0 sm:pl-5 sm:min-w-[180px]">
                  <span className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Lokasi Seller</span>
                  <span className="font-bold text-gray-900 flex items-center gap-1 text-sm mt-0.5">
                    📍 Banjarmasin
                  </span>
                  <span className="text-gray-400 mt-0.5">Melayani pengiriman nasional</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <div className="mt-16 border-t border-gray-200/80 pt-10">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          Produk Serupa Lainnya
        </h2>

        {related.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 text-sm shadow-xs">
            Tidak ada produk serupa di kategori ini.
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-6 pt-1 px-1 scroll-smooth no-scrollbar">
            {related.map((r) => (
              <div key={r.id} className="w-[180px] sm:w-[200px] md:w-[220px] shrink-0">
                <ItemCard item={r} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FIXED CHECKOUT BAR */}
      <CheckoutBar item={item} />
    </div>
  );
}

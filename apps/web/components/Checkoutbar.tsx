'use client';

import { useState } from 'react';

type Item = {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
};

export default function CheckoutBar({ item }: { item: Item }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(''); // ⬅ Tambahan untuk pesan error

  const updateQty = (value: number) => {
    setQty((prev) => {
      const newQty = prev + value;
      if (newQty < 1) return 1;
      if (newQty > item.stock) return item.stock;
      return newQty;
    });
  };

  const totalHarga = qty * item.price;

  /* ==========================================================
      HANDLE ADD TO CART
  ========================================================== */
  const handleAddToCart = async () => {
    try {
      setLoading(true);
      setAdded(false);
      setError('');

      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: item.id,
          quantity: qty,
        }),
      });

      // ❗ Jika belum login
      if (res.status === 401) {
        setError('Anda harus login terlebih dahulu.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError('Gagal menambah ke keranjang.');
        setLoading(false);
        return;
      }

      // ✔ Berhasil
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      setError('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: item.id,
          quantity: qty,
        }),
      });

      // ❗ Jika belum login
      if (res.status === 401) {
        setError('Anda harus login terlebih dahulu.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError('Gagal menambah ke keranjang.');
        setLoading(false);
        return;
      }

      // ✔ Jika berhasil, langsung menuju halaman cart
      window.location.href = '/cart';
    } catch (err) {
      setError('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="sticky bottom-0
    sm:fixed sm:bottom-0 sm:left-0 sm:right-0
    bg-white border-t border-gray-300 z-50"
    >
      <div
        className="container mx-auto px-3 py-3 
                        flex flex-col gap-3
                        sm:flex-row sm:items-center sm:justify-between"
      >
        {/* LEFT: Product image + title */}
        <div className="flex items-center gap-3 min-w-0 shrink sm:hidden md:flex">
          <div className="w-12 h-12 bg-gray-200 rounded-md shrink-0 overflow-hidden">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300" />
            )}
          </div>

          <div className="text-sm text-black truncate max-w-[140px] sm:max-w-[200px]">
            {item.name}
          </div>
        </div>

        {/* MIDDLE: Qty & Total Harga */}
        <div className="flex items-center justify-start gap-4 shrink-0 sm:w-auto">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <button
              className="px-2 text-xl text-gray-600 font-bold"
              onClick={() => updateQty(-1)}
            >
              −
            </button>

            <span className="px-3 text-lg text-black">{qty}</span>

            <button
              className="px-2 text-xl text-gray-600 font-bold"
              onClick={() => updateQty(1)}
              disabled={qty >= item.stock}
            >
              +
            </button>
          </div>

          <div className="flex flex-col text-right leading-tight">
            <span className="text-xs text-gray-700">Total Harga</span>
            <span className="text-lg sm:text-xl font-semibold text-fuchsia-900">
              Rp{totalHarga.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* RIGHT: Buttons */}
        <div className="flex flex-col items-end gap-2 shrink-0 w-full sm:w-auto">
          {/* Pesan Error */}
          {error && (
            <p className="text-sm text-red-600 font-medium text-right">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
            {/* Beli Sekarang */}
            <button
              onClick={handleBuyNow}
              disabled={loading}
              className="flex-1 text-center sm:flex-none py-2 px-4 border-2 border-[#7D1972] text-[#7D1972]
            rounded-2xl font-medium hover:bg-[#F7F0F6] hover:text-[#5B1154] hover:border-[#5B1154]"
            >
              {loading ? 'Memproses...' : 'Beli Sekarang'}
            </button>

            {/* Tambah ke Cart */}
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className={`flex-1 text-center sm:flex-none py-2 px-4 border-2 border-[#7D1972]
                        rounded-2xl font-medium text-white 
                        ${
                          loading
                            ? 'bg-[#9E1E93]'
                            : 'bg-[#7D1972] hover:bg-[#9E1E93] hover:border-[#9E1E93]'
                        }`}
            >
              {loading
                ? 'Memproses...'
                : added
                ? 'Berhasil ✓'
                : 'Tambah Ke Cart'}
            </button>

            {/* Favorite */}
            <button className="w-12 h-12 flex items-center justify-center rounded-full shadow bg-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-6 h-6 text-gray-500 hover:text-red-500 transition"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                         2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 
                         14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 
                         6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

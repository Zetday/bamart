'use client';

import { useState } from 'react';
import Image from 'next/image';

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
  const [error, setError] = useState('');

  const updateQty = (value: number) => {
    setQty((prev) => {
      const newQty = prev + value;
      if (newQty < 1) return 1;
      if (newQty > item.stock) return item.stock;
      return newQty;
    });
  };

  const totalHarga = qty * item.price;

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

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
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

      window.location.href = '/cart';
    } catch {
      setError('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky bottom-0 sm:fixed sm:bottom-0 sm:left-0 sm:right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)] z-50 transition-colors duration-200">
      <div className="container mx-auto px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* LEFT: Product image + title */}
        <div className="flex items-center gap-3 min-w-0 shrink sm:hidden md:flex">
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0 relative flex items-center justify-center">
            <Image
              src={item.imageUrl || '/placeholder.png'}
              alt={item.name}
              fill
              className="object-contain p-1"
              sizes="48px"
            />
          </div>

          <div className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[140px] sm:max-w-[200px]">
            {item.name}
          </div>
        </div>

        {/* MIDDLE: Qty & Total Harga */}
        <div className="flex items-center justify-between sm:justify-start gap-6 shrink-0 sm:w-auto">
          {/* Qty pill */}
          <div className="flex items-center bg-gray-100/80 border border-gray-200/40 rounded-xl px-2 py-1 shadow-inner shrink-0 dark:bg-gray-700 dark:border-gray-600">
            <button
              onClick={() => updateQty(-1)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 font-extrabold hover:bg-gray-200/60 rounded-lg transition disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-600/60"
            >
              −
            </button>

            <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-white">{qty}</span>

            <button
              onClick={() => updateQty(1)}
              disabled={qty >= item.stock}
              className="w-8 h-8 flex items-center justify-center text-gray-600 font-extrabold hover:bg-gray-200/60 rounded-lg transition disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-600/60"
            >
              +
            </button>
          </div>

          <div className="flex flex-col text-right leading-tight">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider block font-semibold">Total Harga</span>
            <span className="text-lg sm:text-xl font-extrabold text-[#7D1972] dark:text-fuchsia-400">
              Rp {totalHarga.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* RIGHT: Buttons */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 w-full sm:w-auto">
          {error && (
            <p className="text-xs text-red-500 font-bold text-right w-full">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
            {/* Beli Sekarang */}
            <button
              onClick={handleBuyNow}
              disabled={loading}
              className="flex-1 text-center sm:flex-none py-2.5 px-5 border-2 border-[#7D1972] text-[#7D1972] rounded-xl text-sm font-bold bg-white hover:bg-fuchsia-50/40 dark:bg-gray-800 dark:hover:bg-gray-700 transition duration-200 cursor-pointer"
            >
              {loading ? 'Memproses...' : 'Beli Sekarang'}
            </button>

            {/* Tambah ke Cart */}
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className={`flex-1 text-center sm:flex-none py-2.5 px-5 rounded-xl text-sm font-bold text-white transition duration-200 shadow-sm hover:shadow cursor-pointer
              ${
                loading
                  ? 'bg-[#9E1E93]'
                  : 'bg-[#7D1972] hover:bg-[#9E1E93]'
              }`}
            >
              {loading
                ? 'Memproses...'
                : added
                ? 'Berhasil ✓'
                : 'Tambah Ke Cart'}
            </button>

            {/* Favorite */}
            <button className="w-10 h-10 flex items-center justify-center rounded-xl shadow-xs bg-white border border-gray-200 hover:border-red-200 dark:bg-gray-700 dark:border-gray-600 hover:text-red-500 dark:hover:border-red-900 transition shrink-0 cursor-pointer group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

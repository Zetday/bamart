'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CheckoutBreadcrumb from '@/components/CheckoutBreadCrumb';
import CartItemSkeleton from '@/components/skeleton/CartItemSkeleton';
import OrderSummarySkeleton from '@/components/skeleton/OrderSummarySkeleton';
import { IoCartOutline, IoTrashOutline, IoArrowBackOutline } from 'react-icons/io5';

interface CartItem {
  id: number;
  cartId: number;
  itemId: number;
  itemName: string;
  itemPrice: number;
  itemImageUrl: string | null;
  quantity: number;
  subtotal: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const latestQtyRef = useRef<Record<number, number>>({});
  const updatingRef = useRef<Record<number, boolean>>({});
  const [isCartSyncing, setIsCartSyncing] = useState(false);

  // LOAD CART
  useEffect(() => {
    async function loadCart() {
      const res = await fetch('/api/cart');
      const data = await res.json();
      const sortedItems = (data?.items || []).sort((a: CartItem, b: CartItem) => a.id - b.id);
      setCart(sortedItems);
      setLoading(false);
    }
    loadCart();
  }, []);

  // UPDATE QTY
  async function updateQty(cartItemId: number, qty: number) {
    if (qty <= 0) return;

    setIsCartSyncing(true);

    // simpan qty terakhir
    latestQtyRef.current[cartItemId] = qty;

    // optimistic UI
    setCart((prev: CartItem[]) =>
      prev.map((c: CartItem) =>
        c.id === cartItemId
          ? { ...c, quantity: qty, subtotal: qty * c.itemPrice }
          : c
      )
    );

    if (updatingRef.current[cartItemId]) return;

    updatingRef.current[cartItemId] = true;

    while (latestQtyRef.current[cartItemId] !== undefined) {
      const latestQty = latestQtyRef.current[cartItemId];
      delete latestQtyRef.current[cartItemId];

      await fetch('/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity: latestQty }),
      });
    }

    updatingRef.current[cartItemId] = false;

    // 🔥 FINAL SYNC
    await syncCartFromServer();
    setIsCartSyncing(false);
  }

  async function syncCartFromServer() {
    const res = await fetch('/api/cart');
    const data = await res.json();
    const sortedItems = (data.items || []).sort((a: CartItem, b: CartItem) => a.id - b.id);
    setCart(sortedItems);
  }

  // REMOVE
  async function removeItem(cartItemId: number) {
    setIsCartSyncing(true);

    // optimistic
    setCart((prev: CartItem[]) => prev.filter((c: CartItem) => c.id !== cartItemId));

    await fetch('/api/cart/remove', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItemId }),
    });

    await syncCartFromServer();
    setIsCartSyncing(false);
  }

  const total = cart.reduce((sum: number, c: CartItem) => sum + c.subtotal, 0);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50/50 pt-20 sm:pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mt-6 lg:flex lg:items-start xl:gap-8">
            {/* LEFT */}
            <div className="w-full space-y-6 lg:max-w-2xl xl:max-w-4xl">
              <div className="h-6 w-40 rounded bg-gray-200 animate-pulse" />

              {[...Array(3)].map((_, i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>

            {/* RIGHT */}
            <div className="mt-6 lg:mt-0 lg:w-full max-w-4xl">
              <OrderSummarySkeleton />
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 pt-20 sm:pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4">
        <CheckoutBreadcrumb current="cart" />

        {cart.length === 0 ? (
          <div className="mt-8 bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 text-center shadow-sm max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-20 h-20 bg-fuchsia-50 text-[#7D1972] rounded-full flex items-center justify-center mb-6 border border-fuchsia-100">
              <IoCartOutline size={40} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Keranjang Belanja Kosong</h3>
            <p className="text-gray-500 text-sm sm:text-base max-w-md mb-8 leading-relaxed">
              Wah, keranjang belanjamu masih kosong. Yuk, cari produk UMKM menarik lainnya di galeri produk kami!
            </p>
            <Link
              href="/items"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7D1972] text-white font-bold rounded-2xl hover:bg-[#9c2292] shadow-sm hover:shadow transition-all"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT — ITEMS */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                Barang Belanjaan ({cart.length})
              </h2>

              {cart.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6 transition hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* IMAGE */}
                      <Link 
                        href={`/items/${c.itemId}`} 
                        className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0 relative flex items-center justify-center"
                      >
                        <Image
                          src={c.itemImageUrl || '/placeholder.png'}
                          fill
                          alt={c.itemName}
                          className="object-contain p-1"
                          sizes="80px"
                        />
                      </Link>

                      {/* DETAILS */}
                      <div className="min-w-0">
                        <Link
                          href={`/items/${c.itemId}`}
                          className="text-sm sm:text-base font-bold text-gray-900 hover:text-[#7D1972] transition truncate block max-w-[200px] sm:max-w-xs md:max-w-md"
                        >
                          {c.itemName}
                        </Link>
                        
                        <p className="text-xs text-gray-400 mt-1">
                          Rp {c.itemPrice.toLocaleString('id-ID')} / unit
                        </p>

                        <button
                          onClick={() => removeItem(c.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition mt-3 cursor-pointer"
                        >
                          <IoTrashOutline size={14} /> Hapus
                        </button>
                      </div>
                    </div>

                    {/* QUANTITY & SUB-TOTAL */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                      {/* QTY SELECTOR */}
                      <div className="flex items-center bg-gray-100/80 border border-gray-200/40 rounded-xl px-2 py-1 shadow-inner shrink-0">
                        <button
                          onClick={() => updateQty(c.id, c.quantity - 1)}
                          disabled={isCartSyncing}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 font-extrabold hover:bg-gray-200/60 rounded-lg transition disabled:opacity-50"
                        >
                          −
                        </button>

                        <span className="w-8 text-center text-sm font-bold text-gray-900">{c.quantity}</span>

                        <button
                          onClick={() => updateQty(c.id, c.quantity + 1)}
                          disabled={isCartSyncing}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 font-extrabold hover:bg-gray-200/60 rounded-lg transition disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>

                      {/* SUB-TOTAL */}
                      <div className="text-right sm:min-w-[120px]">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Subtotal</span>
                        <p className="text-base sm:text-lg font-extrabold text-[#7D1972] mt-0.5">
                          Rp {c.subtotal.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT — SUMMARY */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <div
                  className={`space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800
                  ${isCartSyncing ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-1.5">
                    Ringkasan Belanja
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                      <span>Total Barang ({cart.length})</span>
                      <span className="text-gray-900 dark:text-white font-medium">Rp {total.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                      <span>Biaya Pengiriman</span>
                      <span className="text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900 px-2 py-0.5 rounded">
                        Dihitung di Checkout
                      </span>
                    </div>

                    <hr className="border-gray-100 dark:border-gray-700" />

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-base font-extrabold text-gray-900 dark:text-white">Total Tagihan</span>
                      <span className="text-lg sm:text-xl font-black text-[#7D1972]">
                        Rp {total.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* CHECKOUT BUTTON */}
                  <Link
                    href={cart.length === 0 || isCartSyncing ? '#' : '/checkout'}
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      if (cart.length === 0 || isCartSyncing) {
                        e.preventDefault();
                        return;
                      }
                    }}
                    className={`flex w-full items-center justify-center rounded-xl py-3 px-5 text-sm font-bold text-white shadow-sm transition-all duration-200
                    ${
                      cart.length === 0 || isCartSyncing
                        ? 'bg-gray-300 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed shadow-none'
                        : 'bg-[#7D1972] hover:bg-[#9E1E93] hover:shadow'
                    }`}
                  >
                    {isCartSyncing ? 'Memperbarui harga...' : 'Lanjutkan ke Checkout'}
                  </Link>

                  {/* BACK TO SHOPPING BUTTON */}
                  <Link
                    href="/items"
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3 px-5 text-sm font-bold text-[#7D1972] bg-white border-2 border-[#7D1972] hover:bg-fuchsia-50/40 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-200 shadow-xs"
                  >
                    <IoArrowBackOutline size={16} /> Kembali ke Galeri
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

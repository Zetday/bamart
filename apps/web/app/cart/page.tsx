'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CheckoutBreadcrumb from '@/components/CheckoutBreadCrumb';
import CartItemSkeleton from '@/components/skeleton/CartItemSkeleton';
import OrderSummarySkeleton from '@/components/skeleton/OrderSummarySkeleton';

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
      setCart(data?.items || []);
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
    setCart(data.items || []);
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
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-5">
        <div className="mx-auto max-w-7xl px-4 pt-18">
          <div className="mt-6 lg:flex lg:items-start xl:gap-8">
            {/* LEFT */}
            <div className="w-full space-y-6 lg:max-w-2xl xl:max-w-4xl">
              <div className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />

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
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-5">
      {/* Tambahkan padding-top agar breadcrumb tidak tertutup */}
      <div className="mx-auto max-w-7xl px-4 pt-18">
        <CheckoutBreadcrumb current="cart" />

        <div className="mt-6 lg:flex lg:items-start xl:gap-8">
          {/* LEFT */}
          <div className="w-full space-y-6 lg:max-w-2xl xl:max-w-4xl">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Shopping Cart
            </h2>

            {cart.length === 0 ? (
              <p className="text-gray-500">Keranjang anda masih kosong</p>
            ) : (
              cart.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm 
                  dark:border-gray-700 dark:bg-gray-800 md:p-6"
                >
                  <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
                    {/* IMAGE */}
                    <Image
                      src={c.itemImageUrl || '/placeholder.png'}
                      width={80}
                      height={80}
                      alt={c.itemName}
                      className="rounded-md object-cover shrink-0 md:order-1"
                    />

                    {/* QUANTITY */}
                    <div className="flex items-center justify-between md:order-3 md:justify-end">
                      <div className="flex items-center">
                        <button
                          onClick={() => updateQty(c.id, c.quantity - 1)}
                          className="inline-flex h-5 w-5 items-center justify-center 
                          rounded-md border border-gray-300 bg-gray-100 dark:bg-gray-700 cursor-pointer"
                        >
                          -
                        </button>

                        <input
                          type="text"
                          readOnly
                          value={c.quantity}
                          className="w-10 text-center bg-transparent font-medium text-gray-900 dark:text-white"
                        />

                        <button
                          onClick={() => updateQty(c.id, c.quantity + 1)}
                          className="inline-flex h-5 w-5 items-center justify-center 
                          rounded-md border border-gray-300 bg-gray-100 dark:bg-gray-700 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <p className="text-base font-bold text-gray-900 dark:text-white md:w-32 text-end">
                        Rp {c.subtotal.toLocaleString('id-ID')}
                      </p>
                    </div>

                    {/* DETAILS */}
                    <div className="w-full md:max-w-md md:order-2 space-y-3">
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {c.itemName}
                      </p>

                      <button
                        onClick={() => removeItem(c.id)}
                        className="text-sm font-medium text-red-600 dark:text-red-500 cursor-pointer hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT — SUMMARY */}
          <div className="mt-6 lg:mt-0 lg:w-full max-w-4xl">
            <div
              className={`space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm
            ${isCartSyncing ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                Order Summary
              </p>

              <dl className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                <dt className="text-base font-bold text-gray-900 dark:text-white">
                  Total
                </dt>
                <dd className="text-base font-bold text-gray-900 dark:text-white">
                  Rp {total.toLocaleString('id-ID')}
                </dd>
              </dl>

              {/* CHECKOUT BUTTON */}
              <Link
                href={cart.length === 0 || isCartSyncing ? '#' : '/checkout'}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (cart.length === 0 || isCartSyncing) {
                    e.preventDefault();
                    return;
                  }
                }}
                className={`flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-white
                ${
                  cart.length === 0 || isCartSyncing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#7D1972] hover:bg-[#9E1E93]'
                }`}
              >
                {isCartSyncing
                  ? 'Memperbarui harga...'
                  : 'Lanjutkan ke Checkout'}
              </Link>

              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-gray-500">or</span>

                <Link
                  href="/items"
                  className="text-sm font-medium text-[#7D1972] underline"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

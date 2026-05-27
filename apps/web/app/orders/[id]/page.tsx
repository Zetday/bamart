'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import OrderDetailSkeleton from '@/components/skeleton/OrderDetailSkeleton';
import { IoReceiptOutline, IoArrowBackOutline } from 'react-icons/io5';

interface OrderItem {
  id: number;
  quantity: number;
  subtotal: number;
  itemName?: string;
  itemPrice?: number;
  itemImageUrl?: string | null;
  item?: {
    id: number;
    name: string;
    price: number;
    imageUrl: string | null;
  };
}

interface OrderDetail {
  id: number;
  orderDate: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string | null;
  totalPrice: number;
  status: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/order/detail?orderId=${orderId}`);
      const data = await res.json();
      setOrder(data.order);
    }
    load();
  }, [orderId]);

  if (!order) {
    return <OrderDetailSkeleton />;
  }

  const orderDate = new Date(order.orderDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const subtotal = order.items.reduce((sum, i) => sum + i.subtotal, 0);
  const shippingCost = order.totalPrice - subtotal;

  function getStatusBadge(status: string) {
    const s = status.toUpperCase();
    if (s === 'PENDING') {
      return (
        <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-900">
          Pending
        </span>
      );
    }
    if (s === 'PAID' || s === 'SUCCESS') {
      return (
        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/30 dark:text-emerald-400 dark:ring-emerald-900">
          Paid
        </span>
      );
    }
    if (s === 'SHIPPED') {
      return (
        <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-900">
          Shipped
        </span>
      );
    }
    if (s === 'COMPLETED') {
      return (
        <span className="inline-flex items-center rounded-md bg-fuchsia-50 px-2.5 py-1 text-xs font-bold text-[#7D1972] ring-1 ring-inset ring-[#7D1972]/10 dark:bg-fuchsia-950/30 dark:text-fuchsia-400 dark:ring-fuchsia-900">
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-700/10 dark:bg-rose-950/30 dark:text-rose-400 dark:ring-rose-900">
        {status}
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-20 sm:pt-24 pb-16 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4">
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#7D1972] dark:text-fuchsia-400 hover:underline">
            <IoArrowBackOutline size={16} /> Kembali ke Riwayat
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN — ORDER DETAILS & PRODUCTS */}
          <div className="lg:col-span-8 space-y-6">
            {/* ORDER HEADER & RECEIVER INFO CARD */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-fuchsia-50 text-[#7D1972] dark:bg-fuchsia-950/40 dark:text-fuchsia-400 shrink-0">
                    <IoReceiptOutline size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Detail Pesanan #{order.id}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dibuat pada {orderDate}</p>
                  </div>
                </div>
                <div>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 text-sm">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Informasi Penerima</h4>
                  <p className="font-bold text-gray-900 dark:text-white">{order.fullName}</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">{order.phone}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Alamat Pengiriman</h4>
                  <p className="text-gray-900 dark:text-white leading-relaxed">{order.address}</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-0.5">{order.city}, {order.postalCode}</p>
                </div>
                {order.notes && (
                  <div className="sm:col-span-2 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Catatan Pengiriman</h4>
                    <p className="text-gray-600 dark:text-gray-300 dark:text-gray-400 italic">"{order.notes}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* PRODUCTS PURCHASED CARD */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                Produk yang Dibeli ({order.items.length})
              </h3>

              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {order.items.map((ci) => {
                  const name = ci.itemName || ci.item?.name || 'Barang';
                  const imageUrl = ci.itemImageUrl || ci.item?.imageUrl;
                  const price = ci.itemPrice ?? ci.item?.price ?? (ci.quantity > 0 ? ci.subtotal / ci.quantity : 0);

                  return (
                    <div key={ci.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="w-16 h-16 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0 relative overflow-hidden flex items-center justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={name}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] text-gray-400 font-medium">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <Link href={`/items/${ci.item?.id || ci.id}`} className="font-bold text-sm text-gray-900 dark:text-white hover:text-[#7D1972] dark:hover:text-fuchsia-400 transition truncate block">
                          {name}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {ci.quantity} × Rp {price.toLocaleString('id-ID')}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-extrabold text-sm text-[#7D1972] dark:text-fuchsia-400">
                          Rp {ci.subtotal.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — SUMMARY */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
                  Ringkasan Pembayaran
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      Rp {subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                    <span>Ongkir</span>
                    <span className={`font-semibold ${shippingCost === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                      {shippingCost === 0
                        ? 'Gratis'
                        : `Rp ${shippingCost.toLocaleString('id-ID')}`}
                    </span>
                  </div>

                  <hr className="border-gray-100 dark:border-gray-700" />

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-base font-extrabold text-gray-900 dark:text-white">Total Pembayaran</span>
                    <span className="text-lg sm:text-xl font-black text-[#7D1972]">
                      Rp {order.totalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="mt-6 space-y-3">
                  {order.status === 'PENDING' && (
                    <Link
                      href={`/payment?orderId=${order.id}`}
                      className="flex w-full items-center justify-center rounded-xl py-3 px-5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 shadow-xs transition-all duration-200"
                    >
                      Lanjutkan Pembayaran
                    </Link>
                  )}

                  <Link
                    href="/items"
                    className="flex w-full items-center justify-center rounded-xl py-3 px-5 text-sm font-bold text-white bg-[#7D1972] hover:bg-[#9E1E93] hover:shadow transition-all duration-200"
                  >
                    Belanja Lagi
                  </Link>

                  <Link
                    href="/orders"
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3 px-5 text-sm font-bold text-[#7D1972] bg-white border-2 border-[#7D1972] hover:bg-fuchsia-50/40 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    Kembali ke Riwayat
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


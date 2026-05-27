'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import OrdersListSkeleton from '@/components/skeleton/OrdersListSkeleton';
import { IoReceiptOutline } from 'react-icons/io5';

interface OrderListItem {
  id: number;
  orderDate: string;
  totalPrice: number;
  status: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/order/list');
      const data = await res.json();

      if (data.orders) {
        setOrders(data.orders);
      }

      setLoading(false);
    }

    load();
  }, []);

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
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Riwayat Order
          </h2>
          <span className="text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            Total {orders.length} pesanan
          </span>
        </div>

        {/* Loading State */}
        {loading && <OrdersListSkeleton />}

        {/* Tidak ada order */}
        {!loading && orders.length === 0 && (
          <div className="bg-white border border-gray-100 dark:border-gray-800 dark:bg-gray-800 rounded-3xl p-8 sm:p-12 text-center shadow-sm flex flex-col items-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-fuchsia-50 text-[#7D1972] rounded-full flex items-center justify-center mb-6 border border-fuchsia-100 dark:bg-fuchsia-950/40 dark:text-fuchsia-400 dark:border-fuchsia-900">
              <IoReceiptOutline size={40} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Belum Ada Pesanan
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md mb-8 leading-relaxed">
              Kamu belum memiliki riwayat pemesanan produk UMKM. Yuk, cari produk menarik lainnya di galeri produk kami!
            </p>
            <Link
              href="/items"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7D1972] text-white font-bold rounded-2xl hover:bg-[#9c2292] shadow-sm hover:shadow transition-all"
            >
              Mulai Belanja
            </Link>
          </div>
        )}

        {/* Order List */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const date = new Date(order.orderDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-[#7D1972] transition duration-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[#7D1972] md:p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-fuchsia-50 text-[#7D1972] dark:bg-fuchsia-950/40 dark:text-fuchsia-400 shrink-0">
                        <IoReceiptOutline size={22} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          Order #{order.id}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Dibuat pada {date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:text-right border-t sm:border-t-0 border-gray-100 dark:border-gray-700 pt-3 sm:pt-0">
                      <div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider block font-semibold">Total Tagihan</span>
                        <p className="font-extrabold text-base text-[#7D1972] dark:text-fuchsia-400 mt-0.5">
                          Rp {order.totalPrice.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import OrdersListSkeleton from '@/components/skeleton/OrdersListSkeleton';

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

  return (
    <>
      <div className="pt-24 px-4 max-w-3xl mx-auto pb-12">
        <h2 className="text-2xl font-bold mb-6">Riwayat Order</h2>

        {/* Loading State */}
        {loading && <OrdersListSkeleton />}

        {/* Tidak ada order */}
        {!loading && orders.length === 0 && (
          <div className="text-gray-600 text-center py-6">
            Anda belum memiliki order.
            <br />
            <Link href="/items" className="text-[#7D1972] underline">
              Mulai belanja sekarang
            </Link>
          </div>
        )}

        {/* Order List */}
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
                className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Order #{order.id}
                    </p>
                    <p className="text-gray-500 text-sm">{date}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      Rp {order.totalPrice.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-[#7D1972] font-medium">
                      {order.status}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

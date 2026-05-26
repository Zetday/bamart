'use client';

import CheckoutBreadcrumb from '@/components/CheckoutBreadCrumb';
import Link from 'next/link';
import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  /* ======================================================
   SUMMARY ROW — typed version
====================================================== */
  interface SummaryRowProps {
    label: string;
    value: React.ReactNode;
    bold?: boolean;
  }

  function SummaryRow({ label, value, bold }: SummaryRowProps) {
    return (
      <dl className="flex items-center justify-between py-3">
        <dt className={`text-base ${bold ? 'font-bold' : 'text-gray-500'}`}>
          {label}
        </dt>
        <dd className={`text-base ${bold ? 'font-bold' : 'font-medium'}`}>
          {value}
        </dd>
      </dl>
    );
  }

  const router = useRouter();

  const [subtotal, setSubtotal] = useState<number>(0);
  const [subtotalLoading, setSubtotalLoading] = useState<boolean>(true);
  const [delivery, setDelivery] = useState<'reguler' | 'cepat'>('reguler');
  const [loading, setLoading] = useState<boolean>(false);

  const shippingCost = delivery === 'cepat' ? 15000 : 0;
  const total = subtotal + shippingCost;

  /* ============================================
      LOAD SUBTOTAL DARI API
  ============================================ */
  useEffect(() => {
    async function loadSubtotal() {
      try {
        const res = await fetch('/api/cart/summary');
        const data: { subtotal: number } = await res.json();
        setSubtotal(data.subtotal || 0);
      } finally {
        setSubtotalLoading(false);
      }
    }
    loadSubtotal();
  }, []);

  /* ============================================
      HANDLE SUBMIT
  ============================================ */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = Object.fromEntries(formData.entries());

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...payload, delivery }),
    });

    const data: { redirect?: string } = await res.json();

    if (data.redirect) {
      router.push(data.redirect);
    }

    setLoading(false);
  }

  function renderValue(value: string) {
    return (
      <span className="inline-block h-4 w-24 rounded bg-gray-200 animate-pulse" />
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-7xl px-4 2xl:px-0 py-6 pt-23"
      >
        <CheckoutBreadcrumb current="checkout" />

        <div className="mt-6 sm:mt-8 lg:flex lg:items-start lg:gap-12 xl:gap-16">
          {/* LEFT SECTION */}
          <div className="min-w-0 flex-1 space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Detail Pengiriman
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* FULL NAME */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Nama Lengkap*
                  </label>
                  <input
                    name="fullName"
                    required
                    className="block w-full rounded-lg border p-2.5"
                    type="text"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    No. Telepon*
                  </label>

                  <div className="flex items-center">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-s-lg border border-gray-300 bg-gray-100
                                 px-4 py-2.5 text-sm font-medium text-gray-900"
                    >
                      +62
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <path
                          stroke="currentColor"
                          strokeWidth="2"
                          d="m19 9-7 7-7-7"
                        />
                      </svg>
                    </button>

                    <input
                      type="number"
                      name="phone"
                      placeholder="XXXXXXXXXXX"
                      required
                      className="block w-full rounded-e-lg border border-gray-300 bg-gray-50 p-2.5 
                                 text-sm text-gray-900 focus:border-[#7D1972] focus:ring-[#7D1972]"
                    />
                  </div>
                </div>

                {/* CITY */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Kota*
                  </label>
                  <input
                    name="city"
                    required
                    className="block w-full rounded-lg border p-2.5"
                  />
                </div>

                {/* ADDRESS */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Alamat Lengkap*
                  </label>
                  <textarea
                    name="address"
                    required
                    className="block w-full rounded-lg border p-2.5 h-24"
                  />
                </div>

                {/* POSTAL CODE */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Kode Pos*
                  </label>
                  <input
                    name="postalCode"
                    required
                    type="number"
                    className="block w-full rounded-lg border p-2.5"
                  />
                </div>

                {/* NOTES */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    name="notes"
                    className="block w-full rounded-lg border p-2.5 h-20"
                  />
                </div>
              </div>

              {/* DELIVERY METHODS */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pilih Metode Pengantaran
                </h3>

                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      value="reguler"
                      checked={delivery === 'reguler'}
                      onChange={() => setDelivery('reguler')}
                    />
                    Reguler (Gratis)
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      value="cepat"
                      checked={delivery === 'cepat'}
                      onChange={() => setDelivery('cepat')}
                    />
                    Pengiriman Cepat (+Rp15.000)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="mt-6 w-full space-y-6 lg:max-w-xs xl:max-w-md">
            <div className="flow-root">
              <div className="-my-3 divide-y">
                <SummaryRow
                  label="Subtotal"
                  value={
                    subtotalLoading
                      ? renderValue('')
                      : `Rp ${subtotal.toLocaleString('id-ID')}`
                  }
                />

                <SummaryRow
                  label="Pengiriman"
                  value={
                    shippingCost === 0
                      ? 'Gratis'
                      : `Rp ${shippingCost.toLocaleString()}`
                  }
                />
                <SummaryRow
                  label="Total"
                  bold
                  value={
                    subtotalLoading
                      ? renderValue('')
                      : `Rp ${total.toLocaleString('id-ID')}`
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || subtotalLoading}
              className={`w-full rounded-lg py-2.5 text-white
              ${
                loading || subtotalLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#7D1972] hover:bg-[#9E1E93]'
              }`}
            >
              {subtotalLoading
                ? 'Menghitung total...'
                : loading
                ? 'Memproses...'
                : 'Lanjutkan ke Pembayaran'}
            </button>

            <p className="text-sm text-gray-500">
              Belum yakin?{' '}
              <Link href="/cart" className="text-[#7D1972] underline">
                Kembali ke Cart
              </Link>
            </p>
          </div>
        </div>
      </form>
    </>
  );
}

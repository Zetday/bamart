'use client';

import CheckoutBreadcrumb from '@/components/CheckoutBreadCrumb';
import Link from 'next/link';
import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  /* ======================================================
   SUMMARY ROW — typed version
====================================================== */
  // Removed SummaryRow to use inline styling consistent with Cart page


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

    const result = await res.json();
    const redirectUrl = result.data?.redirect || result.redirect;

    if (redirectUrl) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('page-navigation-start'));
      }
      router.push(redirectUrl);
    } else {
      setLoading(false);
    }
  }

  function renderValue() {
    return (
      <span className="inline-block h-4 w-24 rounded bg-gray-200 animate-pulse" />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-20 sm:pt-24 pb-16 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4">
        <CheckoutBreadcrumb current="checkout" />

        <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SECTION */}
          <div className="lg:col-span-8 space-y-6">
            {/* DELIVERY DETAILS CARD */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">
                Detail Pengiriman
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* FULL NAME */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Nama Lengkap*
                  </label>
                  <input
                    name="fullName"
                    required
                    className="block w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm text-gray-900 focus:border-[#7D1972] focus:ring-1 focus:ring-[#7D1972] focus:outline-hidden dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:border-[#7D1972] dark:focus:ring-[#7D1972]"
                    type="text"
                  />
                </div>

                {/* PHONE */}
                <div className="sm:col-span-1">
                  <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">
                    No. Telepon*
                  </label>

                  <div className="flex items-center">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-l-xl border border-r-0 border-gray-300 bg-gray-100
                                 px-4 py-3 text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    >
                      +62
                    </span>

                    <input
                      type="tel"
                      name="phone"
                      placeholder="XXXXXXXXXXX"
                      required
                      className="block w-full rounded-r-xl border border-gray-300 bg-gray-50/50 p-3 
                                 text-sm text-gray-900 focus:border-[#7D1972] focus:ring-1 focus:ring-[#7D1972] focus:outline-hidden
                                 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:border-[#7D1972] dark:focus:ring-[#7D1972]"
                    />
                  </div>
                </div>

                {/* CITY */}
                <div className="sm:col-span-1">
                  <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Kota*
                  </label>
                  <input
                    name="city"
                    required
                    className="block w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm text-gray-900 focus:border-[#7D1972] focus:ring-1 focus:ring-[#7D1972] focus:outline-hidden dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:border-[#7D1972] dark:focus:ring-[#7D1972]"
                    type="text"
                  />
                </div>

                {/* ADDRESS */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Alamat Lengkap*
                  </label>
                  <textarea
                    name="address"
                    required
                    className="block w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm text-gray-900 focus:border-[#7D1972] focus:ring-1 focus:ring-[#7D1972] focus:outline-hidden dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:border-[#7D1972] dark:focus:ring-[#7D1972] h-24 resize-none"
                  />
                </div>

                {/* POSTAL CODE */}
                <div className="sm:col-span-1">
                  <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Kode Pos*
                  </label>
                  <input
                    name="postalCode"
                    required
                    type="number"
                    className="block w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm text-gray-900 focus:border-[#7D1972] focus:ring-1 focus:ring-[#7D1972] focus:outline-hidden dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:border-[#7D1972] dark:focus:ring-[#7D1972]"
                  />
                </div>

                {/* NOTES */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    name="notes"
                    className="block w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm text-gray-900 focus:border-[#7D1972] focus:ring-1 focus:ring-[#7D1972] focus:outline-hidden dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:border-[#7D1972] dark:focus:ring-[#7D1972] h-20 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* DELIVERY METHODS CARD */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">
                Pilih Metode Pengantaran
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* REGULER */}
                <label
                  className={`relative flex cursor-pointer rounded-xl border p-4 shadow-xs focus:outline-none transition-all duration-200
                  ${
                    delivery === 'reguler'
                      ? 'border-[#7D1972] bg-fuchsia-50/10 ring-2 ring-[#7D1972]/20 dark:border-[#7D1972]'
                      : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="reguler"
                    checked={delivery === 'reguler'}
                    onChange={() => setDelivery('reguler')}
                    className="sr-only"
                  />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-200
                        ${
                          delivery === 'reguler'
                            ? 'border-[#7D1972] bg-[#7D1972]'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {delivery === 'reguler' && (
                          <span className="h-2.5 w-2.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Reguler</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Estimasi 3 - 5 hari kerja</span>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-[#7D1972]">Gratis</span>
                  </div>
                </label>

                {/* CEPAT */}
                <label
                  className={`relative flex cursor-pointer rounded-xl border p-4 shadow-xs focus:outline-none transition-all duration-200
                  ${
                    delivery === 'cepat'
                      ? 'border-[#7D1972] bg-fuchsia-50/10 ring-2 ring-[#7D1972]/20 dark:border-[#7D1972]'
                      : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="cepat"
                    checked={delivery === 'cepat'}
                    onChange={() => setDelivery('cepat')}
                    className="sr-only"
                  />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-200
                        ${
                          delivery === 'cepat'
                            ? 'border-[#7D1972] bg-[#7D1972]'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {delivery === 'cepat' && (
                          <span className="h-2.5 w-2.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Pengiriman Cepat</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Estimasi 1 - 2 hari kerja</span>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-[#7D1972]">Rp 15.000</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION — SUMMARY */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <div
                className={`space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6
                ${loading || subtotalLoading ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
                  Ringkasan Belanja
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {subtotalLoading
                        ? renderValue()
                        : `Rp ${subtotal.toLocaleString('id-ID')}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                    <span>Pengiriman</span>
                    <span className={`font-semibold ${shippingCost === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                      {shippingCost === 0
                        ? 'Gratis'
                        : `Rp ${shippingCost.toLocaleString('id-ID')}`}
                    </span>
                  </div>

                  <hr className="border-gray-100 dark:border-gray-700" />

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-base font-extrabold text-gray-900 dark:text-white">Total Tagihan</span>
                    <span className="text-lg sm:text-xl font-black text-[#7D1972]">
                      {subtotalLoading
                        ? renderValue()
                        : `Rp ${total.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || subtotalLoading}
                  className={`flex w-full items-center justify-center rounded-xl py-3 px-5 text-sm font-bold text-white shadow-sm transition-all duration-200
                  ${
                    loading || subtotalLoading
                      ? 'bg-gray-300 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed shadow-none'
                      : 'bg-[#7D1972] hover:bg-[#9E1E93] hover:shadow'
                  }`}
                >
                  {subtotalLoading
                    ? 'Menghitung total...'
                    : loading
                    ? 'Memproses...'
                    : 'Lanjutkan ke Pembayaran'}
                </button>

                <div className="text-center pt-2">
                  <Link href="/cart" className="text-sm font-bold text-[#7D1972] hover:underline dark:text-fuchsia-400">
                    Kembali ke Cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import CheckoutBreadcrumb from '@/components/CheckoutBreadCrumb';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const params = useSearchParams();
  const router = useRouter();

  const orderId = params.get('orderId');

  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [totalLoading, setTotalLoading] = useState(true);

  const [method, setMethod] = useState<string>(''); // QRIS / VA / EWALLET
  const [bank, setBank] = useState('BCA');
  const [vaNumber, setVaNumber] = useState(''); // Stable VA — generated once

  /* -----------------------------------
        LOAD TOTAL ORDER
  ----------------------------------- */
  useEffect(() => {
    async function load() {
      if (!orderId) return;

      setTotalLoading(true);

      try {
        const res = await fetch(`/api/order/summary?orderId=${orderId}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        setTotal(data.total || 0);
      } finally {
        setTotalLoading(false);
      }
    }
    load();
  }, [orderId]);

  /* -----------------------------------
        GENERATE VA WHEN SELECTED
  ----------------------------------- */
  function handleSelectMethod(value: string) {
    setMethod(value);

    if (value === 'VA' && !vaNumber) {
      // Generate VA once
      const random = Math.floor(1000000000 + Math.random() * 9000000000);
      setVaNumber(`7777${random}`);
    }
  }

  /* -----------------------------------
        MOCK PAYMENT SIMULATION
  ----------------------------------- */
  async function handlePay(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    // Simulasi proses pembayaran 2 detik (seperti gateway asli)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Kirim mock ke server
      const res = await fetch('/api/order/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId ? Number(orderId) : 0,
          method,
          bank,
          vaNumber,
          mockSuccess: true, // tanda untuk backend (opsional)
        }),
      });

      if (!res.ok) {
        toast.error('Gagal memproses pembayaran');
        setLoading(false);
        return;
      }

      // Redirect ke halaman sukses mock
      router.push(`/success?orderId=${orderId}`);
    } catch {
      toast.error('Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setLoading(false);
    }
  }

  /* -----------------------------------
        UI
  ----------------------------------- */
  return (
    <div className="min-h-screen bg-gray-50/50 pt-20 sm:pt-24 pb-16 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4">
        <CheckoutBreadcrumb current="payment" />

        <form onSubmit={handlePay} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDE - PAYMENT FORM */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">
                Pilih Metode Pembayaran
              </h3>

              {/* PAYMENT METHOD CHOICES */}
              <div className="flex flex-col gap-3">
                {/* QRIS */}
                <label
                  className={`relative flex cursor-pointer rounded-xl border p-4 shadow-xs focus:outline-none transition-all duration-200
                  ${
                    method === 'QRIS'
                      ? 'border-[#7D1972] bg-fuchsia-50/10 ring-2 ring-[#7D1972]/20 dark:border-[#7D1972]'
                      : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="QRIS"
                    checked={method === 'QRIS'}
                    onChange={() => handleSelectMethod('QRIS')}
                    className="sr-only"
                    required
                  />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-200
                        ${
                          method === 'QRIS'
                            ? 'border-[#7D1972] bg-[#7D1972]'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {method === 'QRIS' && (
                          <span className="h-2.5 w-2.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">QRIS</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Pembayaran instan via GoPay, OVO, Dana, LinkAja, dll.</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900">Rekomendasi</span>
                  </div>
                </label>

                {/* VA */}
                <label
                  className={`relative flex cursor-pointer rounded-xl border p-4 shadow-xs focus:outline-none transition-all duration-200
                  ${
                    method === 'VA'
                      ? 'border-[#7D1972] bg-fuchsia-50/10 ring-2 ring-[#7D1972]/20 dark:border-[#7D1972]'
                      : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="VA"
                    checked={method === 'VA'}
                    onChange={() => handleSelectMethod('VA')}
                    className="sr-only"
                  />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-200
                        ${
                          method === 'VA'
                            ? 'border-[#7D1972] bg-[#7D1972]'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {method === 'VA' && (
                          <span className="h-2.5 w-2.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Virtual Account Bank</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Transfer otomatis via BCA, Mandiri, BNI, BRI.</span>
                      </div>
                    </div>
                  </div>
                </label>

                {/* EWALLET */}
                <label
                  className={`relative flex cursor-pointer rounded-xl border p-4 shadow-xs focus:outline-none transition-all duration-200
                  ${
                    method === 'EWALLET'
                      ? 'border-[#7D1972] bg-fuchsia-50/10 ring-2 ring-[#7D1972]/20 dark:border-[#7D1972]'
                      : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="EWALLET"
                    checked={method === 'EWALLET'}
                    onChange={() => handleSelectMethod('EWALLET')}
                    className="sr-only"
                  />
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-200
                        ${
                          method === 'EWALLET'
                            ? 'border-[#7D1972] bg-[#7D1972]'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {method === 'EWALLET' && (
                          <span className="h-2.5 w-2.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">E-Wallet</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Bayar langsung menggunakan aplikasi DANA, OVO, atau GoPay.</span>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* QRIS SECTION */}
              {method === 'QRIS' && (
                <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6 text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Scan QR Code di bawah untuk membayar:
                  </p>
                  <div className="inline-block p-4 rounded-2xl bg-white border border-gray-200 dark:border-gray-700 shadow-inner">
                    <img
                      src="/payment/qris.svg"
                      alt="QRIS"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-4">
                    Pastikan total pembayaran Anda tepat:
                    <span className="font-extrabold text-[#7D1972] block text-base mt-0.5">
                      Rp {total.toLocaleString('id-ID')}
                    </span>
                  </p>
                </div>
              )}

              {/* VIRTUAL ACCOUNT SECTION */}
              {method === 'VA' && (
                <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Pilih Bank Virtual Account
                    </label>
                    <select
                      className="w-full rounded-xl border border-gray-300 bg-gray-50/50 p-3 text-sm text-gray-900 focus:border-[#7D1972] focus:ring-1 focus:ring-[#7D1972] focus:outline-hidden dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:border-[#7D1972] dark:focus:ring-[#7D1972]"
                      onChange={(e) => setBank(e.target.value)}
                      value={bank}
                    >
                      <option value="BCA">BCA Virtual Account</option>
                      <option value="BRI">BRI Virtual Account</option>
                      <option value="BNI">BNI Virtual Account</option>
                      <option value="MANDIRI">Mandiri Virtual Account</option>
                    </select>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex flex-col items-center">
                    <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Nomor Virtual Account</span>
                    <p className="font-mono font-black text-2xl text-gray-900 dark:text-white tracking-widest mt-1">
                      {vaNumber}
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#7D1972] dark:text-fuchsia-400 hover:underline mt-2 cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(vaNumber);
                        toast.success('Nomor VA berhasil disalin!');
                      }}
                    >
                      Salin Nomor VA
                    </button>
                  </div>

                  <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed text-center">
                    Pembayaran dapat ditransfer melalui ATM, Mobile Banking, atau Internet Banking sesuai bank yang dipilih.
                  </p>
                </div>
              )}

              {/* EWALLET SECTION */}
              {method === 'EWALLET' && (
                <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6 space-y-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                    Dukung pembayaran via aplikasi dompet digital populer:
                  </p>
                  <div className="grid grid-cols-3 gap-4 items-center justify-center px-4">
                    <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center h-14">
                      <img
                        src="/payment/dana.png"
                        className="max-h-7 object-contain opacity-90"
                        alt="DANA"
                      />
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center h-14">
                      <img
                        src="/payment/ovo.jpg"
                        className="max-h-8 object-contain rounded-md opacity-90"
                        alt="OVO"
                      />
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center h-14">
                      <img
                        src="/payment/gopay.png"
                        className="max-h-5 object-contain opacity-90"
                        alt="GoPay"
                      />
                    </div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs text-center leading-relaxed">
                    Setelah mengklik tombol Bayar, Anda akan diarahkan ke halaman otentikasi e-wallet Anda.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE - SUMMARY */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
                Ringkasan Pembayaran
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                  <span>Nomor Order</span>
                  <span className="text-gray-900 dark:text-white font-mono font-semibold">#{orderId}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                  <span>Metode Pembayaran</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {method ? (method === 'VA' ? `VA - ${bank}` : method) : '-'}
                  </span>
                </div>

                <hr className="border-gray-100 dark:border-gray-700" />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">Total Tagihan</span>
                  <span className="text-lg sm:text-xl font-black text-[#7D1972]">
                    {totalLoading ? (
                      <span className="inline-block h-5 w-24 rounded bg-gray-200 animate-pulse" />
                    ) : (
                      `Rp ${total.toLocaleString('id-ID')}`
                    )}
                  </span>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading || totalLoading || !method}
                className={`mt-6 flex w-full items-center justify-center rounded-xl py-3 px-5 text-sm font-bold text-white shadow-sm transition-all duration-200
                ${
                  loading || totalLoading || !method
                    ? 'bg-gray-300 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-[#7D1972] hover:bg-[#9E1E93] hover:shadow'
                }`}
              >
                {totalLoading
                  ? 'Menghitung total...'
                  : loading
                  ? 'Memproses pembayaran...'
                  : `Bayar Rp ${total.toLocaleString('id-ID')}`}
              </button>

              <div className="text-center pt-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 mt-4">
                Pembayaran diproses secara aman & terenkripsi. <br />
                Tidak ingin melakukan pembayaran sekarang?{' '}
                <Link className="font-bold text-[#7D1972] dark:text-fuchsia-400 hover:underline" href="/items">
                  Bayar Nanti
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

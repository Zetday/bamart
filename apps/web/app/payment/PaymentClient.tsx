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
    <>
      <section className="bg-white py-6 antialiased">
        <div className="mx-auto max-w-7xl px-4 2xl:px-0 pt-18">
          <CheckoutBreadcrumb current="payment" />

          <div className="max-w-7xl mt-6">
            <h2 className="text-xl font-semibold text-gray-900">Pembayaran</h2>

            <div className="mt-6 sm:mt-8 lg:flex lg:items-start lg:gap-12">
              {/* LEFT SIDE */}
              <form
                onSubmit={handlePay}
                className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm 
                           sm:p-6 lg:max-w-xl lg:p-8"
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Pilih Metode Pembayaran
                </h3>

                {/* PAYMENT METHOD RADIO */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_method"
                      value="QRIS"
                      className="h-4 w-4"
                      onChange={() => handleSelectMethod('QRIS')}
                      required
                    />
                    <span className="text-gray-800">QRIS (Rekomendasi)</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_method"
                      value="VA"
                      className="h-4 w-4"
                      onChange={() => handleSelectMethod('VA')}
                    />
                    <span className="text-gray-800">Virtual Account Bank</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment_method"
                      value="EWALLET"
                      className="h-4 w-4"
                      onChange={() => handleSelectMethod('EWALLET')}
                    />
                    <span className="text-gray-800">
                      E-Wallet (Dana, OVO, GoPay)
                    </span>
                  </label>
                </div>

                {/* --------------------------
                    QRIS SECTION
                --------------------------- */}
                {method === 'QRIS' && (
                  <div className="mt-6 text-center">
                    <p className="text-gray-700 mb-3">
                      Scan QR untuk membayar:
                    </p>

                    <img
                      src="/payment/qris.svg"
                      alt="QRIS"
                      className="mx-auto w-48 h-48 border p-2 rounded-lg bg-white"
                    />

                    <p className="text-gray-600 text-sm mt-2">
                      Pastikan nominal sesuai:
                      <span className="font-semibold">
                        {' '}
                        Rp {total.toLocaleString('id-ID')}
                      </span>
                    </p>
                  </div>
                )}

                {/* --------------------------
                    VIRTUAL ACCOUNT SECTION
                --------------------------- */}
                {method === 'VA' && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-1">
                      Pilih Bank
                    </label>

                    <select
                      className="w-full border rounded-lg p-2.5"
                      onChange={(e) => setBank(e.target.value)}
                    >
                      <option value="BCA">BCA Virtual Account</option>
                      <option value="BRI">BRI Virtual Account</option>
                      <option value="BNI">BNI Virtual Account</option>
                      <option value="MANDIRI">Mandiri Virtual Account</option>
                    </select>

                    <div className="mt-4 bg-gray-100 rounded-lg p-3">
                      <p className="text-gray-700 text-sm">
                        Nomor Virtual Account:
                      </p>

                      <p className="font-bold text-lg tracking-wider">
                        {vaNumber}
                      </p>

                      <button
                        type="button"
                        className="text-blue-600 text-sm mt-1"
                        onClick={() => navigator.clipboard.writeText(vaNumber)}
                      >
                        Salin
                      </button>
                    </div>

                    <p className="text-gray-500 text-xs mt-2">
                      Transfer melalui ATM, Mobile Banking, atau Internet
                      Banking.
                    </p>
                  </div>
                )}

                {/* --------------------------
                    E-WALLET SECTION
                --------------------------- */}
                {method === 'EWALLET' && (
                  <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <img
                      src="/payment/dana.png"
                      className="h-10 mx-auto opacity-80"
                    />
                    <img
                      src="/payment/ovo.jpg"
                      className="h-10 mx-auto opacity-80"
                    />
                    <img
                      src="/payment/gopay.png"
                      className="h-10 mx-auto opacity-80"
                    />

                    <p className="col-span-3 text-gray-600 text-sm mt-2">
                      Kamu akan diarahkan ke aplikasi e-wallet.
                    </p>
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading || totalLoading || !method}
                  className={`mt-8 w-full rounded-lg py-3 text-white
                  ${
                    loading || totalLoading || !method
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#7D1972] hover:bg-[#9E1E93]'
                  }`}
                >
                  {totalLoading
                    ? 'Menghitung total...'
                    : loading
                    ? 'Memproses pembayaran...'
                    : `Bayar Rp ${total.toLocaleString('id-ID')}`}
                </button>
              </form>

              {/* RIGHT SIDE SUMMARY */}
              <div className="mt-8 grow lg:mt-0">
                <div className="space-y-4 rounded-lg border bg-gray-50 p-6">
                  <dl className="flex items-center justify-between">
                    <dt className="text-base text-gray-600">
                      Total Pembayaran
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      Rp {total.toLocaleString('id-ID')}
                    </dd>
                  </dl>
                </div>

                <div className="mt-6 text-center text-gray-500 text-sm">
                  Pembayaran diproses secara aman & terenkripsi. <br />
                  Tidak ingin melakukan pembayaran sekarang?{' '}
                  <Link className="text-[#7D1972] underline" href="/items">
                    bayar nanti
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

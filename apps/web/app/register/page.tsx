'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUYER',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Register failed');
      setLoading(false);
      return;
    }

    // ⭐ Notifikasi sukses registrasi
    toast.success('Registrasi berhasil! Silakan login.');

    // Redirect setelah 1–1.5 detik
    setTimeout(() => {
      router.push('/login');
    }, 1300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-8 w-full max-w-md">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/logo/bamart-logo.svg"
            alt="Bamart Logo"
            width={120}
            height={120}
          />
          <h2 className="text-3xl font-bold text-[#7D1972] mt-3">
            Daftar Akun
          </h2>
          <p className="text-gray-600 text-sm">
            Buat akun baru dan mulai berbelanja
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <p className="text-red-600 bg-red-100 border border-red-300 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </p>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              autoFocus
              placeholder="Nama Lengkap"
              className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#7D1972]"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#7D1972]"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#7D1972]"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {/* ROLE SELECT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="relative">
              <select
                className="
                  appearance-none w-full p-3 pr-10 rounded-lg border border-gray-300 
                  bg-white text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-[#7D1972] focus:border-[#7D1972]
                  cursor-pointer transition
                "
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="BUYER">Pembeli</option>
                <option value="SELLER">Penjual</option>
              </select>

              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="text-[#7D1972]"
                >
                  <path
                    d="M5 7L10 12L15 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#7D1972] text-white font-semibold hover:bg-[#65145c] transition shadow-md disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>

          <p className="text-center text-gray-700 text-sm mt-2">
            Sudah punya akun?{' '}
            <a
              href="/login"
              className="text-[#7D1972] font-semibold hover:underline"
            >
              Login di sini
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Login failed');
      setLoading(false);
      return;
    }

    const user = data.data || data.user;

    if (!user) {
      setError('Data user tidak ditemukan dalam respons login');
      setLoading(false);
      return;
    }

    if (user.role === 'ADMIN') {
      toast.success('Selamat datang Admin!');
      router.push('/dashboard/admin');
    } else if (user.role === 'SELLER') {
      toast.success('Selamat datang Penjual!');
      router.push('/dashboard/seller');
    } else {
      toast.success('Selamat berbelanja!');
      router.push('/items'); // BUYER
    } // Setelah login → arahkan ke halaman marketplace
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-8 w-full max-w-md">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/logo/bamart-logo.svg"
            alt="Bamart Logo"
            width={100}
            height={100}
          />
          <h2 className="text-3xl font-bold text-[#7D1972] mt-3">
            Selamat Datang
          </h2>
          <p className="text-gray-600 text-sm">Masuk untuk melanjutkan</p>
        </div>

        {/* ERROR */}
        {error && (
          <p className="text-red-600 bg-red-100 border border-red-300 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </p>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoFocus
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

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#7D1972] text-white font-semibold hover:bg-[#65145c] transition shadow-md disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>

          {/* SWITCH REGISTER */}
          <p className="text-center text-gray-700 text-sm mt-3">
            Belum punya akun?{' '}
            <a
              href="/register"
              className="text-[#7D1972] font-semibold hover:underline"
            >
              Daftar di sini
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

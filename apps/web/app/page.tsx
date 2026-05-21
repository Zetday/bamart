'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  TrendingUp,
  Zap,
  ChevronRight,
  Star,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CategoryWithCount {
  id: number;
  name: string;
  description: string | null;
  _count: {
    items: number;
  };
}

export default function ModernLandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSellers: 0,
    totalCustomers: 0,
  });
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  // Emoji mapping untuk kategori
  const categoryIcons: Record<string, string> = {
    Makanan: '🍜',
    Fashion: '👕',
    Minuman: '🥤',
    Kerajinan: '🎨',
    Elektronik: '📱',
    Kesehatan: '💊',
    Kecantikan: '💄',
    Olahraga: '⚽',
  };

  const categoryColors = [
    'from-orange-400 to-red-500',
    'from-purple-400 to-pink-500',
    'from-blue-400 to-cyan-500',
    'from-green-400 to-emerald-500',
    'from-yellow-400 to-orange-500',
    'from-indigo-400 to-purple-500',
    'from-pink-400 to-rose-500',
    'from-teal-400 to-green-500',
  ];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollY]);

  // Fetch data dari API dengan optimasi loading
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch stats terlebih dahulu (prioritas tinggi)
        const statsPromise = fetch('/api/stats').then(async (res) => {
          const data = await res.json();
          if (res.ok && data && !data.error) {
            setStats({
              totalProducts: data.totalProducts || 0,
              totalSellers: data.totalSellers || 0,
              totalCustomers: data.totalCustomers || 0,
            });
            setLoading(false); // Set loading false setelah stats selesai
          }
        });

        // Fetch categories di background
        const categoriesPromise = fetch('/api/categories').then(
          async (categoriesRes) => {
            const categoriesData = await categoriesRes.json();

            if (categoriesRes.ok && Array.isArray(categoriesData)) {
              // Ambil items untuk menghitung produk per kategori
              const itemsRes = await fetch('/api/items');
              const itemsData = await itemsRes.json();

              if (Array.isArray(itemsData)) {
                const categoriesWithCount = categoriesData.map((cat) => ({
                  ...cat,
                  _count: {
                    items: itemsData.filter(
                      (item) => item.categoryId === cat.id
                    ).length,
                  },
                }));

                // Urutkan berdasarkan jumlah produk (terbanyak) dan ambil 4 teratas
                const topCategories = categoriesWithCount
                  .sort((a, b) => b._count.items - a._count.items)
                  .slice(0, 4);

                setCategories(topCategories);
              } else {
                setCategories(
                  categoriesData
                    .map((cat) => ({
                      ...cat,
                      _count: { items: 0 },
                    }))
                    .slice(0, 4)
                );
              }
            }
          }
        );

        // Tunggu stats selesai, categories bisa loading di background
        await statsPromise;
        // Categories akan update secara independen
        categoriesPromise.catch((error) => {
          console.error('Error fetching categories:', error);
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Pengiriman Cepat',
      desc: 'Same-day delivery tersedia',
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: 'Produk Berkualitas',
      desc: 'Terjamin kualitas UMKM lokal',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Harga Terbaik',
      desc: 'Harga langsung dari produsen',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
            style={{ top: '-10%', left: '-5%', animationDelay: '0s' }}
          />
          <div
            className="absolute w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
            style={{ top: '10%', right: '-5%', animationDelay: '2s' }}
          />
          <div
            className="absolute w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
            style={{ bottom: '-10%', left: '30%', animationDelay: '4s' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
          <div className="text-center space-y-8">
            {/* Logo with Animation */}
            <div className="flex justify-center animate-float">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse" />
                <Image
                  src="/logo/bamart-logo.svg"
                  alt="Bamart Logo"
                  width={250}
                  height={250}
                  className="drop-shadow-sm"
                />
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <p className="text-xl md:text-2xl font-semibold text-gray-700">
                Marketplace UMKM Kota Banjarmasin
              </p>
            </div>

            {/* Subtitle */}
            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Dukung produk lokal terbaik dengan belanja mudah, cepat, dan
              terpercaya. Ribuan produk UMKM pilihan menanti Anda.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link
                href="/items"
                className="group relative px-8 py-4 bg-gradient-to-r from-[#7D1972] to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Mulai Belanja
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>

            {/* Stats - Dynamic from Database */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-12">
              {loading ? (
                <div className="col-span-3 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#7D1972]" />
                </div>
              ) : (
                [
                  { value: stats.totalProducts, label: 'Produk' },
                  { value: stats.totalSellers, label: 'UMKM Partner' },
                  { value: stats.totalCustomers, label: 'Customer' },
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[#7D1972] to-pink-600 bg-clip-text text-transparent">
                      {stat.value}+
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#7D1972] to-purple-600 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Section - Dynamic from Database */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-4">
            Kategori Populer
          </h2>
          <p className="text-gray-600 text-lg">Temukan produk favorit Anda</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-[#7D1972]" />
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/items?category=${cat.name}`}
                className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl cursor-pointer transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${
                    categoryColors[i % categoryColors.length]
                  } opacity-0 group-hover:opacity-10 transition-opacity`}
                />

                <div className="relative z-10 space-y-4">
                  <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">
                    {categoryIcons[cat.name] || '📦'}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {cat._count?.items || 0} Produk
                    </p>
                  </div>
                  <div className="flex items-center text-[#7D1972] font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Lihat Semua <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Belum ada kategori tersedia
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="relative bg-gradient-to-r from-[#7D1972] via-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 overflow-hidden shadow-2xl">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48" />

          <div className="relative z-10 text-center text-white space-y-6">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-6 h-6 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <h2 className="text-3xl md:text-5xl font-black">
              Siap Berbelanja?
            </h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan pelanggan yang telah mempercayai Bamart
              untuk kebutuhan mereka
            </p>
            <Link
              href="/items"
              className="inline-block mt-6 px-10 py-4 bg-white text-[#7D1972] font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Mulai Sekarang
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

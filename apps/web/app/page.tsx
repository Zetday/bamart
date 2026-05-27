'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  TrendingUp,
  Zap,
  ChevronRight,
  Star,
  Loader2,
  Users,
  Store,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ItemCard, { Item } from '@/components/ItemCard';

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface ItemMinimal {
  id: number;
  categoryId: number | null;
}

interface CategoryWithCount {
  id: number;
  name: string;
  description: string | null;
  _count: {
    items: number;
  };
}

export default function ModernLandingPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSellers: 0,
    totalCustomers: 0,
  });
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Icon mapping untuk kategori
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
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-red-500 to-pink-500',
  ];

  // Fetch data dari API
  useEffect(() => {
    async function fetchData() {
      try {
        const statsPromise = fetch('/api/stats').then(async (res) => {
          const data = await res.json();
          if (res.ok && data && !data.error) {
            setStats({
              totalProducts: data.totalProducts || 0,
              totalSellers: data.totalSellers || 0,
              totalCustomers: data.totalBuyers || 0,
            });
            setLoading(false);
          }
        });

        const categoriesPromise = fetch('/api/categories').then(
          async (categoriesRes) => {
            const categoriesData = await categoriesRes.json();
            const categoriesList = categoriesData.data || categoriesData || [];

            if (categoriesRes.ok && Array.isArray(categoriesList)) {
              const itemsRes = await fetch('/api/items');
              const itemsDataEnvelope = await itemsRes.json();
              const itemsData = itemsDataEnvelope.data || itemsDataEnvelope || [];

              if (Array.isArray(itemsData)) {
                // Ambil 4 produk pertama untuk ditampilkan di beranda
                setFeaturedItems(itemsData.slice(0, 4));

                const categoriesWithCount = categoriesList.map((cat: Category) => ({
                  ...cat,
                  _count: {
                    items: itemsData.filter(
                      (item: ItemMinimal) => item.categoryId === cat.id
                    ).length,
                  },
                }));

                const topCategories = categoriesWithCount
                  .sort((a, b) => b._count.items - a._count.items)
                  .slice(0, 4);

                setCategories(topCategories);
              } else {
                setCategories(
                  categoriesList
                    .map((cat: Category) => ({
                      ...cat,
                      _count: { items: 0 },
                    }))
                    .slice(0, 4)
                );
              }
            }
          }
        );

        await statsPromise;
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
      icon: <Zap className="w-6 h-6 text-fuchsia-500" />,
      title: 'Pengiriman Instant',
      desc: 'Layanan Same-day & Instant delivery langsung ke depan pintu rumah Anda.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
      title: 'Kualitas Terjamin',
      desc: 'Produk-produk pilihan terbaik yang dikurasi langsung dari UMKM lokal terpercaya.',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-pink-500" />,
      title: 'Harga Tangan Pertama',
      desc: 'Belanja langsung dari produsen lokal tanpa perantara dengan harga paling hemat.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 overflow-hidden pb-20">
      
      {/* Dynamic Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-purple-200/40 dark:bg-purple-950/10 blur-3xl animate-blob-slow" />
        <div className="absolute top-[30%] right-[-15%] w-[40rem] h-[40rem] rounded-full bg-pink-200/30 dark:bg-fuchsia-950/10 blur-3xl animate-blob-slower" />
        <div className="absolute bottom-[10%] left-[20%] w-[38rem] h-[38rem] rounded-full bg-indigo-200/40 dark:bg-indigo-950/10 blur-3xl animate-blob-slow" />
      </div>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-12 md:pt-12 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left order-2 lg:order-1">
            
            {/* Glassmorphic Promo Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200/60 dark:border-purple-900/30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-xs animate-fade-in">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 tracking-wide uppercase">
                Pasar UMKM Terbesar di Banjarmasin
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-tight bg-linear-to-r from-slate-900 via-[#7D1972] to-fuchsia-600 bg-clip-text text-transparent dark:from-white dark:via-fuchsia-400 dark:to-purple-300">
              Dukung Produk Lokal, Belanja Lebih Mudah &amp; Cepat
            </h1>

            {/* Subheading */}
            <p className="text-slate-650 dark:text-slate-355 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Bamart menghubungkan Anda langsung dengan pengrajin dan pelaku UMKM terbaik di Kota Banjarmasin. Temukan keunikan dan kualitas produk asli Banua sekarang juga!
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-2">
              <Link
                href="/items"
                className="group relative w-full sm:w-auto px-8 py-4 bg-linear-to-r from-[#7D1972] to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/20 hover:shadow-xl hover:shadow-purple-600/30 transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex items-center justify-center gap-2"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Mulai Belanja
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
              </Link>
              
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-md text-slate-700 dark:text-slate-200 font-bold rounded-2xl shadow-xs hover:border-[#7D1972]/50 hover:text-[#7D1972] dark:hover:text-fuchsia-450 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Daftar sebagai Seller</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Stats Showcase */}
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto lg:mx-0 pt-8 border-t border-slate-250/50 dark:border-slate-800/50">
              {loading ? (
                <div className="col-span-3 flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-[#7D1972]" />
                </div>
              ) : (
                [
                  { value: stats.totalProducts, label: 'Produk Terdaftar', icon: <Package className="w-4 h-4 text-purple-650" /> },
                  { value: stats.totalSellers, label: 'Mitra UMKM', icon: <Store className="w-4 h-4 text-fuchsia-650" /> },
                  { value: stats.totalCustomers, label: 'Customer Aktif', icon: <Users className="w-4 h-4 text-pink-650" /> },
                ].map((stat, i) => (
                  <div key={i} className="space-y-1 text-center lg:text-left group cursor-default">
                    <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      {stat.icon}
                      <span>{stat.label.split(' ')[0]}</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black bg-linear-to-r from-[#7D1972] to-fuchsia-600 bg-clip-text text-transparent dark:from-fuchsia-400 dark:to-purple-400 group-hover:scale-103 transition-transform duration-200 origin-left">
                      {stat.value}+
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden sm:block">
                      {stat.label}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Logo Only */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end animate-float order-1 lg:order-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-purple-500/10 dark:bg-fuchsia-500/5 blur-3xl opacity-40 animate-pulse" />
              <Image
                src="/logo/bamart-logo.svg"
                alt="Bamart Logo"
                width={320}
                height={320}
                className="drop-shadow-md w-[220px] sm:w-[280px] md:w-[320px] h-auto object-contain"
                priority
              />
            </div>
          </div>
          
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xs hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#7D1972]/5 transition-all duration-300 border border-slate-100 dark:border-slate-800">
                {feature.icon}
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#7D1972] dark:group-hover:text-fuchsia-400 transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DYNAMIC PRODUCTS SECTION ("PRODUK PILIHAN") */}
      {featuredItems.length > 0 && (
        <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-850 dark:text-white leading-tight">
                Produk Pilihan Hari Ini
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
                Dapatkan produk terlaris dengan diskon terbaik dari mitra UMKM kami
              </p>
            </div>
            <Link
              href="/items"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7D1972] hover:text-[#9E1E93] dark:text-fuchsia-400 dark:hover:text-fuchsia-350 transition-colors uppercase tracking-wider shrink-0 cursor-pointer"
            >
              <span>Lihat Semua Produk</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* POPULAR CATEGORIES SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-850 dark:text-white">
            Kategori Terpopuler
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Temukan barang impian Anda dengan cepat berdasarkan jenis produk
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-[#7D1972]" />
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/items?category=${cat.name}`}
                className="group relative bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md cursor-pointer transform hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Hover Background Accent */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${
                    categoryColors[i % categoryColors.length]
                  } opacity-0 group-hover:opacity-4/100 transition-opacity duration-300`}
                />

                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-300 border border-slate-100 dark:border-slate-800/80">
                    {categoryIcons[cat.name] || '📦'}
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg sm:text-xl text-slate-800 dark:text-slate-100 group-hover:text-[#7D1972] dark:group-hover:text-fuchsia-400 transition-colors duration-200">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                      {cat._count?.items || 0} Produk Terdaftar
                    </p>
                  </div>
                </div>

                <div className="relative z-10 pt-4 flex items-center text-xs font-bold text-[#7D1972] dark:text-fuchsia-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-350 mt-4">
                  <span>Jelajahi</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-450 dark:text-slate-500 text-sm font-semibold">
            Belum ada kategori yang tersedia saat ini.
          </div>
        )}
      </section>

      {/* DUAL CTA SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Buyer CTA */}
          <div className="relative bg-gradient-to-tr from-[#7D1972] to-purple-800 rounded-3xl p-8 sm:p-12 overflow-hidden shadow-xl text-white flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-105 transition-transform duration-500" />
            <div className="space-y-4 max-w-sm">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <h3 className="text-3xl font-black">Siap Belanja Produk Lokal?</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Temukan ribuan produk UMKM pilihan langsung dari pembuatnya. Pembayaran mudah, pengiriman terpercaya.
              </p>
            </div>
            <Link
              href="/items"
              className="inline-flex items-center justify-center gap-2 mt-8 px-6 py-3.5 bg-white text-[#7D1972] font-bold rounded-2xl shadow-md hover:shadow-lg transform hover:scale-102 transition-all duration-300 w-fit text-sm"
            >
              <span>Belanja Sekarang</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Seller CTA */}
          <div className="relative bg-gradient-to-tr from-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-12 overflow-hidden shadow-xl text-white flex flex-col justify-between group border border-slate-800">
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-16 -mb-16 group-hover:scale-105 transition-transform duration-500" />
            <div className="space-y-4 max-w-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-indigo-300">
                <span>Mitra Kerja Sama</span>
              </div>
              <h3 className="text-3xl font-black">Kembangkan Bisnis UMKM Anda</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Jangkau lebih banyak pelanggan di seluruh kota Banjarmasin. Kelola penjualan dan produk Anda dengan mudah di Bamart.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 mt-8 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transform hover:scale-102 transition-all duration-300 w-fit text-sm"
            >
              <span>Daftar Toko Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* Styled Animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(40px, -60px) scale(1.15);
          }
          66% {
            transform: translate(-30px, 30px) scale(0.9);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-16px);
          }
        }
        .animate-blob-slow {
          animation: blob 12s infinite ease-in-out;
        }
        .animate-blob-slower {
          animation: blob 18s infinite ease-in-out 3s;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 30s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin 20s linear infinite reverse;
        }
      `}</style>
    </div>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'SELLER' | 'BUYER';
}

function getInitials(name: string | undefined) {
  if (!name) return 'U'; // default User
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Search query states
  const urlSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [isSearching, setIsSearching] = useState(false);

  // Sync input value with URL changes (e.g. clearing filters or navigating back)
  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  // Debounced search logic
  useEffect(() => {
    // If the local search query is identical to the URL value, don't trigger anything
    const currentUrlSearch = searchParams.get('search') || '';
    if (searchQuery === currentUrlSearch) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const delayDebounceFn = setTimeout(() => {
      setIsSearching(false);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('page-navigation-start'));
      }

      const params = new URLSearchParams(window.location.search);
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      } else {
        params.delete('search');
      }

      if (window.location.pathname === '/items') {
        router.push(`/items?${params.toString()}`);
      } else {
        router.push(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, router, searchParams]);

  // Ambil user dari API
  useEffect(() => {
    async function getUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data.data || data.user || null);
      } catch (err) {
        console.error('Failed to fetch user', err);
        setUser(null);
      }
    }
    getUser();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Anda akan keluar dari akun ini!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7D1972',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Logout!',
      cancelButtonText: 'Batal',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Logout failed');
      }

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil Logout',
        text: 'Anda telah keluar dari akun.',
        timer: 1500,
        showConfirmButton: false,
      });

      window.location.href = '/items';
    } catch (error) {
      console.error('Logout error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Logout',
        text: 'Terjadi kesalahan. Silakan coba lagi.',
      });
    }
  };

  // Immediate search on form submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(false);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('page-navigation-start'));
    }

    const params = new URLSearchParams(window.location.search);
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }

    if (window.location.pathname === '/items') {
      router.push(`/items?${params.toString()}`);
    } else {
      router.push(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  let menuLabel = 'Riwayat Order';
  let menuLink = '/orders';

  if (user?.role === 'SELLER') {
    menuLabel = 'Dashboard';
    menuLink = '/dashboard/seller';
  }

  if (user?.role === 'ADMIN') {
    menuLabel = 'Dashboard';
    menuLink = '/dashboard/admin';
  }

  // Handle cart click
  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Silakan login terlebih dahulu untuk mengakses keranjang', {
        duration: 3000,
      });
      return;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('page-navigation-start'));
    }

    router.push('/cart');
  };

  return (
    <nav className="sticky top-0 left-0 w-full z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-gray-200/50 dark:border-slate-800/50 shadow-xs transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 h-16 md:h-20">

          {/* LEFT: Logo */}
          <Link
            href="/items"
            className="hidden md:flex mr-2 items-center shrink-0 group"
          >
            <div className="relative overflow-hidden p-1 rounded-xl group-hover:bg-slate-100/50 dark:group-hover:bg-slate-800/50 transition duration-300">
              <Image
                src="/logo/bamart-logo.svg"
                alt="logo"
                width={130}
                height={36}
                className="w-[110px] md:w-[130px] h-auto shrink-0 transition-transform duration-300 group-hover:scale-[1.02]"
                priority
              />
            </div>
          </Link>

          {/* MIDDLE: Search Bar */}
          <div className="flex-1 flex justify-center max-w-xl mx-auto w-full">
            <form onSubmit={handleSearch} className="relative w-full group">
              <input
                type="text"
                placeholder="Cari produk impian Anda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl py-2 md:py-2.5 pl-5 pr-12
                           text-sm text-gray-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
                           focus:outline-none focus:ring-2 focus:ring-[#7D1972]/30 focus:border-[#7D1972] focus:bg-white dark:focus:bg-slate-950
                           transition-all duration-300 shadow-inner-xs"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                {isSearching ? (
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-[#7D1972] animate-spin" />
                ) : (
                  <Search className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-focus-within:text-[#7D1972] transition-colors duration-300" />
                )}
              </div>
            </form>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {/* Cart Icon */}
            <button
              onClick={handleCartClick}
              className="p-2 md:p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-[#7D1972] dark:hover:text-fuchsia-400 hover:bg-[#7D1972]/10 dark:hover:bg-fuchsia-500/10 transition-all duration-300 relative group cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-105 transition-transform duration-300" />
            </button>

            {/* Profile Dropdown or Guest Authentication */}
            {user ? (
              <div className="relative">
                <button
                  className="flex items-center gap-1 p-0.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-[#7D1972] dark:hover:border-fuchsia-500 transition-all duration-300 focus:outline-none cursor-pointer"
                  onClick={() => setOpen((prev) => !prev)}
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center bg-linear-to-tr from-purple-600 to-[#7D1972] text-white text-xs md:text-sm font-bold shadow-xs">
                    {getInitials(user?.name)}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden md:block mr-1" />
                </button>

                {open && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl rounded-2xl p-4 z-50 animate-fade-in-down">
                      {/* Profil Header */}
                      <div className="flex flex-col pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {user.email}
                        </p>
                        <div className="mt-2 flex">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase bg-[#7D1972]/10 text-[#7D1972] dark:bg-fuchsia-500/20 dark:text-fuchsia-300">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Options */}
                      <div className="space-y-1">
                        <Link
                          href={menuLink}
                          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition duration-150"
                          onClick={() => setOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-500" />
                          <span>{menuLabel}</span>
                        </Link>

                        <button
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition duration-150 text-left cursor-pointer"
                          onClick={() => {
                            setOpen(false);
                            handleLogout();
                          }}
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Guest - Login / Register
              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3 md:pl-4">
                <Link
                  href="/login"
                  className="py-1.5 md:py-2 px-3 md:px-4 border border-[#7D1972] text-[#7D1972] hover:bg-[#7D1972]/5 font-semibold rounded-xl text-xs md:text-sm transition-all duration-300 shadow-xs"
                >
                  Masuk
                </Link>

                <Link
                  href="/register"
                  className="py-1.5 md:py-2 px-3 md:px-4 bg-linear-to-r from-purple-700 to-[#7D1972] hover:from-purple-800 hover:to-[#65145c] text-white font-semibold rounded-xl text-xs md:text-sm transition-all duration-300 shadow-xs hover:shadow-md"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline styles for custom dropdown animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-down {
            animation: fadeInDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `
      }} />
    </nav>
  );
}

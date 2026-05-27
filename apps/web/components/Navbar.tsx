'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { IoSearchSharp } from 'react-icons/io5';
import { TiShoppingCart } from 'react-icons/ti';
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
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

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

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('page-navigation-start'));
    }

    if (searchQuery.trim()) {
      router.push(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/items');
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
    <nav className="bg-white top-0 left-0 w-full fixed z-50 shadow">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex w-full justify-between">
            {/* Logo */}
            <Link
              href="/items"
              className="hidden md:flex mr-5 items-center shrink-0"
            >
              <Image
                src="/logo/bamart-logo.svg"
                alt="logo"
                width={140}
                height={40}
                className="w-[110px] md:w-[140px] h-auto shrink-0"
                priority
              />
            </Link>

            {/* Search Bar */}
            <div className="flex items-center w-full">
              <form onSubmit={handleSearch} className="flex flex-1 relative">
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 pl-4 pr-12
                             focus:outline-none focus:ring-0"
                />

                <button
                  type="submit"
                  className="absolute right-0 top-1/2 -translate-y-1/2 
                             h-full px-4 bg-gray-200 border-l border-gray-300 
                             flex items-center justify-center 
                             hover:bg-gray-300 rounded-r-md"
                >
                  <IoSearchSharp size={24} />
                </button>
              </form>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center">
            <button
              onClick={handleCartClick}
              className="px-4 py-2 cursor-pointer"
              aria-label="Cart"
            >
              <TiShoppingCart size={24} />
            </button>

            {/* If logged in */}
            {user ? (
              <div className="relative">
                <button
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300"
                  onClick={() => setOpen((prev) => !prev)}
                >
                  <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white font-semibold">
                    {getInitials(user?.name)}
                  </div>
                </button>

                {open && (
                  <div className="absolute left-0 mt-2 w-40 bg-white shadow-lg rounded-md z-50">
                    <Link
                      href={menuLink}
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setOpen(false)}
                    >
                      {menuLabel}
                    </Link>

                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Guest - Desktop & Mobile
              <div className="flex border-l h-full pl-4 sm:pl-10">
                <Link
                  href="/login"
                  className="py-2 px-3 sm:px-4 mr-2 sm:mr-3 border-2 border-[#7D1972] font-medium text-[#7D1972] rounded-xl 
                 hover:bg-[#F7F0F6] hover:text-[#5B1154] hover:border-[#5B1154] text-sm sm:text-base"
                >
                  Masuk
                </Link>

                <Link
                  href="/register"
                  className="py-2 px-3 sm:px-4 border-2 border-[#7D1972] bg-[#7D1972] rounded-xl font-medium text-white 
                 hover:bg-[#9E1E93] hover:border-[#9E1E93] text-sm sm:text-base"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

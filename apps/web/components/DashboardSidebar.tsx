'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  LogOut,
  Tag,
  Loader2,
} from 'lucide-react';
import Swal from 'sweetalert2';

interface SidebarProps {
  role: 'ADMIN' | 'SELLER';
}

/* ======================= SPINNER OVERLAY ======================= */
function SidebarLoading() {
  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-sm tracking-wide">Memuat halaman…</span>
      </div>
    </div>
  );
}

export default function DashboardSidebar({ role }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function isActive(path: string) {
    return pathname === path;
  }

  const navigate = (path: string) => {
    startTransition(() => {
      router.push(path);
    });
  };

  /* ======================= LOGOUT ======================= */
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Konfirmasi Logout',
      text: 'Apakah Anda yakin ingin logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Logout',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
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
      Swal.fire({
        icon: 'error',
        title: 'Gagal Logout',
        text: 'Terjadi kesalahan. Silakan coba lagi.',
      });
    }
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl border-r border-gray-700 hidden md:flex flex-col relative overflow-hidden">
      {/* Loading Overlay */}
      {isPending && <SidebarLoading />}

      {/* Header */}
      <div className="px-6 py-8 border-b border-gray-700 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7D1972] to-[#b14fab] flex items-center justify-center shadow-lg">
            <LayoutDashboard size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              {role === 'ADMIN' ? 'Admin Panel' : 'Seller Panel'}
            </h1>
            <p className="text-xs text-gray-400">Dashboard Management</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2 relative z-10">
        <SidebarButton
          disabled={isPending}
          active={isActive(
            role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/seller'
          )}
          label="Dashboard"
          icon={<LayoutDashboard size={20} />}
          onClick={() =>
            navigate(
              role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/seller'
            )
          }
        />

        {role === 'ADMIN' && (
          <SidebarButton
            disabled={isPending}
            active={isActive('/dashboard/admin/users')}
            label="Kelola User"
            icon={<Users size={20} />}
            onClick={() => navigate('/dashboard/admin/users')}
          />
        )}

        <SidebarButton
          disabled={isPending}
          active={isActive(
            role === 'ADMIN'
              ? '/dashboard/admin/items'
              : '/dashboard/seller/items'
          )}
          label="Kelola Item"
          icon={<Package size={20} />}
          onClick={() =>
            navigate(
              role === 'ADMIN'
                ? '/dashboard/admin/items'
                : '/dashboard/seller/items'
            )
          }
        />

        <SidebarButton
          disabled={isPending}
          active={isActive(
            role === 'ADMIN'
              ? '/dashboard/admin/orders'
              : '/dashboard/seller/orders'
          )}
          label={role === 'ADMIN' ? 'Kelola Order' : 'Lihat Order'}
          icon={<ShoppingCart size={20} />}
          onClick={() =>
            navigate(
              role === 'ADMIN'
                ? '/dashboard/admin/orders'
                : '/dashboard/seller/orders'
            )
          }
        />

        {role === 'ADMIN' && (
          <SidebarButton
            disabled={isPending}
            active={isActive('/dashboard/admin/categories')}
            label="Kelola Kategori"
            icon={<Tag size={20} />}
            onClick={() => navigate('/dashboard/admin/categories')}
          />
        )}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700 relative z-10">
        <button
          disabled={isPending}
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl 
            bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 
            font-medium transition-all duration-300 shadow-lg
            disabled:opacity-60 disabled:pointer-events-none"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}

/* ======================= SIDEBAR BUTTON ======================= */
function SidebarButton({
  active,
  label,
  icon,
  onClick,
  disabled,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl text-left transition-all duration-300 group
        ${
          active
            ? 'bg-gradient-to-r from-[#7D1972] to-[#b14fab] text-white shadow-lg scale-105'
            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:translate-x-1'
        }
        disabled:opacity-50 disabled:pointer-events-none
      `}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {active && (
        <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse"></div>
      )}
    </button>
  );
}

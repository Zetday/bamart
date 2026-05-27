'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTransition, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  LogOut,
  Tag,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import Swal from 'sweetalert2';

interface SidebarProps {
  role: 'ADMIN' | 'SELLER';
  userName?: string;
  userEmail?: string;
}

export default function DashboardSidebar({ role, userName, userEmail }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('page-navigation-start'));
    }
    startTransition(() => router.push(path));
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Konfirmasi Logout',
      text: 'Apakah Anda yakin ingin logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Logout',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#7D1972',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Logout failed');

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil Logout',
        timer: 1200,
        showConfirmButton: false,
      });

      window.location.href = '/items';
    } catch {
      Swal.fire({ icon: 'error', title: 'Gagal Logout', text: 'Silakan coba lagi.' });
    }
  };

  const adminLinks = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard/admin' },
    { label: 'Kelola User', icon: <Users size={18} />, path: '/dashboard/admin/users' },
    { label: 'Kelola Item', icon: <Package size={18} />, path: '/dashboard/admin/items' },
    { label: 'Kelola Order', icon: <ShoppingCart size={18} />, path: '/dashboard/admin/orders' },
    { label: 'Kelola Kategori', icon: <Tag size={18} />, path: '/dashboard/admin/categories' },
  ];

  const sellerLinks = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard/seller' },
    { label: 'Kelola Item', icon: <Package size={18} />, path: '/dashboard/seller/items' },
    { label: 'Lihat Order', icon: <ShoppingCart size={18} />, path: '/dashboard/seller/orders' },
  ];

  const links = role === 'ADMIN' ? adminLinks : sellerLinks;

  const initials = userName
    ? userName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : role[0];

  return (
    <>
      {/* Floating Toggle Button on Mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#7D1972] text-white flex items-center justify-center shadow-lg md:hidden hover:bg-[#9c2292] active:scale-95 transition-all duration-200 cursor-pointer border border-[#c96ec4]/20"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="w-60 shrink-0 bg-slate-950 flex-col min-h-screen hidden md:flex border-r border-slate-800">
        {/* Brand */}
        <div className="px-5 pt-7 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7D1972] flex items-center justify-center shrink-0">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight tracking-wide">Bamart</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {role === 'ADMIN' ? 'Admin Panel' : 'Seller Panel'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">
            Menu
          </p>
          {links.map((link) => {
            const active = isActive(link.path);
            return (
              <button
                key={link.path}
                disabled={isPending}
                onClick={() => navigate(link.path)}
                className={`
                  group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 text-left relative
                  disabled:opacity-40 disabled:pointer-events-none
                  ${active
                    ? 'bg-[#7D1972]/20 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }
                `}
              >
                {/* Active indicator */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#7D1972] rounded-r-full" />
                )}
                <span className={active ? 'text-[#c96ec4]' : 'text-slate-500 group-hover:text-slate-300'}>
                  {link.icon}
                </span>
                {link.label}
                {active && <ChevronRight size={14} className="ml-auto text-[#c96ec4]" />}
              </button>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="px-3 pb-5 border-t border-slate-800 pt-4 space-y-3">
          {/* Avatar row */}
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-[#7D1972] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-medium truncate">{userName ?? role}</p>
              <p className="text-slate-500 text-[10px] truncate">{userEmail ?? ''}</p>
            </div>
          </div>

          <button
            disabled={isPending}
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium
              text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150
              disabled:opacity-40 disabled:pointer-events-none"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 w-60 bg-slate-950 z-50 flex flex-col border-r border-slate-800 md:hidden
          transition-transform duration-300 ease-in-out shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand */}
        <div className="px-5 pt-7 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7D1972] flex items-center justify-center shrink-0">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight tracking-wide">Bamart</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {role === 'ADMIN' ? 'Admin Panel' : 'Seller Panel'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">
            Menu
          </p>
          {links.map((link) => {
            const active = isActive(link.path);
            return (
              <button
                key={link.path}
                disabled={isPending}
                onClick={() => {
                  setIsOpen(false);
                  navigate(link.path);
                }}
                className={`
                  group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 text-left relative
                  disabled:opacity-40 disabled:pointer-events-none
                  ${active
                    ? 'bg-[#7D1972]/20 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }
                `}
              >
                {/* Active indicator */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#7D1972] rounded-r-full" />
                )}
                <span className={active ? 'text-[#c96ec4]' : 'text-slate-500 group-hover:text-slate-300'}>
                  {link.icon}
                </span>
                {link.label}
                {active && <ChevronRight size={14} className="ml-auto text-[#c96ec4]" />}
              </button>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="px-3 pb-5 border-t border-slate-800 pt-4 space-y-3">
          {/* Avatar row */}
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-[#7D1972] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-medium truncate">{userName ?? role}</p>
              <p className="text-slate-500 text-[10px] truncate">{userEmail ?? ''}</p>
            </div>
          </div>

          <button
            disabled={isPending}
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium
              text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150
              disabled:opacity-40 disabled:pointer-events-none"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

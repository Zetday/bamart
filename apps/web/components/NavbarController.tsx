'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarController() {
  const pathname = usePathname();

  const hide =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/' ||
    pathname.startsWith('/dashboard');

  if (hide) return null;

  return <Navbar />;
}

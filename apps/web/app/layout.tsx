import './globals.css';
import React from 'react';
import { Suspense } from 'react';
import NavbarController from '@/components/NavbarController'; // client logic here
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Baiman Mart',
  description: 'Simple marketplace built with Next.js & Tailwind',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Suspense fallback={null}>
          <NavbarController />
        </Suspense>
        <main>{children}</main>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

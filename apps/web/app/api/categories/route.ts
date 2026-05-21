import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/* ============================================
   GET — Ambil semua kategori
============================================ */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);

    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

/* ============================================
   POST — Tambah kategori baru
============================================ */
export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();

    /* -------- VALIDASI -------- */

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nama kategori wajib diisi' },
        { status: 400 }
      );
    }

    // Cek duplikasi nama
    const exists = await prisma.category.findFirst({
      where: { name: name.trim() },
    });

    if (exists) {
      return NextResponse.json(
        { error: 'Kategori dengan nama ini sudah ada' },
        { status: 400 }
      );
    }

    /* -------- CREATE CATEGORY -------- */

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description || null,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

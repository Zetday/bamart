import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/* =====================================================
   GET /api/items/[id]
===================================================== */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const itemId = Number(id);

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { user: true, category: true },
  });

  if (!item) {
    return NextResponse.json({ message: 'Item not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: item.id,
    name: item.name,
    price: item.price,
    stock: item.stock,
    description: item.description,
    imageUrl: item.imageUrl,
    seller: item.user.name,
    userId: item.userId,
    category: item.category?.name ?? null,
    categoryId: item.categoryId ?? null,
  });
}

/* =====================================================
   PUT /api/items/[id]  → UPDATE PRODUK
===================================================== */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const itemId = Number(id);
    const body = await req.json();

    // Ambil data dari body
    const { userId, name, description, price, stock, imageUrl, categoryId } =
      body;

    // Jalankan update
    const item = await prisma.item.update({
      where: { id: itemId },
      data: {
        userId: Number(userId), // ⭐ perbaikan utama
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        imageUrl,
        categoryId: categoryId ?? null, // null jika kosong
      },
      include: { user: true, category: true },
    });

    // Kembalikan format seperti ItemRow
    return NextResponse.json({
      id: item.id,
      name: item.name,
      price: item.price,
      stock: item.stock,
      description: item.description,
      imageUrl: item.imageUrl,
      seller: item.user.name,
      userId: item.userId,
      category: item.category?.name ?? null,
      categoryId: item.categoryId ?? null,
    });
  } catch (err) {
    console.error('Update Error:', err);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

/* =====================================================
   DELETE /api/items/[id]
===================================================== */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const itemId = Number(id);

    await prisma.item.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: 'Item deleted' });
  } catch (err) {
    console.error('Delete Error:', err);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}

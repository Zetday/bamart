import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

/* ============================
   PUT /api/categories/:id
============================ */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // params sekarang Promise → wajib await
    const { id } = await context.params;

    const { name, description } = await req.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nama kategori wajib diisi' },
        { status: 400 }
      );
    }

    const updated = await prisma.category.update({
      where: { id: Number(id) },
      data: { name: name.trim(), description: description || null },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 400 }
    );
  }
}

/* ============================
   DELETE /api/categories/:id
============================ */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const deleted = await prisma.category.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 400 }
    );
  }
}

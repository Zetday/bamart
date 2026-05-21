import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function POST(req: Request) {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { itemId, quantity = 1 } = await req.json();

  // Ambil product dulu (wajib!)
  const product = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!product) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  // Buat cart jika belum ada
  let cart = await prisma.cart.findUnique({
    where: { userId: user.id },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: user.id },
    });
  }

  // Cek item dalam cart
  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, itemId },
  });

  if (existing) {
    const newQty = existing.quantity + quantity;

    await prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: newQty,
        subtotal: newQty * product.price, // aman karena product dijamin ada
      },
    });

    return NextResponse.json({ message: 'Updated quantity' });
  }

  // Create item baru dalam cart
  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      itemId,
      quantity,
      subtotal: quantity * product.price,
    },
  });

  return NextResponse.json({ message: 'Added to cart' });
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET() {
  const user = await getUser(); // ✅ tanpa req
  if (!user) return NextResponse.json({ subtotal: 0 });

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: { items: { include: { item: true } } },
  });

  if (!cart) return NextResponse.json({ subtotal: 0 });

  const subtotal = cart.items.reduce(
    (sum, ci) => sum + ci.quantity * ci.item.price,
    0
  );

  return NextResponse.json({ subtotal });
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET() {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { orderDate: 'desc' },
    select: {
      id: true,
      orderDate: true,
      totalPrice: true,
      status: true,
    },
  });

  return NextResponse.json({ orders });
}

// /app/api/order/summary/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orderId = Number(searchParams.get('orderId'));

  if (!orderId)
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: orderId, userId: user.id },
    select: { totalPrice: true },
  });

  if (!order)
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  return NextResponse.json({ total: order.totalPrice });
}

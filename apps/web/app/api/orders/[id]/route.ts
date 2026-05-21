import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface UpdateOrderInput {
  buyerId: number;
  totalPrice: number;
  status: string;

  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
}

// =====================
// GET DETAIL
// =====================
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      items: { include: { item: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}

// =====================
// UPDATE ORDER
// =====================
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const body = await request.json();
  const { id } = await context.params;

  const updated = await prisma.order.update({
    where: { id: Number(id) },
    data: {
      userId: body.buyerId,
      totalPrice: body.totalPrice,
      status: body.status,
      fullName: body.fullName,
      phone: body.phone,
      address: body.address,
      city: body.city,
      postalCode: body.postalCode,
      notes: body.notes,
    },
    include: {
      items: { include: { item: true } },
    },
  });

  return NextResponse.json(updated);
}

// =====================
// DELETE ORDER
// =====================
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const orderId = Number(id);

  await prisma.orderItem.deleteMany({ where: { orderId } });
  await prisma.order.delete({ where: { id: orderId } });

  return NextResponse.json({ success: true });
}

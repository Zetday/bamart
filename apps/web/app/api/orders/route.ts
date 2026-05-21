import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface CreateOrderItemInput {
  itemId: number;
  quantity: number;
  subtotal: number;
}

interface CreateOrderInput {
  userId: number;
  totalPrice: number;
  status: string;

  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;

  items: CreateOrderItemInput[];
}

// =====================
// GET ALL ORDERS
// =====================
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: { include: { item: true } },
      },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load orders' },
      { status: 500 }
    );
  }
}

// =====================
// CREATE ORDER
// =====================
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateOrderInput;

    const newOrder = await prisma.order.create({
      data: {
        userId: body.userId,
        totalPrice: body.totalPrice,
        status: body.status,

        fullName: body.fullName,
        phone: body.phone,
        address: body.address,
        city: body.city,
        postalCode: body.postalCode,
        notes: body.notes,

        items: {
          create: body.items.map((it) => ({
            itemId: it.itemId,
            quantity: it.quantity,
            subtotal: it.subtotal,
          })),
        },
      },
      include: {
        items: { include: { item: true } },
      },
    });

    return NextResponse.json({ order: newOrder });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

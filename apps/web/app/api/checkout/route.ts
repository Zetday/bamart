import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function POST(req: Request) {
  const user = await getUser(); // ✅ tanpa req
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { fullName, phone, address, city, postalCode, notes, delivery } = body;

  // Ambil cart user
  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: { items: { include: { item: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: 'Cart empty' }, { status: 400 });
  }

  const subtotal = cart.items.reduce(
    (sum, ci) => sum + ci.quantity * ci.item.price,
    0
  );

  // Hitung ongkir
  let shippingCost = 0;
  if (delivery === 'cepat') shippingCost = 15000;
  if (delivery === 'reguler') shippingCost = 0;

  const totalPrice = subtotal + shippingCost;

  // Buat order
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      totalPrice,
      status: 'PENDING',
      fullName,
      phone,
      address,
      city,
      postalCode,
      notes,
      items: {
        create: cart.items.map((ci) => ({
          itemId: ci.itemId,
          quantity: ci.quantity,
          subtotal: ci.quantity * ci.item.price,
        })),
      },
    },
  });

  // Kosongkan cart
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return NextResponse.json(
    { redirect: `/payment?orderId=${order.id}` },
    { status: 200 }
  );
}

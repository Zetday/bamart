import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUser } from '@/lib/auth';

export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { cartItemId } = await req.json();

  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  return NextResponse.json({ message: 'Item removed' });
}

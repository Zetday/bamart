import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const sellers = await prisma.user.findMany({
    where: {
      role: 'SELLER',
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return NextResponse.json(sellers);
}

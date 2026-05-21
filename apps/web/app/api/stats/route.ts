import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [totalProducts, totalSellers, totalCustomers] = await Promise.all([
      prisma.item.count(),
      prisma.user.count({ where: { role: 'SELLER' } }),
      prisma.user.count({ where: { role: 'BUYER' } }),
    ]);

    return NextResponse.json({
      totalProducts,
      totalSellers,
      totalCustomers,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);

    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

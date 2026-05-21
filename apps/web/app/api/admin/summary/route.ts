import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.item.count();
    const totalOrders = await prisma.order.count();

    // Ambil 6 bulan terakhir untuk chart
    const orders = await prisma.order.findMany({
      select: { orderDate: true },
      orderBy: { orderDate: 'asc' },
    });

    // Format: [{ month: "Jan", orders: 10 }]
    const monthlyCount: Record<string, number> = {};

    orders.forEach((order) => {
      const month = order.orderDate.toLocaleString('id-ID', { month: 'short' });
      monthlyCount[month] = (monthlyCount[month] || 0) + 1;
    });

    const monthlyData = Object.keys(monthlyCount).map((month) => ({
      month,
      orders: monthlyCount[month],
    }));

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalOrders,
      monthlyData,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to load summary' },
      { status: 500 }
    );
  }
}

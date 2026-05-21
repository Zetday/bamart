import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sellerId = user.id;

    /* ---------------------------------
            TOTAL PRODUCTS
    ---------------------------------- */
    const totalProducts = await prisma.item.count({
      where: { userId: sellerId },
    });

    /* ---------------------------------
            TOTAL ORDERS
    ---------------------------------- */
    const totalOrders = await prisma.order.count({
      where: {
        items: {
          some: { item: { userId: sellerId } },
        },
      },
    });

    /* ---------------------------------
            TOTAL REVENUE
            (sum of subtotal)
    ---------------------------------- */
    const orderItems = await prisma.orderItem.findMany({
      where: { item: { userId: sellerId } },
      select: {
        subtotal: true,
        order: { select: { orderDate: true } },
      },
    });

    const totalRevenue = orderItems.reduce((sum, oi) => sum + oi.subtotal, 0);

    /* ---------------------------------
            MONTHLY SALES (orders count)
    ---------------------------------- */
    const monthlyMap: Record<string, number> = {};

    orderItems.forEach((oi) => {
      const month = new Date(oi.order.orderDate).toLocaleString('id-ID', {
        month: 'short',
      });
      monthlyMap[month] = (monthlyMap[month] || 0) + 1;
    });

    const monthlySales = Object.entries(monthlyMap).map(([month, orders]) => ({
      month,
      orders,
    }));

    /* ---------------------------------
            REVENUE TREND
    ---------------------------------- */
    const revenueTrendMap: Record<string, number> = {};

    orderItems.forEach((oi) => {
      const month = new Date(oi.order.orderDate).toLocaleString('id-ID', {
        month: 'short',
      });
      revenueTrendMap[month] = (revenueTrendMap[month] || 0) + oi.subtotal;
    });

    const revenueTrend = Object.entries(revenueTrendMap).map(
      ([month, revenue]) => ({
        month,
        revenue,
      })
    );

    /* ---------------------------------
                RESPONSE
    ---------------------------------- */
    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      monthlySales,
      revenueTrend,
    });
  } catch (error) {
    console.error('ERROR /api/seller/summary:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

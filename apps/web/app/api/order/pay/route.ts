// /app/api/order/pay/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await req.json();

  if (!orderId)
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  // Pastikan order milik user
  const order = await prisma.order.findUnique({
    where: { id: Number(orderId), userId: user.id },
  });

  if (!order)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Update status menjadi PAID
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "PAID" },
  });

  return NextResponse.json({
    redirect: `/success?orderId=${order.id}`,
  });
}

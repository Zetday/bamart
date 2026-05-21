import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function PUT(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cartItemId, quantity } = await req.json();

  if (quantity <= 0) {
    return NextResponse.json({ error: "Quantity must be > 0" }, { status: 400 });
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { item: true },
  });

  if (!cartItem)
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: {
      quantity,
      subtotal: quantity * cartItem.item.price,
    },
  });

  return NextResponse.json({ message: "Quantity updated" });
}

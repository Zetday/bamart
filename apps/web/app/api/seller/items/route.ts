import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = verifyToken(token);
  if (!user || user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, price, stock, imageUrl } = await req.json();

  const item = await prisma.item.create({
    data: {
      name,
      description,
      price,
      stock,
      imageUrl,
      userId: user.id,
    },
  });

  return NextResponse.json({ message: "Item added", item });
}

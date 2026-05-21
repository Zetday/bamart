import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    // Ambil search query dari URL
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    // Build where condition untuk search
    const whereCondition = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              description: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const items = await prisma.item.findMany({
      where: whereCondition,
      include: { user: true, category: true },
    });

    return NextResponse.json(
      items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        stock: i.stock,
        seller: i.user.name,
        userId: i.userId,
        description: i.description,
        imageUrl: i.imageUrl,
        category: i.category?.name ?? null,
        categoryId: i.categoryId,
      }))
    );
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const item = await prisma.item.create({
      data: {
        userId: body.userId,
        name: body.name,
        description: body.description,
        price: body.price,
        stock: body.stock,
        imageUrl: body.imageUrl,
        categoryId: body.categoryId || null,
      },
      include: { user: true, category: true },
    });

    return NextResponse.json({
      id: item.id,
      name: item.name,
      price: item.price,
      stock: item.stock,
      seller: item.user.name,
      userId: item.userId,
      description: item.description,
      imageUrl: item.imageUrl,
      category: item.category?.name ?? null,
      categoryId: item.categoryId,
    });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}

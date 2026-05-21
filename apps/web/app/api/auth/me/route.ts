import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const token = cookie.split('token=')[1]?.split(';')[0] ?? '';

  if (!token) {
    return NextResponse.json({ user: null });
  }

  // payload = { id, role, ... }
  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json({ user: null });
  }

  // Ambil user sebenarnya dari database
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return NextResponse.json({ user });
}

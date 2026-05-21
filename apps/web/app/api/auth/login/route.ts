import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Silahkan isi username dan password' }, { status: 400 });
    }

    // cari user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Username atau Password salah' },
        { status: 401 }
      );
    }

    // cek password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { error: 'Username atau Password salah' },
        { status: 401 }
      );
    }

    // BUAT JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // SET RESPONSE
    const response = NextResponse.json({
      message: 'Login sukses',
      user: { id: user.id, email: user.email, role: user.role },
    });

    // SET COOKIE DI SINI (PERLU DI SINI!)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    // RETURN RESPONSE YANG SUDAH ADA COOKIESNYA
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

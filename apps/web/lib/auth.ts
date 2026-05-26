import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';

/* -------------------------------------------
   Custom interface untuk CookieStore Next.js
-------------------------------------------- */
interface MinimalCookie {
  value: string;
}

interface CookieStore {
  get(name: string): MinimalCookie | undefined;
}

/* -------------------------------------------
   TOKEN PAYLOAD
-------------------------------------------- */
export interface TokenPayload extends JwtPayload {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'SELLER' | 'BUYER';
}

/* -------------------------------------------
   VERIFY TOKEN
-------------------------------------------- */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch {
    return null;
  }
}

/* -------------------------------------------
   GET USER FROM COOKIE (type-safe, no “any”)
-------------------------------------------- */
export async function getUser() {
  const cookieStore = (await cookies()) as unknown as CookieStore;

  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return {
    id: decoded.id,
    name: decoded.name || 'User',
    email: decoded.email,
    role: decoded.role,
  };
}

/* -------------------------------------------
   OPTIONAL: ROLE CHECK
-------------------------------------------- */
export async function requireRole(roles: Array<'ADMIN' | 'SELLER' | 'BUYER'>) {
  const user = await getUser();
  if (!user) return null;
  if (!roles.includes(user.role)) return null;

  return user;
}

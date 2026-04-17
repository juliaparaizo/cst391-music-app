import { createHmac } from 'crypto';
import { cookies } from 'next/headers';
import type { SessionUser } from './types';

const SECRET = process.env.SESSION_SECRET || 'cst391-dev-secret-key-change-in-prod';
const COOKIE_NAME = 'session';

function sign(payload: string): string {
  const sig = createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verify(token: string): string | null {
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return null;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const expected = createHmac('sha256', SECRET).update(payload).digest('base64url');
  if (sig !== expected) return null;
  return payload;
}

export function createSessionToken(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64url');
  return sign(payload);
}

export function parseSessionToken(token: string): SessionUser | null {
  const payload = verify(token);
  if (!payload) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return parseSessionToken(token);
}

export { COOKIE_NAME };

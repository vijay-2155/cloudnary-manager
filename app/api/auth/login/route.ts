import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  const envPassword = (process.env.AUTH_PASSWORD ?? '').trim();
  if (!password || password.trim() !== envPassword) {
    return NextResponse.json({
      error: 'Invalid password',
      debug_env_set: !!process.env.AUTH_PASSWORD,
      debug_env_length: envPassword.length,
    }, { status: 401 });
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('session', secret, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return response;
}

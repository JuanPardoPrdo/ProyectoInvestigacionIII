import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { getSessionConfig } from '@/infrastructure/auth/session';

export async function POST(req: NextRequest) {
    const res = NextResponse.redirect(new URL('/login', req.url));
    const session = await getIronSession<any>(req, res, getSessionConfig());

    // RF-04: Cierre de Sesión Seguro eliminando variables de sesión.
    session.destroy();

    return res;
}

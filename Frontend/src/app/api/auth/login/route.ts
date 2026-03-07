import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { getSessionConfig } from '@/infrastructure/auth/session';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 400 });
        }

        // Llamada Proxy al EndPoint de C# WebAPI
        const netResponse = await fetch('http://localhost:5080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await netResponse.json();

        if (!netResponse.ok) {
            return NextResponse.json(
                { message: data.message || "Credenciales inválidas" },
                { status: netResponse.status === 401 ? 401 : 403 }
            );
        }

        // Configurar sesión segura de Next.js almacenando JWT de .NET
        const res = NextResponse.json({
            success: true,
            user: {
                id: data.idPersona.toString(),
                nombre: data.nombreCompleto,
                rol: data.rol
            }
        });

        const session = await getIronSession<any>(req, res, getSessionConfig());
        session.user = {
            id: data.idPersona.toString(),
            nombre: data.nombreCompleto,
            rol: data.rol,
            token: data.token // Inyectamos el JWT de ASP.NET
        };
        await session.save();

        return res;

    } catch (err: any) {
        console.error('Login Proxy error:', err);

        if (err.code === 'ECONNREFUSED') {
            return NextResponse.json(
                { message: 'El servidor de Backend (.NET) no responde. Asegúrate de ejecutarlo en el puerto 5080.' },
                { status: 503 }
            );
        }

        return NextResponse.json({ message: 'Error interno conectando con el Backend' }, { status: 500 });
    }
}

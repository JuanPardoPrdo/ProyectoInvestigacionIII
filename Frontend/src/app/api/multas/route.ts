import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/infrastructure/auth/getServerSession';

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.user?.token || session.user.rol !== 'Administrador') {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const netResponse = await fetch('http://localhost:5080/api/multas', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.user.token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await netResponse.json();
        return NextResponse.json(data, { status: netResponse.status });

    } catch (err: any) {
        return NextResponse.json({ message: 'Error interno del proxy de Next.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.token || session.user.rol !== 'Administrador') {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const body = await req.json();
        const netResponse = await fetch('http://localhost:5080/api/multas', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.user.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await netResponse.json();
        return NextResponse.json(data, { status: netResponse.status });

    } catch (err: any) {
        return NextResponse.json({ message: 'Error interno del proxy de Next.' }, { status: 500 });
    }
}

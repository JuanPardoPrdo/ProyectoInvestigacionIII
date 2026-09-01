import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/infrastructure/auth/getServerSession';

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.token || session.user.rol !== 'Administrador') {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const netResponse = await fetch('http://localhost:5080/api/residentes/unidades', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.user.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!netResponse.ok) {
            return NextResponse.json({ message: 'Error backend .NET al consultar unidades' }, { status: netResponse.status });
        }

        const data = await netResponse.json();
        return NextResponse.json({ unidades: data.unidades }, { status: 200 });

    } catch (err: any) {
        console.error('Proxy GET unidades error:', err);
        if (err.code === 'ECONNREFUSED') {
            return NextResponse.json(
                { message: 'Conexión rechazada: El servidor .NET está fuera de línea.' },
                { status: 503 }
            );
        }
        return NextResponse.json({ message: 'Error interno del proxy de Next.' }, { status: 500 });
    }
}

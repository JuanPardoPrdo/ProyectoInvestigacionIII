import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/infrastructure/auth/getServerSession';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session?.user?.token || session.user.rol !== 'Administrador') {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const netResponse = await fetch(`http://localhost:5080/api/multas/${id}/pagar`, {
            method: 'PUT',
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

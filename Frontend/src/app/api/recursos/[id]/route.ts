import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/infrastructure/auth/getServerSession';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session?.user?.token || session.user.rol !== 'Administrador') {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const body = await req.json();
        const netResponse = await fetch(`http://localhost:5080/api/recursos/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${session.user.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!netResponse.ok) {
            const errorText = await netResponse.text();
            try {
                const errorData = JSON.parse(errorText);
                return NextResponse.json(errorData, { status: netResponse.status });
            } catch {
                return NextResponse.json({ message: `Error del backend: ${netResponse.status}`, detail: errorText }, { status: netResponse.status });
            }
        }

        return NextResponse.json({ message: 'Recurso actualizado con éxito' }, { status: 200 });

    } catch (err: any) {
        return NextResponse.json({ message: 'Error interno del proxy de Next.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session?.user?.token || session.user.rol !== 'Administrador') {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const netResponse = await fetch(`http://localhost:5080/api/recursos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.user.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!netResponse.ok) {
            const errorData = await netResponse.json();
            return NextResponse.json(errorData, { status: netResponse.status });
        }

        return NextResponse.json({ message: 'Recurso eliminado' }, { status: 200 });

    } catch (err: any) {
        return NextResponse.json({ message: 'Error interno del proxy de Next.' }, { status: 500 });
    }
}

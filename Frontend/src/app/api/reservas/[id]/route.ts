import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/infrastructure/auth/getServerSession';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session?.user?.token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;

        if (!id) {
            return NextResponse.json({ message: 'ID Reserva requerido' }, { status: 400 });
        }

        const netResponse = await fetch(`http://localhost:5080/api/reservas/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.user.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!netResponse.ok) {
            const result = await netResponse.json();
            return NextResponse.json({ message: result.message || 'Error en .NET API' }, { status: netResponse.status });
        }

        return NextResponse.json({ message: 'Reserva cancelada' }, { status: 200 });

    } catch (err: any) {
        return NextResponse.json({ message: 'Error interno de proxy al cancelar' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session?.user?.token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;
        const body = await req.json();

        const netResponse = await fetch(`http://localhost:5080/api/reservas/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${session.user.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!netResponse.ok) {
            const result = await netResponse.json();
            return NextResponse.json({ message: result.message || 'Error en .NET API' }, { status: netResponse.status });
        }

        return NextResponse.json({ message: 'Reserva actualizada' }, { status: 200 });

    } catch (err: any) {
        return NextResponse.json({ message: 'Error interno de proxy al actualizar' }, { status: 500 });
    }
}

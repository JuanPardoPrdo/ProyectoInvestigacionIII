import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/infrastructure/auth/getServerSession';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const { idRecurso, fechaInicio, fechaFin } = await req.json();

        if (!idRecurso || !fechaInicio || !fechaFin) {
            return NextResponse.json({ message: 'Datos incompletos.' }, { status: 400 });
        }

        const netResponse = await fetch('http://localhost:5080/api/reservas', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.user.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                idRecurso: parseInt(idRecurso, 10),
                fechaInicio,
                fechaFin
            })
        });

        const result = await netResponse.json();

        if (!netResponse.ok) {
            return NextResponse.json({ message: result.message || 'Error en .NET API' }, { status: netResponse.status });
        }

        return NextResponse.json({ message: result.message, reserva: result.reserva }, { status: 201 });

    } catch (err: any) {
        console.error('Error Proxy Reserva:', err);
        return NextResponse.json({ message: 'Error interno del proxy.' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const netResponse = await fetch('http://localhost:5080/api/reservas', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.user.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!netResponse.ok) {
            return NextResponse.json({ message: 'Error backend .NET' }, { status: netResponse.status });
        }

        const data = await netResponse.json();
        return NextResponse.json({ reservas: data.reservas }, { status: 200 });

    } catch (err: any) {
        return NextResponse.json({ message: 'Error interno del proxy de Next.' }, { status: 500 });
    }
}

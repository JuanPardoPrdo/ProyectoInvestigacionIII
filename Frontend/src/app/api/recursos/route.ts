import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/infrastructure/auth/getServerSession';

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const netResponse = await fetch('http://localhost:5080/api/recursos', {
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
        return NextResponse.json({ recursos: data.recursos }, { status: 200 });

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
        console.log('Proxy POST body:', body);

        const netResponse = await fetch('http://localhost:5080/api/recursos', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.user.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!netResponse.ok) {
            const errorText = await netResponse.text();
            console.error('Backend error response:', errorText);
            try {
                const errorData = JSON.parse(errorText);
                return NextResponse.json(errorData, { status: netResponse.status });
            } catch {
                return NextResponse.json({ message: `Error backend (.NET): ${netResponse.status}`, detail: errorText }, { status: netResponse.status });
            }
        }

        const data = await netResponse.json();
        return NextResponse.json(data, { status: netResponse.status });

    } catch (err: any) {
        console.error('Proxy POST exception:', err);
        return NextResponse.json({ message: 'Error interno del proxy de Next.', error: err.message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const netResponse = await fetch('http://localhost:5080/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await netResponse.json();
        return NextResponse.json(data, { status: netResponse.status });

    } catch (err: any) {
        if (err.code === 'ECONNREFUSED') {
            return NextResponse.json({ message: 'El servidor backend no responde.' }, { status: 503 });
        }
        return NextResponse.json({ message: 'Error interno.' }, { status: 500 });
    }
}

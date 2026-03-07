import { getSession } from '@/infrastructure/auth/getServerSession';
import { redirect } from 'next/navigation';
import ResidenteReservas from '@/presentation/components/ResidenteReservas';

export default async function ResidenteHome() {
    const session = await getSession();

    if (!session?.user || session.user.rol !== 'Residente') {
        redirect('/login');
    }

    return (
        <div className="dashboard-container">
            <ResidenteReservas userName={session.user.nombre} />

            <form action="/api/auth/logout" method="POST" style={{ marginTop: '40px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                <button type="submit" className="btn-danger">
                    Cerrar Sesión Corriente
                </button>
            </form>
        </div>
    );
}

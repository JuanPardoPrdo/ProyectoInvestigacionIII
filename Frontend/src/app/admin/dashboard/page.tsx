import { getSession } from '@/infrastructure/auth/getServerSession';
import { redirect } from 'next/navigation';
import AdminRecursos from '@/presentation/components/AdminRecursos';

export default async function AdminDashboard() {
    const session = await getSession();

    if (!session?.user || session.user.rol !== 'Administrador') {
        redirect('/login');
    }

    return (
        <div className="dashboard-container">
            <AdminRecursos />

            <form action="/api/auth/logout" method="POST" style={{ marginTop: '40px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                <button type="submit" className="btn-danger">
                    Cerrar Sesión Progresiva
                </button>
            </form>
        </div>
    );
}

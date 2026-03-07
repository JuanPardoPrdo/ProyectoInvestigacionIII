'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/presentation/styles/login.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                // RNF-03: Mostrar un error genérico, limpiar password
                setError(data.message || 'Credenciales inválidas');
                setPassword('');
                setLoading(false);
                return;
            }

            // RF-02: Redireccionamiento según el Rol
            if (data.user.rol === 'Administrador') {
                router.push('/admin/dashboard');
            } else {
                router.push('/residente/home');
            }
        } catch (err) {
            setError('Error de conexión. Inténtelo más tarde.');
            setLoading(false);
        }
    };

    return (
        <>
            <div className="bg-circle bg-circle-1"></div>
            <div className="bg-circle bg-circle-2"></div>

            <div className="login-container">
                <div className="login-header">
                    <h1>El Molino</h1>
                    <p>Portal de Reservas Residencial</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            className="input-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="juan@ejemplo.com"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            className="input-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className={`error-message ${error ? 'visible' : ''}`}>
                        {error}
                    </div>

                    <button
                        type="submit"
                        className={`btn-submit ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        <span className="btn-text">Iniciar Sesión</span>
                        <span className="loading-spinner"></span>
                    </button>
                </form>
            </div>
        </>
    );
}

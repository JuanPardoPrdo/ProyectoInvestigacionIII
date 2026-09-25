'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import '@/presentation/styles/login.css';

function ResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [loading, setLoading] = useState(false);
    const [exito, setExito] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') ?? '';

    useEffect(() => {
        if (!token) {
            setError('Token inválido o faltante. Solicita un nuevo enlace.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmar) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, nuevaPassword: password })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Error al restablecer la contraseña.');
            } else {
                setExito(true);
            }
        } catch {
            setError('Error de conexión. Inténtalo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="bg-circle bg-circle-1"></div>
            <div className="bg-circle bg-circle-2"></div>

            <div className="login-container" style={{ padding: '2.5rem' }}>
                <div className="login-header" style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '1.6rem' }}>Nueva Contraseña</h1>
                    <p>Ingresa tu nueva contraseña para acceder al portal</p>
                </div>

                {exito ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎉</div>
                        <p style={{ color: '#4ade80', marginBottom: '0.5rem', fontWeight: 600 }}>
                            ¡Contraseña restablecida!
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                            Ya puedes iniciar sesión con tu nueva contraseña.
                        </p>
                        <button
                            className="btn-submit"
                            style={{ marginTop: 0 }}
                            onClick={() => router.push('/login')}
                        >
                            Ir al inicio de sesión
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="password">Nueva Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                className="input-control"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                required
                                minLength={6}
                                disabled={!token}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="confirmar">Confirmar Contraseña</label>
                            <input
                                type="password"
                                id="confirmar"
                                className="input-control"
                                value={confirmar}
                                onChange={e => setConfirmar(e.target.value)}
                                placeholder="Repite la contraseña"
                                required
                                minLength={6}
                                disabled={!token}
                            />
                        </div>

                        <div className={`error-message ${error ? 'visible' : ''}`}>{error}</div>

                        <button
                            type="submit"
                            className={`btn-submit ${loading ? 'loading' : ''}`}
                            disabled={loading || !token}
                        >
                            <span className="btn-text">Restablecer Contraseña</span>
                            <span className="loading-spinner"></span>
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--text-muted)',
                                    fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline'
                                }}
                            >
                                ← Volver al inicio de sesión
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="login-page-wrapper">Cargando...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}

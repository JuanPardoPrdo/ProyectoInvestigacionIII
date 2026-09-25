'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/presentation/styles/login.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Error al procesar la solicitud.');
            } else {
                setEnviado(true);
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
                    <h1 style={{ fontSize: '1.6rem' }}>Recuperar Contraseña</h1>
                    <p>Ingresa tu correo y recibirás un enlace de restablecimiento</p>
                </div>

                {enviado ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
                        <p style={{ color: '#4ade80', marginBottom: '0.5rem', fontWeight: 600 }}>
                            ¡Instrucciones enviadas!
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                            Si el correo está registrado, recibirás un enlace válido por 15 minutos.
                        </p>
                        <button
                            className="btn-submit"
                            style={{ marginTop: 0 }}
                            onClick={() => router.push('/login')}
                        >
                            Volver al inicio de sesión
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="email">Correo Electrónico</label>
                            <input
                                type="email"
                                id="email"
                                className="input-control"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                required
                            />
                        </div>

                        <div className={`error-message ${error ? 'visible' : ''}`}>{error}</div>

                        <button
                            type="submit"
                            className={`btn-submit ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            <span className="btn-text">Enviar Instrucciones</span>
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

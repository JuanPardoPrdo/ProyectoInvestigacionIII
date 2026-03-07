'use client';

import { useState, useEffect } from 'react';
import '@/presentation/styles/dashboard.css';

export default function ResidenteReservas({ userName }: { userName: string }) {
    const [reservas, setReservas] = useState<any[]>([]);
    const [recursos, setRecursos] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [idReservaEditando, setIdReservaEditando] = useState<number | null>(null);
    const [filter, setFilter] = useState('Todas');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Form State
    const [idRecurso, setIdRecurso] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [horaInicio, setHoraInicio] = useState('08:00');
    const [fechaFin, setFechaFin] = useState('');
    const [horaFin, setHoraFin] = useState('10:00');

    const fetchReservasYRecursos = async () => {
        try {
            const [resReservas, resRecursos] = await Promise.all([
                fetch('/api/reservas').then(r => r.json()),
                fetch('/api/recursos').then(r => r.json())
            ]);
            setReservas(resReservas.reservas || []);
            setRecursos(resRecursos.recursos || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservasYRecursos();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const resetForm = () => {
        setIdRecurso('');
        setFechaInicio('');
        setHoraInicio('08:00');
        setFechaFin('');
        setHoraFin('10:00');
        setIdReservaEditando(null);
        setError('');
    };

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const start = new Date(`${fechaInicio}T${horaInicio}`);
        const end = new Date(`${fechaFin}T${horaFin}`);

        try {
            const method = idReservaEditando ? 'PUT' : 'POST';
            const url = idReservaEditando ? `/api/reservas/${idReservaEditando}` : '/api/reservas';

            // Construir ISO local (sin Z) para evitar el shift de toISOString()
            const formatLocalISO = (fecha: string, hora: string) => `${fecha}T${hora}:00`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idRecurso: parseInt(idRecurso),
                    fechaInicio: formatLocalISO(fechaInicio, horaInicio),
                    fechaFin: formatLocalISO(fechaFin, horaFin)
                })
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message);
                return;
            }

            setIsModalOpen(false);
            resetForm();
            fetchReservasYRecursos();
        } catch (err) {
            setError('Error al procesar la solicitud');
        }
    };

    const handleAbrirEdicion = (res: any) => {
        const start = new Date(res.fechaInicio);
        const end = new Date(res.fechaFin);

        setIdReservaEditando(res.idReserva);
        setIdRecurso(res.recurso?.idRecurso.toString() || '');

        // formatear localmente YYYY-MM-DD
        const toLocalISODate = (d: Date) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        setFechaInicio(toLocalISODate(start));
        setHoraInicio(start.toTimeString().slice(0, 5));
        setFechaFin(toLocalISODate(end));
        setHoraFin(end.toTimeString().slice(0, 5));

        setIsModalOpen(true);
    };

    const handleCancelar = async (id: number) => {
        if (!confirm('¿Seguro de cancelar esta reserva?')) return;
        try {
            await fetch(`/api/reservas/${id}`, { method: 'DELETE' });
            fetchReservasYRecursos();
        } catch (err) {
            console.error(err);
        }
    };

    const stats = {
        total: reservas.length,
        confirmadas: reservas.filter(r => r.estadoReserva === 'Confirmada').length,
        canceladas: reservas.filter(r => r.estadoReserva === 'Cancelada').length,
        finalizadas: reservas.filter(r => r.estadoReserva === 'Finalizada').length,
    };

    const filteredReservas = filter === 'Todas'
        ? reservas
        : reservas.filter(r => r.estadoReserva === filter);

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem', color: '#6366f1' }}>Iniciando sistema de reservas...</div>;

    return (
        <div>
            <div className="dashboard-header">
                <div className="welcome-section">
                    <h1>Bienvenido, {userName || 'Residente'}</h1>
                    <div className="system-time">
                        {currentTime.toLocaleDateString()} — {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                </div>
                <button className="btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
                    + Nueva Reserva
                </button>
            </div>

            <div className="stats-container">
                <div className="stat-card">
                    <span className="stat-label">Total Reservas</span>
                    <span className="stat-value">{stats.total}</span>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #22c55e' }}>
                    <span className="stat-label">Confirmadas</span>
                    <span className="stat-value" style={{ color: '#4ade80' }}>{stats.confirmadas}</span>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #f87171' }}>
                    <span className="stat-label">Canceladas</span>
                    <span className="stat-value" style={{ color: '#f87171' }}>{stats.canceladas}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Finalizadas</span>
                    <span className="stat-value" style={{ color: '#94a3b8' }}>{stats.finalizadas}</span>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Listado de Actividad</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['Todas', 'Confirmada', 'Cancelada', 'Finalizada'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '6px 14px',
                                fontSize: '0.8rem',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: filter === f ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                color: filter === f ? 'white' : 'var(--text-muted)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="scrollable-area">
                <div className="card-grid">
                    {filteredReservas.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed var(--glass-border)' }}>
                            <p style={{ color: '#94a3b8' }}>No se encontraron registros de este tipo.</p>
                        </div>
                    ) : (
                        filteredReservas.map((res: any) => (
                            <div key={res.idReserva} className="glass-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1px' }}>{res.recurso?.nombre}</h3>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                            ID: #{res.idReserva}
                                        </span>
                                    </div>
                                    <span className={`tag-status tag-${res.estadoReserva.toLowerCase()}`} style={{ padding: '0.2rem 0.6rem', fontSize: '0.65rem' }}>
                                        {res.estadoReserva}
                                    </span>
                                </div>

                                <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', width: '40px' }}>Inicia</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{new Date(res.fechaInicio).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', width: '40px' }}>Termina</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{new Date(res.fechaFin).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Costo</span>
                                        <span style={{ color: '#a5b4fc', fontSize: '1rem', fontWeight: '800' }}>
                                            ${res.costoTotal}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        {res.idReserva && res.estadoReserva === 'Confirmada' && (
                                            <>
                                                <button onClick={() => handleAbrirEdicion(res)} className="btn-secondary" style={{ padding: '0.4rem 0.7rem', fontSize: '0.7rem' }}>
                                                    Editar
                                                </button>
                                                <button onClick={() => handleCancelar(res.idReserva)} className="btn-danger" style={{ padding: '0.4rem 0.7rem', fontSize: '0.7rem' }}>
                                                    Cancelar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 style={{ marginBottom: '2rem', fontSize: '1.8rem', fontWeight: '800', textAlign: 'center' }}>
                            {idReservaEditando ? 'Ajustar Parámetros' : 'Nueva Reservación'}
                        </h3>
                        <form onSubmit={handleCreateOrUpdate}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.7rem', color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>Seleccionar Espacio</label>
                                <select
                                    required
                                    value={idRecurso}
                                    onChange={e => setIdRecurso(e.target.value)}
                                    style={{ width: '100%', padding: '1rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '14px', appearance: 'none' }}
                                >
                                    <option value="">Despliegue para seleccionar...</option>
                                    {recursos.map(r => (
                                        <option key={r.idRecurso} value={r.idRecurso}>{r.nombre} (Tarifa: ${r.costoPorReserva})</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.7rem', color: '#94a3b8', fontSize: '0.85rem' }}>Fecha de Inicio</label>
                                    <input type="date" required value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={{ width: '100%', padding: '1rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '14px', colorScheme: 'dark' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.7rem', color: '#94a3b8', fontSize: '0.85rem' }}>Hora de Inicio</label>
                                    <input type="time" required value={horaInicio} onChange={e => setHoraInicio(e.target.value)} style={{ width: '100%', padding: '1rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '14px', colorScheme: 'dark' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.7rem', color: '#94a3b8', fontSize: '0.85rem' }}>Fecha de Cierre</label>
                                    <input type="date" required value={fechaFin} onChange={e => setFechaFin(e.target.value)} style={{ width: '100%', padding: '1rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '14px', colorScheme: 'dark' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.7rem', color: '#94a3b8', fontSize: '0.85rem' }}>Hora de Cierre</label>
                                    <input type="time" required value={horaFin} onChange={e => setHoraFin(e.target.value)} style={{ width: '100%', padding: '1rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '14px', colorScheme: 'dark' }} />
                                </div>
                            </div>

                            {error && (
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '12px', borderRadius: '12px', marginBottom: '2rem', fontSize: '0.85rem', textAlign: 'center' }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', padding: '0.8rem 1.5rem', fontWeight: '600' }}>Descartar</button>
                                <button type="submit" className="btn-primary" style={{ width: '200px' }}>
                                    {idReservaEditando ? 'Actualizar' : 'Agendar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

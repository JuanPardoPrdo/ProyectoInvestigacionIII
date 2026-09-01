'use client';

import { useState, useEffect } from 'react';
import '@/presentation/styles/dashboard.css';
import { Multa, CrearMultaDto } from '@/domain/entities/Multa';

interface ReservaResumen {
    idReserva: number;
    idPersona: number;
    recurso: { idRecurso: number; nombre: string; tipo: string; costoPorReserva: number; estadoFisico: string } | null;
    fechaInicio: string;
    fechaFin: string;
    costoTotal: number;
    estadoReserva: string;
}

type FiltroEstado = 'todas' | 'pendientes' | 'pagadas';

export default function AdminMultas() {
    const [multas, setMultas] = useState<Multa[]>([]);
    const [reservas, setReservas] = useState<ReservaResumen[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState<FiltroEstado>('todas');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [idReserva, setIdReserva] = useState<number | string>('');
    const [descripcionDano, setDescripcionDano] = useState('');
    const [montoMulta, setMontoMulta] = useState<number | string>('');
    const [error, setError] = useState('');

    const fetchDatos = async () => {
        try {
            const [resMultas, resReservas] = await Promise.all([
                fetch('/api/multas').then(r => r.json()),
                fetch('/api/reservas').then(r => r.json())
            ]);
            setMultas(resMultas.multas || []);
            setReservas(resReservas.reservas || []);
        } catch (err) {
            console.error('Error cargando datos de multas:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDatos();
    }, []);

    const handleOpenModal = () => {
        setIdReserva('');
        setDescripcionDano('');
        setMontoMulta('');
        setError('');
        setIsModalOpen(true);
    };

    const handleCrearMulta = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!idReserva) {
            setError('Debe seleccionar una reserva.');
            return;
        }
        if (!descripcionDano.trim()) {
            setError('La descripción del uso indebido es requerida.');
            return;
        }
        if (!montoMulta || Number(montoMulta) <= 0) {
            setError('El monto de la multa debe ser mayor a cero.');
            return;
        }

        try {
            const payload: CrearMultaDto = {
                idReserva: Number(idReserva),
                descripcionDano: descripcionDano.trim(),
                montoMulta: Number(montoMulta)
            };

            const res = await fetch('/api/multas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Error al registrar la multa.');
                return;
            }

            setIsModalOpen(false);
            fetchDatos();
        } catch (err) {
            setError('Error al conectar con el servidor.');
        }
    };

    const handleMarcarPagada = async (idIncidente: number) => {
        if (!confirm('¿Confirma que el residente ha pagado esta multa?')) return;
        try {
            const res = await fetch(`/api/multas/${idIncidente}/pagar`, { method: 'PUT' });
            const data = await res.json();
            if (!res.ok) {
                alert(data.message || 'No fue posible marcar la multa como pagada.');
                return;
            }
            fetchDatos();
        } catch (err) {
            alert('Error de conexión al intentar actualizar la multa.');
        }
    };

    const handleEliminar = async (idIncidente: number) => {
        if (!confirm('¿Está seguro de eliminar esta multa? Esta acción también revertirá el cargo en el estado de cuenta del residente.')) return;
        try {
            const res = await fetch(`/api/multas/${idIncidente}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) {
                alert(data.message || 'No fue posible eliminar la multa.');
                return;
            }
            fetchDatos();
        } catch (err) {
            alert('Error de conexión al intentar eliminar la multa.');
        }
    };

    const multasFiltradas = multas.filter(m => {
        if (filtro === 'pendientes') return !m.pagado;
        if (filtro === 'pagadas') return m.pagado;
        return true;
    });

    const montoPendiente = multas.filter(m => !m.pagado).reduce((acc, m) => acc + m.montoMulta, 0);
    const montoRecaudado = multas.filter(m => m.pagado).reduce((acc, m) => acc + m.montoMulta, 0);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);

    const formatFecha = (fecha: string) =>
        new Date(fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });

    if (loading) return (
        <div className="loading-container" style={{ textAlign: 'center', padding: '100px', color: '#f59e0b' }}>
            Cargando registro de multas...
        </div>
    );

    return (
        <div className="admin-residentes-container">
            <div className="dashboard-header">
                <div className="welcome-section">
                    <h1>Multas por Uso Indebido</h1>
                    <div className="system-time">
                        Registro de Incidentes y Cargos — {new Date().toLocaleDateString()}
                    </div>
                </div>
                <button className="btn-primary" onClick={handleOpenModal}>
                    + Registrar Multa
                </button>
            </div>

            {/* Stats */}
            <div className="stats-container">
                <div className="stat-card">
                    <span className="stat-label">Total Multas</span>
                    <span className="stat-value">{multas.length}</span>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <span className="stat-label">Monto Pendiente</span>
                    <span className="stat-value" style={{ color: '#fbbf24', fontSize: '1rem' }}>{formatCurrency(montoPendiente)}</span>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #22c55e' }}>
                    <span className="stat-label">Monto Recaudado</span>
                    <span className="stat-value" style={{ color: '#4ade80', fontSize: '1rem' }}>{formatCurrency(montoRecaudado)}</span>
                </div>
            </div>

            {/* Filtro por estado */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                {(['todas', 'pendientes', 'pagadas'] as FiltroEstado[]).map(f => (
                    <button
                        key={f}
                        onClick={() => setFiltro(f)}
                        style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '20px',
                            border: '1px solid var(--glass-border)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: filtro === f ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                            color: filtro === f ? '#fff' : 'var(--text-muted)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {f === 'todas' ? '📋 Todas' : f === 'pendientes' ? '⚠️ Pendientes' : '✅ Pagadas'}
                        <span style={{ marginLeft: '0.4rem', opacity: 0.8 }}>
                            ({f === 'todas' ? multas.length : f === 'pendientes' ? multas.filter(m => !m.pagado).length : multas.filter(m => m.pagado).length})
                        </span>
                    </button>
                ))}
            </div>

            {/* Lista de multas */}
            <div className="scrollable-area">
                <div className="card-grid">
                    {multasFiltradas.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed var(--glass-border)' }}>
                            <p style={{ color: '#94a3b8' }}>
                                {filtro === 'todas' ? 'No hay multas registradas.' : `No hay multas ${filtro}.`}
                            </p>
                        </div>
                    ) : (
                        multasFiltradas.map(m => (
                            <div key={m.idIncidente} className="glass-card resource-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>{m.nombreResidente}</h3>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                            Doc: {m.documentoResidente} • Reserva #{m.idReserva}
                                        </span>
                                    </div>
                                    <span
                                        style={{
                                            padding: '0.15rem 0.6rem',
                                            borderRadius: '12px',
                                            fontSize: '0.6rem',
                                            fontWeight: 700,
                                            background: m.pagado ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                                            color: m.pagado ? '#4ade80' : '#fbbf24',
                                            border: `1px solid ${m.pagado ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`
                                        }}
                                    >
                                        {m.pagado ? '✅ Pagada' : '⚠️ Pendiente'}
                                    </span>
                                </div>

                                <div style={{ marginBottom: '0.6rem' }}>
                                    <div className="resource-info" style={{ marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                                        <span className="label">Recurso:</span>
                                        <span className="value">{m.nombreRecurso}</span>
                                    </div>
                                    <div className="resource-info" style={{ marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                                        <span className="label">Descripción:</span>
                                        <span className="value" style={{ fontSize: '0.72rem', fontStyle: 'italic', color: '#cbd5e1' }}>{m.descripcionDano}</span>
                                    </div>
                                    <div className="resource-info" style={{ marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                                        <span className="label">Monto:</span>
                                        <span className="value" style={{ color: '#fbbf24', fontWeight: 700 }}>{formatCurrency(m.montoMulta)}</span>
                                    </div>
                                    <div className="resource-info" style={{ marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                                        <span className="label">Reportado:</span>
                                        <span className="value">{formatFecha(m.fechaReporte)}</span>
                                    </div>
                                    {m.pagado && m.fechaPago && (
                                        <div className="resource-info" style={{ fontSize: '0.75rem' }}>
                                            <span className="label">Fecha pago:</span>
                                            <span className="value" style={{ color: '#4ade80' }}>{formatFecha(m.fechaPago)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="card-actions" style={{ paddingTop: '0.6rem', gap: '0.4rem' }}>
                                    {!m.pagado && (
                                        <button
                                            className="btn-secondary"
                                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.65rem', borderColor: 'rgba(34,197,94,0.4)', color: '#4ade80' }}
                                            onClick={() => handleMarcarPagada(m.idIncidente)}
                                        >
                                            ✓ Marcar Pagada
                                        </button>
                                    )}
                                    <button
                                        className="btn-danger"
                                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.65rem' }}
                                        onClick={() => handleEliminar(m.idIncidente)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal registrar multa */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '520px' }}>
                        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.4rem', fontWeight: '800' }}>
                            Registrar Multa por Uso Indebido
                        </h2>
                        <form onSubmit={handleCrearMulta}>
                            <div style={{ marginBottom: '1.2rem' }}>
                                <label className="form-label">Reserva Afectada</label>
                                <select
                                    className="form-input"
                                    required
                                    value={idReserva}
                                    onChange={e => setIdReserva(e.target.value)}
                                >
                                    <option value="">Seleccione una reserva...</option>
                                    {reservas.map(r => (
                                        <option key={r.idReserva} value={r.idReserva}>
                                            #{r.idReserva} — {r.recurso?.nombre ?? 'Recurso'} ({r.estadoReserva}) — {new Date(r.fechaInicio).toLocaleDateString('es-CO')}
                                        </option>
                                    ))}
                                </select>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                                    Se enlaza el cargo a la reserva seleccionada.
                                </span>
                            </div>

                            <div style={{ marginBottom: '1.2rem' }}>
                                <label className="form-label">Descripción del Uso Indebido / Daño</label>
                                <textarea
                                    className="form-input"
                                    required
                                    rows={3}
                                    value={descripcionDano}
                                    onChange={e => setDescripcionDano(e.target.value)}
                                    placeholder="Ej: El residente dejó el salón comunal con daños en el mobiliario y suciedad excesiva..."
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label">Monto de la Multa (COP)</label>
                                <input
                                    className="form-input"
                                    type="number"
                                    min={1}
                                    step={1000}
                                    required
                                    value={montoMulta}
                                    onChange={e => setMontoMulta(e.target.value)}
                                    placeholder="Ej: 150000"
                                />
                            </div>

                            {error && (
                                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', padding: '10px', borderRadius: '10px', marginBottom: '1.2rem', fontSize: '0.85rem', textAlign: 'center' }}>
                                    {error}
                                </div>
                            )}

                            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', padding: '0.6rem 1.2rem' }}
                                >
                                    Descartar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Registrar Multa
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

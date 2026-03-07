'use client';

import { useState, useEffect } from 'react';
import '@/presentation/styles/dashboard.css';

interface Recurso {
    idRecurso: number;
    nombre: string;
    tipo: string;
    costoPorReserva: number;
    estadoFisico: string;
}

export default function AdminRecursos() {
    const [recursos, setRecursos] = useState<Recurso[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [idRecursoEditando, setIdRecursoEditando] = useState<number | null>(null);
    const [error, setError] = useState('');

    // Form State
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState('');
    const [costo, setCosto] = useState(0);
    const [estado, setEstado] = useState('Disponible');

    const fetchRecursos = async () => {
        try {
            const res = await fetch('/api/recursos');
            const data = await res.json();
            setRecursos(data.recursos || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecursos();
    }, []);

    const resetForm = () => {
        setNombre('');
        setTipo('');
        setCosto(0);
        setEstado('Disponible');
        setIdRecursoEditando(null);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const method = idRecursoEditando ? 'PUT' : 'POST';
            const url = idRecursoEditando ? `/api/recursos/${idRecursoEditando}` : '/api/recursos';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    tipo,
                    costoPorReserva: costo,
                    estadoFisico: estado
                })
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message);
                return;
            }

            setIsModalOpen(false);
            resetForm();
            fetchRecursos();
        } catch (err) {
            setError('Error al procesar la solicitud');
        }
    };

    const handleEdit = (r: Recurso) => {
        setIdRecursoEditando(r.idRecurso);
        setNombre(r.nombre);
        setTipo(r.tipo);
        setCosto(r.costoPorReserva);
        setEstado(r.estadoFisico);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Seguro que desea eliminar este espacio?')) return;
        try {
            const res = await fetch(`/api/recursos/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                alert(data.message);
                return;
            }
            fetchRecursos();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="loading-container">Cargando infraestructura...</div>;

    return (
        <div className="admin-recursos-container">
            <div className="dashboard-header">
                <div className="welcome-section">
                    <h1>Sistemas de Infraestructura</h1>
                    <div className="system-time">
                        Modo Administrativo — {new Date().toLocaleDateString()}
                    </div>
                </div>
                <button className="btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
                    + Registrar Recurso
                </button>
            </div>

            <div className="stats-container">
                <div className="stat-card">
                    <span className="stat-label">Total Espacios</span>
                    <span className="stat-value">{recursos.length}</span>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #22c55e' }}>
                    <span className="stat-label">Operativos</span>
                    <span className="stat-value" style={{ color: '#4ade80' }}>
                        {recursos.filter(r => r.estadoFisico === 'Disponible').length}
                    </span>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <span className="stat-label">Mantenimiento</span>
                    <span className="stat-value" style={{ color: '#fbbf24' }}>
                        {recursos.filter(r => r.estadoFisico === 'Mantenimiento').length}
                    </span>
                </div>
            </div>

            <div className="scrollable-area">
                <div className="card-grid">
                    {recursos.map(r => (
                        <div key={r.idRecurso} className="glass-card resource-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>{r.nombre}</h3>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{r.tipo}</span>
                                </div>
                                <span className={`tag-status tag-${r.estadoFisico.toLowerCase().replace(' ', '-')}`} style={{ padding: '0.2rem 0.6rem', fontSize: '0.65rem' }}>
                                    {r.estadoFisico}
                                </span>
                            </div>

                            <div style={{ marginBottom: '0.8rem' }}>
                                <div className="resource-info" style={{ marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                                    <span className="label">Costo:</span>
                                    <span className="value">${r.costoPorReserva}</span>
                                </div>
                                <div className="resource-info" style={{ fontSize: '0.8rem' }}>
                                    <span className="label">ID:</span>
                                    <span className="value">#{r.idRecurso}</span>
                                </div>
                            </div>

                            <div className="card-actions" style={{ paddingTop: '0.8rem', gap: '0.4rem' }}>
                                <button className="btn-secondary" style={{ padding: '0.4rem 0.7rem', fontSize: '0.7rem' }} onClick={() => handleEdit(r)}>Editar</button>
                                <button className="btn-danger" style={{ padding: '0.4rem 0.7rem', fontSize: '0.7rem' }} onClick={() => handleDelete(r.idRecurso)}>Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            {idRecursoEditando ? 'Actualizar Espacio' : 'Registrar Nuevo Espacio'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.2rem' }}>
                                <label className="form-label">Nombre del Espacio</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    required
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    placeholder="Ej: Gimnasio, Cancha..."
                                />
                            </div>

                            <div style={{ marginBottom: '1.2rem' }}>
                                <label className="form-label">Tipo de Recurso</label>
                                <select className="form-input" required value={tipo} onChange={e => setTipo(e.target.value)}>
                                    <option value="">Seleccione tipo...</option>
                                    <option value="Zona Humeda">Zona Húmeda</option>
                                    <option value="Espacio Cerrado">Espacio Cerrado</option>
                                    <option value="Cancha Deportiva">Cancha Deportiva</option>
                                    <option value="Salud y Bienestar">Salud y Bienestar</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label className="form-label">Costo por Uso</label>
                                    <input className="form-input" type="number" required value={costo} onChange={e => setCosto(Number(e.target.value))} />
                                </div>
                                <div>
                                    <label className="form-label">Estado Inicial</label>
                                    <select className="form-input" value={estado} onChange={e => setEstado(e.target.value)}>
                                        <option value="Disponible">Disponible</option>
                                        <option value="Mantenimiento">Mantenimiento</option>
                                        <option value="Clausurado">Clausurado</option>
                                    </select>
                                </div>
                            </div>

                            {error && <div className="error-box">{error}</div>}

                            <div className="modal-footer">
                                <button type="button" className="btn-text" onClick={() => { setIsModalOpen(false); resetForm(); }}>Descartar</button>
                                <button type="submit" className="btn-primary">
                                    {idRecursoEditando ? 'Guardar Cambios' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

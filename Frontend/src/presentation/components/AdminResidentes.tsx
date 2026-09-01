'use client';

import { useState, useEffect } from 'react';
import '@/presentation/styles/dashboard.css';
import { Residente, Unidad } from '@/domain/entities/Residente';

export default function AdminResidentes() {
    const [residentes, setResidentes] = useState<Residente[]>([]);
    const [unidades, setUnidades] = useState<Unidad[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [idPersonaEditando, setIdPersonaEditando] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');

    // Unit Modal State
    const [isUnidadModalOpen, setIsUnidadModalOpen] = useState(false);
    const [nuevoNumeroUnidad, setNuevoNumeroUnidad] = useState('');
    const [nuevoBloqueTorre, setNuevoBloqueTorre] = useState('');
    const [unidadError, setUnidadError] = useState('');

    // Form State (Residente)
    const [idUnidad, setIdUnidad] = useState<number | string>('');
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [documento, setDocumento] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('Residente');
    const [estado, setEstado] = useState(1);

    const fetchResidentesYUnidades = async () => {
        try {
            const [resRes, resUni] = await Promise.all([
                fetch('/api/residentes').then(r => r.json()),
                fetch('/api/residentes/unidades').then(r => r.json())
            ]);
            setResidentes(resRes.residentes || []);
            setUnidades(resUni.unidades || []);
        } catch (err) {
            console.error('Error cargando residentes y unidades:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResidentesYUnidades();
    }, []);

    const resetForm = () => {
        setIdUnidad(unidades.length > 0 ? unidades[0].idUnidad : '');
        setNombreCompleto('');
        setDocumento('');
        setEmail('');
        setPassword('');
        setRol('Residente');
        setEstado(1);
        setIdPersonaEditando(null);
        setError('');
    };

    const handleOpenCreate = () => {
        resetForm();
        if (unidades.length > 0) {
            setIdUnidad(unidades[0].idUnidad);
        }
        setIsModalOpen(true);
    };

    const handleEdit = (r: Residente) => {
        setIdPersonaEditando(r.idPersona);
        setIdUnidad(r.idUnidad);
        setNombreCompleto(r.nombreCompleto);
        setDocumento(r.documento);
        setEmail(r.email || '');
        setPassword('');
        setRol(r.rol);
        setEstado(r.estado);
        setError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!idUnidad) {
            setError('Debe seleccionar una unidad residencial.');
            return;
        }

        try {
            const method = idPersonaEditando ? 'PUT' : 'POST';
            const url = idPersonaEditando ? `/api/residentes/${idPersonaEditando}` : '/api/residentes';

            const payload: any = {
                idUnidad: Number(idUnidad),
                nombreCompleto,
                documento,
                email,
                rol,
                estado: Number(estado)
            };

            if (!idPersonaEditando) {
                payload.password = password || 'password123';
            } else if (password.trim().length > 0) {
                payload.password = password;
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Error al procesar la solicitud');
                return;
            }

            setIsModalOpen(false);
            resetForm();
            fetchResidentesYUnidades();
        } catch (err) {
            setError('Error al procesar la solicitud con el servidor.');
        }
    };

    const handleCrearUnidad = async (e: React.FormEvent) => {
        e.preventDefault();
        setUnidadError('');

        if (!nuevoNumeroUnidad.trim()) {
            setUnidadError('El número de unidad es requerido.');
            return;
        }

        try {
            const res = await fetch('/api/residentes/unidades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    numeroUnidad: nuevoNumeroUnidad.trim(),
                    bloqueTorre: nuevoBloqueTorre.trim() || undefined
                })
            });

            const data = await res.json();
            if (!res.ok) {
                setUnidadError(data.message || 'Error al registrar unidad residencial.');
                return;
            }

            const resUni = await fetch('/api/residentes/unidades').then(r => r.json());
            setUnidades(resUni.unidades || []);

            if (data.unidad?.idUnidad) {
                setIdUnidad(data.unidad.idUnidad);
            }

            setIsUnidadModalOpen(false);
            setNuevoNumeroUnidad('');
            setNuevoBloqueTorre('');
        } catch (err) {
            setUnidadError('Error al conectar con el servidor.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Está seguro de eliminar este residente? Esta acción es irreversible.')) return;
        try {
            const res = await fetch(`/api/residentes/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                alert(data.message || 'No fue posible eliminar el residente.');
                return;
            }
            fetchResidentesYUnidades();
        } catch (err) {
            console.error(err);
            alert('Error de conexión al intentar eliminar el residente.');
        }
    };

    const residentesFiltrados = residentes.filter(r => {
        const query = busqueda.toLowerCase();
        return (
            r.nombreCompleto.toLowerCase().includes(query) ||
            r.documento.toLowerCase().includes(query) ||
            r.numeroUnidad.toLowerCase().includes(query) ||
            (r.email && r.email.toLowerCase().includes(query))
        );
    });

    const stats = {
        total: residentes.length,
        activos: residentes.filter(r => r.estado === 1).length,
        inactivos: residentes.filter(r => r.estado === 0).length,
    };

    if (loading) return <div className="loading-container" style={{ textAlign: 'center', padding: '100px', color: '#6366f1' }}>Cargando residentes y accesos...</div>;

    return (
        <div className="admin-residentes-container">
            <div className="dashboard-header">
                <div className="welcome-section">
                    <h1>Gestión de Residentes y Usuarios</h1>
                    <div className="system-time">
                        Padrón Residencial — {new Date().toLocaleDateString()}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            setUnidadError('');
                            setNuevoNumeroUnidad('');
                            setNuevoBloqueTorre('');
                            setIsUnidadModalOpen(true);
                        }}
                    >
                        + Nueva Unidad
                    </button>
                    <button className="btn-primary" onClick={handleOpenCreate}>
                        + Registrar Residente
                    </button>
                </div>
            </div>

            <div className="stats-container">
                <div className="stat-card">
                    <span className="stat-label">Total Residentes</span>
                    <span className="stat-value">{stats.total}</span>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #22c55e' }}>
                    <span className="stat-label">Residentes Activos</span>
                    <span className="stat-value" style={{ color: '#4ade80' }}>{stats.activos}</span>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #f87171' }}>
                    <span className="stat-label">Inactivos / Bloqueados</span>
                    <span className="stat-value" style={{ color: '#f87171' }}>{stats.inactivos}</span>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Buscar por nombre, documento, unidad o email..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                    />
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Mostrando {residentesFiltrados.length} de {residentes.length} residentes
                </span>
            </div>

            <div className="scrollable-area">
                <div className="card-grid">
                    {residentesFiltrados.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed var(--glass-border)' }}>
                            <p style={{ color: '#94a3b8' }}>No se encontraron residentes registrados con los criterios especificados.</p>
                        </div>
                    ) : (
                        residentesFiltrados.map(r => (
                            <div key={r.idPersona} className="glass-card resource-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>{r.nombreCompleto}</h3>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                            Doc: {r.documento} • {r.rol}
                                        </span>
                                    </div>
                                    <span className={`tag-status ${r.estado === 1 ? 'tag-activo' : 'tag-inactivo'}`} style={{ padding: '0.15rem 0.5rem', fontSize: '0.6rem' }}>
                                        {r.estado === 1 ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>

                                <div style={{ marginBottom: '0.6rem' }}>
                                    <div className="resource-info" style={{ marginBottom: '0.2rem', fontSize: '0.75rem' }}>
                                        <span className="label">Unidad:</span>
                                        <span className="value">{r.numeroUnidad} {r.bloqueTorre ? `(${r.bloqueTorre})` : ''}</span>
                                    </div>
                                    <div className="resource-info" style={{ marginBottom: '0.2rem', fontSize: '0.75rem' }}>
                                        <span className="label">Correo:</span>
                                        <span className="value" style={{ wordBreak: 'break-all', fontSize: '0.72rem' }}>{r.email || 'No registrado'}</span>
                                    </div>
                                    <div className="resource-info" style={{ fontSize: '0.75rem' }}>
                                        <span className="label">ID Sistema:</span>
                                        <span className="value">#{r.idPersona}</span>
                                    </div>
                                </div>

                                <div className="card-actions" style={{ paddingTop: '0.6rem', gap: '0.4rem' }}>
                                    <button className="btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.65rem' }} onClick={() => handleEdit(r)}>
                                        Editar
                                    </button>
                                    <button className="btn-danger" style={{ padding: '0.35rem 0.6rem', fontSize: '0.65rem' }} onClick={() => handleDelete(r.idPersona)}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal para Registrar / Editar Residente */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: '800' }}>
                            {idPersonaEditando ? 'Actualizar Residente' : 'Registrar Nuevo Residente'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Nombre Completo</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    required
                                    value={nombreCompleto}
                                    onChange={e => setNombreCompleto(e.target.value)}
                                    placeholder="Ej: Carlos Rodriguez"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label className="form-label">Documento de Identidad</label>
                                    <input
                                        className="form-input"
                                        type="text"
                                        required
                                        value={documento}
                                        onChange={e => setDocumento(e.target.value)}
                                        placeholder="Ej: 1020304050"
                                    />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <label className="form-label" style={{ margin: 0 }}>Unidad Residencial</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUnidadError('');
                                                setNuevoNumeroUnidad('');
                                                setNuevoBloqueTorre('');
                                                setIsUnidadModalOpen(true);
                                            }}
                                            style={{
                                                background: 'transparent',
                                                color: 'var(--secondary)',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                textDecoration: 'underline'
                                            }}
                                        >
                                            + Crear Unidad
                                        </button>
                                    </div>
                                    <select
                                        className="form-input"
                                        required
                                        value={idUnidad}
                                        onChange={e => setIdUnidad(e.target.value)}
                                    >
                                        <option value="">Seleccione Unidad...</option>
                                        {unidades.map(u => (
                                            <option key={u.idUnidad} value={u.idUnidad}>
                                                {u.numeroUnidad} {u.bloqueTorre ? `- ${u.bloqueTorre}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Correo Electrónico</label>
                                <input
                                    className="form-input"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="residente@ejemplo.com"
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label className="form-label">
                                    {idPersonaEditando ? 'Nueva Contraseña (dejar en blanco para mantener la actual)' : 'Contraseña de Acceso'}
                                </label>
                                <input
                                    className="form-input"
                                    type="password"
                                    required={!idPersonaEditando}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder={idPersonaEditando ? '•••••••• (sin cambios)' : 'Contraseña inicial'}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label className="form-label">Rol / Tipo</label>
                                    <select className="form-input" value={rol} onChange={e => setRol(e.target.value)}>
                                        <option value="Residente">Residente</option>
                                        <option value="Propietario">Propietario</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Estado de la Cuenta</label>
                                    <select className="form-input" value={estado} onChange={e => setEstado(Number(e.target.value))}>
                                        <option value={1}>Activo (Permite acceso)</option>
                                        <option value={0}>Inactivo (Bloqueado)</option>
                                    </select>
                                </div>
                            </div>

                            {error && <div className="error-box" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '10px', borderRadius: '10px', marginBottom: '1.2rem', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>}

                            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" className="btn-text" onClick={() => { setIsModalOpen(false); resetForm(); }} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', padding: '0.6rem 1.2rem' }}>
                                    Descartar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {idPersonaEditando ? 'Guardar Cambios' : 'Registrar Residente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal para Registrar Nueva Unidad Residencial */}
            {isUnidadModalOpen && (
                <div className="modal-overlay" style={{ zIndex: 110 }}>
                    <div className="modal-content" style={{ maxWidth: '460px' }}>
                        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.4rem', fontWeight: '800' }}>
                            Registrar Unidad Residencial
                        </h2>
                        <form onSubmit={handleCrearUnidad}>
                            <div style={{ marginBottom: '1.2rem' }}>
                                <label className="form-label">Número de Unidad (Apto / Casa)</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    required
                                    value={nuevoNumeroUnidad}
                                    onChange={e => setNuevoNumeroUnidad(e.target.value)}
                                    placeholder="Ej: A-103, Casa 14, 302..."
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label">Bloque o Torre (Opcional)</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={nuevoBloqueTorre}
                                    onChange={e => setNuevoBloqueTorre(e.target.value)}
                                    placeholder="Ej: Edificio Central, Torre 2..."
                                />
                            </div>

                            {unidadError && (
                                <div className="error-box" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '10px', borderRadius: '10px', marginBottom: '1.2rem', fontSize: '0.85rem', textAlign: 'center' }}>
                                    {unidadError}
                                </div>
                            )}

                            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    type="button"
                                    className="btn-text"
                                    onClick={() => {
                                        setIsUnidadModalOpen(false);
                                        setUnidadError('');
                                    }}
                                    style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', padding: '0.6rem 1.2rem' }}
                                >
                                    Descartar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Guardar Unidad
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

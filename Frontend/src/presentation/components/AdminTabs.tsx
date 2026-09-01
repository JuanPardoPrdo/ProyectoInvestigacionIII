'use client';

import { useState } from 'react';
import AdminRecursos from '@/presentation/components/AdminRecursos';
import AdminResidentes from '@/presentation/components/AdminResidentes';
import AdminMultas from '@/presentation/components/AdminMultas';
import '@/presentation/styles/dashboard.css';

export default function AdminTabs() {
    const [activeTab, setActiveTab] = useState<'recursos' | 'residentes' | 'multas'>('recursos');

    return (
        <div>
            <div className="nav-tabs">
                <button
                    className={`nav-tab ${activeTab === 'recursos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recursos')}
                >
                    🏢 Gestión de Infraestructura
                </button>
                <button
                    className={`nav-tab ${activeTab === 'residentes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('residentes')}
                >
                    👥 Gestión de Residentes
                </button>
                <button
                    className={`nav-tab ${activeTab === 'multas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('multas')}
                >
                    ⚠️ Multas
                </button>
            </div>

            {activeTab === 'recursos' && <AdminRecursos />}
            {activeTab === 'residentes' && <AdminResidentes />}
            {activeTab === 'multas' && <AdminMultas />}
        </div>
    );
}

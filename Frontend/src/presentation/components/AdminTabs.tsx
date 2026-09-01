'use client';

import { useState } from 'react';
import AdminRecursos from '@/presentation/components/AdminRecursos';
import AdminResidentes from '@/presentation/components/AdminResidentes';
import '@/presentation/styles/dashboard.css';

export default function AdminTabs() {
    const [activeTab, setActiveTab] = useState<'recursos' | 'residentes'>('recursos');

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
            </div>

            {activeTab === 'recursos' ? <AdminRecursos /> : <AdminResidentes />}
        </div>
    );
}

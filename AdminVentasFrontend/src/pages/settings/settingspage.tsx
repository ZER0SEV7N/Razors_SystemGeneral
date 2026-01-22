//adminventasfrontend/src/pages/settings/settingspage.tsx
/*--------------------------------------------------------------------
    Página de Configuración de la Compañía
    - Principales funcionalidades:
        - Mostrar y actualizar la información de configuración de la compañía
        - Integración con la API para obtener y guardar datos
        - Modificar logo de la compañía
        - Modificar nombre, dirección y teléfono
--------------------------------------------------------------------*/
import { useState, useEffect } from "react";
import api from "../../lib/api";
import { API_URL } from "../../lib/config";
import type { CompanySettings, User } from "../../types/index";
import Modal from "../../components/ui/ModalExample";

//Componente principal de la página de configuración
const SettingsPage = () => {
    //Estado para la configuración de la compañía
    const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'users'>('profile');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    //Cargar usuario actual al montar
    useEffect(() => {
        const stored = localStorage.getItem("user");
        if(stored) setCurrentUser(JSON.parse(stored));
    }, []);

    const isAdmin = currentUser?.role === 'ADMIN';
    return (
        <div className="page-container">
            <div className="page-header">
                <h2>⚙️ Configuración</h2>
            </div>

            {/* --- NAVEGACIÓN DE PESTAÑAS --- */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                <button 
                    onClick={() => setActiveTab('profile')}
                    style={activeTab === 'profile' ? tabActiveStyle : tabStyle}
                >👤 Mi Perfil
                </button>
                
                {/* Opciones solo para Admins */}
                {isAdmin && (
                    <>
                        <button 
                            onClick={() => setActiveTab('company')}
                            style={activeTab === 'company' ? tabActiveStyle : tabStyle}
                        >
                            🏢 Empresa
                        </button>
                        <button 
                            onClick={() => setActiveTab('users')}
                            style={activeTab === 'users' ? tabActiveStyle : tabStyle}
                        >
                            👥 Usuarios
                        </button>
                    </>
                )}
            </div>

            {/* --- CONTENIDO DINÁMICO --- */}
            <div className="tab-content">
                {activeTab === 'profile' && <ProfileSettings user={currentUser} />}
                {isAdmin && activeTab === 'company' && <CompanySettingsTab />}
                {isAdmin && activeTab === 'users' && <UsersManagementTab />}
            </div>
        </div>
    );
};

// --- ESTILOS DE TABS (Inline para no ensuciar CSS global) ---
const tabStyle: React.CSSProperties = {
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    fontWeight: 600,
    fontSize: '0.95rem'
};

const tabActiveStyle: React.CSSProperties = {
    ...tabStyle,
    color: 'var(--primary)',
    borderBottom: '3px solid var(--primary)'
};

// ==========================================
// SUB-COMPONENTE: MI PERFIL
// ==========================================
}
export default SettingsPage;
//AdminVentasFrontend/src/pages/settings/settingspage.tsx
//--------------------------------------------------------------------
/*    Página de Configuración del Sistema
    - Principales funcionalidades:
        - Navegación entre pestañas de configuración
        - Acceso a configuración de perfil, empresa, sucursales y conexión
--------------------------------------------------------------------*/
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../css/settings.css";

// Iconos
import { User, Building, MapPin, Wifi } from "lucide-react";

// TABS
import ProfileTab from "./tabs/ProfileTab";   
import CompanyTab from "./tabs/CompanyTab";   
import BranchesTab from "./tabs/BranchTab"; 
import ConnectionTab from "./tabs/ConnectionTab"; 

const SettingsPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const isAdmin = user?.role === "ADMIN";

    return (
        <div className="page-container">
            <header className="page-header">
                <h2>Configuración del Sistema</h2>
            </header>

            <div className="settings-layout">
                {/* SIDEBAR */}
                <aside className="settings-sidebar">
                    <button className={`settings-nav-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                        <User size={18} /> Mi Perfil
                    </button>

                    {isAdmin && (
                        <>
                            <div style={{margin:'15px 0 5px 10px', fontSize:'0.75rem', color:'#94a3b8', fontWeight:'bold', textTransform:'uppercase'}}>Administración</div>
                            <button className={`settings-nav-btn ${activeTab === 'company' ? 'active' : ''}`} onClick={() => setActiveTab('company')}>
                                <Building size={18} /> Datos Empresa
                            </button>
                            <button className={`settings-nav-btn ${activeTab === 'branches' ? 'active' : ''}`} onClick={() => setActiveTab('branches')}>
                                <MapPin size={18} /> Sucursales
                            </button>
                        </>
                    )}

                    <div style={{margin:'15px 0 5px 10px', fontSize:'0.75rem', color:'#94a3b8', fontWeight:'bold', textTransform:'uppercase'}}>Sistema</div>
                    <button className={`settings-nav-btn ${activeTab === 'connection' ? 'active' : ''}`} onClick={() => setActiveTab('connection')}>
                        <Wifi size={18} /> Conexión
                    </button>
                </aside>

                {/* CONTENIDO */}
                <main className="settings-content">
                    {activeTab === 'profile' && <ProfileTab user={user}/>} {/* Pasa el user como prop si tu ProfileTab lo requiere */}
                    {activeTab === 'company' && isAdmin && <CompanyTab />}
                    {activeTab === 'branches' && isAdmin && <BranchesTab />}
                    {activeTab === 'connection' && <ConnectionTab />}
                </main>
            </div>
        </div>
    );
};
export default SettingsPage;
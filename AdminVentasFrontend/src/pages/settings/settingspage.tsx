//adminventasfrontend/src/pages/settings/settingspage.tsx
//Modulo para la pagina de configuraciones del sistema
//Funcionalidades: Gestion de perfil, datos de la empresa, sucursales, conexion del sistema
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../css/settings.css"; //Estilos específicos del layout

//Iconos
import { User, Building, MapPin, Wifi } from "lucide-react";

//TABS
import ProfileTab from "./tabs/ProfileTab";   
import CompanyTab from "./tabs/CompanyTab";   
import BranchesTab from "./tabs/BranchTab"; 
import ConnectionTab from "./tabs/ConnectionTab"; 

//Componente principal de la pagina de configuraciones
const SettingsPage = () => {
    const { user } = useAuth(); //Obtener datos del usuario autenticado
    const [activeTab, setActiveTab] = useState("profile"); //Estado para la pestaña activa
    const isAdmin = user?.role === "OWNER"; //Verificar si el usuario owner

    //Renderizado del componente
    return (
        <div className="page-container">
            {/* ENCABEZADO DE LA PÁGINA */}
            <header className="page-header">
                <h2>⚙️ Configuración del Sistema</h2>
            </header>

            <div className="settings-layout">
                {/* SIDEBAR DE NAVEGACIÓN */}
                <aside className="settings-sidebar">
                    <button 
                        className={`settings-nav-btn ${activeTab === 'profile' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={18} /> Mi Perfil
                    </button>
                    {/* Opciones */}
                    {isAdmin && (
                        <>
                            <div className="settings-sidebar-divider">ADMINISTRACIÓN</div>
                            <button 
                                className={`settings-nav-btn ${activeTab === 'company' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('company')}
                            >
                                <Building size={18} /> Datos Empresa
                            </button>
                            <button 
                                className={`settings-nav-btn ${activeTab === 'branches' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('branches')}
                            >
                                <MapPin size={18} /> Sucursales
                            </button>
                        </>
                    )}

                    <div className="settings-sidebar-divider">SISTEMA</div>
                    <button 
                        className={`settings-nav-btn ${activeTab === 'connection' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('connection')}
                    >
                        <Wifi size={18} /> Conexión
                    </button>
                </aside>

                {/* ÁREA DE CONTENIDO */}
                <main className="settings-content">
                    {activeTab === 'profile' && <ProfileTab user={user}/>}
                    {activeTab === 'company' && isAdmin && <CompanyTab />}
                    {activeTab === 'branches' && isAdmin && <BranchesTab />}
                    {activeTab === 'connection' && <ConnectionTab />}
                </main>
            </div>
        </div>
    );
};
export default SettingsPage;
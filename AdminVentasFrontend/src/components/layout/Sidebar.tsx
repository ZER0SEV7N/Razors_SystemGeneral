//adminventasfrontend/src/components/layout/Sidebar.tsx
/*--------------------------------------------------------------------
    Componente Sidebar para la navegacion en la aplicacion AdminVentasFrontend
    - Principales funcionalidades:
        - Enlaces de navegacion
        - Estilos y diseño responsivo
--------------------------------------------------------------------*/
import "../css/layout.css"; //Importar estilos CSS para el modal
import { NavLink } from "react-router-dom"; //Importar NavLink para la navegacion entre rutas
import { useAuth } from "../../context/AuthContext";

//Componente Sidebar
const Sidebar = () => {
    //Utilizar el contexto de autenticacion para obtener la informacion del usuario
    const { user, logout } = useAuth();

    //Estado para almacenar la informacion del usuario
    if (!user) return <div className="sidebar">Cargando...</div>;
    //Obtener el rol del usuario
    const role = user.role; // OWNER, ADMIN, GERENTE, VENDEDOR
    const isOwner = role === 'OWNER';
    const isBranchAdmin = role === 'ADMIN' || role === 'GERENTE';

    return (
        <aside className="sidebar">
            {/* Sección de Usuario */}
            <div className="sidebar-user">
                <img
                    src={user.avatar ? `http://localhost:8000/storage/${user.avatar}` : "https://i.pravatar.cc/150" } 
                    alt="avatar" 
                />
                <h4>{user.name} {user.last_name}</h4>
                <small>{user.email}</small> <br/>
                <span className="role-badge">
                    {role} {user.branch ? `| ${user.branch.name}` : ''}
                </span>
            </div>

            {/* Menú de Navegación (CSS: .sidebar-menu) */}
            <nav className="sidebar-menu">
                {/* --- MÓDULO VENTAS (Todos) --- */}
                <div className="menu-section">VENTAS</div>
                <NavLink to="/sales">🛒 Punto de Venta</NavLink>
                <NavLink to="/history">📜 Historial</NavLink>
                <NavLink to="/clients">👥 Clientes</NavLink>

                {/* --- MÓDULO GESTIÓN (Owner y Admins de Sede) --- */}
                {(isOwner || isBranchAdmin) && (
                    <>
                        <div className="menu-section">GESTIÓN</div>
                        <NavLink to="/dashboard">📊 Dashboard</NavLink>
                        
                        {/* El texto cambia según el rol */}
                        <NavLink to="/inventory">
                            {isOwner ? "📦 Inventario Global" : "📦 Inventario Local"}
                        </NavLink>
                        
                        <NavLink to="/categories">🗂️ Categorías</NavLink>
                    </>
                )}

                {/* --- MÓDULO ADMINISTRACIÓN (Exclusivo OWNER) --- */}
                {isOwner && (
                    <>
                        <div className="menu-section">ADMINISTRACIÓN</div>
                        <NavLink to="/users">👔 Usuarios</NavLink>
                        <NavLink to="/branches">🏢 Sucursales</NavLink>
                        <NavLink to="/settings">⚙️ Configuración</NavLink>
                    </>
                )}

                {/* Botón de Logout */}
                <div className="sidebar-footer">
                    <button onClick={logout} className="btn-logout">
                        🚪 Cerrar Sesión
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;

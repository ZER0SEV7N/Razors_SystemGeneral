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
    const role = user.role; // ADMIN, GERENTE, VENDEDOR

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
                <small style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                    {role} {user.branch ? `| ${user.branch.name}` : ''}
                </small>
            </div>

            {/* Menú de Navegación (CSS: .sidebar-menu) */}
            <nav className="sidebar-menu">
                {/* --- VENTAS (Todos) --- */}
                <NavLink to="/sales">Punto de Venta</NavLink>
                <NavLink to="/history">Historial Ventas</NavLink>
                <NavLink to="/clients">Clientes</NavLink>

                {/* --- GERENCIA (Admin y Gerente) --- */}
                {(role === 'ADMIN' || role === 'GERENTE') && (
                    <>
                        <div style={{ marginTop: '10px', marginBottom: '5px', paddingLeft: '15px', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                            Gestión
                        </div>
                        <NavLink to="/dashboard">Dashboard</NavLink>
                        <NavLink to="/products">Inventario</NavLink>
                        <NavLink to="/categories">Categorías</NavLink>
                    </>
                )}

                {/* --- ADMINISTRACIÓN (Solo Admin) --- */}
                {role === 'ADMIN' && (
                    <>
                        <div style={{ marginTop: '10px', marginBottom: '5px', paddingLeft: '15px', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                            Admin
                        </div>
                        <NavLink to="/users">Usuarios</NavLink>
                        <NavLink to="/settings">Configuración</NavLink>
                    </>
                )}

                {/* Botón de Logout */}
                <button onClick={logout}>
                    Cerrar Sesión
                </button>
            </nav>
        </aside>
    );
};

export default Sidebar;

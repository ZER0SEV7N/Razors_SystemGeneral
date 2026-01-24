//adminventasfrontend/src/components/layout/Navbar.tsx
/*--------------------------------------------------------------------
    Componente Navbar para la aplicacion AdminVentasFrontend
    - Principales funcionalidades:
        - Barra de navegacion superior
        - Enlaces a secciones principales
--------------------------------------------------------------------*/
import "../css/layout.css"; //Importar estilos CSS para el modal
import { useAuth } from "../../context/AuthContext";

//Componente Navbar
const Navbar = () => {
    const { user } = useAuth();

    return (
        <header className="navbar">
            {/* Título Principal */}
            <h3>RAZORS System</h3>

            {/* Espaciador para empujar info a la derecha */}
            <div style={{ flex: 1 }}></div>

            {/* Información extra alineada a la derecha */}
            <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                    {user?.branch?.name || 'Sede Principal'}
                </span>
            </div>
        </header>
    );
}
export default Navbar;

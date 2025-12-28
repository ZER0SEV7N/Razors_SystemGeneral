//adminVentasFrontend/src/components/layout/MainLayout.tsx
/*--------------------------------------------------------------------
    Componente MainLayout para la aplicacion AdminVentasFrontend
    - Principales funcionalidades:
        - Estructura base de la aplicacion
        - Integracion de Navbar y Sidebar
--------------------------------------------------------------------*/
import Navbar from "./Navbar"; //Importar el componente Navbar
import Sidebar from "./Sidebar"; //Importar el componente Sidebar
import "../css/layout.css"; //Importar estilos CSS para el modal
import { Outlet } from "react-router-dom"; //Importar Outlet para renderizar rutas hijas

//Componente MainLayout
const MainLayout = () => {
    return (
        <div className="layout">
            <Sidebar />
            <div className="layout-content">
                <Navbar />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
export default MainLayout;
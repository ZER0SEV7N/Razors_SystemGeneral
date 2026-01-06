//AdminVentasFrontend/src/App.tsx
/*--------------------------------------------------------------------
    Componente principal de la aplicacion AdminVentasFrontend
    - Configuracion de rutas
    - Estructura base de la aplicacion
--------------------------------------------------------------------*/
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; //Importar componentes de react-router-dom para la navegacion
import Login from "./pages/Login"; //Importar la pagina de Login
import Dashboard from "./pages/Dashboard"; //Importar la pagina de Dashboard
import ProtectedRoute from "./lib/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import ProductsPage from "./pages/products/ProductsPage";
import SalesPage from "./pages/sales/salesPage";
import SalesHistory from "./pages/sales/salesHistory";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas Publicas */}
                <Route path="/login" element={<Login />} />
                {/* Rutas protegidas */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/sales" element={<SalesPage />} />
                        <Route path="/sales/history" element={<SalesHistory />} />
                    </Route>
                </Route>
                {/* Ruta por defecto */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
export default App;

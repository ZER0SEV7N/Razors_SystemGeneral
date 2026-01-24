//AdminVentasFrontend/src/App.tsx
/*--------------------------------------------------------------------
    Componente principal de la aplicacion AdminVentasFrontend
    - Configuracion de rutas
    - Estructura base de la aplicacion
--------------------------------------------------------------------*/
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; //Importar componentes de react-router-dom para la navegacion
import { AuthProvider } from "./context/AuthContext"; 

//Importar el proveedor de contexto de autenticacion
import ProtectedRoute from "./lib/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

//Importar las paginas principales
import Login from "./pages/Login"; //Importar la pagina de Login
import Dashboard from "./pages/Dashboard"; //Importar la pagina de Dashboard
import ProductsPage from "./pages/products/ProductsPage";
import CategoriesPage from "./pages/categories/CategoriesPage";
import SalesPage from "./pages/sales/salesPage";
import ClientsPage from "./pages/clients/clientsPage";
import SalesHistory from "./pages/sales/salesHistory";
import SettingsPage from "./pages/settings/settingspage";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Rutas Publicas */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Rutas protegidas */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<MainLayout />}>
                            {/* Redirección raíz al dashboard */}
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />

                            <Route path="/dashboard" element={<Dashboard />} />
                            
                            {/* Módulos de Gestión */}
                            <Route path="/products" element={<ProductsPage />} />
                            <Route path="/categories" element={<CategoriesPage />} /> 
                            <Route path="/clients" element={<ClientsPage />} />
                            
                            {/* Módulo de Ventas */}
                            <Route path="/sales" element={<SalesPage />} />
                            <Route path="/history" element={<SalesHistory />} />

                            {/* Módulo de Configuración */}
                            <Route path="/settings" element={<SettingsPage />} />
                        </Route>
                    </Route>
                    
                    {/* Ruta por defecto (404) */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
export default App;

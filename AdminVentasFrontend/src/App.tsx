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
import InventoryPage from "./pages/Inventory/InventoryPage";
import CategoriesPage from "./pages/categories/CategoriesPage";
import SalesPage from "./pages/sales/salesPage";
import UserPage from "./pages/users/UserPage";
import ClientsPage from "./pages/clients/clientsPage";
import SalesHistory from "./pages/sales/salesHistory";
import SettingsPage from "./pages/settings/settingspage";
// TODO: Crear estos componentes pronto. Por ahora evitamos que rompa la compilación si no existen.
// import UsersPage from "./pages/users/UsersPage";
import BranchesPage from "./pages/branches/BranchesPage";
const Placeholder = ({title}: {title: string}) => <div style={{padding: 20}}><h2>🚧 {title} en construcción</h2></div>;

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Rutas Publicas */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Rutas Protegidas */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />

                            <Route path="/dashboard" element={<Dashboard />} />
                            
                            {/* Gestión de Inventario (Ahora apunta a InventoryPage) */}
                            <Route path="/inventory" element={<InventoryPage />} />
                            {/* Mantenemos ruta legacy por si acaso, o redirigimos */}
                            <Route path="/products" element={<Navigate to="/inventory" replace />} />
                            
                            <Route path="/categories" element={<CategoriesPage />} /> 
                            <Route path="/clients" element={<ClientsPage />} />
                            
                            {/* Ventas */}
                            <Route path="/sales" element={<SalesPage />} />
                            <Route path="/history" element={<SalesHistory />} />

                            {/* Configuración Global (Owner) */}
                            <Route path="/users" element={<UserPage />} /> 
                            
                            <Route path="/branches" element={<BranchesPage />} />
                            
                            <Route path="/settings" element={<SettingsPage />} />
                        </Route>
                    </Route>
                    
                    {/* 404 */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
export default App;
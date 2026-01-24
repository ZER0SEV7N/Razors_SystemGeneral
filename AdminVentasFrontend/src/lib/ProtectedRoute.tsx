//AdminVentasFrontend/src/lib/ProtectedRoute.tsx
/*--------------------------------------------------------------------
    Componente de ruta protegida para la aplicacion AdminVentasFrontend
    - Verifica si el usuario esta autenticado antes de permitir el acceso a rutas protegidas
--------------------------------------------------------------------*/
import { Navigate, Outlet } from "react-router-dom"; //Importar componente Navigate de react-router-dom para redireccionamiento
import { useAuth } from "../context/AuthContext"; //Importar el contexto de autenticacion

interface Props {
  allowedRoles?: string[]; //Roles permitidos para acceder a la ruta [ADMIN, VENDEDOR, GERENTE]
}
//Componente de ruta protegida
const ProtectedRoute = ({ allowedRoles }: Props) => {
  const { user, isAuthenticated, isLoading } = useAuth(); //Obtener el contexto de autenticacion

  if (isLoading) {
        return <div className="loading-screen">Cargando sistema...</div>; 
  }

  //Si el usuario no esta autenticado correctamente, redirigir a la pagina de login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  //Si se especificaron roles permitidos, verificar si el usuario tiene uno de esos roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    //Logica de redireccion segun rol
    if (user.role === 'VENDEDOR') {
        return <Navigate to="/sales" replace />;
    }
    //Por defecto redirigir al dashboard
    return <Navigate to="/dashboard" replace />;
  }

  //Si hay token, renderizar los componentes hijos
  return <Outlet />;
};
//Exportar el componente ProtectedRoute
export default ProtectedRoute;

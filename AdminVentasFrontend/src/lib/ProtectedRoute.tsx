//AdminVentasFrontend/src/lib/ProtectedRoute.tsx
/*--------------------------------------------------------------------
    Componente de ruta protegida para la aplicacion AdminVentasFrontend
    - Verifica si el usuario esta autenticado antes de permitir el acceso a rutas protegidas
--------------------------------------------------------------------*/
import { Navigate, Outlet } from "react-router-dom"; //Importar componente Navigate de react-router-dom para redireccionamiento

//Componente de ruta protegida
const ProtectedRoute = () => {
  const token = localStorage.getItem("token"); //Obtener el token de autenticacion del almacenamiento local

  //Si no hay token, redirigir a la pagina de login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  //Si hay token, renderizar los componentes hijos
  return <Outlet />;
};
//Exportar el componente ProtectedRoute
export default ProtectedRoute;

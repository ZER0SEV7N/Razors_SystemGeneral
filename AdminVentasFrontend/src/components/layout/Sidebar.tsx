//adminventasfrontend/src/components/layout/Sidebar.tsx
/*--------------------------------------------------------------------
    Componente Sidebar para la navegacion en la aplicacion AdminVentasFrontend
    - Principales funcionalidades:
        - Enlaces de navegacion
        - Estilos y diseño responsivo
--------------------------------------------------------------------*/
import "../css/layout.css"; //Importar estilos CSS para el modal
import { useEffect, useState } from "react"; //Importar useEffect y useState para manejar el estado y efectos secundarios
import { NavLink } from "react-router-dom"; //Importar NavLink para la navegacion entre rutas
import api from "../../lib/api"; //Importar la instancia de axios configurada para realizar solicitudes a la API

//Definir la interfaz para la informacion del usuario
interface User {
    name: string;
    last_name: string;
    email: string;
    avatar?: string;
}

//Componente Sidebar
const Sidebar = () => {
    const [user, setUser] = useState<User | null>(null); //Estado para almacenar la informacion del usuario
   
    //Funcion para el logout del usuario
    const handleLogout = async () => {
        try{
            await api.post("/logout"); //Realizar la peticion POST a la API para cerrar sesion
        }catch(e){
            console.error("Error during logout:", e);
        }finally{
            localStorage.removeItem("token"); //Eliminar el token de autenticacion del almacenamiento local
            localStorage.removeItem("user"); //Eliminar el token de autenticacion y la informacion del usuario del almacenamiento local
            window.location.href = "/login"; //Redirigir a la pagina de login
        }
    };

    //Utilizar useEffect para cargar la informacion del usuario al montar el componente
    useEffect(() => {
        const storedUser = localStorage.getItem("user"); //Verificar si la informacion del usuario ya esta en localStorage
        //Si la informacion del usuario ya esta en localStorage, usarla
        if (storedUser) {
            setUser(JSON.parse(storedUser)); //Parsear y establecer la informacion del usuario desde localStorage
            return;
        }
        //Si no esta en localStorage, obtenerla desde la API
        api.get("/me")//Realizar la peticion GET a la API para obtener la informacion del usuario
            .then(res => {
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data)); //Almacenar la informacion del usuario en localStorage
            })
            .catch(() => {
            localStorage.removeItem("token"); //Si hay un error, eliminar el token de autenticacion
            window.location.href = "/login"; //Redirigir a la pagina de login
            });
    }, []);
    //Si la informacion del usuario no esta disponible, mostrar un mensaje de carga    
    if(!user){
        return <div className="sidebar">Cargando...</div>; //Mostrar un mensaje de carga mientras se obtiene la informacion del usuario
    }

    //Renderizar el Sidebar con la informacion del usuario y los enlaces de navegacion
    return (
        <aside className="sidebar">
            <div className="sidebar-user">
                <img src={user.avatar || "https://i.pravatar.cc/150"} alt ="avatar" />
                <h4>{user.name} {user.last_name}</h4>
                <small>{user.email}</small>
            </div>

            <nav className="sidebar-menu">
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/products">Administrar Inventario</NavLink>
                <NavLink to="/categories">Administrar Categorías</NavLink>
                <NavLink to="/clients">Administrar Clientes</NavLink>
                <NavLink to="/sales">Generar Ventas</NavLink>
                <NavLink to="/sales/history">Historial de Ventas</NavLink>
                <NavLink to="/reports">Reportes</NavLink>
                <NavLink to="/settings">Configuración</NavLink>
                <button onClick={handleLogout}>Cerrar Sesión</button>
            </nav>
        </aside>
    );
}

export default Sidebar;

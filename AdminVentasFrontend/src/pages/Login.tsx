//AdminVentasFrontend/src/pages/Login.tsx
/*--------------------------------------------------------------------
    Pagina principal para logueo de usuario
    - Principales funcionalidades:
        - Formulario de login
        - Manejo de estado y validaciones
        - Integracion con API para autenticacion
--------------------------------------------------------------------*/
import { useState } from "react"; //Importar useState para manejar el estado del componente
import { useNavigate } from "react-router-dom"; //Importar useNavigate para la navegacion entre paginas
import api from "../lib/api"; //Importar la instancia de axios configurada para realizar solicitudes a la API
import "../pages/css/login.css"; //Importar estilos CSS para la pagina de login

//Componente de Login
const Login = () => {
    const navigate = useNavigate(); //Hook para la navegacion
    const [email, setEmail] = useState(""); //Estado para el email del usuario
    const [password, setPassword] = useState(""); //Estado para la contraseña del usuario
    const [error, setError] = useState(""); //Estado para manejar errores de login
    const [loading, setLoading] = useState(false); //Estado para indicar si se esta procesando el login

    //Funcion para el manejo del envio del formulario del Login
    //Utilizando la peticion HTTP/POST a la API
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); //Prevenir el comportamiento por defecto del formulario
        setLoading(true); //Indicar que se inicio el proceso de login
        setError(""); //Limpiar errores previos
        try{
            //Realizar la peticion POST a la API para el login
            const res = await api.post("/login", {
                email, password
            });
            //Guardar el token de autenticacion en el almacenamiento local
            const { token, user } = res.data;
            //Verificar que se recibio el token y la informacion del usuario
            if(!token || !user){
                throw new Error("Token de autenticacion no recibido");
            }
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            //Redirigir al usuario a la pagina principal despues del login exitoso
            navigate("/dashboard");
        }catch (err) {  
            setError("Error de autenticacion. Verifique sus credenciales."); //Establecer el mensaje de error
        } finally {
            setLoading(false); //Indicar que el proceso de login ha finalizado
        }
    };
    //Renderizar el formulario de login
    return (
        <div className="login-container">
            <h1>Bienvenido a Razors System Administration.</h1>
            <h2>Iniciar Sesión.</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="email">Correo Electrónico:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-email" required/>
                </div>
                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-password" required/>
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" disabled={loading} className="btn-login">
                    {loading ? "Procesando..." : "Iniciar Sesión"}
                </button>
            </form>
        </div>
    );
}
export default Login; //Exportar el componente Login para su uso en otras partes de la aplicacion
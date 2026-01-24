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
import "./css/Login.css"; //Importar estilos CSS para la pagina de login (Ajustado a ruta relativa estándar)
import { useAuth } from "../context/AuthContext"; //Importar el contexto de autenticacion

//Componente de Login
const Login = () => {
    const navigate = useNavigate(); //Hook para la navegacion
    const { login } = useAuth(); //Obtener el contexto de autenticacion
    const [email, setEmail] = useState(""); //Estado para el email del usuario
    const [password, setPassword] = useState(""); //Estado para la contraseña del usuario
    const [error, setError] = useState(""); //Estado para manejar errores de login
    const [loading, setLoading] = useState(false); //Estado para indicar si se esta procesando el login

    //Funcion para el manejo del envio del formulario del Login
    //Utilizando la peticion HTTP/POST a la API
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); //Prevenir el comportamiento por defecto del formulario (Evita recarga)      
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
            console.log("LOGIN EXITOSO");

            login(token, user);
            
            //Redirección inteligente según rol (Opcional pero recomendado)
            if (user.role === 'VENDEDOR') {
                navigate("/sales");
            } else {
                navigate("/dashboard");
            }

        } catch (err: any) {  
            console.error("Error en login:", err);
            // Capturar mensaje del backend si existe, sino usar mensaje genérico
            const msg = err.response?.data?.message || "Error de autenticacion. Verifique sus credenciales.";
            setError(msg); //Establecer el mensaje de error
        } finally {
            setLoading(false); //Indicar que el proceso de login ha finalizado
        }
    };

    //Renderizar el formulario de login
    return (
        <div className="login-wrapper">
            <div className="login-container">
                <h1>Bienvenido a Razors System Administration.</h1>
                <h2>Iniciar Sesión.</h2>
                <form onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email">Correo Electrónico:</label>
                        <input 
                            type="email" 
                            id="email"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="input-email" 
                            required
                            placeholder="ejemplo@correo.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Contraseña:</label>
                        <input 
                            type="password" 
                            id="password"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="input-password" 
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Mensaje de error condicional */}
                    {error && <div className="error-message">⚠️ {error}</div>}

                    <button type="submit" disabled={loading} className="btn-login">
                        {loading ? "Procesando..." : "Iniciar Sesión"}
                    </button>
                </form>
            </div>
        </div>
    );
}
export default Login; //Exportar el componente Login para su uso en otras partes de la aplicacion
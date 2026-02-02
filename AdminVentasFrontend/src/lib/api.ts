//AdminVentasFrontend/src/lib/api.ts
import axios from "axios"; //Importar axios para realizar solicitudes HTTP
import { API_URL } from "./config"; //Importar la URL base de la API desde el archivo de configuración

//Crear una instancia de axios con la configuración predeterminada
const api = axios.create({
    baseURL: API_URL, //Establecer la URL base de la API
    headers: {
        'Accept': 'application/json',
    }
});
// INTERCEPTOR DE SOLICITUD (El cambio clave está aquí)
api.interceptors.request.use((config) => {
    // 1. Buscamos el token en localStorage (Persistente)
    let token = localStorage.getItem("token");

    // 2. Si no está, lo buscamos en sessionStorage (Temporal)
    if (!token) {
        token = sessionStorage.getItem("token");
    }

    // 3. Si encontramos token en alguno de los dos, lo inyectamos
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
});

// INTERCEPTOR DE RESPUESTA (Manejo de errores 401)
api.interceptors.response.use( 
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Evitamos bucle infinito si ya estamos en login
            if (window.location.pathname !== "/login") {
                // Limpiamos AMBOS almacenamientos
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                sessionStorage.clear();
                
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);
export default api; //Exportar la instancia de axios para su uso en otras partes de la aplicación
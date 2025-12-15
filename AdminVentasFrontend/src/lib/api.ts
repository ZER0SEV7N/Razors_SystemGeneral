//AdminVentasFrontend/src/lib/api.ts
import axios from "axios"; //Importar axios para realizar solicitudes HTTP
import { API_URL } from "./config"; //Importar la URL base de la API desde el archivo de configuración

//Crear una instancia de axios con la configuración predeterminada
const api = axios.create({
    baseURL: API_URL, //Establecer la URL base de la API
    headers: {
        "Content-Type": "application/json", //Establecer el tipo de contenido a JSON
    },
});
//Agregar un interceptor para incluir el token de autenticación en cada solicitud
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token"); //Obtener el token de autenticación del almacenamiento local
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; //Agregar el token al encabezado de autorización si existe
    }
    return config; //Devolver la configuración modificada
});

export default api; //Exportar la instancia de axios para su uso en otras partes de la aplicación
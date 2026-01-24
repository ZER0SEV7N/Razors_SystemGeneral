//adminventasfrontend/src/lib/config.tsx
//--------------------------------------------------------------------
//Modulo de configuracion de la URL base de la API para la aplicacion 
//Detectar automaticamente la IP o si utiliza un .env
export const getBaseURL = () => {
    let baseUrl: string;
    let source: string; 
    //Si esta definido en el .env
    if(import.meta.env.VITE_API_URL) {
        baseUrl = import.meta.env.VITE_API_URL; //Ejemplo: http://api.example.com/api
        source = "Variable de entorno VITE_API_URL"; //Fuente del .env
    //Si no esta en el .env, intentar detectar la IP automaticamente
    } else if (typeof window !== "undefined") {
    //Intentar obtener la IP desde el localStorage (configurada manualmente por el usuario)
    const ip = localStorage.getItem("server_ip");
    //Si se encontro una IP en el localStorage
        if (ip) {
            baseUrl = `http://${ip}:8000/api`;
            source = `IP desde localStorage: ${ip}`;
        } else {
            //Fallback para entornos donde window no existe (SSR o build)
            baseUrl = `http://${window.location.hostname}:8000/api`;
            source = `IP local detectada desde PC: ${window.location.hostname}`;
        }
    }
    //Mostrar log solo en modo desarrollo
    else {
        baseUrl = "http://localhost:8000/api";
        source = "Fallback por defecto (localhost)";
    }
    //Log de la fuente utilizada
    if(import.meta.env.DEV) {
        console.log(`[API CONFIG] Usando base URL: ${baseUrl}`);
        console.log(`[API CONFIG] Fuente detectada: ${source}`);
    }
    //Retornar la URL base de la API
    return baseUrl;
};

export const API_URL = getBaseURL(); //Exportar la URL base de la API
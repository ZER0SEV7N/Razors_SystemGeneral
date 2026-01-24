//adminventasfrontend/src/context/AuthContext.tsx
//Modulo de contexto para la autenticación de usuarios en la aplicación AdminVentasFrontend
//Importaciones necesarias
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../lib/api'; // Asegúrate de tener un módulo api configurado para manejar las solicitudes HTTP
import type { User } from '../types/index'; // Asegúrate de tener un tipo User definido

//Definir que datos y funciones estaran disponibles para toda la aplicación
interface AuthContextType {
    user: User | null; // Información del usuario autenticado
    login: (token: string, userData: User) => void; //Función para iniciar sesión
    logout: () => void; //Función para cerrar sesión
    isAuthenticated: boolean; //Estado de autenticación
    isLoading: boolean; //Estado de carga
}

//Crear el contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//Componente proveedor del contexto de autenticación
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null); //Estado del usuario autenticado
    const [isLoading, setIsLoading] = useState<boolean>(true); //Estado de carga

    //Verificar la sesion guardada en el localhost al recargar la pagina
    useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem('token'); // Obtener el token del almacenamiento local
            const storedUser = localStorage.getItem('user'); // Obtener los datos del usuario del almacenamiento local

            if(token && storedUser) {
                try {
                    // Opcional: Podrías verificar con el backend si el token sigue vivo
                    // const res = await api.get('/me'); 
                    // setUser(res.data);
                    
                    // Por ahora confiamos en localStorage para rapidez
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    // Si el token no sirve, limpiamos todo
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setIsLoading(false);
        };
        checkSession();
    }, []);
    //Función Login: Guarda token y usuario
    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    //Función Logout: Limpia todo y avisa al backend
    const logout = async () => {
        try {
            await api.post('/logout'); //Avisar a Laravel para invalidar token
        } catch (error) {
            console.error("Error al cerrar sesión en servidor", error);
        } finally {
            //Limpieza local obligatoria
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            window.location.href = '/login'; //Redirección forzada
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            logout, 
            isAuthenticated: !!user,
            isLoading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// --- HOOK PERSONALIZADO (El que usas en tus componentes) ---
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }
    return context;
};
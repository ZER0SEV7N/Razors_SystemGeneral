//adminventasfrontend/src/context/AuthContext.tsx
//Modulo de contexto para la autenticación de usuarios en la aplicación AdminVentasFrontend
//Importaciones necesarias
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../lib/api'; // Asegúrate de tener un módulo api configurado para manejar las solicitudes HTTP
import type { Branch, User } from '../types/index'; // Asegúrate de tener un tipo User definido

//Definir que datos y funciones estaran disponibles para toda la aplicación
interface AuthContextType {
    user: User | null; // Información del usuario autenticado
    login: (token: string, userData: User, remember: boolean) => void; //Función para iniciar sesión
    logout: () => void; //Función para cerrar sesión
    currentBranch: Branch | null;
    isAuthenticated: boolean; //Estado de autenticación
    isLoading: boolean; //Estado de carga
}

//Crear el contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//Componente proveedor del contexto de autenticación
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null); //Estado del usuario autenticado
    const [isLoading, setIsLoading] = useState<boolean>(true); //Estado de carga
    //Nuevo estado derivado para fácil acceso
    const currentBranch = user?.branch || null;

    //Verificar la sesion guardada en el localhost al recargar la pagina
    useEffect(() => {
        const initAuth = async () => {
            //1. Buscamos token primero en localStorage (Persistente)
            let storedToken = localStorage.getItem("token");
            //2. Si no hay, buscamos en sessionStorage (Temporal)
            if (!storedToken) {
                storedToken = sessionStorage.getItem("token");
            }
            if (storedToken) {
                try {
                    //Llamamos al profile para obtener datos frescos (incluyendo branch)
                    const res = await api.get("/profile");
                    setUser(res.data);
                } catch (error) {
                    console.error("Sesión inválida", error);
                    //Si falla, limpiamos todo por seguridad
                    localStorage.clear();
                    sessionStorage.clear();
                    setUser(null);
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);


    //Función Login: Guarda token y usuario
    const login = (newToken: string, newUser: User, remember: boolean) => {
        //Lógica de "Mantener Sesión":
        if (remember) {
            //Persistente: Sobrevive al cerrar el navegador
            localStorage.setItem("token", newToken);
            localStorage.setItem("role", newUser.role); 
        } else {
            //Temporal: Muere al cerrar la pestaña/navegador
            sessionStorage.setItem("token", newToken);
            sessionStorage.setItem("role", newUser.role);
        }
        setUser(newUser);
    };

    //Función Logout: Limpia todo y avisa al backend
    const logout = async () => {
        try {
            await api.post('/logout'); //Avisar a Laravel para invalidar token
        } catch (error) {
            console.error("Error al cerrar sesión en servidor", error);
        } finally {
            //Limpieza local obligatoria
            localStorage.clear();
            sessionStorage.clear();
            setUser(null);
            window.location.href = '/login'; //Redirección forzada
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            currentBranch, 
            isAuthenticated: !!user, 
            isLoading, 
            login, 
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// --- HOOK PERSONALIZADO (El que usas en tus componentes) ---
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return context;
};
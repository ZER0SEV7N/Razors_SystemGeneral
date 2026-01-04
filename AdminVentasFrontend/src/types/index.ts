//adminVentasFrontend/src/types/index.ts
/*--------------------------------------------------------------------
    Tipos y interfaces globales para la aplicación AdminVentasFrontend
    - Principales funcionalidades:
        - Definición de tipos para productos, categorías y usuarios
        - Facilitar la tipificación en componentes y funciones
--------------------------------------------------------------------*/

//Interfaz para una categoría
export interface Category {
    category_id: number;
    name: string;
    description?: string;
    is_active: boolean;
}

//Interfaz para un usuario
export interface User {
    user_id: number;
    name: string;
    last_name: string;
    email: string;
}

//Interfaz para un producto
export interface Product {
    product_id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    min_stock: number;
    is_active: boolean;
    image?: string; //Campo opcional para la imagen del producto
    category_id: number;
    category?: Category; //Relación con categoría
    user?: User; //Relación con usuario
}

//Interfaz para Respuestas Paginadas (Laravel paginate)
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
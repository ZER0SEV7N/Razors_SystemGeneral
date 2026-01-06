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

//Interfaz para el carrito de compras
export interface CarItem extends Product {
    quantity: number; //Cantidad del producto en el carrito
    subtotal: number; //Subtotal calculado (price * quantity)
}


//Interfaz para Respuestas Paginadas (Laravel paginate)
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

//Interfaz para un cliente
export interface Client {
    client_id: number;
    name: string;
    document_type?: string;
    document_number?: string;
    email?: string;
    phone?: string;
    address?: string;
}

//Interfaz para el detalle de una venta
export interface SaleDetail {
    detail_id: number;
    sale_id: number;
    product_id: number;
    quantity: number;
    price: number;
    subtotal: number;
    // Relación con producto (para mostrar nombre en el historial)
    product?: Product; 
}

//Interfaz para una venta
export interface Sale {
    sale_id: number;
    user_id: number;
    client_id: number | null;
    sale_date: string; // Las fechas suelen venir como string ISO desde Laravel
    total: number;
    status: 'PENDIENTE' | 'PAGADO' | 'CANCELADO'; // Tipado estricto para estados
    // Relaciones
    user?: User;
    client?: Client;
    details: SaleDetail[];
}
/*--------------------------------------------------------------------
    Tipos y interfaces globales para la aplicación AdminVentasFrontend
--------------------------------------------------------------------*/

// Interfaz para las sedes (branches)
export interface Branch {
    branch_id: number;
    name: string;
    address: string;
    phone?: string;
    code: string;
    is_main: boolean;
    company_id: number;
}

// Interfaz para una categoría
export interface Category {
    category_id: number;
    name: string;
    description?: string;
    is_active: boolean;
    products_count?: number;
}

// Interfaz para un usuario
export interface User {
    user_id: number;
    name: string;
    last_name: string;
    // Roles actualizados según tu backend
    role: 'OWNER' | 'ADMIN' | 'VENDEDOR' | 'GERENTE'; 
    email: string;
    phone?: string;
    avatar?: string;
    branch_id?: number | null; // Nullable para OWNER
    branch?: Branch; // Relación con la sede
    is_active?: boolean;
}

// Interfaz para configuracion de compañia
export interface CompanySettings {
    name: string;
    address: string;
    phone: string;
    email?: string;
    ruc?: string;
    website?: string;
    logo_path?: string;
}

// Interfaz para un producto
export interface Product {
product_id: number;
    name: string;
    description?: string;
    price: number;
    image?: string;
    category_id: number;
    category?: Category;
    is_active: boolean;
    min_stock: number;
    
    stock: number; // Stock Central (Global)

    // NUEVO: Array de sucursales con su stock
    branches?: Array<{
        is_main: boolean;
        branch_id: number;
        name: string;
        pivot: {
            stock: number;
        }
    }>;
}

// NUEVO: Interfaz para Producto en Sucursal (Stock Local)
export interface BranchProduct extends Product {
    local_stock: number; // Stock específico de la sede
}

export interface CartItem extends Product {
    quantity: number;
    subtotal: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface Client {
    client_id: number;
    name: string;
    document_type?: string;
    document_number?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export interface SaleDetail {
    detail_id: number;
    sale_id: number;
    product_id: number;
    quantity: number;
    price: number;
    subtotal: number;
    product?: Product; 
}

export interface Sale {
    sale_id: number;
    user_id: number;
    branch_id: number;
    client_id: number | null;
    sale_date: string;
    total: number;
    status: 'PENDIENTE' | 'PAGADO' | 'CANCELADO';
    payment_method: string; 
    payment_reference?: string;
    user?: User;
    client?: Client;
    details: SaleDetail[];
    // Relación opcional para saber si ya tiene guía
    despath_guide?: DespathGuide; 
}

// NUEVO: Interfaz para Guía de Remisión
export interface DespathGuide {
    guide_id: number;
    sale_id: number;
    transfer_date: string;
    origin_address: string;
    destination_address: string;
    driver_name?: string;
    vehicle_plate?: string;
    status: string;
    sale?: Sale;
}

export interface DashboardStats {
    total_products: number;
    low_stock_count: number;
    total_categories: number;
    sales_today?: number;
    sales_month?: number;
    inventory_value?: number;
}
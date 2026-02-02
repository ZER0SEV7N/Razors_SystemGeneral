/*adminVentasFrontend/src/pages/products/ProductFilters.tsx
    Componente de filtros para la lista de productos
    - Principales funcionalidades:
        - Filtro por categoría
        - Filtro por rango de precio
        - Filtro por disponibilidad de stock
        - Botones para aplicar y limpiar filtros
        - Integración con la lista de productos para actualizar la vista según los filtros aplicados
        - Filtrado de activos/inactivos
--------------------------------------------------------------------*/
import { useState, useEffect } from "react"; //Importar useState y useEffect para manejar el estado y ciclo de vida del componente
import api from "../../lib/api"; //Importar la instancia de axios configurada para realizar solicitudes a la API
// import "../css/products.css"; // ELIMINADO: Usamos estilos globales
import type { Category } from "../../types"; //Importar la interfaz Category desde los tipos globales

//Definir la interfaz para las props del componente
interface FilterState {
    search: string;
    category_id: string;
    low_stock: boolean;
    show_inactive: boolean;
    price_min: string;
    price_max: string;
}

interface Props {
    filters: FilterState; //Estado actual de los filtros
    onChange: (newFilters: FilterState) => void; //Función para actualizar los filtros
}

const ProductFilters = ({ filters, onChange }: Props) => {
    const [categories, setCategories] = useState<Category[]>([]); //Estado para almacenar la lista de categorías

    //Usar useEffect para cargar las categorias al montar el componente
    useEffect(() => {
        //cargar categorias para el filtro
        api.get("/categories").then((res) => setCategories(res.data));
    }, []);

    //Funcion para manejar cambios en los campos de filtro
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === "checkbox" 
            ? (e.target as HTMLInputElement).checked 
            : value;

        onChange({
            ...filters,
            [name]: newValue,
        });
    };
    
    //Funcion para limpiar los filtros
    const handleClear = () => {
        onChange({
            search: "",
            category_id: "",
            low_stock: false,
            show_inactive: false,
            price_min: "",
            price_max: "",
        });
    };

    //Renderizar el componente de filtros
    return (
        <div style={{ 
            display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', 
            background: 'white', padding: '15px', borderRadius: 'var(--radius)', 
            boxShadow: 'var(--shadow-sm)', marginBottom: '20px', border: '1px solid var(--border)'
        }}>
            {/* Barra de filtros */}
            <div style={{ flex: '1 1 200px' }}>
                <input name="search" 
                    placeholder="Buscar..." 
                    value={filters.search} 
                    onChange={handleChange} 
                    className="input-field"
                />
            </div>
            {/* Filtro por categoría */}
            <div style={{ flex: '0 1 200px' }}>
                <select name="category_id" value={filters.category_id} onChange={handleChange} className="input-field">
                    <option value="">Todas las Categorias</option>
                    {categories.map((cat) =>(
                        <option key={cat.category_id} 
                            value={cat.category_id}
                            >{cat.name}
                        </option>
                    ))}
                </select>
            </div>
            {/* Filtro por rango de precio */}
            <div style={{display:'flex', gap:'10px'}}>
                <input type="number" 
                    name="price_min" 
                    placeholder="Min S/." 
                    value={filters.price_min} 
                    onChange={handleChange} 
                    className="input-field" 
                    style={{width:'80px'}}
                />
                <input type="number" 
                    name="price_max" 
                    placeholder="Max S/." 
                    value={filters.price_max} 
                    onChange={handleChange} 
                    className="input-field" 
                    style={{width:'80px'}}
                /> 
            </div>
            {/* Filtro por checks */}
            <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input type="checkbox" name="low_stock" checked={filters.low_stock} onChange={handleChange} /> 
                    ⚠️ Bajo Stock
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input type="checkbox" name="show_inactive" checked={filters.show_inactive} onChange={handleChange} /> 
                    👁️ Mostrar Inactivos
                </label>
            </div>
            {/* Botones para limpiar filtros */}
            <div>
                <button onClick={handleClear} className="btn-secondary" style={{ padding: '8px 15px' }}>
                    Limpiar Filtros
                </button>
            </div>
        </div>
    );
};
export default ProductFilters; //Exportar el componente ProductFilters
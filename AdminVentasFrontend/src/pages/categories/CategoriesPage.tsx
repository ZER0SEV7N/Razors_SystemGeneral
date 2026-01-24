//adminventasfrontend/src/pages/categories/CategoriesPage.tsx
//--------------------------------------------------------------------
// Página para gestionar categorías de productos
// - Funcionalidades principales:
//     - Listar categorías existentes
//     - Botón para abrir el formulario de creación/edición
//     - Integración con CategoriesForm para crear/editar categorías
//     - LLamar a los filtros de productos al cambiar categoría
//     - Uso de modal para mostrar el formulario
//--------------------------------------------------------------------
import { useState, useEffect } from "react"; //Importar useState y useEffect para manejar el estado y ciclo de vida del componente
import { useNavigate } from "react-router-dom"; //Importar useNavigate para la navegación programática
import api from "../../lib/api"; //Importar la instancia de axios configurada para realizar solicitudes a la API
import type { Category } from "../../types"; //Importar la interfaz Category desde los tipos globales
import CategoriesForm from "./CategoriesForm"; //Componente del formulario de categorías
import Modal from "../../components/ui/ModalExample"; //Componente modal reutilizable
import "../css/categories.css"; //Importar estilo especifico para categorías
import { Edit, Trash2, PackageSearch, Plus } from "lucide-react"; //Importar iconos desde lucide-react

//Funcion componente para la página de categorías
const CategoriesPage = () => {
    const navigate = useNavigate(); //Hook para la navegación programática
    const [categories, setCategories] = useState<Category[]>([]); //Estado para almacenar la lista de categorías
    const [showModal, setShowModal] = useState(false); //Estado para mostrar/ocultar el modal
    const [loading, setLoading] = useState(false); //Estado para evitar doble click
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined); //Estado para la categoría a editar

    //Funcionalidad useEffect para cargar las categorías al montar el componente
    useEffect(() => {
        fetchCategories();
    }, []);

    //Función para obtener las categorías desde la API
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get("/categories");
            setCategories(res.data);
        } catch (error) {
            console.error("Error al cargar categorías:", error);
        } finally {
            setLoading(false);
        }
    };

    //Función para manejar la apertura del modal de creación
    const handleOpenCreate = () => {
        setEditingCategory(undefined); //Limpiar categoría a editar
        setShowModal(true); //Mostrar el modal
    };

    //Función para manejar la apertura del modal de edición
    const handleOpenEdit = (category: Category) => {
        setEditingCategory(category); //Establecer la categoría a editar
        setShowModal(true); //Mostrar el modal
    };

    //Función para manejar la eliminación de una categoría
    const handleDelete = async (category: Category) => {
        //Si el backend nos envió el conteo, lo usamos para bloquear.
        if (category.products_count && category.products_count > 0) {
            alert(`⛔ No puedes eliminar la categoría "${category.name}" porque tiene ${category.products_count} producto(s) asociado(s).\n\nPrimero elimina o mueve los productos.`);
            return; 
        }

        // 2. Confirmación normal
        if (!window.confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) return;

        try {
            await api.delete(`/categories/${category.category_id}`);
            //Actualizamos la lista visualmente
            setCategories(prev => prev.filter(c => c.category_id !== category.category_id));
        } catch (error) {
            console.error("Error al eliminar:", error);
            //Si el frontend falló en detectar (ej: conteo desactualizado), el backend rechazará por Foreign Key
            alert("Error: No se pudo eliminar la categoría. Verifique que no tenga productos asociados.");
        }
    };

    //Navegar a productos filtrados
    const goToInventory = (categoryId: number) => {
        navigate(`/products?category_id=${categoryId}`);
    };

    //Renderizado del componente
    return (
        <div className="categories-page">
            {/* Cabecera con Botón de Crear */}
            <header className="categories-header">
                <h2>Gestión de Categorías</h2>
                <button className="btn-primary" onClick={handleOpenCreate}>
                    <Plus size={18} /> Nueva Categoría
                </button>
            </header>

            {/* Tabla */}
            {loading ? <p style={{textAlign:'center', padding: 20}}>Cargando...</p> : (
                <div className="categories-table-container">
                    <table className="categories-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th style={{textAlign: 'center'}}>Inventario</th>
                                <th style={{textAlign: 'right'}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.category_id}>
                                    <td style={{fontWeight: 'bold', color: '#1e293b'}}>
                                        {cat.name}
                                    </td>
                                    <td style={{color: '#64748b'}}>
                                        {cat.description || '-'}
                                    </td>
                                    
                                    {/* Botón Mágico: Ver Productos */}
                                    <td style={{textAlign: 'center'}}>
                                        <button 
                                            className="btn-view-products" 
                                            onClick={() => goToInventory(cat.category_id)}
                                        >
                                            <PackageSearch size={16} /> Ver Productos
                                        </button>
                                    </td>

                                    {/* Botones de Acción */}
                                    <td style={{textAlign: 'right'}}>
                                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '8px'}}>
                                            <button 
                                                className="btn-icon" 
                                                onClick={() => handleOpenEdit(cat)}
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                className="btn-icon" 
                                                onClick={() => handleDelete(cat)}
                                                title={cat.products_count && cat.products_count > 0 ? "No se puede eliminar (tiene productos)" : "Eliminar"}
                                                style={{
                                                    color: cat.products_count && cat.products_count > 0 ? '#cbd5e1' : 'var(--danger)',
                                                    cursor: cat.products_count && cat.products_count > 0 ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{textAlign:'center', padding: 20, color: '#94a3b8'}}>
                                        No hay categorías registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- AQUÍ ESTÁ EL MODAL --- */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            >
                <CategoriesForm 
                    category={editingCategory}
                    onSuccess={() => { 
                        setShowModal(false); // Cerramos el modal
                        fetchCategories();   // Recargamos la tabla
                    }}
                    onCancel={() => setShowModal(false)}
                />
            </Modal>
        </div>
    );
};

export default CategoriesPage; //Exportar el componente CategoriesPage
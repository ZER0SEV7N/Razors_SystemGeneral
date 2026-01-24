//adminVentasFrontend/src/components/ui/CategoriesForm.tsx
/*--------------------------------------------------------------------
    Componente de formulario para crear nuevas categorías
    - Principales funcionalidades:
        - Campos para nombre y descripción
        - Validación de campos
        - Integración con API para crear nuevas categorías
--------------------------------------------------------------------*/
import { useState, useEffect } from "react"; //Importar useState para manejar el estado 
import api from "../../lib/api"; //Impor,tar la instancia de axios configurada para realizar solicitudes a la API
import type { Category } from "../../types"; //Importar la interfaz Category desde los tipos globales

//Definir la interfaz para las props del componente
interface Props {
    category?: Category; //Categoría a editar (opcional)
    onCancel: () => void; //Función para cerrar el formulario
    onSuccess: () => void; //Función para notificar que recargue la lista tras crear/editar
}

//Funcion componente para el formulario de categorías
const CategoriesForm = ({ onCancel, onSuccess, category }: Props) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    
    //UseEffect para cargar los datos de la categoría a editar, si existe
    useEffect(() => {
        //Si hay una categoría para editar, cargar sus datos en el formulario
        if (category) {
            setName(category.name);
            setDescription(category.description || "");
        } else {
            //Si no hay categoría, limpiar el formulario
            setName("");
            setDescription("");
        }
    }, [category]);

    //Función para manejar el envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); //Prevenir el comportamiento por defecto del formulario

        //Validar que el nombre no esté vacío
        if(!name.trim()) {
            alert("El nombre es obligatorio");
            return;
        }

        setLoading(true); //Indicar que se está cargando
        //Subir los datos a la API
        try {
            const payload = { name, description };
            if(category) {
                //Modo de EDICION
                await api.put(`/categories/${category.category_id}`, payload);
            } else {
                //Modo de CREACION
                await api.post("/categories", payload);
            }
            onSuccess(); //Notificar que se creó/actualizó la categoría
        } catch (error) {
            console.error("Error al guardar la categoría:", error);
            alert("Error al guardar la categoría");
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="product-form"> 
            {/* Título del formulario, cambia según si es creación o edición */}
            <h2>{category ? "Editar Categoría" : "Crear Nueva Categoría"}</h2>
            <div className="form-group">
                <label>Nombre</label>
                <input 
                    className="input-field" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Ej: Accesorios, Cuidado Personal..."
                    autoFocus
                />
            </div>
            {/* Campo para la descripción de la categoría */}
            <div className="form-group">
                <label>Descripción (Opcional)</label>
                <textarea 
                    className="input-field" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Breve descripción..."
                    rows={3}
                />
            </div>
            {/* Botones de cancelar y guardar */}
            <div className="modal-footer">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="btn-secondary" 
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={loading}
                >
                    {loading ? "Guardando..." : (category ? "Actualizar" : "Crear Categoría")}
                </button>
            </div>
        </form>
    );

};
export default CategoriesForm; //Exportar el componente CategoriesForm
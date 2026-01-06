//adminVentasFrontend/src/components/ui/CategoriesModal.tsx
/*--------------------------------------------------------------------
    Componente de modal para crear nuevas categorías
    - Principales funcionalidades:
        - Campos para nombre y descripción
        - Validación de campos
        - Integración con API para crear nuevas categorías
--------------------------------------------------------------------*/
import { useState } from "react"; //Importar useState para manejar el estado 
import api from "../../lib/api"; //Importar la instancia de axios configurada para realizar solicitudes a la API
import Modal from "./ModalExample";
import "../css/categories.css"; // <--- Importamos el CSS nuevo

//Definir la interfaz para las props del componente
interface Props {
    onClose: () => void; //Función para cerrar el modal
    onCreated: () => void; //Función para notificar que se creó una nueva categoría
}

//Funcion componente para el modal de categorías
const CategoriesModal = ({ onClose, onCreated }: Props) => {
    const [loading, setLoading] = useState(false); // Estado para evitar doble click
    const [form, setForm] = useState({ 
        name: "",
        description: "",
    }); //Estado para los campos del formulario
    
    //Funcion para subir el formulario
    const submitForm = async () => {
        if(!form.name){
            alert("El nombre es obligatorio"); //Validar que el nombre no esté vacío
            return;
        }
        setLoading(true); 
        try{
            await api.post("/categories", form); //Enviar la solicitud para crear la categoría
            onCreated(); //Notificar que se creó una nueva categoría
            onClose(); //Cerrar el modal
        }catch(error){
            console.error("Error al crear la categoría:", error);
            alert("Error al crear la categoría"); //Mostrar un mensaje de error
        }finally{
            setLoading(false);
        }

    };

    return(
        <Modal isOpen={true} onClose={onClose} title="Nueva Categoría">
            <div className="category-form-content">
                
                <label>Nombre de la Categoría:</label>
                <input
                    placeholder="Ej: Bebidas, Limpieza..."
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    autoFocus
                />

                <label>Descripción (Opcional):</label>
                <textarea
                    placeholder="¿Qué tipo de productos incluye?"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3}
                />

                {/* Botones con clases CSS */}
                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="btn-save" onClick={submitForm} disabled={loading}>
                        {loading ? "Guardando..." : "Guardar Categoría"}
                    </button>
                </div>

            </div>
        </Modal>
    );
};

export default CategoriesModal; //Exportar el componente CategoriesModal

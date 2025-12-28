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
import "../css/Modal.css"; //Importar estilos CSS para el modal

//Definir la interfaz para las props del componente
interface Props {
    onClose: () => void; //Función para cerrar el modal
    onCreated: () => void; //Función para notificar que se creó una nueva categoría
}

//Funcion componente para el modal de categorías
const CategoriesModal = ({ onClose, onCreated }: Props) => {
    const [form, setForm] = useState({
        name: "",
        description: "",
        is_active: true,
    });
    
    //Funcion para subir el formulario
    const submitForm = async () => {
        if(!form.name){
            alert("El nombre es obligatorio"); //Validar que el nombre no esté vacío
            return;
        } 
        try{
            await api.post("/categories", form); //Enviar la solicitud para crear la categoría
            onCreated(); //Notificar que se creó una nueva categoría
            onClose(); //Cerrar el modal
        }catch(error){
            console.error("Error al crear la categoría:", error);
            alert("Error al crear la categoría"); //Mostrar un mensaje de error
        }

    };

    return(
        <div className="modal-backdrop">
            <div className="modal">
                <h3>Nueva Categoria de Producto</h3>
                <input
                    placeholder="Nombre de la categoria"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value})}
                    />
                <textarea
                    placeholder="Descripción"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value})}
                    />
                <label>
                    <input type="checkbox"
                    checked={form.is_active}
                    onChange={() => setForm({ ...form, is_active: !form.is_active })}
                    />
                </label>
                <div className="modal-actions">
                    <button onClick={onClose}>Cancelar</button>
                    <button className="btn-secondary" onClick={submitForm}>Crear Categoria</button>
                </div>
            </div>
        </div>
    );
};

export default CategoriesModal; //Exportar el componente CategoriesModal

//adminventasfrontend/src/pages/users/UserPage.tsx
//------------------------------------------------------------
//Modulo principal para la gestion de usuarios
//   - Funcionalidades:
//       - Visualización de lista de usuarios
//       - Edición y eliminación de usuarios
//       - Creación de nuevos usuarios
//       - Asignación de roles y sedes
//       - Integración con la API para operaciones CRUD
//------------------------------------------------------------
import { useEffect, useState } from 'react';
import type { User } from '../../types';
import api from '../../lib/api';
import "../css/user.css";
import Modal from '../../components/ui/ModalExample';

//Componente principal para la página de usuarios
const UserPage = () => {
    const [user, setUser] = useState<User[]>([]); //Estado para almacenar la lista de usuarios
    const [loading, setLoading] = useState(true); //Estado para manejar la carga de datos
    const [isModalOpen, setIsModalOpen] = useState(false); //Estado para manejar la visibilidad del modal

    //Estado para almacenar el usuario seleccionado para edición
    const [formData, setFormData] = useState({
        name: "",
        last_name: "",
        email: "",
        password: "",
        role: "VENDEDOR",
        branch_id: 1 //Sucursal principal por defecto
    });

    //Función para obtener la lista de usuarios desde la API
    const fetchUsers = async () => {
        //Llamada a la API para obtener usuarios
        try {
            const res = await api.get("/users");
            setUser(res.data.data || res.data); //Actualizar el estado con los datos recibidos
        }catch (error){
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    } 
    
    //Efecto para cargar los usuarios al montar el componente
    useEffect(() => {
        fetchUsers();
    }, []); //Solo se ejecuta una vez al montar

    
}
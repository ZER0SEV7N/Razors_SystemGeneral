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
import { useEffect, useState, type FormEvent } from 'react';
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

    //Manejadores de evento para el formulario y modal
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Crear Nuevo Usuario
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/users", formData);
            alert("✅ Usuario creado correctamente");
            
            // Cerrar modal y limpiar formulario
            setIsModalOpen(false);
            setFormData({
                name: "",
                last_name: "",
                email: "",
                password: "",
                role: "", 
                branch_id: (Number(localStorage.getItem("branchId"))),
            });
            
            // Recargar lista
            fetchUsers();
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || "Error al crear usuario";
            alert("❌ " + msg);
        }
    };

    // Eliminar Usuario
    const handleDelete = async (id: number) => {
        if (!confirm("⚠️ ¿Estás seguro de desactivar este usuario?")) return;
        
        try {
            await api.delete(`/users/${id}`);
            alert("Usuario desactivado");
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Error al eliminar usuario");
        }
    };
// 4. Renderizado
    return (
        <div className="user-page-container">
            {/* Cabecera */}
            <div className="page-header">
                <h2>👥 Gestión de Usuarios</h2>
                <button 
                    className="btn-primary" 
                    onClick={() => setIsModalOpen(true)}
                >
                    + Nuevo Usuario
                </button>
            </div>

            {/* Tabla de Usuarios */}
            <div className="table-container">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Sede</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center">Cargando...</td></tr>
                        ) : user.length === 0 ? (
                            <tr><td colSpan={5} className="text-center">No hay usuarios registrados</td></tr>
                        ) : (
                            user.map((user) => (
                                <tr key={user.user_id}>
                                    <td>
                                        <strong>{user.name} {user.last_name}</strong>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>#{user.branch_id ?? 'N/A'}</td>
                                    <td className="text-center">
                                        <button 
                                            onClick={() => handleDelete(user.user_id)}
                                            className="btn-icon btn-danger"
                                            title="Desactivar Usuario"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 5. INTEGRACIÓN DE TU COMPONENTE MODAL */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Registrar Nuevo Usuario"
            >
                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group">
                        <label>Nombre:</label>
                        <input 
                            name="name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            required 
                            className="input-field"
                        />
                    </div>

                    <div className="form-group">
                        <label>Apellido:</label>
                        <input 
                            name="last_name" 
                            value={formData.last_name} 
                            onChange={handleInputChange} 
                            required 
                            className="input-field"
                        />
                    </div>

                    <div className="form-group">
                        <label>Email:</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            required 
                            className="input-field"
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña:</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleInputChange} 
                            required 
                            className="input-field"
                        />
                    </div>

                    <div className="form-group">
                        <label>Rol:</label>
                        <select 
                            name="role" 
                            value={formData.role} 
                            onChange={handleInputChange} 
                            className="input-field"
                        >
                            <option value="VENDEDOR">Vendedor (Cajero)</option>
                            <option value="GERENTE">Gerente</option>
                            <option value="ADMIN">Administrador</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Sucursal (ID):</label>
                        <input 
                            type="number" 
                            name="branch_id" 
                            value={formData.branch_id} 
                            onChange={handleInputChange} 
                            className="input-field"
                        />
                    </div>

                    <div className="form-actions" style={{gridColumn: '1 / -1', marginTop: '15px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            Guardar Usuario
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UserPage;
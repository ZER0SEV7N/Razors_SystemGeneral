import { useEffect, useState } from "react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../types";
import Modal from "../../components/ui/ModalExample"; // Asegúrate de tener tu componente Modal genérico
import UserForm from "./UserForm"; // Importamos el formulario que me pasaste

const UserPage = () => {
    const { user: currentUser } = useAuth();
    const isOwner = currentUser?.role === 'OWNER';

    // Estados
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

    // Cargar usuarios al montar
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // El backend ya filtra: Si eres Owner trae todos, si eres Admin trae los de tu sede
            const res = await api.get("/users");
            setUsers(res.data);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        } finally {
            setLoading(false);
        }
    };

    // Manejadores
    const handleCreate = () => {
        setEditingUser(undefined); // Modo creación
        setShowModal(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user); // Modo edición
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) return;

        try {
            await api.delete(`/users/${id}`);
            alert("Usuario eliminado");
            fetchUsers(); // Recargar lista
        } catch (error: any) {
            alert("Error al eliminar: " + (error.response?.data?.message || "Error desconocido"));
        }
    };

    const handleSuccess = () => {
        setShowModal(false);
        fetchUsers(); // Recargar tabla para ver los cambios
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h2>👥 Gestión de Usuarios</h2>
                    <p className="text-muted">Administra el personal y sus accesos</p>
                </div>
                <button className="btn-primary" onClick={handleCreate}>
                    + Nuevo Usuario
                </button>
            </header>

            {loading ? (
                <div className="text-center p-4">Cargando usuarios...</div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Sucursal</th>
                                <th>Teléfono</th>
                                <th style={{ textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center">No hay usuarios registrados.</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.user_id}>
                                        {/* Nombre completo */}
                                        <td style={{ fontWeight: 500 }}>
                                            {user.name} {user.last_name}
                                        </td>
                                        
                                        {/* Email */}
                                        <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                                        
                                        {/* Rol (Badge) */}
                                        <td>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                backgroundColor: 
                                                    user.role === 'OWNER' ? '#purple' : 
                                                    user.role === 'ADMIN' ? '#blue' : '#green',
                                                color: 'white' // Ajusta según tu paleta
                                            }} className={`badge-${user.role.toLowerCase()}`}>
                                                {user.role}
                                            </span>
                                        </td>

                                        {/* Sucursal */}
                                        <td>
                                            {user.branch ? (
                                                <span>🏪 {user.branch.name}</span>
                                            ) : (
                                                <span className="text-muted">Global / Sin Asignar</span>
                                            )}
                                        </td>

                                        {/* Teléfono */}
                                        <td>{user.phone || '-'}</td>

                                        {/* Acciones */}
                                        <td className="text-center">
                                            {/* Evitar que uno se borre a sí mismo */}
                                            {user.user_id !== currentUser?.user_id && (
                                                <div className="action-buttons">
                                                    <button 
                                                        onClick={() => handleEdit(user)} 
                                                        className="btn-icon" 
                                                        title="Editar"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(user.user_id)} 
                                                        className="btn-icon btn-danger" 
                                                        title="Eliminar"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            )}
                                            {user.user_id === currentUser?.user_id && (
                                                <small className="text-muted">(Tú)</small>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL PARA CREAR/EDITAR */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingUser ? `Editar Usuario: ${editingUser.name}` : "Registrar Nuevo Usuario"}
            >
                <UserForm
                    userToEdit={editingUser}
                    onSuccess={handleSuccess}
                    onCancel={() => setShowModal(false)}
                />
            </Modal>
        </div>
    );
};

export default UserPage;
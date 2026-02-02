//adminVentasFrontend/src/pages/users/UserPage.tsx
//--------------------------------------------------------------------
//Pagina principal para gestion de usuarios
// - Principales funcionalidades:
//     - Listado de usuarios
//     - Creacion, edicion y eliminacion de usuarios
//--------------------------------------------------------------------
import { useState, useEffect, type FormEvent } from "react"; //Importar useState y useEffect para manejar el estado y ciclo de vida del componente
import api from "../../lib/api"; //Importar la instancia de axios configurada para realizar solicitudes a la API
import { useAuth } from "../../context/AuthContext"; //Importar el contexto de autenticacion
import type { User, Branch } from "../../types"; //importar la interfaz User desde los tipos globales

interface Props {
    userToEdit?: User;
    onSuccess: () => void;
    onCancel: () => void;
}

const UserForm = ({ userToEdit, onSuccess, onCancel }: Props) => {
    const { user: currentUser } = useAuth();
    const isOwner = currentUser?.role === 'OWNER';

    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState<Branch[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        last_name: "",
        email: "",
        password: "", // Opcional en edit
        phone: "",
        role: "VENDEDOR", // Por defecto
        branch_id: ""
    });

    // Cargar datos iniciales
    useEffect(() => {
        // Si es Owner, cargamos las sucursales para el select
        if (isOwner) {
            api.get("/branches").then(res => setBranches(res.data));
        }

        if (userToEdit) {
            setFormData({
                name: userToEdit.name,
                last_name: userToEdit.last_name,
                email: userToEdit.email,
                password: "", // Dejar vacío para no cambiar
                phone: userToEdit.phone || "",
                role: userToEdit.role,
                branch_id: userToEdit.branch_id?.toString() || ""
            });
        }
    }, [userToEdit, isOwner]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Limpiamos datos vacíos (como password si no se cambia)
            const payload: any = { ...formData };
            if (!payload.password) delete payload.password;
            
            // Si NO es Owner, eliminamos branch_id del payload (el backend lo pone solo)
            if (!isOwner) delete payload.branch_id;

            if (userToEdit) {
                await api.put(`/users/${userToEdit.user_id}`, payload);
                alert("✅ Usuario actualizado");
            } else {
                await api.post("/users", payload);
                alert("✅ Usuario creado exitosamente");
            }
            onSuccess();
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || "Error al guardar";
            alert("❌ " + msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="user-form">
            <div className="form-row" style={{display: 'flex', gap: 10}}>
                <div className="form-group" style={{flex: 1}}>
                    <label>Nombre:</label>
                    <input 
                        required className="input-field" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div className="form-group" style={{flex: 1}}>
                    <label>Apellido:</label>
                    <input 
                        required className="input-field" 
                        value={formData.last_name}
                        onChange={e => setFormData({...formData, last_name: e.target.value})}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Email:</label>
                <input 
                    type="email" required className="input-field" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                />
            </div>

            <div className="form-group">
                <label>Contraseña {userToEdit && <small>(Dejar en blanco para mantener)</small>}:</label>
                <input 
                    type="password" 
                    className="input-field" 
                    minLength={6}
                    required={!userToEdit} // Obligatorio solo al crear
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder={userToEdit ? "••••••" : ""}
                />
            </div>

            <div className="form-row" style={{display: 'flex', gap: 10}}>
                {/* SELECT DE ROL */}
                <div className="form-group" style={{flex: 1}}>
                    <label>Rol:</label>
                    <select 
                        className="input-field"
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value})}
                    >
                        {/* El Admin solo puede crear Vendedores (o Gerentes si quisieras) */}
                        <option value="VENDEDOR">Vendedor</option>
                        {isOwner && (
                            <>
                                <option value="ADMIN">Administrador de Sede</option>
                                <option value="GERENTE">Gerente</option>
                                {/* Owner no debería crear otro Owner usualmente, pero se puede */}
                            </>
                        )}
                    </select>
                </div>

                {/* SELECT DE SUCURSAL (SOLO OWNER) */}
                {isOwner && (
                    <div className="form-group" style={{flex: 1}}>
                        <label>Sucursal:</label>
                        <select 
                            className="input-field"
                            value={formData.branch_id}
                            // Si es OWNER creando ADMIN/VENDEDOR, branch es obligatoria
                            required={formData.role !== 'OWNER'} 
                            onChange={e => setFormData({...formData, branch_id: e.target.value})}
                            disabled={formData.role === 'OWNER'} // Owner no tiene sucursal fija
                        >
                            <option value="">-- Seleccionar --</option>
                            {branches.map(b => (
                                <option key={b.branch_id} value={b.branch_id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="modal-actions">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? "Guardando..." : "Guardar Usuario"}
                </button>
            </div>
        </form>
    );
};

export default UserForm;
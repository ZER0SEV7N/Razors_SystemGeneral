//adminVentasFrontend/src/pages/settings/profileTab.tsx
/*--------------------------------------------------------------------
    Pestaña de Perfil de Usuario
    - Principales funcionalidades:
        - Mostrar y actualizar la información del perfil del usuario
        - Integración con la API para obtener y guardar datos
--------------------------------------------------------------------*/
import { useState, useEffect } from "react";
import api from "../../lib/api";
import { API_URL } from "../../lib/config";

//==========================================
// SUB-COMPONENTE: MI PERFIL
//==========================================
//Interfaz de Props
interface Props {
    user: any;
}

//Componente de la pestaña de perfil
const ProfileTab = ({ user }: Props) => {
    //Estados para el formulario
    const [form, setForm] = useState({ name: "", last_name: "", email: "", password: "" });
    const [avatar, setAvatar] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if(user) {
            setForm({ ...form, name: user.name, last_name: user.last_name, email: user.email });
            if (user.avatar) setPreview(`${API_URL.replace('/api', '')}/storage/${user.avatar}`);
        }
    }, [user]);

    //Manejar cambios en el formulario
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", form.name); //Agregar nombre
        formData.append("last_name", form.last_name); //Agregar apellido
        formData.append("email", form.email); //Agregar email
        if (form.password) formData.append("password", form.password); //Agregar contraseña solo si se modificó
        if (avatar) formData.append("avatar", avatar); //Agregar avatar si se seleccionó
        formData.append("_method", "PUT"); // Para compatibilidad con Laravel
        //Enviar datos a la API
        try {
            const res = await api.post(`/profile`, formData); //Usar endpoint de perfil
            localStorage.setItem("user", JSON.stringify(res.data)); //Actualizar usuario en localStorage
            alert("Perfil actualizado con éxito.");
        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            alert("Error al actualizar el perfil.");
        }
    };
    //Renderizar formulario
    return (
        <form onSubmit={handleSave} style={{ maxWidth: '600px', background: 'white', padding: '24px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-main)' }}>Mi Información</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: '#f1f5f9', border: '2px solid var(--border)' }}>
                    {preview ? <img src={preview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:'2rem' }}>👤</span>}
                </div>
                <div>
                    <label className="btn-secondary" style={{ display: 'inline-block', cursor: 'pointer' }}>
                        📷 Cambiar Foto
                        <input type="file" hidden accept="image/*" onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setAvatar(e.target.files[0]);
                                setPreview(URL.createObjectURL(e.target.files[0]));
                            }
                        }} />
                    </label>
                </div>
            </div>

            <div className="form-group">
                <label>Nombre Completo</label>
                <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
                <label>Email</label>
                <input className="input-field" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="form-group">
                <label>Nueva Contraseña (Opcional)</label>
                <input className="input-field" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="********" />
            </div>

            <div style={{ textAlign: 'right', marginTop: '20px' }}>
                <button type="submit" className="btn-primary">💾 Guardar Cambios</button>
            </div>
        </form>
    );
}

export default ProfileTab;

import { useState, useEffect } from "react";
import api from "../../../lib/api";
import { API_URL } from "../../../lib/config";
import { Camera, Save } from "lucide-react";

interface Props {
    user: any;
}

const ProfileTab = ({ user }: Props) => {
    const [form, setForm] = useState({ name: "", last_name: "", email: "", password: "" });
    const [avatar, setAvatar] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(user) {
            setForm({ 
                name: user.name || "", 
                last_name: user.last_name || "", 
                email: user.email || "",
                password: ""
            });
            if (user.avatar) setPreview(`${API_URL.replace('/api', '')}/storage/${user.avatar}`);
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("last_name", form.last_name);
        formData.append("email", form.email);
        if (form.password) formData.append("password", form.password);
        if (avatar) formData.append("avatar", avatar);
        formData.append("_method", "PUT"); 

        try {
            const res = await api.post(`/profile`, formData);
            // Actualizar localStorage sin borrar el token
            const oldUser = JSON.parse(localStorage.getItem("user") || '{}');
            localStorage.setItem("user", JSON.stringify({ ...oldUser, ...res.data }));
            
            alert("✅ Perfil actualizado con éxito.");
            window.location.reload(); // Recargar para ver cambios (foto header)
        } catch (error) {
            console.error(error);
            alert("❌ Error al actualizar el perfil.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} style={{maxWidth: '600px'}}>
            <h3 className="settings-section-title">Mi Información Personal</h3>
            
            {/* Sección Avatar (Reutilizando estilos de CompanyTab para consistencia) */}
            <div className="logo-upload-area">
                <div className="logo-preview" style={{borderRadius: '50%'}}>
                    {preview ? (
                        <img src={preview} alt="Avatar" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                    ) : (
                        <span style={{fontSize:'2rem'}}>👤</span>
                    )}
                </div>
                <div>
                    <label className="btn-secondary" style={{display: 'inline-flex', alignItems: 'center', cursor: 'pointer'}}>
                        <Camera size={16} style={{marginRight:8}}/> 
                        Cambiar Foto
                        <input type="file" hidden accept="image/*" onChange={(e) => {
                            if (e.target.files?.[0]) {
                                setAvatar(e.target.files[0]);
                                setPreview(URL.createObjectURL(e.target.files[0]));
                            }
                        }} />
                    </label>
                    <small style={{display:'block', color:'var(--secondary)', marginTop: 8}}>JPG, PNG (Máx 2MB)</small>
                </div>
            </div>

            <div className="form-group">
                <label>Nombre Completo</label>
                <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            
            <div className="form-group">
                <label>Correo Electrónico</label>
                <input className="input-field" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>

            <div className="form-group">
                <label>Nueva Contraseña (Opcional)</label>
                <input className="input-field" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Dejar en blanco para mantener la actual" />
            </div>

            <div className="modal-footer" style={{background: 'transparent', borderTop: 'none', padding: 0, marginTop: 30}}>
                <button type="submit" className="btn-primary" disabled={loading}>
                    <Save size={18} /> {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
            </div>
        </form>
    );
}

export default ProfileTab;
import { useState, useEffect } from "react";
import api from "../../../lib/api";
import { API_URL } from "../../../lib/config"; 
import { Upload, Save } from "lucide-react";

const CompanyTab = () => {
    const [loading, setLoading] = useState(false);
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "", ruc: "", address: "", phone: "", email: "", website: ""
    });

    useEffect(() => {
        fetchCompany();
    }, []);

    const fetchCompany = async () => {
        try {
            const res = await api.get("/company");
            const data = res.data;
            if(data) {
                setForm({ 
                    name: data.name || "", ruc: data.ruc || "", address: data.address || "",
                    phone: data.phone || "", email: data.email || "", website: data.website || ""
                });
                if (data.logo_path) {
                    const baseUrl = API_URL.replace('/api', '');
                    setLogoPreview(`${baseUrl}/storage/${data.logo_path}`);
                }
            }
        } catch (error) {
            console.error("Error cargando empresa", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => formData.append(key, value));
        if (logo) formData.append("logo", logo);
        formData.append("_method", "PUT");

        try {
            await api.post('/company', formData); 
            alert("✅ Datos de la empresa actualizados.");
        } catch (error) {
            alert("❌ Error al guardar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3 className="settings-section-title">Datos de la Empresa</h3>
            
            <div className="logo-upload-area">
                <div className="logo-preview">
                    {logoPreview ? <img src={logoPreview} alt="Logo" /> : <span style={{fontSize:'2rem'}}>🏢</span>}
                </div>
                <div>
                    <label className="btn-secondary" style={{display: 'inline-flex', alignItems: 'center', cursor: 'pointer'}}>
                        <Upload size={16} style={{marginRight:8}}/> 
                        {logo ? "Cambiar Archivo" : "Subir Logo"}
                        <input type="file" hidden accept="image/*" onChange={(e) => {
                            if(e.target.files?.[0]) {
                                setLogo(e.target.files[0]);
                                setLogoPreview(URL.createObjectURL(e.target.files[0]));
                            }
                        }} />
                    </label>
                    <small style={{display:'block', color:'var(--secondary)', marginTop: 8}}>Recomendado: PNG fondo transparente.</small>
                </div>
            </div>

            {/* Grid usando form-row de ui.css */}
            <div className="form-row">
                <div className="form-group">
                    <label>Razón Social</label>
                    <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                    <label>RUC</label>
                    <input className="input-field" value={form.ruc} onChange={e => setForm({...form, ruc: e.target.value})} maxLength={11} />
                </div>
            </div>

            <div className="form-group">
                <label>Dirección Fiscal</label>
                <input className="input-field" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Teléfono</label>
                    <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="form-group">
                    <label>Email Contacto</label>
                    <input className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
            </div>

            <div className="modal-footer" style={{background: 'transparent', borderTop: 'none', padding: 0, marginTop: 30}}>
                <button type="submit" className="btn-primary" disabled={loading}>
                    <Save size={18} /> {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
            </div>
        </form>
    );
};
export default CompanyTab;
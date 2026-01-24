//AdminVentasFrontend/src/pages/settings/tabs/CompanyTab.tsx
/*--------------------------------------------------------------------
    Componente de pestañas para la configuración de la empresa
    - Principales funcionalidades:
        - Pestañas para diferentes secciones de configuración
        - Formularios para editar información de la empresa
        - Cargar fotos y logos de la empresa
--------------------------------------------------------------------*/
import { useState, useEffect } from "react";
import api from "../../../lib/api";
import { API_URL } from "../../../lib/config"; 
import { Upload, Save } from "lucide-react";

//Funcion componente para las pestañas de configuración de la empresa
const CompanyTab = () => {
    const [loading, setLoading] = useState(false); //Estado para manejar la carga del formulario
    const [logo, setLogo] = useState<File | null>(null); //Estado para manejar el logo de la empresa
    const [logoPreview, setLogoPreview] = useState<string | null>(null); //Estado para la vista previa del logo

    const [form, setForm] = useState({
        name: "",
        ruc: "",
        address: "",
        phone: "",
        email: "",
        website: "",
    });

    //1. Cargar la configuración de la empresa al montar el componente
    const fetchCompany = async () => {
        //Llamar a la API para obtener la configuración de la empresa
        try {
            const res = await api.get("/company"); // Llamar al endpoint de configuración de la empresa
            const data = res.data; // Obtener los datos de la respuesta
            if(data) {
                //Actualizar el estado del formulario con los datos recibidos
                setForm({ 
                    name: data.name || "",
                    ruc: data.ruc || "",
                    address: data.address || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    website: data.website || ""
                });
                //Configurar la vista previa del logo si existe
                if (data.logo_path) {
                    const baseUrl = API_URL.replace('/api', ''); //Obtener la URL base 
                    setLogoPreview(`${baseUrl}/storage/${data.logo_path}`); //Configurar la vista previa del logo
                }
            }
        } catch (error) {
            console.error("Error cargando configuración de la empresa", error);
        }
    };

    //Usar useEffect para cargar la configuración al montar el componente
    useEffect(() => {
        fetchCompany();
    }, []);

    //2. Manejar el guardado de la configuración de la empresa
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => formData.append(key, value));
        if (logo) formData.append("logo", logo);
        formData.append("_method", "PUT"); // Truco para Laravel

        try {
            await api.post('/company', formData); 
            alert("✅ Datos de la empresa actualizados.");
        } catch (error) {
            console.error(error);
            alert("❌ Error al guardar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3 className="settings-section-title">Datos de la Empresa</h3>
            
            {/* Logo Upload */}
            <div className="logo-upload-area">
                <div className="logo-preview">
                    {logoPreview ? (
                        <img src={logoPreview} alt="Logo" style={{width:'100%', height:'100%', objectFit:'contain'}} />
                    ) : (
                        <span style={{fontSize:'2rem'}}>🏢</span>
                    )}
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
                    <small style={{display:'block', color:'#64748b', marginTop: 8}}>PNG o JPG (Máx 2MB).</small>
                </div>
            </div>

            {/* Inputs Grid */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                <div className="form-group">
                    <label>Razón Social</label>
                    <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                    <label>RUC</label>
                    <input className="input-field" value={form.ruc} onChange={e => setForm({...form, ruc: e.target.value})} maxLength={11} />
                </div>
                <div className="form-group" style={{gridColumn:'1/-1'}}>
                    <label>Dirección Fiscal</label>
                    <input className="input-field" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
                <div className="form-group">
                    <label>Teléfono</label>
                    <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="form-group">
                    <label>Email Contacto</label>
                    <input className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
            </div>

            <div className="modal-footer">
                <button type="submit" className="btn-primary" disabled={loading}>
                    <Save size={18} style={{marginRight:5}} />
                    {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
            </div>
        </form>
    );
};
export default CompanyTab;
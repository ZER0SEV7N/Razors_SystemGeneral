//adminVentasFrontend/src/pages/settings/tabs/BranchTab.tsx
/*--------------------------------------------------------------------
    Componente de pestaña para la configuración de sucursales
    - Principales funcionalidades:
        - Listar sucursales
        - Crear, editar y eliminar sucursales
        - Activar o desactivar sucursales
--------------------------------------------------------------------*/
import { useState, useEffect } from "react";
import api from "../../../lib/api";
import Modal from "../../../components/ui/ModalExample"; // Tu modal genérico
import { Plus, MapPin, Edit, Trash2 } from "lucide-react";
import type { Branch } from "../../../types/index";

//Funcion componente para la pestaña de sucursales
const BranchTab = () => {
    const [branches, setBranches] = useState<Branch[]>([]); //Estado para la lista de sucursales
    const [loading, setLoading] = useState(false); //Estado para manejar la carga de datos
    //Estado para manejar el modal de creación/edición
    const [showModal, setShowModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null); //Estado para la sucursal que se está editando
    // Estado del Formulario
    const [form, setForm] = useState({ name: "", address: "", phone: "", code: "", is_main: false });

    //1. Cargar la lista de sucursales al montar el componente
    const fetchBranches = async () => {
        try{
            const res = await api.get("/branches");
            setBranches(res.data);
        } catch (error) {
            console.error("Error cargando sucursales", error);
        } finally {
            setLoading(false);
        }
    }

    //Usar useEffect para cargar las sucursales al montar el componente
    useEffect(() => {
        setLoading(true);
        fetchBranches();
    }, []);

    //Abrir el modal para crear una nueva sucursal
    const handleOpenModal = (branch?: Branch) => {
        setEditingBranch(branch || null);
        if (branch) {
            setForm({
                name: branch.name,
                address: branch.address,
                phone: branch.phone || "",
                code: branch.code || "",
                is_main: branch.is_main
            });
        } else {
            setForm({ name: "", address: "", phone: "", code: "", is_main: false });
        }
        setShowModal(true);
    };
// 3. Guardar (Create / Update)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBranch) {
                // Editar
                await api.put(`/branches/${editingBranch.branch_id}`, form);
            } else {
                // Crear
                await api.post('/branches', form);
            }
            setShowModal(false);
            fetchBranches(); // Recargar lista
            alert("✅ Guardado correctamente");
        } catch (error: any) {
            alert("❌ Error: " + (error.response?.data?.message || "Revisa los datos (Código único)"));
        }
    };

    // 4. Eliminar (Desactivar)
    const handleDelete = async (id: number) => {
        if(!confirm("¿Seguro que deseas desactivar esta sede?")) return;
        try {
            await api.delete(`/branches/${id}`);
            fetchBranches();
        } catch (error: any) {
            alert(error.response?.data?.message || "Error al eliminar");
        }
    };

    return (
        <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20}}>
                <h3 className="settings-section-title" style={{marginBottom:0, border:'none'}}>Gestión de Sucursales</h3>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={16} style={{marginRight:5}}/> Nueva Sede
                </button>
            </div>

            {/* LISTA */}
            <div className="branches-list">
                {branches.map(branch => (
                    <div key={branch.branch_id} className="branch-item">
                        <div>
                            <h4 style={{margin:'0 0 5px 0', display:'flex', alignItems:'center', color:'#1e293b'}}>
                                <MapPin size={18} style={{color:'var(--primary)', marginRight:8}}/> 
                                {branch.name}
                                {branch.is_main && <span className="branch-tag-main">Principal</span>}
                            </h4>
                            <div style={{fontSize:'0.9rem', color:'#64748b'}}>
                                <div>📍 {branch.address}</div>
                                <div>🔢 Código: <strong>{branch.code}</strong></div>
                            </div>
                        </div>
                        <div style={{display:'flex', gap:8}}>
                            <button className="btn-icon" onClick={() => handleOpenModal(branch)} title="Editar">
                                <Edit size={18}/>
                            </button>
                            {/* No permitir borrar la principal */}
                            {!branch.is_main && (
                                <button className="btn-icon btn-danger" onClick={() => handleDelete(branch.branch_id)} title="Eliminar">
                                    <Trash2 size={18}/>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL FORMULARIO */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingBranch ? "Editar Sede" : "Nueva Sede"}
            >
                <form onSubmit={handleSave} className="product-form">
                    <div className="form-group">
                        <label>Nombre de la Sede</label>
                        <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Ej: Tienda Norte" />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Código (Único)</label>
                            <input className="input-field" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required placeholder="S001" maxLength={10}/>
                        </div>
                        <div className="form-group">
                            <label>Teléfono</label>
                            <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Dirección Física</label>
                        <input className="input-field" value={form.address} onChange={e => setForm({...form, address: e.target.value})} required />
                    </div>

                    <div style={{background:'#f0fdf4', padding:10, borderRadius:6, marginTop:10}}>
                        <label style={{display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontWeight:600, color:'#166534'}}>
                            <input 
                                type="checkbox" 
                                checked={form.is_main} 
                                onChange={e => setForm({...form, is_main: e.target.checked})}
                            />
                            Establecer como Sede Principal
                        </label>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                        <button type="submit" className="btn-primary" disabled={loading}> {loading ? "Guardando..." : "Guardar Cambios"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
export default BranchTab;
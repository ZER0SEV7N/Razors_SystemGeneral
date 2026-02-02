import { useState, useEffect, type FormEvent } from "react";
import api from "../../lib/api";
import type { Branch } from "../../types";

interface Props {
    branchToEdit?: Branch;
    onSuccess: () => void;
    onCancel: () => void;
}

const BranchForm = ({ branchToEdit, onSuccess, onCancel }: Props) => {
    const [loading, setLoading] = useState(false);
    
    const [form, setForm] = useState({
        name: "",
        code: "",
        address: "",
        phone: "",
        is_main: false // Nuevo campo
    });

    useEffect(() => {
        if (branchToEdit) {
            setForm({
                name: branchToEdit.name,
                code: branchToEdit.code,
                address: branchToEdit.address,
                phone: branchToEdit.phone || "",
                is_main: branchToEdit.is_main // Cargar estado actual
            });
        } else {
            // Generar código sugerido al crear
            setForm(prev => ({ 
                ...prev, 
                code: `SUC-${Math.floor(Math.random()*1000)}`,
                is_main: false 
            }));
        }
    }, [branchToEdit]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        // Validación opcional: Advertir si marca como principal
        if (form.is_main && !confirm("⚠️ ¿Marcar como Sede Principal?\nEsto podría quitarle el estado de principal a otra sede existente.")) {
            return;
        }

        setLoading(true);
        try {
            if (branchToEdit) {
                await api.put(`/branches/${branchToEdit.branch_id}`, form);
                alert("✅ Sucursal actualizada");
            } else {
                await api.post("/branches", form);
                alert("✅ Sucursal creada con éxito");
            }
            onSuccess();
        } catch (err: any) {
            console.error(err);
            alert("❌ " + (err.response?.data?.message || "Error al guardar"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="branch-form">
            {/* Fila 1: Nombre y Código */}
            <div className="form-row" style={{display: 'flex', gap: 10}}>
                <div className="form-group" style={{flex: 2}}>
                    <label>Nombre de la Sede:</label>
                    <input 
                        required className="input-field" 
                        placeholder="Ej: Tienda Norte"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                    />
                </div>
                <div className="form-group" style={{flex: 1}}>
                    <label>Código:</label>
                    <input 
                        required className="input-field" 
                        placeholder="Ej: LIM-02"
                        value={form.code}
                        onChange={e => setForm({...form, code: e.target.value})}
                    />
                </div>
            </div>

            {/* Fila 2: Dirección */}
            <div className="form-group">
                <label>Dirección Física:</label>
                <input 
                    required className="input-field" 
                    placeholder="Av. Principal 123..."
                    value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})}
                />
            </div>

            {/* Fila 3: Teléfono */}
            <div className="form-group">
                <label>Teléfono de Contacto:</label>
                <input 
                    className="input-field" 
                    placeholder="+51 999..."
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                />
            </div>

            {/* NUEVO: Checkbox Principal */}
            <div className="form-group" style={{marginTop: 15, padding: '10px', background: '#f8f9fa', borderRadius: 4}}>
                <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 10}}>
                    <input 
                        type="checkbox" 
                        checked={form.is_main}
                        // Si ya es principal (editando), no dejamos quitar el check fácilmente para evitar quedarnos sin sede principal
                        disabled={branchToEdit?.is_main} 
                        onChange={e => setForm({...form, is_main: e.target.checked})}
                        style={{width: 18, height: 18}}
                    />
                    <div>
                        <span style={{fontWeight: 'bold', display: 'block'}}>Es Sede Principal</span>
                        <small className="text-muted">
                            {branchToEdit?.is_main 
                                ? "Esta sede ya es la principal (no se puede desmarcar aquí)." 
                                : "Marcar esto convertirá a esta sede en el Almacén Central."}
                        </small>
                    </div>
                </label>
            </div>

            <div className="modal-actions">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? "Guardando..." : "Guardar Sede"}
                </button>
            </div>
        </form>
    );
};

export default BranchForm;
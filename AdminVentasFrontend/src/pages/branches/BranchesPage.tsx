import { useEffect, useState } from "react";
import api from "../../lib/api";
import Modal from "../../components/ui/ModalExample";
import BranchForm from "./BranchForm";
import type { Branch } from "../../types";

const BranchesPage = () => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estados Modal
    const [showModal, setShowModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | undefined>(undefined);

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const res = await api.get("/branches");
            setBranches(res.data);
        } catch (error) {
            console.error("Error cargando sucursales");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("⚠️ ¿Estás seguro? Se eliminará la sucursal y su inventario.")) return;
        try {
            await api.delete(`/branches/${id}`);
            alert("✅ Sucursal eliminada");
            fetchBranches();
        } catch (err: any) {
            alert("Error: " + (err.response?.data?.message || "No se pudo eliminar"));
        }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h2>🏢 Mis Sucursales</h2>
                    <p className="text-muted">Administra tus puntos de venta y almacenes.</p>
                </div>
                <button 
                    className="btn-primary"
                    onClick={() => { setEditingBranch(undefined); setShowModal(true); }}
                >
                    + Nueva Sede
                </button>
            </header>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Dirección / Teléfono</th>
                            <th>Tipo</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center">Cargando...</td></tr>
                        ) : branches.map((b) => (
                            <tr key={b.branch_id} style={{backgroundColor: b.is_main ? '#f8f9fa' : 'white'}}>
                                <td className="font-bold text-gray-500">{b.code}</td>
                                <td className="font-bold text-lg">{b.name}</td>
                                <td>
                                    <div>📍 {b.address}</div>
                                    <div className="text-muted text-sm">📞 {b.phone || "S/T"}</div>
                                </td>
                                <td>
                                    {b.is_main ? (
                                        <span className="badge-main">⭐ Principal</span>
                                    ) : (
                                        <span className="badge-branch">Sucursal</span>
                                    )}
                                </td>
                                <td className="text-center">
                                    <div className="action-buttons">
                                        <button 
                                            onClick={() => { setEditingBranch(b); setShowModal(true); }}
                                            className="btn-icon" 
                                            title="Editar"
                                        >✏️</button>
                                        
                                        {!b.is_main && (
                                            <button 
                                                onClick={() => handleDelete(b.branch_id)}
                                                className="btn-icon btn-danger" 
                                                title="Eliminar"
                                            >🗑️</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingBranch ? "Editar Sucursal" : "Nueva Sucursal"}
            >
                <BranchForm 
                    branchToEdit={editingBranch}
                    onSuccess={() => { setShowModal(false); fetchBranches(); }}
                    onCancel={() => setShowModal(false)}
                />
            </Modal>
        </div>
    );
};

export default BranchesPage;
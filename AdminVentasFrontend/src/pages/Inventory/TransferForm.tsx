//adminVentasFrontend/src/pages/Inventory/TransferForm.tsx
/*--------------------------------------------------------------------
    Componente de formulario para transferir stock entre sucursales
    - Principales funcionalidades:
        - Selección de sucursal destino
        - Ingreso de cantidad a transferir
--------------------------------------------------------------------*/
import { useEffect, useState, type FormEvent } from "react";
import api from "../../lib/api"; //Importar la instancia de axios configurada para realizar solicitudes a la API
import type {Product, Branch } from "../../types"; //Importar la interfaz Branch desde los tipos globales

//Interfaces de Props
interface Props {
product: Product; //Producto a transferir
onCancel: () => void; //Función para Cancelar el formulario
onSuccess: () => void; //Función para manejar el éxito de la transferencia
}

//Componente TransferForm
const TransferForm = ({ product, onCancel, onSuccess }: Props) => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Estado del formulario
    const [branchId, setBranchId] = useState("");
    const [quantity, setQuantity] = useState(1);

    // --- CORRECCIÓN DEL BUG ---
    // Buscamos cuánto stock tiene realmente el "Almacén Central" (is_main = true)
    // Si no encuentra, asume 0.
    const centralStock = product.branches?.find(b => b.is_main)?.pivot?.stock || 0;

    useEffect(() => {
        // Cargar sucursales (excluyendo la central para no transferirse a sí mismo si se desea)
        api.get("/branches").then(res => {
            // Opcional: Filtrar para no mostrar la central en el destino
            const destinations = res.data.filter((b: Branch) => !b.is_main);
            setBranches(destinations.length > 0 ? destinations : res.data);
        });
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!branchId) return alert("Selecciona una sucursal destino");
        
        // BUG ARREGLADO: Validar contra centralStock, no product.stock (que es 0)
        if (quantity > centralStock) {
            return alert(`❌ No hay suficiente stock en Almacén Central.\nDisponible: ${centralStock}`);
        }

        setLoading(true);
        try {
            await api.post("/inventory/transfer", {
                product_id: product.product_id,
                branch_id: branchId,
                quantity: quantity
            });
            alert("✅ Transferencia realizada con éxito");
            onSuccess();
        } catch (error: any) {
            console.error(error);
            alert("❌ " + (error.response?.data?.message || "Error al transferir"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="modal-info-box" style={{marginBottom: 20}}>
                <p>Producto: <strong>{product.name}</strong></p>
                {/* Mostrar el stock real de la central */}
                <p>Disponible en Central: <strong>{centralStock} Unidades</strong></p>
            </div>

            <div className="form-group">
                <label>Sucursal de Destino:</label>
                <select 
                    className="input-field" 
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    required
                >
                    <option value="">-- Seleccionar Sede --</option>
                    {branches.map(b => (
                        <option key={b.branch_id} value={b.branch_id}>
                            {b.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Cantidad a Enviar:</label>
                <input 
                    type="text" 
                    className="input-field"
                    min="1"
                    // BUG ARREGLADO: El máximo es lo que hay en la central
                    max={centralStock}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                />
            </div>

            <div className="modal-footer">
                <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
                <button 
                    type="submit" 
                    className="btn-primary" 
                    // Deshabilitar si no hay stock o está cargando
                    disabled={loading || centralStock === 0}
                >
                    {loading ? "Transfiriendo..." : "Confirmar Envío"}
                </button>
            </div>
        </form>
    );
};
export default TransferForm; //Exportar el componente TransferForm para su uso en otras partes de la aplicacion
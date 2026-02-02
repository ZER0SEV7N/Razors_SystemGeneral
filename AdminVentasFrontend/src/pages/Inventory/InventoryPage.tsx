//AdminVentasFrontend/src/pages/inventory/InventoryPage.tsx
/*--------------------------------------------------------------------
    Pagina principal para gestion del inventario de productos
    - Principales funcionalidades:
        - Listado de productos
        - Busqueda y filtrado
        - Integracion con API para obtener datos de productos
--------------------------------------------------------------------*/
import { useEffect, useState } from "react"; //Importar useEffect y useState para manejar el estado y ciclo de vida del componente
import api from "../../lib/api"; //Importar la instancia de axios configurada para realizar solicitudes a la API
import InventoryTable from "./InventoryTable"; //Importar el componente InventoryTable
import ProductForm from "./ProductForm"; //Importar el componente ProductForm
import ProductFilters from "./ProductFilters"; //Importar el componente ProductFilters
import Modal from "../../components/ui/ModalExample"; //Importar el componente ModalExample
import TransferForm from "./TransferForm"; //
import type { Branch, Product } from "../../types"; //Importar la interfaz Product desde los tipos globales
import { useAuth } from "../../context/AuthContext"; //Importar el contexto de autenticacion

//Funcion componente para la pagina de productos
const InventoryPage = () => {
    const { user } = useAuth();
    const isOwner = user?.role === 'OWNER';

    // Estados de Datos
    const [products, setProducts] = useState<Product[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    
    // --- NUEVO: ESTADO PARA EL FILTRO DE SUCURSAL ---
    // "" = Global (Central), "1" = Sede 1, etc.
    const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("");

    const [filters, setFilters] = useState({
        search: "", category_id: "", low_stock: false, show_inactive: false, price_min: "", price_max: ""
    });

    // Modales
    const [showProductForm, setShowProductForm] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [productToTransfer, setProductToTransfer] = useState<Product | null>(null);

    //Determinar si estamos en vista "Global" (Owner sin filtro de sucursal)
    const isGlobalView = isOwner && selectedBranchFilter === "";

    // Carga inicial de sucursales (Solo Owner)
    useEffect(() => {
        if (isOwner) {
            api.get("/branches").then(res => setBranches(res.data));
        }
    }, [isOwner]);

    // 1. CARGA INTELIGENTE DE INVENTARIO
    const fetchInventory = async () => {
        setLoading(true);
        try {
            let url = "";
            const params = new URLSearchParams();
            
            // Filtros comunes
            if(filters.search) params.append("search", filters.search);
            if(filters.category_id) params.append("category_id", filters.category_id);

            // LOGICA DE DECISIÓN DE ENDPOINT
            if (isOwner) {
                if (selectedBranchFilter === "") {
                    // CASO 1: OWNER viendo GLOBAL
                    url = `/products?${params.toString()}`;
                    if(filters.low_stock) params.append("low_stock", "true");
                    if(filters.show_inactive) params.append("show_inactive", "true");
                } else {
                    // CASO 2: OWNER viendo UNA SUCURSAL ESPECÍFICA
                    url = `/inventory/branch/${selectedBranchFilter}`;
                }
            } else {
                // CASO 3: VENDEDOR viendo SU PROPIA SUCURSAL
                url = `/inventory/branch/${user?.branch_id}`;
            }

            const res = await api.get(url);
            
            // Normalizar respuesta (Laravel paginate vs Collection)
            let data = res.data.data ? res.data.data : res.data;

            // ADAPTADOR DE STOCK:
            // Si estamos viendo una sucursal (ya sea porque soy vendedor o porque soy Owner filtrando)
            // el stock real viene en 'pivot.stock', no en 'stock' (que es el global).
            const isViewingBranch = !isOwner || (isOwner && selectedBranchFilter !== "");

            if (isViewingBranch) {
                data = data.map((p: any) => ({
                    ...p,
                    // Si existe pivote, usamos ese stock. Si no, 0.
                    stock: p.pivot ? p.pivot.stock : 0 
                }));
            }

            setProducts(data);
        } catch (error) {
            console.error("Error cargando inventario:", error);
        } finally {
            setLoading(false);
        }
    };

    // Recargar cuando cambian filtros, usuario O LA SUCURSAL SELECCIONADA
    useEffect(() => {
        const timer = setTimeout(() => fetchInventory(), 400);
        return () => clearTimeout(timer);
    }, [filters, user, selectedBranchFilter]); 

    // 2. ACCIONES
    const handleOpenDistribute = (product: Product) => {
        setProductToTransfer(product);
        setShowTransferModal(true);
    };

    const handleDelete = async (id: number) => {
        if(!confirm("¿Desactivar producto globalmente?")) return;
        await api.delete(`/products/${id}`);
        fetchInventory();
    };

    // Helper para el título de la columna
    const getStockLabel = () => {
        if (!isOwner) return "Stock Local";
        if (selectedBranchFilter === "") return "Stock Central (Global)";
        // Buscar nombre de la sede seleccionada
        const branchName = branches.find(b => b.branch_id.toString() === selectedBranchFilter)?.name;
        return `Stock en ${branchName}`;
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h2>📦 Gestión de Inventario</h2>
                    <p className="text-muted" style={{fontSize: '0.9rem'}}>
                        {isOwner 
                            ? "Panel de Control Logístico" 
                            : `Inventario Local: ${user?.branch?.name}`}
                    </p>
                </div>
                
                <div style={{display: 'flex', gap: '10px'}}>
                    {/* SELECTOR DE SUCURSAL (SOLO OWNER) */}
                    {/* --- CORRECCIÓN AQUÍ: NOMBRES CLAROS --- */}
                    {isOwner && (
                        <select 
                            className="input-field" 
                            style={{padding: '8px', fontWeight: 'bold', minWidth: '220px'}}
                            value={selectedBranchFilter}
                            onChange={(e) => setSelectedBranchFilter(e.target.value)}
                        >
                            {/* Opción 1: Vista Global (Resumen) */}
                            <option value="">🌎 Vista Global (Todas las Sedes)</option>
                            
                            {/* Opción 2: Lista de Sucursales Reales */}
                            <optgroup label="Filtrar por Sede Física">
                                {branches.map(b => (
                                    <option key={b.branch_id} value={b.branch_id}>
                                        {/* Icono diferente para la principal si quieres distinguirla */}
                                        {b.is_main ? '🏭' : '🏪'} {b.name}
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                    )}

                    {/* Botón Crear (Solo Owner y solo si está en vista Global para evitar confusiones) */}
                    {isOwner && (
                        <button className="btn-primary" onClick={() => { setEditingProduct(undefined); setShowProductForm(true); }}>
                            + Nuevo Producto
                        </button>
                    )}
                </div>
            </header>

            <ProductFilters filters={filters} onChange={setFilters} />

            {loading ? (
                <div className="text-center p-4">Cargando inventario...</div>
            ) : (
                <InventoryTable 
                    products={products}
                    // Solo mostramos controles completos si es Owner Y está en vista Global
                    isOwner={isOwner && selectedBranchFilter === ""} 
                    // Título dinámico de la columna stock
                    stockTitle={getStockLabel()}
                    // PASAMOS LA NUEVA PROP
                    isGlobalView={isGlobalView}
                    onEdit={(p) => { setEditingProduct(p); setShowProductForm(true); }}
                    onDelete={handleDelete}
                    onDistribute={handleOpenDistribute}
                />
            )}

            {/* --- MODAL 1: CREAR/EDITAR --- */}
            <Modal isOpen={showProductForm} onClose={() => setShowProductForm(false)} title={editingProduct ? "Editar Producto" : "Nuevo Producto"}>
                <ProductForm 
                    product={editingProduct} 
                    onSuccess={() => { setShowProductForm(false); fetchInventory(); }}
                    onCancel={() => setShowProductForm(false)}
                />
            </Modal>

            {/* --- MODAL 2: DISTRIBUIR STOCK --- */}
            <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="🚚 Traslado de Mercadería">
                {productToTransfer && (
                    <TransferForm 
                        product={productToTransfer}
                        onSuccess={() => { setShowTransferModal(false); fetchInventory(); }}
                        onCancel={() => setShowTransferModal(false)}
                    />
                )}
            </Modal>
        </div>
    );
};

export default InventoryPage; //Exportar el componente InventoryPage
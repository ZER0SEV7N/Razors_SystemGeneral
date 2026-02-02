//adminVentasFrontend/src/pages/sales/salesPage.tsx
//Componente maestro para la página de ventas
// -- Funcionalidades principales:
//    - Mostrar lista de productos
//    - Manejar el carrito de compras
//    - Procesar ventas
//Importaciones necesarias desde React y otros componentes/hooks
import { useState, useEffect } from "react"; //Importar useState y useEffect para manejar el estado y efectos secundarios
import api from "../../lib/api";
import { useCart } from "../../components/hooks/useCart";
import type { Branch, Client, Product } from "../../types"; //Importar la interfaz Product desde los tipos globales
import "../css/sales.css" //Importar estilos CSS para la página de ventas
import { useAuth } from "../../context/AuthContext";

const SalesPage = () => {
    const { user } = useAuth(); // Necesitamos saber quién está vendiendo
    const isOwner = user?.role === 'OWNER';
    //1. Estado locales
    const [products, setProducts] = useState<Product[]>([]); //Estado para almacenar la lista de productos
    const [searchTerm, setSearchTerm] = useState<string>(""); //Estado para el término de búsqueda
    const [loadingPay, setLoadingPay] = useState<boolean>(false); //Estado para indicar si se está procesando el pago
    //---Estados para metodos de pago---
    const [paymentMethod, setPaymentMethod] = useState<string>("EFECTIVO");
    const [paymentRef, setPaymentRef] = useState<string>("");

    // --- NUEVO: ESTADOS PARA EL SELECTOR DE SUCURSAL ---
    const [branches, setBranches] = useState<Branch[]>([]);
    // Si es Owner, empieza vacío (Central). Si es vendedor, usa su ID fijo.
    const [selectedBranchId, setSelectedBranchId] = useState<string>("");
    
    // --- Estados para clientes ---
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    //2. Hook del Carrito (nuestra Lógica de Carrito personalizada)
    const { cart, addToCart, removeFromCart, decreaseQuantity, clearCart, total } = useCart();

    //3. Efecto para cargar los productos desde la API al montar el componente
    useEffect(() => {
        if (user) {
            // Configurar sucursal inicial
            if (!isOwner && user.branch_id) {
                setSelectedBranchId(user.branch_id.toString());
            }
            
            fetchClients();

            // Si es Owner, cargamos la lista de sedes para que pueda elegir
            if (isOwner) {
                api.get("/branches").then(res => setBranches(res.data));
            }
        }
    }, [user, isOwner]);

    useEffect(() => {
        fetchProducts();
    }, [selectedBranchId]);

    //Funcion para obtener los clientes desde la API
    const fetchClients = async () => {
        try {
            const res = await api.get("/clients");
            const lista = res.data.data ? res.data.data : res.data;
            setClients(lista);
        } catch (error) {
            console.error("Error cargando clientes:", error);
        }
    };

    //Funcion para obtener los productos desde la API
    const fetchProducts = async () => {
        try{
            let url = "/products"; // Por defecto (Central)

            // Si hay una sucursal seleccionada (ya sea por Owner o porque es Vendedor)
            if (selectedBranchId) {
                url = `/inventory/branch/${selectedBranchId}`;
            }

            const res = await api.get(url);
            let lista = res.data.data ? res.data.data : res.data;

            // ADAPTADOR DE STOCK
            if (selectedBranchId) {
                lista = lista.map((p: any) => ({
                    ...p,
                    stock: p.pivot ? p.pivot.stock : 0 
                }));
            }

            setProducts(lista);
        } catch(error){
            console.error("Error cargando productos:", error);
        }
    };

    // Manejar cambio de sucursal (Solo Owner)
    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newBranchId = e.target.value;
        if(cart.length > 0) {
            if(!confirm("⚠️ Al cambiar de sucursal se vaciará el carrito actual. ¿Continuar?")) return;
            clearCart();
        }
        setSelectedBranchId(newBranchId);
    };

    //Funcion para selección de cliente
    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = Number(e.target.value);
        if (!id) {
            setSelectedClient(null); // Público General
        } else {
            const found = clients.find(c => c.client_id === id);
            setSelectedClient(found || null);
        }
    };

    // Filtrar productos según el término de búsqueda
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.is_active
    );

    //Funcion para vender (procesar la venta)
    const handleSale = async () => {
        //Validar que haya productos en el carrito
        if (cart.length === 0) return;

        //Validación de stock frontend (Doble seguridad)
        const stockError = cart.find(item => item.quantity > item.stock);
        if (stockError) {
            alert(`❌ Stock insuficiente para: ${stockError.name}`);
            return;
        }

        //Validar referencia si no es efectivo
        if (paymentMethod !== "EFECTIVO" && !paymentRef.trim()) {
             if(!confirm("¿Deseas procesar el pago sin número de referencia?")) return;
        }
        //Procesar la venta
        setLoadingPay(true);

        //Construir el objeto de venta
        const saleData = {
            client_id: selectedClient ? selectedClient.client_id : null,
            products: cart.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            })),
            payment_method: paymentMethod, 
            payment_reference: paymentRef || null,
            // Opcional: Podrías enviar branch_id al backend si modificamos el SaleController
            branch_id: selectedBranchId || null
        };

        try{
            const res = await api.post("/sales", saleData); 
            alert(`✅ Venta registrada con éxito. Ticket #${res.data.sale_id}`);
            
            clearCart(); 
            setPaymentRef(""); 
            setPaymentMethod("EFECTIVO"); 
            setSelectedClient(null);
            fetchProducts(); 
        }catch (error: any){
            console.error(error);
            const msg = error.response?.data?.message || "Error al procesar venta";
            alert("❌ " + msg);        
        }finally{
            setLoadingPay(false);
        }
    };

    //Obtenemos la URL completa de la imagen
    const getImg = (path?: string) => {
        if(!path) return "https://placehold.co/100?text=IMG";
        if (path.startsWith("http")) return path;
        return `http://localhost:8000/storage/${path}`;
    };

    return (
        <div className="sales-container">
            {/* Panel Izquierdo: Catálogo */}
            <div className="catalog-panel">
                
                {isOwner && (
                    <div style={{marginBottom: 10}}>
                        <select 
                            className="input-field" 
                            style={{width: '100%', fontWeight: 'bold', border: '2px solid #3b82f6'}}
                            value={selectedBranchId}
                            onChange={handleBranchChange}
                        >
                            <option value="">🏢 Almacén Central (Global)</option>
                            <optgroup label="Vender desde Sucursal:">
                                {branches.map(b => (
                                    <option key={b.branch_id} value={b.branch_id}>
                                        🏪 {b.name}
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                    </div>
                )}

                <div className="search-bar">
                    <input className="search-input"
                        placeholder="🔎 Buscar producto por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus={!isOwner} 
                    />
                </div>

                <div className="products-grid">
                    {filteredProducts.map((p) =>(
                        <div key={p.product_id}
                            className={`product-card ${p.stock <= 0 ? 'no-stock' : ''}`}
                            onClick={() => p.stock > 0 && addToCart(p)}
                        >
                            <span className={`stock-badge ${p.stock <= p.min_stock ? 'critical' : ''}`}>
                                {p.stock} Unid.
                            </span>
                            
                            <div className="card-img-container">
                                <img src={getImg(p.image)} alt={p.name} className="card-img"/>
                            </div>
                            
                            <div className="card-info">
                                <div className="card-title">{p.name}</div>
                                <div className="card-price">S/. {Number(p.price).toFixed(2)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Panel Derecho: Carrito */}
            <div className="cart-panel">
                <div className="cart-header">
                    <h3>🛒 Nueva Venta</h3>
                    
                    {isOwner && selectedBranchId && (
                        <div style={{fontSize: '0.8rem', color: '#16a34a', marginBottom: 5}}>
                            Vendiendo desde: <b>{branches.find(b => b.branch_id.toString() === selectedBranchId)?.name}</b>
                        </div>
                    )}

                    {/* --- NUEVO SELECTOR DE CLIENTES (TIPO LISTA) --- */}
                    <div className="client-section">
                        <label>Cliente:</label>
                        <select 
                            className="input-field" 
                            style={{width: '100%', padding: '10px'}}
                            value={selectedClient ? selectedClient.client_id : ""}
                            onChange={handleClientChange}
                        >
                            <option value="">👤 Público General</option>
                            {clients.map(c => (
                                <option key={c.client_id} value={c.client_id}>
                                    {c.name} {c.document_number ? `(${c.document_number})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <p>🛒 Carrito vacío</p>
                            <small>Selecciona productos del catálogo</small>
                        </div>
                    ) : (
                        cart.map((item) =>(
                            <div key={item.product_id} className="cart-item">
                                <div className="item-details">
                                    <h4>{item.name}</h4>
                                    <small>S/. {item.price} x {item.quantity}</small>
                                </div>
                                <div className="item-actions">
                                    <button onClick={() => decreaseQuantity(item.product_id)}>-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => item.quantity < item.stock && addToCart(item)} disabled={item.quantity >= item.stock}>+</button>
                                    <button className="trash" onClick={() => removeFromCart(item.product_id)}>🗑️</button>
                                </div>
                                <div className="item-total">
                                    S/. {(Number(item.price) * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="cart-footer">
                    <div className="payment-section">
                        <label>Método de Pago:</label>
                        <select 
                            className="input-field" 
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <option value="EFECTIVO">💵 Efectivo</option>
                            <option value="TARJETA">💳 Tarjeta</option>
                            <option value="TRANSFERENCIA">📲 Yape / Plin</option>
                        </select>

                        {paymentMethod !== 'EFECTIVO' && (
                            <input 
                                className="input-field mt-2" 
                                placeholder="Nro. Referencia / Operación"
                                value={paymentRef}
                                onChange={(e) => setPaymentRef(e.target.value)}
                            />
                        )}
                    </div>

                    <div className="total-display">
                        <span>Total a Pagar</span>
                        <h1>S/. {total.toFixed(2)}</h1>
                    </div>

                    <button 
                        className="btn-checkout" 
                        disabled={cart.length === 0 || loadingPay}
                        onClick={handleSale}
                    >
                        {loadingPay ? "Procesando..." : "✅ CONFIRMAR VENTA"}
                    </button>
                </div>
            </div>
        </div>
    )
};
export default SalesPage; //Exportar el Componente
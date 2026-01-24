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
import type { Product } from "../../types"; //Importar la interfaz Product desde los tipos globales
import "../css/sales.css" //Importar estilos CSS para la página de ventas

const SalesPage = () => {
    //1. Estado locales
     const [products, setProducts] = useState<Product[]>([]); //Estado para almacenar la lista de productos
     const [searchTerm, setSearchTerm] = useState<string>(""); //Estado para el término de búsqueda
     const [loadingPay, setLoadingPay] = useState<boolean>(false); //Estado para indicar si se está procesando el pago
     // --- NUEVOS ESTADOS PARA TU CONTROLADOR ---
    const [paymentMethod, setPaymentMethod] = useState<string>("EFECTIVO");
    const [paymentRef, setPaymentRef] = useState<string>("");

    //2. Hook del Carrito (nuestra Lógica de Carrito personalizada)
    const { cart, addToCart, removeFromCart, decreaseQuantity, clearCart, total } = useCart();

    //3. Efecto para cargar los productos desde la API al montar el componente
    useEffect(() => {
        fetchProducts();
    }, []);

    //Funcion para obtener los productos desde la API
    const fetchProducts = async () => {
        try{
            //Traer productos desde la API
            const res = await api.get("/products"); //Realizar la petición GET a la API para obtener la lista de productos
            // Ajuste por si tu API devuelve paginación o data directa
            const lista = res.data.data ? res.data.data : res.data;
            setProducts(lista);
        }catch(error){
            console.error("Error Cargando productos:", error);
        }
    };

    //4. Filtrar productos según el término de búsqueda
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.is_active
    );

    // --- FUNCIÓN ADAPTADA A TU BACKEND ---
    const handleSale = async () => {
        if (cart.length === 0) return;

        // Validación simple de referencia si no es efectivo (opcional)
        if (paymentMethod !== "EFECTIVO" && !paymentRef.trim()) {
             if(!confirm("¿Deseas procesar el pago sin número de referencia?")) return;
        }

        setLoadingPay(true);

        // Preparamos el payload EXACTO que pide tu SaleController::store
        const saleData = {
            client_id: null, // Por ahora null (Público General), luego puedes agregar selector de clientes
            products: cart.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            })),
            // Campos requeridos por tu validación:
            payment_method: paymentMethod, 
            payment_reference: paymentRef || null 
        };

        try{
            // Tu backend devuelve { message: '...', sale_id: ... }
            const res = await api.post("/sales", saleData); 
            
            alert(`✅ Venta registrada con éxito. ID: ${res.data.sale_id}`);
            
            clearCart(); 
            setPaymentRef(""); // Limpiar referencia
            setPaymentMethod("EFECTIVO"); // Resetear método
            fetchProducts(); // Refrescar stock visualmente
        }catch (error: any){
            console.error("Error procesando la venta:", error);
            // Mostrar error del backend (ej: "Stock insuficiente...")
            const msg = error.response?.data?.message || "Error al procesar venta";
            alert("❌ Error: " + msg);        
        }finally{
            setLoadingPay(false);
        }
    };

    const getImg = (path?: string) => path ? `http://localhost:8000/storage/${path}` : "https://placehold.co/100?text=IMG";

    return (
        <div className="sales-container">
            {/* --- IZQUIERDA: CATÁLOGO (Igual que antes) --- */}
            <div className="catalog-panel">
                <div className="search-bar">
                    <input className="search-input"
                        placeholder="🔎 Buscar producto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="products-grid">
                    {filteredProducts.map((p) =>(
                        <div key={p.product_id}
                            className={`product-card ${p.stock <= 0 ? 'no-stock' : ''}`}
                            onClick={() => p.stock > 0 && addToCart(p)}
                        >
                            <span className="stock-badge">{p.stock} Unid.</span>
                            <img src={getImg(p.image)} alt={p.name} className="card-img"/>
                            <div className="card-title">{p.name}</div>
                            <div className="card-price">S/. {Number(p.price).toFixed(2)}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- DERECHA: CARRITO Y PAGO --- */}
            <div className="cart-panel">
                <div className="cart-header">
                    <h3>Ticket de Venta</h3>
                    <small>Cliente: Público General</small>
                </div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <p className="empty-cart">El carrito está vacío</p>
                    ) : (
                        cart.map((item) =>(
                           <div key={item.product_id} className="cart-item">
                                <div className="item-info">
                                    <h4>{item.name}</h4>
                                    <small>S/. {Number(item.price).toFixed(2)} x {item.quantity}</small>
                                </div>
                                <div className="item-controls">
                                    <button className="btn-qty" onClick={() => decreaseQuantity(item.product_id)}>-</button>
                                    <span>{item.quantity}</span>
                                    {/* Validamos contra stock visualmente aunque el backend valida también */}
                                    <button className="btn-qty" onClick={() => item.quantity < item.stock && addToCart(item)}>+</button>
                                    <button className="btn-remove" onClick={() => removeFromCart(item.product_id)}>🗑️</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* --- SECCIÓN DE PAGO (NUEVO) --- */}
                <div className="cart-footer">
                    
                    {/* Selector de Método de Pago */}
                    <div style={{marginBottom: 15}}>
                        <label style={{display:'block', fontSize:'0.85rem', fontWeight:600, color:'#64748b', marginBottom:5}}>Método de Pago:</label>
                        <select 
                            className="input-field" 
                            style={{width:'100%', padding: 8}}
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <option value="EFECTIVO">💵 Efectivo</option>
                            <option value="TARJETA">💳 Tarjeta (Débito/Crédito)</option>
                            <option value="TRANSFERENCIA">📲 Transferencia / Yape</option>
                        </select>
                    </div>

                    {/* Input de Referencia (Solo si no es efectivo) */}
                    {paymentMethod !== 'EFECTIVO' && (
                        <div style={{marginBottom: 15}}>
                            <input 
                                className="input-field" 
                                style={{width:'100%', padding: 8}}
                                placeholder="Nro. Operación / Ref."
                                value={paymentRef}
                                onChange={(e) => setPaymentRef(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="total-row">
                        <span>TOTAL:</span>
                        <span>S/. {total.toFixed(2)}</span>
                    </div>

                    <button 
                        className="btn-pay" 
                        disabled={cart.length === 0 || loadingPay}
                        onClick={handleSale}
                    >
                        {loadingPay ? "Procesando..." : "💵 COBRAR"}
                    </button>
                </div>
            </div>
        </div>
    )
};
export default SalesPage;
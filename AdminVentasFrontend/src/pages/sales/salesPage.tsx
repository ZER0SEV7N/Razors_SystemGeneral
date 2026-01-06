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
            setProducts(res.data.data || res.data); //Actualizar el estado con la lista de productos obtenida
        }catch(error){
            console.error("Error Cargando productos:", error);
        }
    };

    //4. Filtrar productos según el término de búsqueda
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.is_active
    );

    //5. Función para procesar la venta
    const handleSale = async () => {
        if (cart.length === 0) return;
        setLoadingPay(true);

        //Preparar los datos para la venta
        const saleData = {
            client_id: null, //Por ahora no manejamos clientes
            products: cart.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            }))
        };

        try{
            //Enviar la venta a la API
            await api.post("/sales", saleData); //Realizar la petición POST a la API para procesar la venta
            alert("Venta procesada con éxito");
            clearCart(); //Limpiar el carrito después de la venta
            fetchProducts(); //Refrescar la lista de productos para actualizar stock
        }catch (error: any){
            console.error("Error procesando la venta:", error);
            alert("❌ Error: " + (error.response?.data?.message || "Error al procesar venta"));        
        }finally{
            setLoadingPay(false);
        }
    };

    //Helper para obtener la URL completa de la imagen del producto
    const getImg = (path?: string) => path ? `http://localhost:8000/storage/${path}` : "https://placehold.co/100?text=IMG";

    //Renderizado del componente
    return (
        <div className="sales-container">
            {/* Izquierda - Catalogo */}
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

            {/* Derecha - Carrito de Compras */}
            <div className="cart-panel">
                <div className="cart-header">
                    <h3>Ticket de Venta</h3>
                    <small>Cliente: Publico General</small>
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
                                    <button className="btn-qty" onClick={() => addToCart(item)}>+</button>
                                    <button className="btn-remove" onClick={() => removeFromCart(item.product_id)}>🗑️</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="cart-footer">
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
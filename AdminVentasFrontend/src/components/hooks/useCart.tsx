//adminVentasFrontend/src/components/hooks/useCart.tsx
/*--------------------------------------------------------------------
    Hook personalizado para manejar el carrito de compras
    - Principales funcionalidades:
        - Agregar productos al carrito
        - Eliminar productos del carrito
        - Actualizar cantidades de productos
        - Calcular totales del carrito
--------------------------------------------------------------------*/
import { useState, useMemo, useEffect } from "react"; //Importar useState para manejar el estado y useMemo para memorizar valores calculados
import type { CartItem, Product } from "../../types"; //Importar las interfaces necesarias desde los tipos globales
export const useCart = () => {
    // 1. Inicializar estado buscando en LocalStorage si existe
    const [cart, setCart] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('pos_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // 2. Guardar en LocalStorage cada vez que cambie el carrito
    useEffect(() => {
        localStorage.setItem('pos_cart', JSON.stringify(cart));
    }, [cart]);

    // Función para agregar un producto al carrito
    const addToCart = (product: Product) => {
        setCart((prev) => {
            const exists = prev.find((item) => item.product_id === product.product_id);

            // Si ya existe, validamos stock y sumamos
            if(exists){
                if(exists.quantity >= product.stock){
                    // Opcional: Usar una librería de Toast en lugar de alert
                    alert("⚠️ No hay suficiente stock disponible para agregar más."); 
                    return prev;
                }
                return prev.map((item) =>
                    item.product_id === product.product_id
                    ? { ...item, quantity: item.quantity + 1, subtotal: Number(item.price) * (item.quantity + 1) }
                    : item
                );
            }

            // Si es nuevo, validamos que haya al menos 1
            if (product.stock < 1) {
                alert("⚠️ Producto sin stock.");
                return prev;
            }

            // Lo agregamos con cantidad 1
            return [...prev, { ...product, quantity: 1, subtotal: Number(product.price) }];
        });
    };

    // Función para eliminar un producto del carrito
    const removeFromCart = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.product_id !== productId));
    };

    // Función para Decrementar la cantidad
    const decreaseQuantity = (productId: number) => {
        setCart((prev) => prev.map(item => {
            if(item.product_id === productId){
                // Si la cantidad es 1, no bajamos a 0 (para borrar usa el botón de basura)
                const newQty = item.quantity - 1;
                return { ...item, quantity: newQty < 1 ? 1 : newQty };
            }
            return item;
        }));
    };

    // Limpiar carrito después de vender
    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('pos_cart'); // Limpiamos también la memoria
    };

    // Calcular el total del carrito
    const total = useMemo(() => {
        return cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
    }, [cart]);

    return { 
        cart, 
        addToCart, 
        removeFromCart, 
        decreaseQuantity, 
        clearCart, 
        total 
    };
}
//adminVentasFrontend/src/components/hooks/useCart.tsx
/*--------------------------------------------------------------------
    Hook personalizado para manejar el carrito de compras
    - Principales funcionalidades:
        - Agregar productos al carrito
        - Eliminar productos del carrito
        - Actualizar cantidades de productos
        - Calcular totales del carrito
--------------------------------------------------------------------*/
import { useState, useMemo } from "react"; //Importar useState para manejar el estado y useMemo para memorizar valores calculados
import type { CarItem, Product } from "../../types"; //Importar las interfaces necesarias desde los tipos globales

export const useCart = () => {
    const [cart, setCart] = useState<CarItem[]>([]); //Estado para almacenar los items del carrito

    //Funcion para agregar un producto al carrito
    const addToCart = (product: Product) => {
        setCart((prev) => {
            const exists = prev.find((item) => item.product_id === product.product_id);

            //Si ya existe, sumamos 1
            if(exists){
                if(exists.quantity >= product.stock){
                    alert("No hay suficiente stock disponible");
                    return prev;
                }
                return prev.map((item) =>
                    item.product_id === product.product_id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                );
            }
            //Si es nuevo, lo agregamos con cantidad 1
            return [...prev, { ...product, quantity: 1, subtotal: Number(product.price)}];
        });
    };

    //Funcion para eliminar un producto del carrito
    const removeFromCart = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.product_id !== productId));
    };

    //Funcion para Decrementar la cantidad
    const decreaseQuantity = (productId: number) => {
        setCart((prev) => prev.map(item => {
            if(item.product_id === productId){
                const newQty = item.quantity - 1;
                if(newQty <= 0) return item; //No permitir cantidades negativas
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    //Limpiar carrito despues de vender
    const clearCart = () => setCart([]);

    //Calcular el total del carrito
    const total = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.subtotal * item.quantity, 0);
    }, [cart]);
    return { cart, addToCart, removeFromCart, decreaseQuantity, clearCart, total };
}
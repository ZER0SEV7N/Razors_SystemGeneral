//adminVentasFrontend/src/pages/sales/salesHistory.tsx
//Pagina de historial de ventas
// Funcionalidades:
// - Mostrar una lista de ventas pasadas
// - Filtrar ventas por fecha, cliente o estado
// - Ver detalles de una venta específica
import { useEffect, useState } from "react";
import api from "../../lib/api";
import "../css/sales.css" //reutilizar el CSS del contenedor principal
import type { Sale } from "../../types/index"; 

//Funcion principal del componente SalesHistory
const SalesHistory = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

    //Cargar las ventas al montar el componente
    useEffect(() => {
        fetchSales();
    }, []);

    //Funcion para obtener las ventas desde la API
    const fetchSales = async () => {
        try {
            setLoading(true);
            const res = await api.get("/sales");
            //Soporta ambas estructuras de respuesta (paginada y no paginada)
            const data = res.data.data ? res.data.data : res.data; // Manejar ambas estructuras de respuesta
            setSales(data);
        }catch (err) {
            console.error("Error al cargar las ventas.", err);
        } finally {
            setLoading(false);
        };
    };

    // --- NUEVA FUNCIÓN: APROBAR VENTA ---
    const handleApproveSale = async (id: number) => {
        if (!confirm("💰 ¿Confirmar que se recibió el pago?\nLa venta pasará a estado PAGADO.")) return;

        try {
            // Enviamos status: 'PAGADO' al método update del controlador
            await api.put(`/sales/${id}`, { status: 'PAGADO' });
            alert("✅ Venta APROBADA exitosamente.");
            fetchSales(); // Recargamos la tabla para ver el cambio
        } catch (err: any) {
            console.error("Error al aprobar:", err);
            // Si el backend devuelve error (ej: no eres Admin), lo mostramos
            const msg = err.response?.data?.message || "Error al aprobar la venta.";
            alert("❌ " + msg);
        }
    };

    //Funcion para anular las Ventas (Devuelve el Stock)
    const handleCancelSale = async (id: number) => {
        if (!confirm("⚠️ ¿Estás seguro de ANULAR esta venta?\nEl stock será devuelto al inventario.")) return;
        
        try {
            await api.delete(`/sales/${id}`); //Llama al metodo Cancel en la API
            alert("✅ Venta anulada correctamente.");
            fetchSales(); //Recargar las ventas
            setSelectedSale(null); //Cerrar detalles
        } catch (err) {
            console.error("Error al anular la venta.", err);
            alert("❌ Error al anular la venta.");
        }
    };

    //Funcion para abrir el PDF de la venta
    const handleViewPDF = async (id: number) => { 
        try {
            //Pedir el PDF al API usan AXIOS (que ya tiene el token)
            const res = await api.get(`/reports/sales/${id}`, {
                responseType: 'blob' // Indicar que la respuesta es un Blob (archivo)
            });

            //2. Crear una URL para el Blob y abrir en nueva pestaña
            const pdfBlob = new Blob([res.data], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            //3. Abrir en nueva pestaña
            window.open(pdfUrl, '_blank');
            //Nota: No es necesario liberar la URL del Blob en este caso, el navegador lo maneja
            //setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000); //Liberar despues de 10 segundos
        } catch (err) {
            console.error("Error al generar el PDF de la venta.", err);
            alert("❌ Error al generar el PDF de la venta.");
        }
    };

    const handleInventoryReport = async () => {
        try {
            const res = await api.get("/reports/inventory", {
                responseType: 'blob'
            });
            const pdfUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            window.open(pdfUrl, '_blank');
        } catch (err) {
            alert("❌ Error al generar el reporte de inventario.");
        }
    };

    // Funcion para reporte mensual
    const handleMonthlyReport = async () => {
        const date = new Date();
        const month = date.getMonth() + 1; 
        const year = date.getFullYear();
        try{
            //Pedir el PDF al API usan AXIOS (que ya tiene el token)
            const res = await api.get(`/reports/monthly?month=${month}&year=${year}`, {
                responseType: 'blob'
            });
            //Crear Blob y URL
            const pdfBlob = new Blob([res.data], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            //Abrir en nueva pestaña
            window.open(pdfUrl, '_blank');
        } catch (err) {
            console.error("Error al generar el reporte mensual.", err);
            alert("❌ Error al generar el reporte mensual.");
        }
    };

    // Renderizado del componente
    return (
        <div className="sales-container history-layout">
            <div className="history-header">
                <h2>📜 Historial de Ventas</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Botón para reporte mensual */}
                    <button onClick={handleMonthlyReport} className="btn-refresh" style={{background: '#3b82f6', color: 'white', border: 'none'}}>
                        📊 Reporte Mensual
                    </button>
                    
                    <button onClick={fetchSales} className="btn-refresh">
                        🔄 Actualizar
                    </button>
                    
                    <button onClick={handleInventoryReport}>📥 Descargar Inventario PDF</button>
                </div>
            </div>

            {/* TABLA DE VENTAS */}
            <div className="table-container">
                <table className="sales-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="text-center">Cargando ventas...</td></tr>
                        ) : sales.length === 0 ? (
                            <tr><td colSpan={6} className="text-center">No hay ventas registradas</td></tr>
                        ) : (
                            sales.map((sale) => (
                                <tr key={sale.sale_id}>
                                    <td className="font-bold">#{sale.sale_id}</td>
                                    <td>{new Date(sale.sale_date).toLocaleString()}</td>
                                    <td>{sale.client ? sale.client.name : 'Público General'}</td>
                                    <td className="font-bold text-green">
                                        S/. {Number(sale.total).toFixed(2)}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${sale.status.toLowerCase()}`}>
                                            {sale.status}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <div className="action-buttons">
                                            {/* 1. Botón APROBAR (Solo si está PENDIENTE) */}
                                            {sale.status === 'PENDIENTE' && (
                                                <button 
                                                    onClick={() => handleApproveSale(sale.sale_id)}
                                                    className="btn-icon"
                                                    style={{color: '#10b981', background: '#ecfdf5', marginRight: 5}}
                                                    title="Aprobar Pago">✅</button>
                                            )}
                                            <button 
                                                onClick={() => setSelectedSale(sale)}
                                                className="btn-icon"
                                                title="Ver Detalles">👁️</button>
                                            
                                            <button 
                                                onClick={() => handleViewPDF(sale.sale_id)}
                                                className="btn-icon"
                                                title="Imprimir PDF">📄</button>
                                            
                                            {sale.status !== 'CANCELADO' && (
                                                <button 
                                                    onClick={() => handleCancelSale(sale.sale_id)}
                                                    className="btn-icon btn-danger"
                                                    title="Anular Venta">🚫</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL DE DETALLES --- */}
            {selectedSale && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>🧾 Venta #{selectedSale.sale_id}</h3>
                            <button onClick={() => setSelectedSale(null)} className="btn-close">&times;</button>
                        </div>

                        <div className="modal-body">
                            <div className="info-grid">
                                <div>
                                    <label>Fecha:</label>
                                    <p>{new Date(selectedSale.sale_date).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label>Vendedor:</label>
                                    <p>{selectedSale.user?.name}</p>
                                </div>
                                <div>
                                    <label>Estado:</label>
                                    <span className={`status-badge ${selectedSale.status.toLowerCase()}`}>
                                        {selectedSale.status}
                                    </span>
                                </div>
                            </div>

                            <table className="details-table">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th className="text-center">Cant.</th>
                                        <th className="text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedSale.details.map((det) => (
                                        <tr key={det.detail_id}>
                                            <td>{det.product?.name || "(Eliminado)"}</td>
                                            <td className="text-center">{det.quantity}</td>
                                            <td className="text-right">S/. {Number(det.subtotal).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            <div className="modal-total">
                                <span>Total: S/. {Number(selectedSale.total).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button onClick={() => setSelectedSale(null)} className="btn-secondary">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesHistory;
//adminVentasFrontend/src/pages/sales/salesHistory.tsx
//Pagina de historial de ventas
// Funcionalidades:
// - Mostrar una lista de ventas pasadas
// - Filtrar ventas por fecha, cliente o estado
// - Ver detalles de una venta específica
import { useEffect, useState, type FormEvent } from "react";
import api from "../../lib/api";
import "../css/sales.css" //reutilizar el CSS del contenedor principal
import type { Sale } from "../../types/index"; 
import Modal from "../../components/ui/ModalExample";

//Funcion principal del componente SalesHistory
const SalesHistory = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

    // --- ESTADOS PARA GUÍA DE REMISIÓN ---
    const [isGuideModalOpen, setGuideModalOpen] = useState(false);
    const [guideForm, setGuideForm] = useState({
        sale_id: 0,
        transfer_date: new Date().toISOString().split('T')[0], // Hoy
        driver_name: '',
        vehicle_plate: ''
    });

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

    //Funcion para Abrir Modal para Crear Guía de Remisión
    /*const handleOpenGuideModal = (saleId: number) => {
        setGuideForm({
            sale_id: saleId,
            transfer_date: new Date().toISOString().split('T')[0],
            driver_name: '',
            vehicle_plate: ''
        });
        setGuideModalOpen(true);
    };*/

    //Funcion para Enviar Formulario (Crear Guía de Remisión)
    const handleSubmitGuide = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/guides', guideForm);
            alert("✅ Guía de Remisión generada con éxito");
            setGuideModalOpen(false);
            fetchSales(); // Recargar para actualizar el botón a "Ver Guía"
        } catch (err: any) {
            console.error(err);
            alert("Error: " + (err.response?.data?.message || "No se pudo crear la guía"));
        }
    };

    //Funcion para Ver Guía Existente
    /*const handleViewGuide = async (guideId: number) => {
        try {
            const res = await api.get(`/guides/${guideId}/pdf`, { responseType: 'blob' });
            const pdfUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            window.open(pdfUrl, '_blank');
        } catch (err) {
            alert("Error al abrir la guía");
        }
    };*/

    //Funcion para aprobar las Ventas (Cambiar estado a PAGADO) 
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
            //Enviamos status: 'CANCELADO' al método update del controlador
            await api.put(`/sales/${id}`, { status: 'CANCELADO' }); 
            alert("✅ Venta anulada.");
            fetchSales();
        } catch (err) {
            console.error("Error al anular la venta.", err);
            alert("❌ Error al anular la venta.");
        }
    };

    //Funcion para abrir el PDF de la venta
    const handleViewPDF = async (id: number) => { 
        try {
            //Pedir el PDF al API
            const res = await api.get(`/reports/sales/${id}`, { responseType: 'blob' });
            //Crear Blob y URL
            const pdfUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            //Abrir en nueva pestaña
            window.open(pdfUrl, '_blank');
        } catch (err) {
            console.error("Error al generar el PDF de la venta.", err);
            alert("❌ Error al generar el PDF de la venta.");
        }
    };

    //Funcion para reporte de inventario
    const handleInventoryReport = async () => {
        try {
            //Pedir el PDF al API
            const res = await api.get("/reports/inventory", { responseType: 'blob' });
            //Crear Blob y URL
            const pdfUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            //Abrir en nueva pestaña
            window.open(pdfUrl, '_blank');
        } catch (err) {
            alert("❌ Error al generar el reporte de inventario.");
        }
    };

    // Funcion para reporte mensual
    const handleMonthlyReport = async () => {
        const date = new Date();
        try{
            const res = await api.get(`/reports/monthly?month=${date.getMonth() + 1}&year=${date.getFullYear()}`, {
                responseType: 'blob'
            });
            const pdfUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            window.open(pdfUrl, '_blank');
        } catch (err) {
            console.error("Error al generar el reporte mensual.", err);
            alert("❌ Error reporte mensual.");
        }
    };

    // Renderizado del componente
    return (
        <div className="sales-container history-layout">
            <div className="history-header">
                <h2>📜 Historial de Ventas</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleMonthlyReport} className="btn-refresh" style={{background: '#3b82f6', color: 'white'}}>
                        📊 Reporte del Mes
                    </button>
                    <button onClick={handleInventoryReport} className="btn-refresh" style={{background: '#10b981', color: 'white'}}>
                        📦 Inventario
                    </button>
                    <button onClick={fetchSales} className="btn-refresh">🔄</button>
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

                    {/* CUERPO DE LA TABLA */}
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center">Cargando...</td></tr>
                        ) : sales.map((sale) => (
                            <tr key={sale.sale_id} className={sale.status === 'CANCELADO' ? 'row-cancelled' : ''}>
                                <td className="font-bold">#{sale.sale_id}</td>
                                <td>{new Date(sale.sale_date).toLocaleString()}</td>
                                <td>{sale.client ? sale.client.name : 'Público General'}</td>
                                <td className="font-bold text-green">S/. {Number(sale.total).toFixed(2)}</td>
                                <td><span className={`status-badge ${sale.status.toLowerCase()}`}>{sale.status}</span></td>
                                
                                {/* --- COLUMNA DE ACCIONES REDISEÑADA --- */}
                                <td className="text-center">
                                    <div className="action-buttons">
                                        
                                        {/* 1. BOLETA */}
                                        <button 
                                            onClick={() => handleViewPDF(sale.sale_id)} 
                                            className="btn-action-col pdf" 
                                            title="Ver Boleta"
                                        >
                                            <span className="icon">📄</span>
                                            <span className="label">Boleta</span>
                                        </button>

                                        {/* 2. DETALLES */}
                                        <button 
                                            onClick={() => setSelectedSale(sale)}
                                            className="btn-action-col view"
                                            title="Ver Detalles"
                                        >
                                            <span className="icon">👁️</span>
                                            <span className="label">Detalle</span>
                                        </button>

                                        {/* 3. APROBAR (Solo Pendientes) */}
                                        {sale.status === 'PENDIENTE' && (
                                            <button 
                                                onClick={() => handleApproveSale(sale.sale_id)}
                                                className="btn-action-col approve"
                                                title="Confirmar Pago"
                                            >
                                                <span className="icon">✅</span>
                                                <span className="label">Aprobar</span>
                                            </button>
                                        )}

                                        {/* 4. ANULAR (Solo si activo) */}
                                        {sale.status !== 'CANCELADO' && (
                                            <button 
                                                onClick={() => handleCancelSale(sale.sale_id)}
                                                className="btn-action-col cancel"
                                                title="Anular Venta"
                                            >
                                                <span className="icon">🚫</span>
                                                <span className="label">Anular</span>
                                            </button>
                                        )}

                                        {/* GUÍAS (Desactivadas por ahora) */}
                                        {/* <button className="btn-action-col disabled" title="Guías desactivadas">
                                            <span className="icon">🚚</span>
                                            <span className="label">Guía</span>
                                        </button> 
                                        */}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        
            {/* --- MODAL CREAR GUÍA --- */}
            <Modal isOpen={isGuideModalOpen} onClose={() => setGuideModalOpen(false)} title="Generar Guía de Remisión">
                <form onSubmit={handleSubmitGuide} className="guide-form">
                    <div className="form-group">
                        <label>Fecha de Traslado:</label>
                        <input 
                            type="date" 
                            required
                            className="input-field"
                            value={guideForm.transfer_date}
                            onChange={e => setGuideForm({...guideForm, transfer_date: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Conductor (Opcional):</label>
                        <input 
                            className="input-field"
                            placeholder="Nombre del Chofer"
                            value={guideForm.driver_name}
                            onChange={e => setGuideForm({...guideForm, driver_name: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Placa Vehículo (Opcional):</label>
                        <input 
                            className="input-field"
                            placeholder="ABC-123"
                            value={guideForm.vehicle_plate}
                            onChange={e => setGuideForm({...guideForm, vehicle_plate: e.target.value})}
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={() => setGuideModalOpen(false)} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">Generar Guía</button>
                    </div>
                </form>
            </Modal>

            {/* --- MODAL DE DETALLES --- */}
            <Modal 
                isOpen={!!selectedSale} 
                onClose={() => setSelectedSale(null)} 
                title={`Detalle Venta #${selectedSale?.sale_id}`}
            >
                {selectedSale && (
                    <div className="details-container">
                        <div className="info-grid">
                            <div>
                                <label className="text-gray-500 text-sm">Cliente:</label>
                                <p className="font-bold">{selectedSale.client?.name || 'Público General'}</p>
                            </div>
                            <div>
                                <label className="text-gray-500 text-sm">Vendedor:</label>
                                <p>{selectedSale.user?.name}</p>
                            </div>
                            <div>
                                <label className="text-gray-500 text-sm">Pago:</label>
                                <p>{selectedSale.payment_method}</p>
                            </div>
                            <div>
                                <label className="text-gray-500 text-sm">Fecha:</label>
                                <p>{new Date(selectedSale.sale_date).toLocaleString()}</p>
                            </div>
                        </div>

                        <hr className="my-4 border-gray-200" />

                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Producto</th>
                                    <th className="text-center py-2">Cant.</th>
                                    <th className="text-right py-2">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedSale.details.map(d => (
                                    <tr key={d.detail_id} className="border-b border-gray-100">
                                        <td className="py-2">{d.product?.name || "(Eliminado)"}</td>
                                        <td className="text-center">{d.quantity}</td>
                                        <td className="text-right">S/. {Number(d.subtotal).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-4 text-right">
                            <span className="text-lg font-bold">Total: S/. {Number(selectedSale.total).toFixed(2)}</span>
                        </div>

                        <div className="modal-actions mt-6">
                            <button onClick={() => setSelectedSale(null)} className="btn-secondary w-full">
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SalesHistory;//Exportar el componente SalesHistory para su uso en otras partes de la aplicacion
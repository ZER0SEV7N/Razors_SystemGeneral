//adminventasfrontend/src/pages/dashboard.tsx
/*Página del Dashboard del sistema de administración
  Funcionalidades claves:
    - Mostrar estadísticas clave del sistema
    - Visualizar resumen de productos, categorías y usuarios
    - Proporcionar acceso rápido a funciones comunes
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Para navegación fluida
import api from "../lib/api";
import { useAuth } from "../context/AuthContext"; // Usamos el hook de seguridad
import type { DashboardStats, Sale } from "../types/index"; // Tipos definidos en src/types/index.ts
import { DollarSign, Package, ShoppingCart, AlertTriangle, TrendingUp, Layers } from "lucide-react";
import "../pages/css/dashboard.css"; //Importar estilos específicos para el dashboard

//Componente de la página del Dashboard
const Dashboard = () => {
  const { user } = useAuth(); //Obtener el contexto de autenticacion
  const navigate = useNavigate(); //Hook para la navegacion entre paginas
  
  //Estado para almacenar las estadísticas del dashboard
  const [stats, setStats] = useState<DashboardStats | null>(null); //Estado para almacenar las estadísticas del dashboard
  const [loading, setLoading] = useState<boolean>(true); //Estado para manejar la carga de datos
  const [recentSales, setRecentSales] = useState<Sale[]>([]); //Estado para almacenar las ventas recientes

  //Cargar las estadísticas del dashboard al montar el componente
  useEffect(() => {
    //Funcion para cargar estadisticas del dashboard desde la API
    const fetchStats = async () => {
      //Realizar la solicitud a la API
      try {
        const res = await api.get("/dashboard/stats"); //Realizar solicitud GET a la API
        setStats(res.data); //Actualizar el estado con las estadísticas recibidas

        //Si el backend envía las ventas recientes, las guardamos
        if (res.data.recent_sales) {
          setRecentSales(res.data.recent_sales);
        }
      }catch (error) {
        console.error("Error fetching dashboard stats:", error); //Manejar errores de la solicitud
      } finally {
        setLoading(false); //Actualizar el estado de carga
      }
    };
    fetchStats(); //Llamar a la función para cargar las estadísticas al montar el componente
  }, []);

  if (loading) {
    return <div className="dashboard-container">Cargando estadísticas del dashboard...</div>; //Mostrar mensaje de carga mientras se obtienen los datos
  }

  //Logica para determinar si el stock es bajo
  const hasLowStock = stats?.low_stock_count && stats.low_stock_count > 0;

  //Renderizar el componente del dashboard
  return (
        <div className="dashboard-container">
            {/* --- HEADER --- */}
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p className="dashboard-subtitle">
                    Bienvenido de nuevo, <strong>{user?.name}</strong>. 
                    {user?.branch ? ` Sede: ${user.branch.name}` : ''}
                </p>
            </div>

            {/* --- GRID DE TARJETAS (KPIs) --- */}
            <div className="stats-grid">
                
                {/* 1. Ventas del Mes (Verde) */}
                {stats?.sales_month !== undefined && (
                    <div className="stat-card card-green">
                        <h3 className="stat-title">
                            <TrendingUp size={16} style={{ display: 'inline', marginRight: '5px' }} />
                            Ventas del Mes
                        </h3>
                        <p className="stat-value">
                            S/. {Number(stats.sales_month).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                )}

                {/* 2. Ventas Hoy (Azul) */}
                {stats?.sales_today !== undefined && (
                    <div className="stat-card card-blue">
                        <h3 className="stat-title">
                            <DollarSign size={16} style={{ display: 'inline', marginRight: '5px' }} />
                            Ventas Hoy
                        </h3>
                        <p className="stat-value">
                            S/. {Number(stats.sales_today).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                )}

                {/* 3. Total Productos (Violeta) */}
                <div className="stat-card card-violet">
                    <h3 className="stat-title">
                        <Layers size={16} style={{ display: 'inline', marginRight: '5px' }} />
                        Total Productos
                    </h3>
                    <p className="stat-value">
                        {stats?.total_products || 0}
                    </p>
                </div>

                {/* 4. Stock Crítico (Rojo si hay alerta, Verde si no) */}
                <div className={`stat-card ${hasLowStock ? 'card-red' : 'card-green'}`}>
                    <h3 className="stat-title">
                        <AlertTriangle size={16} style={{ display: 'inline', marginRight: '5px' }} />
                        Stock Crítico
                    </h3>
                    <div className="stat-value">
                        {stats?.low_stock_count || 0}
                        {hasLowStock && <span className="alert-text">Atención</span>}
                    </div>
                </div>

                {/* 5. Valor Inventario (Naranja) */}
                {stats?.inventory_value !== undefined && (
                    <div className="stat-card card-orange">
                        <h3 className="stat-title">
                            <ShoppingCart size={16} style={{ display: 'inline', marginRight: '5px' }} />
                            Valor Inventario
                        </h3>
                        <p className="stat-value">
                            S/. {Number(stats.inventory_value).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                )}
            </div>

            {/* --- ACCIONES RÁPIDAS --- */}
            <div className="quick-actions-container">
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#333' }}>Acciones Rápidas</h3>
                <div className="quick-actions-grid">
                    <button 
                        className="btn-action btn-blue"
                        onClick={() => navigate('/inventory')}
                    >
                        <Package size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
                        Gestionar Inventario
                    </button>
                    
                    <button 
                        className="btn-action btn-green" 
                        onClick={() => navigate('/sales')}
                    >
                        <ShoppingCart size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
                        Generar Venta
                    </button>
                </div>
            </div>
            {/* --- TABLA DE ÚLTIMAS VENTAS (Faltaba esta sección) --- */}
            <div style={{ marginTop: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '15px' }}>Últimas Ventas</h3>
                
                <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div className="table-responsive" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <tr>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>ID</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>CLIENTE</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>TOTAL</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>ESTADO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSales.length > 0 ? (
                                    recentSales.map((sale) => (
                                        <tr key={sale.sale_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px 20px', color: '#334155' }}>#{String(sale.sale_id).padStart(6, '0')}</td>
                                            <td style={{ padding: '12px 20px', color: '#334155' }}>{sale.client ? sale.client.name : 'Público General'}</td>
                                            <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#0f172a' }}>
                                                S/. {Number(sale.total).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ padding: '12px 20px' }}>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold',
                                                    backgroundColor: sale.status === 'PAGADO' ? '#dcfce7' : '#fee2e2',
                                                    color: sale.status === 'PAGADO' ? '#166534' : '#991b1b'
                                                }}>
                                                    {sale.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                                            No hay ventas recientes.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
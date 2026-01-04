//adminventasfrontend/src/pages/dashboard.tsx
/*Página del Dashboard del sistema de administración
  Funcionalidades claves:
    - Mostrar estadísticas clave del sistema
    - Visualizar resumen de productos, categorías y usuarios
    - Proporcionar acceso rápido a funciones comunes
 */
import { useEffect, useState } from "react";
import api from "../lib/api";
import "../pages/css/dashboard.css"; //Importar estilos específicos para el dashboard

//Definir la interfaz para las estadísticas del dashboard
interface DashboardStats {
  total_products: number;
  low_stock_count: number;
  total_categories: number;
  total_users: number;
  inventory_value: number;
}

interface User {
    name: string;
    email: string;
}

//Componente de la página del Dashboard
const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null); //Estado para almacenar las estadísticas del dashboard
  const [loading, setLoading] = useState<boolean>(true); //Estado para manejar la carga de datos
  const [user, setUser] = useState<User | null>(null); //Estado para almacenar el nombre del usuario

  useEffect(() => {
    //Cargar el nombre del usuario desde el almacenamiento local
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    //Funcion para cargar estadisticas del dashboard desde la API
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/stats"); //Realizar solicitud GET a la API
        setStats(res.data); //Actualizar el estado con las estadísticas recibidas
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
      {/*Seccion de Bienvenida*/}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">
          Bienvenido de nuevo, <strong>{user?.name || "Usuario"} </strong>
          Aqui tienes un resumen de las estadísticas clave.
        </p>
      </div>

      {/*Seccion de Estadisticas*/}
      <div className="stats-grid">
        {/*Tarjeta de Total de Productos*/}
        <StatCard
          title="Total de Productos"
          value={stats?.total_products || 0}
          icon="📦"
          color="#4CAF50"
        />
        {/*Tarjeta de Productos con Bajo Stock*/}
        <StatCard
          title="Stock Crítico"
          value={stats?.low_stock_count || 0}
          icon="⚠️"
          variant={hasLowStock ? "card-red" : "card-green"}
          isAlert={hasLowStock}
        />
        {/*Tarjeta de Total de Categorías*/}
        <StatCard
          title="Total de Categorías"
          value={stats?.total_categories || 0}
          icon="🗂️"
          variant="card-violet"
        />
        {/* Valor Inventario */}
        <div className="stat-card card-orange">
            <h3 className="stat-title">Valor del Inventario</h3>
            <p className="stat-value">
                ${Number(stats?.inventory_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        {/* 3. Accesos Rápidos (Quick Actions) */}
        <div className="quick-actions-container">
            <h3>Acciones Rápidas</h3>
            <div className="quick-actions-grid">
                <button 
                    className="btn-action btn-blue"
                    onClick={() => window.location.href='/products'}
                >
                    📦 Gestionar Inventario
                </button>
                <button className="btn-action btn-green">
                    🛒 Nueva Venta (Próximamente)
                </button>
            </div>
          </div>
      </div>
    </div>
  )
}
// Componente auxiliar para las tarjetas
// Props: title, value, variant (clase css), isAlert (booleano)
const StatCard = ({ title, value, variant, isAlert }: any) => (
    <div className={`stat-card ${variant}`}>
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">
            {value}
            {isAlert && <span className="alert-text">⚠️ Acción requerida</span>}
        </p>
    </div>
);

export default Dashboard;
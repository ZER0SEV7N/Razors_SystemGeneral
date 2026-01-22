import ReactDOM from 'react-dom/client'
import App from './App'

// ===============================================
// 🎨 AQUÍ IMPORTAMOS LOS ESTILOS GLOBALES
// ===============================================
import '../src/App.css'  // Colores y reset básico
import './components/css/layout.css'  // Sidebar y Navbar
import './pages/css/ui.css'      // Botones, Tablas y Modales

// Nota: Login.css y sales.css se importan dentro de sus propias páginas
// porque son estilos muy específicos que no queremos en toda la app.

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <App />
)
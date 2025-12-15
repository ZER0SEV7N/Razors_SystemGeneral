//AdminVentasFrontend/src/App.tsx
/*--------------------------------------------------------------------
    Componente principal de la aplicacion AdminVentasFrontend
    - Configuracion de rutas
    - Estructura base de la aplicacion
--------------------------------------------------------------------*/
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; //Importar componentes de react-router-dom para la navegacion
import Login from "./pages/Login"; //Importar la pagina de Login

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} /> {/* Ruta para la pagina de Login */}
                {/* Otras rutas pueden ser agregadas aqui */}
            </Routes>
        </Router>
    );
}
export default App;

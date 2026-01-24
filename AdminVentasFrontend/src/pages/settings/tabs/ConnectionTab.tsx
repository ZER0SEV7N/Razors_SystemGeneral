/*--------------------------------------------------------------------
   Pestaña de Conexión
   - Permite definir manualmente la IP del backend.
   - Guarda el valor en localStorage para que config.tsx lo lea.
--------------------------------------------------------------------*/
import { useState, useEffect } from "react";
import { API_URL } from "../../../lib/config"; // Importamos para mostrar la URL actual
import { Wifi, RefreshCw, AlertTriangle, Monitor } from "lucide-react";

const ConnectionTab = () => {
    const [ip, setIp] = useState("");

    // Al cargar, leemos si ya existe una IP guardada
    useEffect(() => {
        const stored = localStorage.getItem("server_ip");
        // Si hay guardada, la usamos. Si no, intentamos sugerir la actual
        setIp(stored || window.location.hostname);
    }, []);

    const handleSave = () => {
        if (!ip.trim()) return;
        
        const confirmMessage = "⚠️ El sistema se reiniciará para aplicar la nueva configuración.\n\n¿Estás seguro de cambiar la IP del servidor?";
        
        if(window.confirm(confirmMessage)) {
            localStorage.setItem("server_ip", ip);
            window.location.reload(); // Recarga forzada para que config.tsx lea el nuevo valor
        }
    };

    const handleReset = () => {
        if(window.confirm("¿Restablecer configuración a valores por defecto (localhost)?")) {
            localStorage.removeItem("server_ip");
            window.location.reload();
        }
    };

    return (
        <div>
            <h3 className="settings-section-title">Conexión de Red</h3>
            
            {/* Tarjeta de Información */}
            <div style={{
                background: '#eff6ff', 
                padding: '20px', 
                borderRadius: '8px', 
                marginBottom: '24px', 
                display: 'flex', 
                gap: '15px', 
                alignItems: 'flex-start',
                border: '1px solid #dbeafe'
            }}>
                <Wifi className="text-primary" size={28} style={{marginTop: 4}} />
                <div>
                    <h4 style={{margin: '0 0 8px 0', color: '#1e40af'}}>Configuración de IP del Servidor</h4>
                    <p style={{margin: 0, fontSize: '0.9rem', color: '#3b82f6', lineHeight: '1.5'}}>
                        Si estás usando este sistema en una red local (LAN), ingresa aquí la dirección IP de la computadora donde está instalado el Backend (Laravel).
                        <br/>
                        <strong>Ejemplo:</strong> Si el servidor es <code>192.168.1.50</code>, escribe eso abajo.
                    </p>
                </div>
            </div>

            {/* Formulario */}
            <div className="form-group">
                <label style={{fontWeight: 600, color: '#475569', marginBottom: 8, display: 'block'}}>
                    Dirección IP o Hostname
                </label>
                <div style={{display: 'flex', gap: '10px', maxWidth: '500px'}}>
                    <div style={{position: 'relative', flex: 1}}>
                        <Monitor size={18} style={{position: 'absolute', left: 12, top: 12, color: '#94a3b8'}}/>
                        <input 
                            className="input-field" 
                            style={{paddingLeft: '38px'}}
                            value={ip} 
                            onChange={e => setIp(e.target.value)} 
                            placeholder="Ej: 192.168.1.50"
                        />
                    </div>
                    <button className="btn-primary" onClick={handleSave}>
                        <RefreshCw size={16} style={{marginRight: 6}}/> 
                        Aplicar y Reiniciar
                    </button>
                </div>
            </div>

            {/* Footer con Estado Actual */}
            <div style={{marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '20px'}}>
                <div style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '15px'}}>
                    Estado actual: Conectado a <strong>{API_URL}</strong>
                </div>
                
                <button 
                    onClick={handleReset} 
                    style={{
                        background: 'none', 
                        border: 'none', 
                        color: '#ef4444', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: 0, 
                        fontSize: '0.85rem',
                        fontWeight: 500
                    }}
                >
                    <AlertTriangle size={14}/> Restablecer a valores por defecto
                </button>
            </div>
        </div>
    );
};

export default ConnectionTab;
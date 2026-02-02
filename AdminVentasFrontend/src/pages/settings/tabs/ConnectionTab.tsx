import { useState, useEffect } from "react";
import { API_URL } from "../../../lib/config"; 
import { Wifi, RefreshCw, AlertTriangle, Monitor } from "lucide-react";

const ConnectionTab = () => {
    const [ip, setIp] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("server_ip");
        setIp(stored || window.location.hostname);
    }, []);

    const handleSave = () => {
        if (!ip.trim()) return;
        if(window.confirm("⚠️ El sistema se reiniciará para aplicar la nueva IP.\n¿Continuar?")) {
            localStorage.setItem("server_ip", ip);
            window.location.reload();
        }
    };

    const handleReset = () => {
        if(window.confirm("¿Restablecer a valores por defecto (localhost)?")) {
            localStorage.removeItem("server_ip");
            window.location.reload();
        }
    };

    return (
        <div style={{maxWidth: '600px'}}>
            <h3 className="settings-section-title">Conexión de Red Local</h3>
            
            {/* Tarjeta Informativa */}
            <div style={{
                background: '#eff6ff', 
                padding: '20px', 
                borderRadius: '8px', 
                marginBottom: '24px', 
                display: 'flex', gap: '15px', alignItems: 'flex-start',
                border: '1px solid #dbeafe'
            }}>
                <Wifi className="text-primary" size={24} style={{color: 'var(--primary)', marginTop: 4}} />
                <div>
                    <h4 style={{margin: '0 0 8px 0', color: '#1e40af', fontSize: '1rem'}}>Configurar Servidor Backend</h4>
                    <p style={{margin: 0, fontSize: '0.9rem', color: '#1e3a8a', lineHeight: '1.5'}}>
                        Si usas la app en otros dispositivos de la misma red Wi-Fi, ingresa aquí la IP de la computadora principal (Servidor).
                        <br/><br/>
                        <strong>IP Actual detectada:</strong> {window.location.hostname}
                    </p>
                </div>
            </div>

            <div className="form-group">
                <label>Dirección IP o Hostname del Servidor</label>
                <div style={{display: 'flex', gap: '10px'}}>
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
                        <RefreshCw size={16}/> Aplicar
                    </button>
                </div>
            </div>

            <div style={{marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '20px'}}>
                <div style={{fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '15px'}}>
                    Conectado a: <code>{API_URL}</code>
                </div>
                
                <button onClick={handleReset} className="btn-danger" style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem'}}>
                    <AlertTriangle size={14}/> Restablecer conexión por defecto
                </button>
            </div>
        </div>
    );
};

export default ConnectionTab;
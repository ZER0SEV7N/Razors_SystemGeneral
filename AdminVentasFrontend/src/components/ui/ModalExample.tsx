//adminVentasFrontend/src/components/ui/ModalExample.tsx
//Componente que muestra un modal base para ser reutilizado en diferentes partes de la aplicación.
//Importaciones necesarias desde React y librerías de UI.
import React from 'react';
import "../css/Modal.css"; // Importación del archivo CSS para estilos del modal

//Interface para las props del componente ModalExample
interface ModalProps{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

//Componente funcional ModalExample
const Modal = ({ isOpen, onClose, title, children}: ModalProps) => {
    //Si el modal no está abierto, no renderiza nada
    if (!isOpen) return null;

    //Funcion para cerrar el modal al hacer clic fuera del contenido
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    //Funcion para manejar el cierre del modal al presionar la tecla Escape
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    //Renderizado del modal
    return (
        <div className="modal-overlay" onClick={handleOverlayClick} onKeyDown={handleKeyDown} tabIndex={0}>
            <div className="modal-container">
                {/* Encabezado del modal con título y botón de cierre */}
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close-button" onClick={onClose}>&times;</button>
                </div>
                {/* Contenido del modal */}
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal;


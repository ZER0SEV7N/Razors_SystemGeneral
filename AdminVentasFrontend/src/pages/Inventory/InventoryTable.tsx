//adminVentaFrontend/src/pages/Inventory/InventoryTable.tsx
//Componente para mostrar la tabla de inventario de productos
//--------------------------------------------------------------------
//Funcionalidades principales:
//- Mostrar lista de productos con detalles
//- Botones de accion para editar, eliminar y distribuir stock
//--------------------------------------------------------------------


import type { Product } from "../../types"; //Importar la interfaz Product desde los tipos globales
import { API_URL } from "../../lib/config";
//Interfaces de Props
interface Props {
  products: Product[]; //Lista de productos
  onEdit: (product: Product) => void; //Función para editar un producto
  isOwner: boolean;
  stockTitle?: string; // NUEVA PROP OPCIONAL
  onDelete: (id: number) => void; //Función para eliminar un producto
  onDistribute: (p: Product) => void; //Función para distribuir stock a sucursales
  //Nueva prop para saber si estamos en modo "Vista de Dios"
  isGlobalView: boolean;
}

//Componente ProductsTable
const InventoryTable = ({ products, onEdit, isOwner,stockTitle, onDelete, onDistribute, isGlobalView }: Props) => {
  //funcion Helper para obtener la URL completa de la imagen del producto
  const getImageUrl = (imagePath?: string) => {
    if(!imagePath) return "https://placehold.co/50x50?text=No+Img"; //Placeholder si no hay foto
    if (imagePath.startsWith("http")) return imagePath; //Si ya es una URL completa
    //Construir la URL completa usando la URL base de la API
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}/storage/${imagePath}`;
  };
  
  //Renderizado del componente
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
            <tr>
              <th style={{ width: '60px' }}>Imagen</th>
              <th style={{ width: '25%' }}>Nombre</th>
              <th style={{ width: '15%' }}>Categoría</th>
              <th style={{ width: '10%' }}>Precio</th>
              <th style={{ width: '10%' }}>{stockTitle || (isOwner ? "Stock Total" : "Stock Local")}</th>
              <th style={{ width: '10%' }}>Estado</th>
              {isOwner && <th style={{ width: '100px', textAlign: 'center' }}>Acciones</th>}
            </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr><td colSpan={7} className="text-center">No hay productos.</td></tr>
          ) : products.map((p) => {
            
            // --- LOGICA CORREGIDA DE VISUALIZACIÓN ---
            let displayStock = p.stock; 
            let stockBreakdown = null;

            // Si es Owner en Vista Global, sumamos TODAS las sucursales (incluida la Central)
            if (isGlobalView && p.branches) {
              const branchesTotal = p.branches.reduce((acc, b) => acc + (b.pivot?.stock || 0), 0);
              // Ahora displayStock es puramente la suma de las sucursales (porque p.stock base es 0)
              displayStock = branchesTotal; 

              // --- DESGLOSE VISUAL LIMPIO ---
              stockBreakdown = (
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', lineHeight: '1.4' }}>
                  {p.branches.map(b => {
                    const qty = b.pivot?.stock || 0;
                    if (qty === 0) return null; // Opcional: Ocultar si es 0

                    // Si es la Principal, la pintamos azul y con icono de fábrica
                    const isMain = b.is_main || b.name.includes("Central") || b.name.includes("Principal");
                    
                    return (
                        <div key={b.branch_id} style={{
                            color: isMain ? '#2563eb' : 'inherit', 
                            fontWeight: isMain ? '700' : '400'
                        }}>
                            {isMain ? '🏭' : '🏪'} {b.name}: <b>{qty}</b>
                        </div>
                    );
                  })}
                </div>
              );
            }

            return (
              <tr key={p.product_id} style={{ opacity: p.is_active ? 1 : 0.6 }}>
                <td>
                  <img 
                    src={getImageUrl(p.image)} 
                    alt={p.name}
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/50x50?text=IMG"; }}
                    style={{width: 40, height: 40, borderRadius: 4, objectFit: 'cover'}}
                  />
                </td>
                
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.description?.substring(0,30) || 'Sin descripción'}...</div>
                </td>

                <td>
                  <span style={{ background: '#eff6ff', color: 'var(--primary)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 500 }}>
                    {p.category?.name || "S/C"}
                  </span>
                </td>

                <td style={{ fontWeight: 600 }}>S/. {Number(p.price).toFixed(2)}</td>

                {/* COLUMNA STOCK CORREGIDA */}
                <td>
                  <span style={{ 
                    fontWeight: 'bold', 
                    fontSize: '1.1rem',
                    color: displayStock <= p.min_stock ? '#ef4444' : '#1e293b'
                    }}>
                    {displayStock}
                  </span>
                  {stockBreakdown}
                </td>

                <td>
                  <span className={`status-badge ${p.is_active ? 'active' : 'inactive'}`}>
                    {p.is_active ? "Activo" : "Inactivo"}
                  </span>
                </td>

                {isOwner && (
                  <td className="text-center">
                    <div className="action-buttons">
                      {isGlobalView && (
                        <button onClick={() => onDistribute(p)} className="btn-icon btn-distribute" title="Distribuir a Sucursales">
                          🚚
                        </button>
                      )}
                      <button onClick={() => onEdit(p)} className="btn-icon" title="Editar">
                        ✏️
                      </button>
                      <button onClick={() => onDelete(p.product_id)} className="btn-icon btn-danger" title="Borrar">
                        🗑️
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
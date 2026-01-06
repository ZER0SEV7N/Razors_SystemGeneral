//adminVentaFrontend/src/pages/products/ProductsTable.tsx
//Componente para mostrar la tabla de productos
// - Recibe una lista de productos y dos funciones para editar y desactivar productos
import type { Product } from "../../types"; //Importar la interfaz Product desde los tipos globales
import { API_URL } from "../../lib/config";
//Interfaces de Props
interface Props {
  products: Product[]; //Lista de productos
  onEdit: (product: Product) => void; //Función para editar un producto
  onDeactivate: (id: number) => void; //Función para desactivar un producto
  onActivate?: (id: number) => void; //Función para reactivar un producto (opcional)
}

//Componente ProductsTable
const ProductsTable = ({ products, onEdit, onDeactivate, onActivate }: Props) => {
  //funcion Helper para obtener la URL completa de la imagen del producto
  const getImageUrl = (imagePath?: string) => {
    if(!imagePath) return "https://placehold.co/50x50?text=No+Img"; //Placeholder si no hay foto
    if (imagePath.startsWith("http")) return imagePath; //Si ya es una URL completa
    //Construir la URL completa usando la URL base de la API
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}/storage/${imagePath}`;

  }
  
  //Renderizado del componente
  return (
    <div className="table-responsive">
      <table className="products-table">
        <thead>
            <tr>
            <th style={{ width: '60px' }}>Imagen</th>
            <th style={{ width: '25%' }}>Nombre</th>
            <th style={{ width: '15%' }}>Categoría</th>
            <th style={{ width: '10%' }}>Precio</th>
            <th style={{ width: '10%' }}>Stock</th>
            <th style={{ width: '10%' }}>Estado</th>
            <th style={{ width: '100px', textAlign: 'center' }}>Acciones</th>
            </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.product_id} className={p.stock <= p.min_stock ? "low-stock-row" : ""}>
              <td>
                <img 
                  src={getImageUrl(p.image)} 
                  alt={p.name}
                  onError={(e) => { e.currentTarget.src = "https://placehold.co/50x50?text=IMG"; }}
                  className="product-img"
                />
              </td>
              
              {/*2. NOMBRE*/}
              <td>
                <div className="product-name">{p.name}</div>
                <div className="product-desc">{p.description?.substring(0, 40) || 'Sin descripción'}...</div>
              </td>

              {/*3. CATEGORÍA */}
              <td>
                <span className="category-tag">{p.category?.name || "Sin Categoría"}</span>
              </td>

              {/*4. PRECIO */}
              <td style={{ fontWeight: 600 }}>${Number(p.price).toFixed(2)}</td>

              {/*5. STOCK */}
              <td>
                <span style={{ color: p.stock <= p.min_stock ? 'red' : 'inherit', fontWeight: 'bold' }}>
                  {p.stock}
                </span>
              </td>

              {/*6. ESTADO */}
              <td>
                <span className={`status-badge ${p.is_active ? 'active' : 'inactive'}`}>
                  {p.is_active ? "Activo" : "Inactivo"}
                </span>
              </td>

              {/*7. ACCIONES */}
              <td className="actions-cell">
                <div className="action-buttons">
                  <button className="btn-icon edit" onClick={() => onEdit(p)} title="Editar">✏️</button>
                    {p.is_active ? (
                      <button className="btn-icon delete" onClick={() => onDeactivate(p.product_id)} title="Desactivar">🗑️</button>
                    ) : (
                      onActivate && <button className="btn-icon restore" onClick={() => onActivate(p.product_id)} title="Reactivar">♻️</button>
                    )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;

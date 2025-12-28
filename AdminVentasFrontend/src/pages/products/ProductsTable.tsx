//adminVentaFrontend/src/pages/products/ProductsTable.tsx
//Componente para mostrar la tabla de productos
// - Recibe una lista de productos y dos funciones para editar y desactivar productos

//Interfaces de Props
interface Props {
  products: any[]; //Lista de productos
  onEdit: (product: any) => void; //Función para editar un producto
  onDeactivate: (id: number) => void; //Función para desactivar un producto
}

//Componente ProductsTable
const ProductsTable = ({ products, onEdit, onDeactivate }: Props) => {
  //Renderizado del componente
  return (
    <table className="products-table">
      {/* Cabecera de la tabla */}
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      {/* Cuerpo de la tabla */}
      <tbody>
        {products.map((p) => (
          <tr key={p.id} className={p.stock <= p.min_stock ? "low-stock" : ""}>
            <td>{p.name}</td>
            <td>{p.description}</td>
            <td>{p.category?.name}</td>
            <td>{p.price}</td>
            <td>{p.stock}</td>
            <td>{p.is_active ? "Activo" : "Inactivo"}</td>
            {/* Acciones que se pueden realizar sobre el producto */}
            <td className="actions">
              <button onClick={() => onEdit(p)}>Editar</button>
              <button onClick={() => onDeactivate(p.id)}>Desactivar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProductsTable;

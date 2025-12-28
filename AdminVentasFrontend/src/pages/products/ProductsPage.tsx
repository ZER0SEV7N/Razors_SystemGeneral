//AdminVentasFrontend/src/pages/Products.tsx
/*--------------------------------------------------------------------
    Pagina principal para gestion de productos
    - Principales funcionalidades:
        - Listado de productos
        - Busqueda y filtrado
        - Integracion con API para obtener datos de productos
--------------------------------------------------------------------*/
import { useEffect, useState } from "react"; //Importar useEffect y useState para manejar el estado y ciclo de vida del componente
import api from "../../lib/api"; //Importar la instancia de axios configurada para realizar solicitudes a la API
import ProductsTable from "./ProductsTable"; //Importar el componente ProductsTable
import ProductForm from "./ProductForm"; //Importar el componente ProductForm
import "../css/products.css"; //Importar estilos CSS para la pagina de productos

//Funcion componente para la pagina de productos
const ProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]); //Estado para almacenar la lista de productos
  const [editingProduct, setEditingProduct] = useState<any | null>(null); //Estado para el producto que se esta editando
  const [showForm, setShowForm] = useState(false); //
  const [showInactive, setShowInactive] = useState(false);

  const fetchProducts = async () => {
  const res = showInactive
    ? await api.get("/products-inactive")
    : await api.get("/products");

    setProducts(res.data);
  };

  const deactivateProduct = async (id: number) => {
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, [showInactive]);

  return (
    <div className="products-page">
      <header>
        <h2>Productos</h2>

        <button onClick={() => {
          setEditingProduct(null);
          setShowForm(true);
        }}>
          + Nuevo Producto
        </button>

        <label>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={() => setShowInactive(!showInactive)}
          />
          Ver inactivos
        </label>
      </header>

      <ProductsTable
        products={products}
        onEdit={(product) => {
          setEditingProduct(product);
          setShowForm(true);
        }}
        onDeactivate={deactivateProduct}
      />

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSuccess={() => {
            fetchProducts();
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default ProductsPage;

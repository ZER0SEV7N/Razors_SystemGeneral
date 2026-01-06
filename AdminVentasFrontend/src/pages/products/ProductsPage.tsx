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
import ProductFilters from "./ProductFilters"; //Importar el componente ProductFilters
import Modal from "../../components/ui/ModalExample"; //Importar el componente ModalExample
import type { Product } from "../../types"; //Importar la interfaz Product desde los tipos globales
import "../css/products.css"; //Importar estilos CSS para la pagina de productos

//Funcion componente para la pagina de productos
const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]); //Estado para almacenar la lista de productos
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined); //Estado para el producto que se esta editando
  const [showForm, setShowForm] = useState(false); //Estado para controlar la visibilidad del formulario de producto
  const [loading, setLoading] = useState(false); //Estado para indicar si se estan cargando los productos
  //Estado para los filtros de productos
  const [filters, setFilters] = useState({
    search: "", category_id: "", low_stock: false, show_inactive: false, price_min: "", price_max: ""
  });

  //Funcion para obtener la lista de productos desde la API
  const fetchProducts = async () => {
    setLoading(true);
    try{
      //Construir los parametros de consulta basados en los filtros
      const params = new URLSearchParams();
      if(filters.search) params.append("search", filters.search); //Filtro de busqueda
      if(filters.category_id) params.append("category_id", filters.category_id); //Filtro por categoria
      if(filters.low_stock) params.append("low_stock", "true"); //Filtro por bajo stock
      if(filters.show_inactive) params.append("show_inactive", "true"); //Filtro para mostrar inactivos
      if(filters.price_min) params.append("price_min", filters.price_min); //Filtro por precio minimo
      if(filters.price_max) params.append("price_max", filters.price_max); //Filtro por precio maximo
      //Realizar la solicitud a la API con los parametros de filtro
      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.data); //Actualizar el estado con los productos obtenidos
    } catch (error) {
      console.error("Error fetching products:", error);
    }finally {
      setLoading(false);
    }
  };

  //Usar useEffect para cargar los productos cuando los filtros cambien
  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 400); //Agregar un retraso para evitar demasiadas solicitudes
    return () => clearTimeout(timer);
  }, [filters]);

  /*-------------------------------------------------------------------
  //Renderizar la pagina de productos
  -------------------------------------------------------------------*/
  return (
    <div className="products-page">
      {/*------- Cabecera ---------*/}
      <header className="header-actions">
        <h2>Inventario</h2>
        <button className="btn-primary" onClick={() => { setEditingProduct(undefined); setShowForm(true); }}>
          + Nuevo Producto
        </button>
      </header>{/*------- Tabla de productos ---------*/}
      {/*------- Filtros de productos ---------*/}
      <ProductFilters filters={filters} onChange={setFilters} />
      {loading ? <div className="loading-indicator">Cargando productos...</div> : (
        
        <ProductsTable
          products={products}
          onEdit={(p) => { setEditingProduct(p); setShowForm(true); }}
          onDeactivate={async (id) => { await api.delete(`/products/${id}`); fetchProducts(); }}
          onActivate={async (id) => { await api.put(`/products/${id}/reactivate`); fetchProducts(); }}
        />
      )}
      {/*------- Formulario de producto ---------*/}
      <Modal isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
      >
        <ProductForm 
          product={editingProduct} 
          onSuccess={() => { fetchProducts(); 
            setShowForm(false);
            setEditingProduct(undefined); 
          }}
          onCancel={() => {
            setShowForm(false); //Cierra el modal al cancelar
            setEditingProduct(undefined);
          }} 
              />
      </Modal>
    </div>
  );
};

export default ProductsPage; //Exportar el componente ProductsPage
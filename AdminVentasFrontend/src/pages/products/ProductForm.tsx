//AdminVentasFrontend/src/pages/products/ProductForm.tsx
/*--------------------------------------------------------------------
    Componente de formulario para crear o editar productos
    - Principales funcionalidades:
        - Campos para nombre, precio, categoría y stock
        - Validación de campos
        - Integración con API para crear o actualizar productos
--------------------------------------------------------------------*/
import { useState, useEffect } from "react"; //Importar useState y useEffect para manejar el estado y ciclo de vida del componente
import api from "../../lib/api"; //Importar la instancia de axios configurada para realizar solicitudes a la API
import CategoriesModal from "../../components/ui/CategoriesModal";
import "../css/products.css"; //Importar estilos CSS para la pagina de productos
import type { Category } from "../../types";

//Definir la interfaz 
interface Props {
    product?: any; //Producto a editar (opcional)
    onSuccess: () => void; //Función a llamar después de una creación o edición exitosa
    onCancel?: () => void; //Función a llamar al cancelar (opcional)
}

//Funcion componente para el formulario de productos
const ProductForm = ({ product, onSuccess, onCancel }: Props) =>{
    const [categories, setCategories] = useState<Category[]>([]); //Estado para almacenar la lista de categorías
    const [showCategoryModal, setShowCategoryModal] = useState(false); //Estado para mostrar/ocultar el modal de categorías
    const [loading, setLoading] = useState(false); // Estado para evitar doble click
    //Estado para manejar la carga de la imagen
    const [image, setImage] = useState<File | null>(null);
    
    //Estado para los campos del formulario
    const [form, setForm] = useState({
        name: "",
        description: "",
        category_id: "",
        price: "",
        stock: "",
        min_stock: "",
    });

    //===========FUNCIONES=========================

    //Cargar las categorías al montar el componente
    const fetchCategories = async () => {
        const res = await api.get("/categories");
        setCategories(res.data.filter((c: any) => c.is_active)); //Filtrar solo categorías activas
    };

    //Usar useEffect para cargar las categorías al montar el componente
    useEffect(() => {
        fetchCategories();
    }, []);

    //Cargar los datos del producto en el formulario si se proporciona un producto
    useEffect(() => {
        if (product) {
          setForm({
            name: product.name || "",
            description: product.description || "",
            category_id: product.category_id?.toString() || "",
            price: product.price?.toString() || "",
            stock: product.stock?.toString() || "",
            min_stock: product.min_stock?.toString() || "",
          });
        }
    }, [product]);

    //Manejar el cambio en los campos del formulario
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, type } = e.target;
      const value = type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setForm({ ...form, [name]: value });
    };

    //Manejar el envío del formulario
    const submitForm = async () => {
        if (!form.name || !form.category_id || !form.price) {
          alert("Nombre, categoría y precio son obligatorios");
          return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("description", form.description);
        formData.append("category_id", form.category_id);
        formData.append("price", form.price);
        formData.append("stock", form.stock);
        formData.append("min_stock", form.min_stock);
        //Agregar la imagen si se seleccionó una
        if(image){
          formData.append("image", image);
        }

        //Si se proporciona un producto, actualizarlo; de lo contrario, crear uno nuevo
        try {
          if (product?.product_id) {
            formData.append("_method", "PUT"); //Para compatibilidad con Laravel
            await api.post(`/products/${product.product_id}`, formData); //Actualizar producto existente
          } else {
            await api.post("/products", formData); //Crear nuevo producto
          }
          onSuccess(); //Llamar a la función onSuccess después de una operación exitosa
      } catch (error) {
          alert("Error al guardar el producto");
          console.error(error);
      }finally {
        setLoading(false);
      }
    };

  return (
    <div className="product-form">
    {/* Input de Nombre */}
      <input 
        name="name" 
        value={form.name} 
        onChange={handleChange} 
        placeholder="Nombre del producto" 
      />
      
      {/* Textarea de Descripción */}
      <textarea 
        name="description" 
        placeholder="Descripción" 
        value={form.description} 
        onChange={handleChange} 
      />

      {/* Fila: Categoría + Botón */}
      <div className="form-row">
        <select 
            name="category_id" 
            value={form.category_id} 
            onChange={handleChange}
            className="flex-grow" // Clase auxiliar para que ocupe espacio
        >
          <option value="">Seleccione una categoría</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
          ))}
        </select>
        <button type="button" className="btn-small" onClick={() => setShowCategoryModal(true)}>
          + Cat
        </button>
      </div>

      {/* Fila: Precio + Stock */}
      <div className="form-row">
        <input 
            name="price" 
            type="number" 
            placeholder="Precio S/." 
            value={form.price} 
            onChange={handleChange} 
        />
        <input 
            name="stock" 
            type="number" 
            placeholder="Stock" 
            value={form.stock} 
            onChange={handleChange} 
        />
      </div>
      
      <input 
        name="min_stock" 
        type="number" 
        placeholder="Stock mínimo (Alerta)" 
        value={form.min_stock} 
        onChange={handleChange} 
      />

      {/* Input de Imagen */}
      <div className="file-input-container">
        <label>Imagen del Producto:</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setImage(e.target.files[0]);
            }
          }} 
        />
      </div>

      {/* Botones de acción */}
      <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancelar
          </button>

          <button 
            onClick={submitForm} 
            disabled={loading} 
            className="btn-primary"
          >
            {loading ? "Guardando..." : (product ? "Actualizar" : "Crear")}
          </button>
      </div>

      {showCategoryModal && (
        <CategoriesModal
          onClose={() => setShowCategoryModal(false)}
          onCreated={fetchCategories}
        />
      )}
    </div>
  );
};

export default ProductForm; //Exportar el componente ProductForm
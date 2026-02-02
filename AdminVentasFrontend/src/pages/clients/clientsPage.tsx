/*adminVentasFrontend/src/pages/clients/clientsPage.tsx
Componente encargado de gestionar la página de clientes
 - Funcionalides principales: 
    - Crear clientes permanentes
    - Actualizar sus datos
    - Listar clientes
   - Eliminar clientes (soft delete)
 */
import { useEffect, useState } from "react";
import type { Client } from "../../types/index";
import api from "../../lib/api";
import Modal from "../../components/ui/ModalExample";

//Componente principal de la página de clientes
const ClientsPage = () => {
  //Estado para almacenar la lista de clientes
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  //Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  //Formulario de cliente
  const [formData, setFormData] = useState({
    name: "",
    document_type: "",
    document_number: "",
    email: "",
    phone: "",
    address: "",
  });

  //Cargar los datos de los clientes
  useEffect(() => {
    fetchClients(); 
  }, []);

  //Función para obtener los clientes desde la API
  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get("clients");
      //Lógica inteligente: ¿Viene paginado (dentro de .data) o directo?
      const receivedData = res.data.data ? res.data.data : res.data;

      //Validación de seguridad: Solo guardamos si es un array real
      if (Array.isArray(receivedData)) {
        setClients(receivedData);
      } else {
        console.error("La API no devolvió una lista válida:", receivedData);
        setClients([]); //Evita que la app se rompa
      }

    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }

  //Funcion para manejar el Modal 
  const handleOpenModal = (client?: Client) => {
    if(client) {
      //Modo edición
      setEditingClient(client);
      setFormData({
        name: client.name,
        document_type: client.document_type || "",
        document_number: client.document_number || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
      });
    } else {
      //Modo creación
      setEditingClient(null);
      setFormData({
        name: "",
        document_type: "",
        document_number: "",
        email: "",
        phone: "",
        address: "",
      });
      setShowModal(true);
    }
  }

  //Funcion para guardar el cliente (crear o actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      if(editingClient) {
        //Actualizar cliente
        await api.put(`clients/${editingClient.client_id}`, formData);
        alert("Cliente actualizado correctamente");
      } else {
        //Crear nuevo cliente
        await api.post("clients", formData);
        alert("Cliente creado correctamente");
      }
      setShowModal(false);
      fetchClients(); //Refrescar la lista de clientes
    } catch(error : any) {
      console.error("Error saving client:", error);
    }
  };

  //Función para eliminar un cliente (soft delete)
  const handleDelete = async (id: number) => {
    if(!confirm("¿Estás seguro de eliminar este cliente?")) return;
    try{
      await api.delete(`clients/${id}`);
      alert("Cliente eliminado correctamente");
      fetchClients(); //Refrescar la lista de clientes
    } catch(error) {
      console.error("Error deleting client:", error);
    }
  };

  //renderizado del componente
  return (
    <div className="page-container"> 
      {/* Encabezado de la página */}
      <div className="page-header"> 
        <h2>Gestion de clientes</h2>
        <div className="header-actions">
          <button onClick={() => handleOpenModal()} className="btn-primary">+ Nuevo Cliente</button>
          <button onClick={fetchClients} className="btn-refresh"> 
            🔁 Refrescar
          </button>
        </div>
      </div>
      {/* Tabla de clientes */}
      <div className="table-container"> 
        <table className="data-table"> 
          <thead>
            <tr>
              <th>Nombre / Razon social</th>
              <th>Documento</th>
              <th>Contacto</th>
              <th>Direccion</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{textAlign:'center'}}>Cargando clientes...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan={5} style={{textAlign:'center'}}>No hay clientes registrados</td></tr>
            ) : (
              clients.map((client) => ( 
                <tr key={client.client_id}>
                  <td style={{fontWeight:'bold'}}>{client.name}</td>
                  <td>
                    <span style={{color:'#64748b', fontSize:'0.8em'}}>{client.document_type}:</span><br/>
                    {client.document_number}
                  </td>
                  <td>
                    <div>📞 {client.phone || '-'}</div>
                    <div style={{color:'#64748b', fontSize:'0.8em'}}>📧 {client.email || '-'}</div>
                  </td>
                    <td>{client.address || '-'}</td>
                  <td style={{textAlign:'center'}}>
                    <button onClick={() => handleOpenModal(client)} className="btn-icon" title="Editar">✏️</button>
                    <button onClick={() => handleDelete(client.client_id)} className="btn-icon btn-danger" title="Eliminar">🗑️</button>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>  
        {/* Modal para crear/editar cliente */}
        <Modal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          title={editingClient ? "Editar Cliente" : "Nuevo Cliente"}
        >

        {/* Formulario de cliente */}
        <form onSubmit={handleSubmit} className="client-form">

          {/* Campos Nombre */}
          <div className="form-group">
            <label>Nombre Completo *</label>
            <input 
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              placeholder="EJ: ZenTech SAC"
            />
          </div>

          {/* Campos Documento y numero */}
          <div className="form-row">
            <div className="form-group">
              <label>Tipo Documento</label>
              <select 
                className="input-field" 
                value={formData.document_type}
                onChange={(e) => setFormData({...formData, document_type: e.target.value})}
              >
                <option value="">-- Seleccionar --</option>
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="PASAPORTE">PASAPORTE</option>
              </select>
          </div>
          <div className="form-group">
            <label>Número Documento</label>
            <input
              className="input-field"
              value={formData.document_number}
              onChange={(e) => setFormData({...formData, document_number: e.target.value})}
              required
              placeholder="EJ: 10456789012"
            />
          </div>
        </div>

        {/* Campos Contacto: Telefono y Email */}
        <div className="form-row">
          <div className="form-group">
            <label>Telefono</label>
            <input 
              className="input-field"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="EJ: +51 987654321"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="EJ: ejemplo@correo.com"
            />
            </div>
          </div>
          {/* Campo Dirección */}
          <div className="form-group">
            <label>Dirección</label>
            <input
              className="input-field"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="EJ: Av. Siempre Viva 123"
            />
          </div>
          {/* Botones de acción */}
          <div className="modal-footer">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button> 
          </div>  
        </form>
      </Modal>
    </div>
  );
}

export default ClientsPage;

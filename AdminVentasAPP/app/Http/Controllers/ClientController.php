<?php
//adminventasapp/app/Http/Controllers/ClientController.php
//Controller para gestionar las operaciones relacionadas con los clientes.
namespace App\Http\Controllers;
use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    //Metodo para listar todos los clientes
    public function index(Request $request)
    {
        //Buscador simple y Paginación
        $query = Client::latest();
        //Si hay un término de búsqueda, aplicarlo
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('document_number', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate(20)); //Retorna de 20 en 20
    }

    //Metodo para crear un nuevo cliente
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'document_type' => 'required|string|max:50',
            'document_number' => 'required|string|max:100|unique:clients,document_number',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
        ]);

        $client = Client::create($request->all()); //Crear nuevo cliente
        return response()->json([
            'message' => 'Cliente creado exitosamente',
            'client' => $client 
        ], 201); //Retornar el cliente creado con codigo 201
    }

    //Actualizar un cliente existente
    public function update(Request $request, $id)
    {
        //Buscar el cliente por ID
        $client = Client::find($id);

        //En caso de que no exista
        if(!$client){
            return response()->json(['message' => 'Cliente no encontrado'], 404);
        }

        //Validar los datos de entrada
        $request->validate([
            'name' => 'required|string|max:255',
            'document_number' => 'required|string|max:100|unique:clients,document_number,'.$id,
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
        ]);

        $client->update($request->all()); //Actualizar cliente
        return response()->json([
            'message' => 'Cliente actualizado exitosamente',
            'client' => $client
        ]);; //Retornar el cliente actualizado
    }

    //Funcion para eliminar un cliente
    public function destroy($id)
    {
        $client = Client::find($id);
        if (!$client) {
            return response()->json(['message' => 'Cliente no encontrado'], 404);
        }

        //Gracias al SoftDeletes, esto NO borra el registro,
        //solo llena el campo 'deleted_at' y lo oculta de las listas futuras.
        $client->delete();

        return response()->json(['message' => 'Cliente eliminado correctamente']);
    }
}

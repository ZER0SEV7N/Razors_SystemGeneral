<?php
//AdminVentasAPP/app/Http/Controllers/productController.php
//Controlador para gestionar las operaciones relacionadas con los productos
// ---------------------------------------------------------------
//Funciones implementadas:
// index(): Devuelve todos los productos en formato JSON

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product; //Importa el modelo Product
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class Productcontroller extends Controller
{
    //Funcion para mostrar todos los productos en formato JSON mientras esten activos
    public function index()
    {
        return response()->json(
            Product::where('is_active', true)
                ->with(['category', 'user'])
                ->get()
        );
    }

    //Funcion para mostrar todos los productos, incluyendo inactivos
    public function inactive()
    {
        return response()->json(
            Product::where('is_active', false)
                ->with(['category', 'user'])
                ->get()
        );
    }

    //Funcion para crear un nuevo producto 
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'nullable|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);
        //Manejo de la carga de la imagen si se proporciona
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $data['user_id'] = auth()->id(); //Asigna el ID del usuario autenticado
        $product = Product::create($data);  //Crea el nuevo producto
        return response()->json($product, 201); //Devuelve el producto creado con código 201
    }

    //Funcion para mostrar un producto específico
    public function show(Product $product)
    {
        return response()->json($product->load(['category', 'user'])); //Carga las relaciones category y user
    }

    //Funcion para actualizar un producto específico
    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'sometimes|required|exists:categories,id',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'min_stock' => 'nullable|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048'
        ]);
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }
        $product->update($data); //Actualiza el producto con los datos validados
        return response()->json($product); //Devuelve el producto actualizado
    }

    //Funcion para eliminar un producto específico
    public function destroy(Product $product)
    {
        $product->update(['is_active' => false]); //Marca el producto como inactivo
        return response()
            ->json(['message' => 'Producto desactivado' //Devuelve un mensaje de confirmación
        ]);
    }

    //Funcion para buscar productos por nombre
    public function search(Request $request)
    {
        $query = $request->query('query'); //Obtiene el parámetro de consulta 'query'
        //Validación básica de la consulta
        if (!$query || strlen($query) < 2) {
            return response()->json([
                'message' => 'La búsqueda debe tener al menos 2 caracteres' 
            ], 422);
        }
        //Busca productos activos que coincidan con el nombre
        $products = Product::where('is_active', true)
            ->where('name', 'like', "%{$query}%")
            ->with(['category', 'user'])
            ->get();

        return response()->json($products);
    }


    //Funcion para Eliminar en el postman
    public function delete(Product $product)
    {
        if (!app()->isLocal()) {
            abort(403, 'Acción no permitida en producción');
        }

        $product->delete();

        return response()->json([
            'message' => 'Producto eliminado permanentemente'
        ]);
    }

}

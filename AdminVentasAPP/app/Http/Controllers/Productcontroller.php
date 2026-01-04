<?php
//AdminVentasAPP/app/Http/Controllers/ProductController.php
//Controlador para gestionar las operaciones relacionadas con los productos
// ---------------------------------------------------------------
//Funciones implementadas:
// index(): Devuelve todos los productos en formato JSON

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product; //Importa el modelo Product
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    //Funcion para mostrar todos los productos en formato JSON
    //Con un filtrado dependiendo de los parámetros de consulta
    public function index(Request $request)
    {
        $query = Product::query();

        //1. Filtrar por estado (activo/inactivo)
        if ($request->boolean('show_inactive')){
            $query->where('is_active', false);
        } else {
            $query->where('is_active', true);
        }

        //2. Filtrar por nombre (Buscador general)
        $query->when($request->input('search'), function ($q, $search){
            return $q->where('name', 'like', "%{$search}%");
        });

        //3. Filtro por Categoria
        $query->when($request->input('category_id'), function ($q, $categoryId){
            return $q->where('category_id', $categoryId);
        });

        //4. Filtro por Stock Bajo (Alerta de stock)
        $query->when($request->boolean('low_stock'), function ($q){
            return $q->whereColumn('stock', '<=', 'min_stock');
        });

        //5. Filtro por Rango de Precio
        $query->when($request->input('price_min'), function ($q, $priceMin){
            return $q->where('price', '>=', $priceMin);
        });

        $query->when($request->input('price_max'), function ($q, $priceMax){
            return $q->where('price', '<=', $priceMax);
        });

        //Ordenamiento y Paginacion
        return response()->json(
            $query->with(['category', 'user'])
                ->latest()
                ->paginate(10)
        );
    }



    //Funcion para crear un nuevo producto 
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,category_id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'nullable|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);
        //Manejo de la carga de la imagen si se proporciona
        if ($request->hasFile('image')) {
            $request->validate([
                'image' => 'image|mimes:jpg,jpeg,png|max:2048'
            ]);

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
            'category_id' => 'sometimes|required|exists:categories,category_id',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'min_stock' => 'nullable|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);
        if ($request->hasFile('image')) {
            $request->validate([
                'image' => 'image|mimes:jpg,jpeg,png|max:2048'
            ]);

            //(opcional) borrar imagen anterior
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }

            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data); //Actualiza el producto con los datos validados
        return response()->json($product); //Devuelve el producto actualizado
    }

    //Funcion para eliminar un producto específico
    public function destroy(Product $product)
    {
        //Verifica si el producto ya está inactivo
        if (!$product->is_active) {
            return response()
                ->json(['message' => 'El producto ya está inactivo' //Mensaje si el producto ya esta inactivo
            ], 400);
        }
        $product->update(['is_active' => false]); //Marca el producto como inactivo
        return response()
            ->json(['message' => 'Producto desactivado' //Devuelve un mensaje de confirmación
        ]);
    }

    //Funcion para reactivar un producto especifico
    public function reactivate(Product $product)
    {
        //Verifica si el producto ya está activo
        if ($product->is_active) {
            return response()
                ->json(['message' => 'El producto ya está activo' //Mensaje si el producto ya esta activo
            ], 400);
        }

        $product->update(['is_active' => true]); //Marca el producto como activo
        return response()
            ->json(['message' => 'Producto reactivado', //Devuelve un mensaje de confirmación
                'product' => $product]
        );
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

<?php
//AdminVentasAPP/app/Http/Controllers/CategoryController.php
//Controlador para gestionar las operaciones relacionadas con las categorías
namespace App\Http\Controllers;

use Illuminate\Http\Request; //Importa la clase Request
use App\Models\Category; //Importa el modelo Category
use App\Http\Controllers\Controller; //Importa el controlador base

class Categorycontroller extends Controller
{
    //Funcion para mostrar todas las categorias en formato JSON
    public function index(){
        return response()->json(Category::where('is_active', true)->get());
    }

    //Funcion para crear una nueva categoria
    public function store(Request $request){
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean'
        ]);

        $category = Category::create($data);  //Crea la nueva categoria
        return response()->json($category, 201); //Devuelve la categoria creada con código 201
    }

    //Funcion para mostrar una categoria específica
    public function show(Category $category){
        return response()->json($category->load('products')); 
    }

    //Funcion para actualizar una categoria específica
    public function update(Request $request, Category $category){
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean'
        ]);
        $category->update($data); //Actualiza la categoria con los datos validados
        return response()->json($category); //Devuelve la categoria actualizada
    }

    //Funcion para eliminar una categoria específica
    public function destroy(Category $category){
        $category->update(['is_active' => false]); //Marca la categoria como inactiva
        return response()->json([
            'message' => 'Categoría desactivada' //Devuelve un mensaje de confirmación
        ]);
    }
}

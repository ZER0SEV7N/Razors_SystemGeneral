<?php
//adminVentasapp/app/Http/Controllers/BranchController.php
//Controlador para manejar las operaciones relacionadas con las sucursales
//Crear, actualizar, eliminar sucursales, etc.
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Branch;
use App\Http\Controllers\Controller;

class BranchController extends Controller
{
    //Funcion para obtener la lista de sucursales
    public function index() {
        return Branch::where('is_active', true)->get(); //Solo sucursales activas
    }

    //Funcion para crear una nueva sucursal
    public function store(Request $request) {
        $request->validate([
            'name' => 'required', //'Nombre obligatorio
            'address' => 'required', //'Dirección obligatoria
            'code' => 'required|unique:branches,code' //'Código único obligatorio
        ]);
        //Crear la sucursal
        $branch = Branch::create($request->all());
        return response()->json($branch, 201);
    }

    //Funcion para actualizar una sucursal
    public function update(Request $request, $id) {
        $branch = Branch::findOrFail($id); //Buscar la sucursal
        $branch->update($request->all()); //Actualizar con los datos recibidos
        return response()->json($branch); //Retornar la sucursal actualizada
    }

    //Funcion para desactivar una sucursal (soft delete)
    public function destroy($id) {
        $branch = Branch::findOrFail($id); //Buscar la sucursal
        $branch->update(['is_active' => false]); //Soft delete manual
        return response()->json(['message' => 'Sede desactivada']);
    }
}

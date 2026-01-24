<?php
//adminVentasapp/app/Http/Controllers/BranchController.php
//Controlador para manejar las operaciones relacionadas con las sucursales
//Crear, actualizar, eliminar sucursales, etc.
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Branch;
use App\Models\Company; // Importamos para obtener el ID de la empresa
use Illuminate\Validation\Rule; // Necesario para validaciones avanzadas
use App\Http\Controllers\Controller;

class BranchController extends Controller
{
    //Funcion para obtener la lista de sucursales
    public function index() {
        return Branch::where('is_active', true)->get(); //Solo sucursales activas
    }

    //Funcion para crear una nueva sucursal
    public function store(Request $request) {
        // CORRECCIÓN: Asignamos el resultado de la validación a $data
        $data = $request->validate([
            'name'    => 'required',
            'address' => 'required|string|max:255',
            'phone'   => 'nullable|string|max:20',
            'code'    => 'required|string|max:10|unique:branches,code'
        ]);

        // --- ASIGNACIÓN AUTOMÁTICA DE COMPANY_ID ---
        // Buscamos o creamos la empresa (asegurándonos de usar company_id)
        $company = Company::firstOrCreate(['company_id' => 1]); 
        
        // Agregamos los campos extra al array $data que YA tiene los datos del formulario
        $data['company_id'] = $company->company_id; 
        $data['is_active'] = true;

        // Ahora sí, $data tiene name, address, code, company_id, etc.
        $branch = Branch::create($data);

        return response()->json($branch, 201);
    }

    //Funcion para actualizar una sucursal
    public function update(Request $request, $id) {
        $branch = Branch::findOrFail($id);

        $data = $request->validate([
            'name'    => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'phone'   => 'nullable|string|max:20',
            // CORRECCIÓN CRÍTICA:
            // Al editar, debemos ignorar el ID de la sucursal actual para que no
            // marque error diciendo "el código ya existe" (cuando es el propio).
            // Nota: El 3er parámetro es el ID a ignorar, el 4to es el nombre de la PK.
            'code'    => 'required|string|max:10|unique:branches,code,' . $id . ',branch_id',
            
            // Permitimos cambiar si es principal o no
            'is_main' => 'boolean'
        ]);

        // Lógica extra: Si esta se vuelve la principal, las demás dejan de serlo
        if (isset($data['is_main']) && $data['is_main'] == true) {
            Branch::where('branch_id', '!=', $id)->update(['is_main' => false]);
        }

        $branch->update($data);
        
        return response()->json($branch);
    }

    //Funcion para desactivar una sucursal (soft delete)
    public function destroy($id) {
        $branch = Branch::findOrFail($id);
        
        // Validación de seguridad: No permitir borrar la sede principal
        if ($branch->is_main) {
            return response()->json(['message' => 'No puedes eliminar la Sede Principal.'], 409);
        }

        // Validación: No borrar si tiene usuarios o ventas asociadas (opcional pero recomendado)
        // if ($branch->users()->exists()) { ... }

        $branch->update(['is_active' => false]);
        
        return response()->json(['message' => 'Sede desactivada correctamente']);
    }
}

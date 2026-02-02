<?php
//adminVentasapp/app/Http/Controllers/BranchController.php
//Controlador para manejar las operaciones relacionadas con las sucursales
//Crear, actualizar, eliminar sucursales, etc.
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Branch;
use Illuminate\Support\Facades\DB;
use App\Models\Company; // Importamos para obtener el ID de la empresa
use Illuminate\Validation\Rule; // Necesario para validaciones avanzadas
use App\Http\Controllers\Controller;

class BranchController extends Controller
{
    //Funcion para obtener la lista de sucursales
    public function index() {
        return Branch::where('is_active', true) //Solo sucursales activas
                    ->orderBy('is_main', 'desc') //La principal primero
                    ->orderBy('branch_id', 'asc') //Luego por ID
                    ->get(); //Solo sucursales activas
    }

    //Funcion para crear una nueva sucursal
    public function store(Request $request) {
        //Validación de $data
        $data = $request->validate([
            'name'    => 'required',
            'address' => 'required|string|max:255',
            'phone'   => 'nullable|string|max:20',
            'code'    => 'required|string|max:10|unique:branches,code',
            'is_main' => 'boolean' //Validamos si se envía como principal
        ]);

        //Transacion para asegurar integridad al crear la sucursal
        return DB::transaction(function () use ($request) {
            //1. Obtener ID de empresa (Hardcodeado a 1 por ahora, según tu lógica)
            Company::firstOrCreate(['company_id' => 1], ['name' => 'Mi Empresa']);
            $companyId = 1; 

            //2. Si la nueva es PRINCIPAL, quitar el rango a las demás
            if ($request->boolean('is_main')) {
                Branch::where('company_id', $companyId)->update(['is_main' => false]);
            }

            //3. Crear la sucursal
            $branch = Branch::create([
                'company_id' => $companyId,
                'name'       => $request->name,
                'address'    => $request->address,
                'phone'      => $request->phone,
                'code'       => $request->code,
                'is_main'    => $request->boolean('is_main', false),
                'is_active'  => true
            ]);

            //4. Retornar la nueva sucursal creada
            return response()->json($branch, 201);
        });
    }

    //Funcion para actualizar una sucursal
    public function update(Request $request, $id) {
        //Buscar la sucursal por ID
        $branch = Branch::findOrFail($id);

        //Validación de $data
        $data = $request->validate([
            'name'    => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'phone'   => 'nullable|string|max:20',
            'is_main' => 'boolean',
            'code' => [
                'required', 
                'string', 
                'max:10', 
                //Ignorar el código de ESTA sucursal (usando su PK custom 'branch_id')
                Rule::unique('branches', 'code')->ignore($branch->branch_id, 'branch_id')
            ],
        ]);

        //Transacción para asegurar integridad al actualizar la sucursal
        return DB::transaction(function () use ($request, $branch) {
            //Si se marca como principal, las demás dejan de serlo
            if ($request->boolean('is_main')) {
                //Evitamos actualizar si ya era la principal para ahorrar querys
                if (!$branch->is_main) {
                    Branch::where('company_id', $branch->company_id)
                          ->where('branch_id', '!=', $branch->branch_id)
                          ->update(['is_main' => false]);
                }
            } 

            //Seguridad: No permitir quitar el check de principal a la única que lo tiene
            //(Alguien debe ser principal siempre. Solo se cambia si otra toma su lugar)
            elseif ($branch->is_main) {
                 return response()->json(['message' => 'No puedes quitar el rango de Principal. Debes asignar otra como Principal primero.'], 409);
            }

            //Actualizar los datos de la sucursal
            $branch->update($request->only(['name', 'address', 'phone', 'code', 'is_main']));
            
            //Retornar la sucursal actualizada
            return response()->json($branch);
        });
    }

    //Funcion para desactivar una sucursal (soft delete)
    public function destroy($id) {
        $branch = Branch::findOrFail($id);
        //1. No borrar la principal
        if ($branch->is_main) {
            return response()->json(['message' => 'No puedes eliminar la Sede Principal. Asigna otra antes.'], 409);
        }

        //2. Verificar si tiene usuarios activos
        if ($branch->users()->where('is_active', true)->exists()) {
             return response()->json(['message' => 'Esta sede tiene usuarios activos.'], 409);
        }

        $branch->update(['is_active' => false]);
        
        return response()->json(['message' => 'Sede desactivada correctamente']);
    }
    
    // Método para reactivar (opcional, pero útil si te equivocaste)
    public function show($id) {
         return Branch::findOrFail($id);
    }
}

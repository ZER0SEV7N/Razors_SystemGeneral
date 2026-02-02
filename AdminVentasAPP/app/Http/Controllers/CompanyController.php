<?php
//adminventasapp/app/Http/Controllers/CompanyController.php
//Controlador para manejar las operaciones relacionadas con la empresa
//como ver y actualizar la información de la empresa.
namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    //Metodo para obtener la información de la empresa
    public function index()
    {
        //Cualquier usuario autenticado puede LEER los datos de la empresa (para el PDF, etc.)
        return response()->json(Company::firstOrCreate(['company_id' => 1], ['name' => 'Mi Empresa']));
    }

    //Metodo para actualizar la información de la empresa
    public function update(Request $request)
    {
        //Solo el OWNER puede actualizar los datos de la empresa
        if ($request->user()->role !== 'OWNER') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        //Validar los datos de entrada
        $request->validate([
            'name'    => 'required|string',
            'ruc'     => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'phone'   => 'nullable|string',
            'email'   => 'nullable|email',
            'website' => 'nullable|string',
            'logo'    => 'nullable|image|max:2048',
        ]);

        //Obtener o crear la empresa (ID fijo 1)
        $company = Company::firstOrNew(['company_id' => 1]);

        //Actualizar los campos
        $company->fill($request->only([
            'name', 'ruc', 'address', 'phone', 'email', 'website'
        ]));

        //Manejar la carga del logo si se proporciona
        if ($request->hasFile('logo')) {
            if ($company->logo_path) {
                Storage::disk('public')->delete($company->logo_path);
            }
            $path = $request->file('logo')->store('company', 'public');
            $company->logo_path = $path;
        }
        
        //Guardar los cambios
        $company->save();
        //Retornar la empresa actualizada
        return response()->json($company);
    }
}
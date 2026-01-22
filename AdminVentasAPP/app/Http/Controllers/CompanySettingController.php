<?php
//adminventasapp/app/Http/Controllers/CompanySettingController.php
//Controlador para manejar las operaciones relacionadas con la configuración de la compañía
//Como actualizar información de la compañía, logo, etc.
namespace App\Http\Controllers;

use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompanySettingController extends Controller
{
    //Funcion para obtener la configuración de la compañía
    public function index()
    {
        return response()->json(CompanySetting::firstOrNew([]));
    }

    //Funcion para actualizar la configuración de la compañía
    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'logo' => 'nullable|image|max:2048', //Maximo 2MB
        ]);

        $settings = CompanySetting::firstOrNew([]);
        $settings->name = $request->name;
        $settings->address = $request->address;
        $settings->phone = $request->phone;

        //---Manejo del logo de la compañía---
        if ($request->hasFile('logo')) {
            //Eliminar logo anterior si existe
            if ($settings->logo_path) {
                Storage::disk('public')->delete($settings->logo_path);
            }
            //Guardar nuevo logo
            $path = $request->file('logo')->store('company', 'public');
            $settings->logo_path = $path;
        }
        $settings->save();

        return response()->json($settings);
    }
}
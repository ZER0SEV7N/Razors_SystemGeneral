<?php
//adminVentasapp/app/Http/Controllers/DespathGuideController.php
//Controlador para gestionar las guías de despacho
//CRUD de guías de despacho asociadas a ventas
namespace App\Http\Controllers;

use App\Models\DespathGuide; //Importar el modelo DespathGuide
use App\Models\Sale; //Importar el modelo Sale
use App\Http\Controllers\Controller; //Importar el controlador base
use App\Models\Company; //Importar el modelo CompanySetting
use Barryvdh\DomPDF\Facade\Pdf; //Importar la fachada de PDF
use Illuminate\Http\Request; //Importar la clase Request

class DespathGuideController extends Controller
{
    //Funcion para generar una Guia a partir de una Venta ID
    public function store(Request $request)
    {
        $request->validate([
            'sale_id' => 'required|exists:sales,sale_id|unique:despatch_guides,sale_id', // Evitar duplicados
            'transfer_date' => 'required|date',
            // Datos opcionales del transportista
            'driver_name' => 'nullable|string',
            'vehicle_plate' => 'nullable|string'
        ]);
        //SEGURIDAD: Verificar permisos del usuario
        $user = auth()->user();
        $sale = Sale::with('client')->findOrFail($request->sale_id); //Cargar venta y cliente relacionado

        //SEGURIDAD: Si no es OWNER, solo puede crear guías de SU sucursal
        if ($user->role !== 'OWNER' && $sale->branch_id !== $user->branch_id) {
            return response()->json(['message' => 'No puedes generar guías para ventas de otra sede.'], 403);
        }

        //Crear la guía de despacho
        $company = Company::first(); // Obtener datos de empresa

        //Dirección de destino: Si no hay cliente, usamos un texto por defecto
        $destAddress = optional($sale->client)->address ?? 'Dirección del Cliente (Público General)';

        //Crear la guía en la base de datos
        $guide = DespathGuide::create([
            'sale_id'             => $sale->sale_id,
            'transfer_date'       => $request->transfer_date,
            'motive'              => 'VENTA',
            'origin_address'      => $company->address ?? 'Almacén Principal',
            'destination_address' => $destAddress,
            'driver_name'         => $request->driver_name,
            'vehicle_plate'       => $request->vehicle_plate,
            'status'              => 'EMITIDO'
        ]);

        //Retornar la guía creada
        return response()->json(['message' => 'Guía creada exitosamente', 'guide' => $guide], 201);
    }

    //Funcion para mostrar una guia de despacho por ID
    public function show($id)
    {
        //Cargamos relaciones necesarias
        $guide = DespathGuide::with(['sale.details.product', 'sale.client'])->findOrFail($id);
        
        //SEGURIDAD DE VISUALIZACIÓN
        $user = auth()->user();
        if ($user->role !== 'OWNER' && $guide->sale->branch_id !== $user->branch_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        //Retornar la guía con sus detalles
        return response()->json($guide);
    }

    //Funcion para generar el PDF de una guia de despacho
    public function pdf($id)
    {
        //Cargamos relaciones necesarias
        $guide = DespathGuide::with(['sale.details.product', 'sale.client', 'sale.user'])->findOrFail($id);
        $user = auth()->user();

        //SEGURIDAD DE PDF
        if ($user->role !== 'OWNER' && $guide->sale->branch_id !== $user->branch_id) {
            abort(403, 'No autorizado para ver este documento.');
        }

        //Obtener datos de la empresa
        $company = Company::firstOrNew(['company_id' => 1]);
        //Generar el PDF usando la vista 'pdf.guide'
        $pdf = Pdf::loadView('pdf.guide', compact('guide', 'company'));
        return $pdf->stream('guia-remision-'.$id.'.pdf');
    }
}
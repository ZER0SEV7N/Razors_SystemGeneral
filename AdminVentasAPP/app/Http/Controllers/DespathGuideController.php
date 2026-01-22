<?php
//adminVentasapp/app/Http/Controllers/DespathGuideController.php
//Controlador para gestionar las guías de despacho
//CRUD de guías de despacho asociadas a ventas
namespace App\Http\Controllers;

use App\Models\DespathGuide; //Importar el modelo DespathGuide
use App\Models\Sale; //Importar el modelo Sale
use App\Http\Controllers\Controller; //Importar el controlador base
use App\Models\CompanySetting; //Importar el modelo CompanySetting
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

        //Obtener los datos de la venta y la empresa
        $sale = Sale::with('client')->findOrFail($request->sale_id);
        $company = CompanySetting::first(); //Datos de la empresa

        //Generar la guía automaticamente tras la venta
        $guide = DespathGuide::Create([
            'sale_id' => $sale->sale_id,
            'transfer_date' => $request->transfer_date,
            'motive' => 'VENTA',
            'origin_address' => $company->address ?? 'Almacén Principal',
            'destination_address' => $sale->client->address ?? 'Dirección del Cliente', // Asegúrate que tu cliente tenga dirección            
            'driver_name' => $request->driver_name,
            'vehicle_plate' => $request->vehicle_plate,
            'status' => 'EMITIDO'
        ]);

        return response()->json([
            'message' => 'Guía de despacho creada exitosamente',
            'guide' => $guide
        ], 201);
    }

    //Funcion para ver una guía de despacho por ID
    public function show(string $id)
    {
        return DespatchGuide::with(['sale.details.product', 'sale.client'])->findOrFail($id);
    }

    //Funcion para generar PDF
    public function pdf($id)
    {
        $guide = DespatchGuide::with(['sale.details.product', 'sale.client', 'sale.user'])->findOrFail($id);
        $company = CompanySetting::first();

        $pdf = Pdf::loadView('pdf.guide', compact('guide', 'company'));
        return $pdf->stream('guia-remision-'.$id.'.pdf');
    }
}
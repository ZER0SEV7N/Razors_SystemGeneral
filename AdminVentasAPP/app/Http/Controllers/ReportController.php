<?php
//adminventasapp/app/Http/Controllers/ReportController.php
//Controlador para gestionar los reportes, como la generacion de PDFs de ventas.
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf; //Importar la fachada de PDF
use App\Models\Sale; //Importar el modelo Sale
use App\Models\SaleDetail; //Importar el modelo SaleDetail
use App\Models\Client; //Importar el modelo Client
use App\Models\CompanySetting; //Importar el modelo CompanySetting (Se utilizara para el logo y datos de la empresa)
use App\Models\Product; //Importar el modelo Product
use Carbon\Carbon; //Importar Carbon para manejo de fechas

class ReportController extends Controller
{
    //Funcion para generar el PDF de una venta (Boleta o Factura)
    public function saleInvoice($id)
    {
        $sale = Sale::with(['client', 'user', 'details.product'])->findOrFail($id);
        $company = CompanySetting::first(); // Datos de la empresa

        $pdf = Pdf::loadView('pdf.invoice', compact('sale', 'company'));
        return $pdf->stream('boleta-'.$id.'.pdf');
    }

    //Funcion para generar un reporte Mensual de todas las ventas
    public function monthlySales(Request $request)
    {
        //Recibir el mes y año desde la solicitud
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);
        $company = CompanySetting::first();

        //Consultar las ventas del mes
        $sales = Sale::with('user')
            ->whereYear('sale_date', $year)
            ->whereMonth('sale_date', $month)
            ->where('status', '!=', 'CANCELADO') //Excluir ventas canceladas
            ->orderBy('sale_date', 'desc')
            ->get();

        //Calcular el total de ventas
        $totalIncome = $sales->sum('total');
        $totalTransactions = $sales->count();

        //Datos para la vista
        $data = [
            'month' => $month,
            'year' => $year,
            'sales' => $sales,
            'totalIncome' => $totalIncome,
            'totalTransactions' => $totalTransactions,
            'dateGenerated' => now()
        ];

        //Generar el PDF
        $pdf = Pdf::loadView('pdf.monthly_report', $data);
        return $pdf->stream('reporte-mensual-'.$month.'-'.$year.'.pdf');
    }

    // [NUEVO] REPORTE DE INVENTARIO (Para auditoría)
    public function inventoryReport()
    {
        $products = Product::with('category')
                    ->where('is_active', true)
                    ->orderBy('category_id')
                    ->get();
        
        $company = CompanySetting::first();
        $totalValue = $products->sum(function($p) { return $p->price * $p->stock; });

        $pdf = Pdf::loadView('pdf.inventory', compact('products', 'totalValue', 'company'));
        return $pdf->stream('reporte-inventario.pdf');
    }
}

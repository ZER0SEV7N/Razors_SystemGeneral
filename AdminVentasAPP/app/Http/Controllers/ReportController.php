<?php
//adminventasapp/app/Http/Controllers/ReportController.php
//Controlador para gestionar los reportes, como la generacion de PDFs de ventas.
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf; //Importar la fachada de PDF
use App\Models\Sale; //Importar el modelo Sale
use App\Models\SaleDetail; //Importar el modelo SaleDetail
use App\Models\Client; //Importar el modelo Client
use App\Models\Company; //Importar el modelo Company (Se utilizara para el logo y datos de la empresa)
use App\Models\Product; //Importar el modelo Product
use Carbon\Carbon; //Importar Carbon para manejo de fechas

class ReportController extends Controller
{
    // Generar Boleta de Venta
    public function saleInvoice($id)
    {
        try {
            $sale = Sale::with(['client', 'user', 'details.product'])->findOrFail($id);
            
            // Buscamos la empresa por company_id = 1 usando el modelo Company
            $company = Company::where('company_id', 1)->first();

            // Si no existe (base de datos vacía), creamos una instancia temporal en memoria
            // para que el PDF no explote al intentar leer $company->name
            if (!$company) {
                $company = new Company([
                    'name' => 'Empresa por Configurar',
                    'address' => '---',
                    'ruc' => '---',
                    'phone' => '',
                    'email' => '',
                    'website' => ''
                ]);
            }

            $pdf = Pdf::loadView('pdf.invoice', compact('sale', 'company'));
            return $pdf->stream('boleta-'.$id.'.pdf');

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al generar el PDF de la venta.',
                'error_detail' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    // Reporte Mensual
    public function monthlySales(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);
        
        // Usamos Company
        $company = Company::where('company_id', 1)->first();

        // Fallback por si no hay empresa
        if (!$company) $company = new Company(['name' => 'Empresa']);

        $sales = Sale::with('user')
            ->whereYear('sale_date', $year)
            ->whereMonth('sale_date', $month)
            ->where('status', '!=', 'CANCELADO')
            ->orderBy('sale_date', 'desc')
            ->get();

        $totalIncome = $sales->sum('total');
        $totalTransactions = $sales->count();

        $data = [
            'month' => $month,
            'year' => $year,
            'sales' => $sales,
            'totalIncome' => $totalIncome,
            'totalTransactions' => $totalTransactions,
            'dateGenerated' => now(),
            'company' => $company // Enviamos la empresa a la vista
        ];

        $pdf = Pdf::loadView('pdf.monthly_report', $data);
        $pdf->setPaper('a4', 'landscape');
        
        return $pdf->stream('reporte-mensual-'.$month.'-'.$year.'.pdf');
    }

    // Reporte de Inventario
    public function inventoryReport()
    {
        $products = Product::with('category')
                    ->where('is_active', true)
                    ->orderBy('category_id')
                    ->get();
        
        // Usamos Company
        $company = Company::where('company_id', 1)->first();
        if (!$company) $company = new Company(['name' => 'Empresa']);
        
        $totalValue = $products->sum(function($p) { return $p->price * $p->stock; });

        $pdf = Pdf::loadView('pdf.inventory', compact('products', 'totalValue', 'company'));
        return $pdf->stream('reporte-inventario.pdf');
    }
}
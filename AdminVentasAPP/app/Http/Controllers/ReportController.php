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
    //Generar Boleta de Venta
    public function saleInvoice($id)
    {
        try {
            $sale = Sale::with(['client', 'user', 'details.product'])->findOrFail($id);
            
            //Buscamos la empresa por company_id = 1 usando el modelo Company
            $company = Company::where('company_id', 1)->first();

            //Si no existe (base de datos vacía), creamos una instancia temporal en memoria
            //para que el PDF no explote al intentar leer $company->name
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

            //Generar el PDF usando la vista 'pdf.invoice'
            $pdf = Pdf::loadView('pdf.invoice', compact('sale', 'company'));
            return $pdf->stream('boleta-'.$id.'.pdf');

        //Capturar errores y retornar mensaje adecuado
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al generar el PDF de la venta.',
                'error_detail' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    //Metodo para generar el reporte mensual de ventas en PDF
    public function monthlySales(Request $request)
    {
        //Obtener mes y año del request, o usar el actual por defecto
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);
        
        //SEGURIDAD: Filtrar según el rol del usuario
        $user = auth()->user();

        //1. Configurar la consulta base
        $query = Sale::with(['user', 'client']) //Cargamos cliente también
            ->whereYear('sale_date', $year)
            ->whereMonth('sale_date', $month)
            ->where('status', '!=', 'CANCELADO')
            ->orderBy('sale_date', 'desc');

        //Si no es OWNER, filtrar por sucursal
        if ($user->role !== 'OWNER') {
            $query->where('branch_id', $user->branch_id);
        }

        $sales = $query->get();

        //Cálculos Financieros Globales del Reporte
        $totalIngresos = $sales->sum('total'); // Monto Bruto (Lo que entró a caja)
        
        //Ingeniería inversa del IGV (18%)
        $totalBase = $totalIngresos / 1.18; 
        $totalIGV = $totalIngresos - $totalBase;

        //Cantidad de transacciones
        $totalTransactions = $sales->count();
        
        //Datos de la empresa
        $company = \App\Models\Company::where('company_id', 1)->first();
        if (!$company) $company = new \App\Models\Company(['name' => 'Empresa']);

        //Preparar datos para el PDF
        $data = [
            'month' => $month,
            'year' => $year,
            'sales' => $sales,
            
            //Enviamos los totales desglosados
            'totalBase' => $totalBase,
            'totalIGV' => $totalIGV,
            'totalIncome' => $totalIngresos,
            'totalTransactions' => $totalTransactions,
            'dateGenerated' => now(),
            'company' => $company,
            'user' => $user //Para mostrar quién generó el reporte
        ];

        //Generar el PDF usando la vista 'pdf.monthly_report'
        $pdf = Pdf::loadView('pdf.monthly_report', $data);
        $pdf->setPaper('a4', 'landscape'); // Horizontal para que quepan las columnas
        
        return $pdf->stream('reporte-mensual-'.$month.'-'.$year.'.pdf');
    }

    //Metodo para generar reporte de Inventario
    public function inventoryReport()
    {
        //Obtener todos los productos activos con su categoría
        $products = Product::with('category')
                    ->where('is_active', true)
                    ->orderBy('category_id')
                    ->get();
        
        //Extraer datos de la empresa
        $company = Company::where('company_id', 1)->first();
        if (!$company) $company = new Company(['name' => 'Empresa']);
        
        //Calcular valor total del inventario
        $totalValue = $products->sum(function($p) { return $p->price * $p->stock; });

        //Generar el PDF usando la vista 'pdf.inventory'
        $pdf = Pdf::loadView('pdf.inventory', compact('products', 'totalValue', 'company'));
        return $pdf->stream('reporte-inventario.pdf');
    }
}
<?php
//adminventasapp/app/Http/Controllers/ReportController.php
//Controlador para gestionar los reportes, como la generacion de PDFs de ventas.
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf; //Importar la fachada de PDF
use App\Models\Sale; //Importar el modelo Sale
use App\Models\SaleDetail; //Importar el modelo SaleDetail
use App\Models\Client; //Importar el modelo Client
use App\Models\Product; //Importar el modelo Product
use Carbon\Carbon; //Importar Carbon para manejo de fechas

class ReportController extends Controller
{
    //Funcion para generar el PDF de una venta (Boleta o Factura)
    public function saleInvoice($id)
    {
        $sale = Sale::with(['client', 'user', 'details.product'])->find($id);

        if(!$sale){
            abort(404, 'Venta no encontrada');
        }    

        $pdf = Pdf::loadView('pdf.invoice', compact('sale'));
        //Configurar el papel y la orientacion
        $pdf->setPaper('A4', 'portrait');
        return $pdf->stream('venta-'.$id.'.pdf');
    }

    //Funcion para generar un reporte Mensual de todas las ventas
    public function monthlySales(Request $request)
    {
        //Recibir el mes y año desde la solicitud
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

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
}

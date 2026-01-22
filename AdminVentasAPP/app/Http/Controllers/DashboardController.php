<?php
//AdminVentasAPP/app/Http/Controllers/DashboardController.php
//Controlador para gestionar las operaciones relacionadas con el dashboard
// ---------------------------------------------------------------
namespace App\Http\Controllers;
//Importaciones necesarias
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User; //Importa el modelo User
use App\Models\Sale; //Importa el modelo Sale
use App\Models\Product; //Importa el modelo Product
use App\Models\Category; //Importa el modelo Category
use Illuminate\Support\Facades\DB; //Importa la clase DB para consultas de base de datos

class DashboardController extends Controller
{
    public function stats ()
    {
        //Fechas clave
        $today = now()->startOfDay(); //Inicio del día actual
        $startOfMonth = now()->startOfMonth(); //Inicio del mes actual

        return response()->json([
            // --- INVENTARIO ---
            'total_products' => Product::where('is_active', true)->count(),
            'low_stock_count' => Product::where('is_active', true)
                                        ->whereColumn('stock', '<=', 'min_stock')
                                        ->count(),
            'total_categories' => Category::where('is_active', true)->count(),
            
            // --- FINANZAS (Solo ventas PAGADAS) ---
            // Dinero en caja HOY
            'sales_today' => Sale::where('status', 'PAGADO')
                                 ->where('sale_date', '>=', $today)
                                 ->sum('total'),
            
            // Dinero acumulado del MES
            'sales_month' => Sale::where('status', 'PAGADO')
                                 ->where('sale_date', '>=', $startOfMonth)
                                 ->sum('total'),

            //Valor total de tu mercadería (Costo de inventario)
            'inventory_value' => Product::where('is_active', true)
                                        ->sum(DB::raw('price * stock')),

            //--- TABLA RÁPIDA ---
            //Las 5 últimas ventas para mostrar en el dashboard
            'recent_sales' => Sale::with('user')
                                  ->where('status', 'PAGADO')
                                  ->orderBy('sale_id', 'desc')
                                  ->take(5)
                                  ->get()
        ]);
    }
}

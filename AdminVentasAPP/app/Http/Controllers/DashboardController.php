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
    public function stats (Request $request)
    {
        $user = $request->user(); //Obtener el usuario autenticado
        //Fechas clave
        $today = now()->startOfDay(); //Inicio del día actual
        $startOfMonth = now()->startOfMonth(); //Inicio del mes actual
        
        //Inicializamos queries base
        $productsQuery = Product::where('is_active', true);
        $salesQuery = Sale::where('status', 'PAGADO');

        //--- LÓGICA DIFERENCIADA ---
        
        //1. Si es ADMIN (No Owner), filtramos por su Sucursal
        if ($user->role !== 'OWNER') {
            $salesQuery->where('branch_id', $user->branch_id);
            
            //Calculamos el valor del inventario LOCAL (lo que tiene en su tienda)
            //Unimos la tabla pivote con la de productos para obtener (stock_local * precio)
            $inventoryValue = DB::table('branch_product')
                ->join('products', 'branch_product.product_id', '=', 'products.product_id')
                ->where('branch_product.branch_id', $user->branch_id)
                ->sum(DB::raw('branch_product.stock * products.price'));
            
            //Productos con stock bajo en ESTA sucursal (ej: menos de 5)
            $lowStockCount = DB::table('branch_product')
                ->where('branch_id', $user->branch_id)
                ->where('stock', '<=', 5) //Umbral fijo o dinámico
                ->count();

        } else {
            //2. Si es OWNER, ve el Global (Almacén Central + Ventas Totales)
            $inventoryValue = $productsQuery->sum(DB::raw('price * stock'));
            
            $lowStockCount = Product::where('is_active', true)
                ->whereColumn('stock', '<=', 'min_stock')
                ->count();
        }

        return response()->json([
            //Métricas Generales
            'total_products'   => Product::where('is_active', true)->count(), // Catálogo global
            'total_categories' => Category::where('is_active', true)->count(),
            'low_stock_count'  => $lowStockCount,

            //Finanzas (Filtradas según rol)
            'sales_today'      => (clone $salesQuery)->where('sale_date', '>=', $today)->sum('total'),
            'sales_month'      => (clone $salesQuery)->where('sale_date', '>=', $startOfMonth)->sum('total'),
            'inventory_value'  => $inventoryValue,

            //Tabla Rápida (Últimas ventas de SU ámbito)
            'recent_sales'     => $salesQuery->with('user')
                                    ->orderBy('sale_id', 'desc')
                                    ->take(5)
                                    ->get()
        ]);
    }
}

<?php
//AdminVentasAPP/app/Http/Controllers/DashboardController.php
//Controlador para gestionar las operaciones relacionadas con el dashboard
// ---------------------------------------------------------------
namespace App\Http\Controllers;
//Importaciones necesarias
use Illuminate\Http\Request;
use App\models\User; //Importa el modelo User
use App\models\Product; //Importa el modelo Product
use App\models\Category; //Importa el modelo Category
use Illuminate\Support\Facades\DB; //Importa la clase DB para consultas de base de datos

class DashboardController extends Controller
{
    public function stats ()
    {
        return response()->json([
            //Total de productos activos
            'total_products' => Product::where('is_active', true)->count(),
            
            //Productos críticos (Stock menor o igual al mínimo)
            'low_stock_count' => Product::where('is_active', true)
                                ->whereColumn('stock', '<=', 'min_stock')
                                ->count(),
                                
            //Total de categorías activas
            'total_categories' => Category::where('is_active', true)->count(),
            
            //Valor total del inventario (Precio * Stock)
            //Esto es útil para saber cuánto dinero hay invertido
            'inventory_value' => Product::where('is_active', true)
                                ->sum(DB::raw('price * stock'))
        ]);
    }
}

<?php
//AdminVentasAPP/app/Http/Controllers/InventoryController.php
//Controlador para gestionar las operaciones relacionadas con el inventario.
//
namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    //Funcion para Mover stock entre sucursales
    public function transferStock(Request $request)
    {
        //Validación de datos
        $request->validate([
            'product_id' => 'required|exists:products,product_id',
            'branch_id'  => 'required|exists:branches,branch_id', //Sucursal destino
            'quantity'   => 'required|integer|min:1'
        ]);

        $productId = $request->product_id;
        $destBranchId = $request->branch_id;
        $qty = $request->quantity;

        //Transacción para asegurar integridad
        try {
            return DB::transaction(function () use ($productId, $destBranchId, $qty) {
                
                //Identificar el Almacén Central (Origen)
                $centralId = $this->getCentralBranchId();

                //2. Validar que exista la Central y que no sea la misma sucursal destino
                if (!$centralId) {
                    return response()->json(['message' => 'Error: No se encontró el Almacén Central.'], 500);
                }

                //Evitar transferencias a la misma sucursal
                if ($centralId == $destBranchId) {
                    return response()->json(['message' => 'No puedes transferir a la misma sucursal.'], 400);
                }

                //Verificar Stock disponible en Tabla Pivote
                $sourceStock = DB::table('branch_product')
                    ->where('product_id', $productId)
                    ->where('branch_id', $centralId)
                    ->value('stock');

                //Si no hay stock suficiente en la sucurlal origen
                if (!$sourceStock || $sourceStock < $qty) {
                    return response()->json([
                        'message' => "Stock insuficiente en Almacén Central. Disponible: " . ($sourceStock ?? 0)
                    ], 400);
                }

                //Restar el stock de la Central
                DB::table('branch_product')
                    ->where('product_id', $productId)
                    ->where('branch_id', $centralId)
                    ->decrement('stock', $qty);

                //Enviar a la Sucursal Destino
                //Verificamos si el producto ya existe en el destino
                $exists = DB::table('branch_product')
                    ->where('product_id', $productId)
                    ->where('branch_id', $destBranchId)
                    ->exists();

                //Si ya existe, actualizamos el stock
                if ($exists) {
                    DB::table('branch_product')
                        ->where('product_id', $productId)
                        ->where('branch_id', $destBranchId)
                        ->increment('stock', $qty);
                } else {
                    //Si no existe, creamos el registro
                    DB::table('branch_product')->insert([
                        'product_id' => $productId,
                        'branch_id'  => $destBranchId,
                        'stock'      => $qty,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                //Retornar éxito
                return response()->json(['message' => 'Transferencia realizada con éxito']);
            });
        //En caso de error, retornar mensaje
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al transferir: ' . $e->getMessage()], 500);
        }
    }
    
    //Metodo para ver stock de una sucursal específica
    public function branchStock($branch_id)
    {
        //Validar que la sucursal exista
        $branch = Branch::findOrFail($branch_id);
        
        //Obtener productos con stock en esa sucursal
        $products = $branch->products()
                           ->where('is_active', true)
                           ->with('category')
                           ->withPivot('stock')
                           ->get();

        //Retornar los productos con su stock
        return response()->json($products);
    }

    //Metodo privado para obtener la ID de la Sucursal Central
    private function getCentralBranchId()
    {
        //Primero, intentar obtener la sucursal marcada como principal
        $central = DB::table('branches')->where('is_main', true)->first();
        if ($central) return $central->branch_id;

        //Segundo, intentar obtener una sucursal llamada "Central"
        $centralByName = DB::table('branches')->where('name', 'like', '%Central%')->first();
        if ($centralByName) return $centralByName->branch_id;

        // Tercero, intentar obtener la primera que encuentre (Fallback)
        $first = DB::table('branches')->first();
        return $first ? $first->branch_id : null;
    }
}
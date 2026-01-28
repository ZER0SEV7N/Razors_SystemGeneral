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
        //1. Validacion de datos
        $request->validate([
            'product_id' => 'required|exists:products,product_id',
            'branch_id' => 'required|exists:branches,branch_id',
            'quantity' => 'required|integer|min:1'
        ]);

        return DB::transaction(function () use ($request) {
            $product = Product::lockForUpdate()->find($request->product_id);

            //1. Validar que haya suficiente en el Global
            if ($product->stock < $request->quantity) {
                return response()->json(['message' => 'Stock Global insuficiente'], 400);
            }

            //2. Restar del Global
            $product->decrement('stock', $request->quantity);

            //3. Sumar a la Sucursal (Tabla Pivote)
            //Usamos updateOrInsert para crear el registro si es la primera vez que llega este producto a esa sede
            $exists = DB::table('branch_product')
                        ->where('branch_id', $request->branch_id)
                        ->where('product_id', $request->product_id)
                        ->exists();
            //Actualizar o insertar el stock en la sucursal
            if ($exists) {
                DB::table('branch_product')
                    ->where('branch_id', $request->branch_id)
                    ->where('product_id', $request->product_id)
                    ->increment('stock', $request->quantity);
            //Agregar nuevo registro en la tabla pivote
            } else {
                DB::table('branch_product')->insert([
                    'branch_id' => $request->branch_id,
                    'product_id' => $request->product_id,
                    'stock' => $request->quantity,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
            //Respuesta exitosa
            return response()->json(['message' => 'Stock transferido a la sucursal correctamente']);
        });
    }
    
    //Ver stock de una sucursal específica
    public function branchStock($branch_id)
    {
        $branch = Branch::with('products')->findOrFail($branch_id);
        return response()->json($branch->products);
    }
}
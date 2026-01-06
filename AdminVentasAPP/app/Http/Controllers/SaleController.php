<?php
//adminventasapp/app/Http/Controllers/SaleController.php
//Controlador para gestionar las operaciones relacionadas con las ventas.
namespace App\Http\Controllers;
//Importar los modelos necesarios
use App\Models\Sale; 
use App\Models\SaleDetail;
use App\Models\Client;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    //Métodos para gestionar las ventas (index, show, store, update, destroy) irían aquí
    public function index()
    {
        $sales = Sale::with(['client', 'user', 'details.product'])
            ->latest()
            ->paginate(10);
        return response()->json($sales);
    }

    //Funcion para crear una nueva venta
    public function store(Request $request)
    {
        //1. Validacion de datos
        $request->validate([
            'client_id' => 'nullable|exists:clients,client_id',
            'products' => 'required|array|min:1', //Es necesario un solo producto
            'products.*.product_id' => 'required|exists:products,product_id',
            'products.*.quantity' => 'required|integer|min:1',
        ]);

        try{
            //2. Iniciar la transaccion
            DB::beginTransaction(); 
            //Calcular el total de la venta y preparar los datos
            $totalSale = 0;
            $saleDetails = [];

            //3. Crear la cabecera de la venta
            $sale = Sale::create([
                'user_id' => $request->user()->user_id, //Asignar el usuario autenticado como vendedor
                'client_id' => $request->client_id,
                'sale_date' => now(),
                'total' => 0, //Se actualizara luego
                'status' => 'PENDIENTE',
            ]);

            //4. Procesar cada producto
            foreach($request->products as $item){
                $product = Product::lockForUpdate()->find($item['product_id']);

                //Verificar stock
                if($product->stock < $item['quantity']){
                    throw new \Exception("Stock insuficiente para el producto: {$product->name}");
                }

                //Calcular subtotal
                $price = $product->price;
                $subtotal = $price * $item['quantity'];

                //Crear el detalle de venta
                SaleDetail::create([
                    'sale_id' => $sale->sale_id,
                    'product_id' => $product->product_id,
                    'quantity' => $item['quantity'],
                    'price' => $price, //precio unitario Historico
                    'subtotal' => $subtotal,
                ]);

                //Actualizar el stock del producto
                $product->decrement('stock', $item['quantity']);

                //Sumar al gran total
                $totalSale += $subtotal;
            }

            //5. Actualizar el total de la venta
            $sale->update(['total' => $totalSale]);

            //6. Confirmar la transaccion
            DB::commit();

            //7. Retornar la respuesta
            return response()->json([
                'message' => 'Venta registrada con exito',
                'sale_id' => $sale->sale_id,
            ], 201);
        }catch (\Exception $e){
            //8. En caso de error, revertir la transaccion
            DB::rollBack();
            return response()->json([
                'message' => 'Error al registrar la venta: ' . $e->getMessage()
            ], 500);
        }
    }
    
    //Ver detalles de una venta
    public function show($id)
    {
        $sale = Sale::with(['client', 'user', 'details.product'])->find($id);
        //Verificar si la venta existe
        if(!$sale){
            return response()->json(['message' => 'Venta no encontrada'], 404);
        }
        //retornar la venta con sus detalles
        return response()->json($sale);
    }

    //Funcion para Anular una venta
    public function cancel($id)
    {
        $sale = Sale::with('details')->find($id);

        //Verificar si la venta existe
        if(!$sale){
            return response()->json(['message' => 'Venta no encontrada'], 404);
        }
        //Solo se pueden anular ventas PENDIENTES
        if($sale->status === 'CANCELADO'){
            return response()->json(['message' => 'La venta ya está cancelada'], 400);
        }

        try{
            DB::beginTransaction();

            //A. Devolver el stock de los productos
            foreach($sale->details as $detail){
                $product = Product::find($detail->product_id);
                //En caso de encontrar el producto
                if ($product){
                    $product->increment('stock', $detail->quantity);
                }
            
                //B. Actualizar el estado de la venta
                $sale->update(['status' => 'CANCELADO']);
                //C. Confirmar la transaccion
                DB::commit();

                return response()->json(['message' => 'Venta cancelada con exito, el stock ha sido restaurado']);
            }
        }catch (\Exception $e){
            //D. En caso de error, revertir la transaccion
            DB::rollBack();
            return response()->json([
                'message' => 'Error al cancelar la venta: ' . $e->getMessage()
            ], 500);
        }
    }
}

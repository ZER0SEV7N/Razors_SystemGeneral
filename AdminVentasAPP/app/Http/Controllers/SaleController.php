<?php
//adminventasapp/app/Http/Controllers/SaleController.php
//Controlador para gestionar las operaciones relacionadas con las ventas.
namespace App\Http\Controllers;
//Importar los modelos necesarios
use App\Models\Sale; 
use App\Models\SaleDetail;
use App\Models\Client;
use App\Models\Branch;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    //Métodos para gestionar las ventas (index, show, store, update, destroy) irían aquí
    public function index(Request $request)
    {
        $user = $request->user();

        //Cargamos relaciones útiles
        $query = Sale::with(['client', 'user', 'details.product']);

        //🔒 FILTRO DE SEGURIDAD:
        //Si NO es Admin, solo ve las ventas de su propia sucursal
        if ($user->role !== 'ADMIN') {
            $query->where('branch_id', $user->branch_id);
        }

        //Aplicar filtros de búsqueda si se proporcionan
        $sales = $query->latest()->paginate(10);
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
            'payment_method' => 'required|string', 
            'payment_reference' => 'nullable|string'
        ]);

        $user = $request->user();

        // El vendedor DEBE tener una sede asignada para poder vender
        if (!$user->branch_id) {
            return response()->json(['message' => 'No tienes una sucursal asignada para realizar ventas.'], 403);
        }

        try{
            //2. Iniciar la transaccion
            return DB::transaction(function () use ($request, $user) { 
                //Calcular el total de la venta y preparar los datos
                $totalSale = 0;
                $saleDetails = [];

                //3. Crear la cabecera de la venta
                $sale = Sale::create([
                    'user_id' => $request->user()->user_id, //Asignar el usuario autenticado como vendedor
                    'branch_id' => $user->branch_id, //Asignar la sucursal del vendedor
                    'client_id' => $request->client_id,
                    'sale_date' => now(),
                    'total' => 0, //Se actualizara luego
                    'status' => 'PENDIENTE',
                    'payment_method' => $request->payment_method,      
                    'payment_reference' => $request->payment_reference 
                ]);

                //4. Procesar cada producto
                foreach($request->products as $item){
                    //Bloquear el producto para evitar condiciones de carrera
                    $product = Product::lockForUpdate()->find($item['product_id']);

                    //1. Verificar si la sucursal del vendedor tiene este producto registrado
                    //Buscamos en la tabla pivote
                    $branchProduct = DB::table('branch_product')
                        ->where('branch_id', $user->branch_id)
                        ->where('product_id', $item['product_id'])
                        ->first(); //Usamos first() para obtener el objeto o null

                    //Verificar stock
                    if (!$branchProduct || $branchProduct->stock < $item['quantity']) {
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

                    //3. Descontar stock DE LA SUCURSAL (Tabla Pivote)
                    DB::table('branch_product')
                        ->where('branch_id', $user->branch_id)
                        ->where('product_id', $item['product_id'])
                        ->decrement('stock', $item['quantity']);

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
            });
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

    //Funcion Para actualizar el estado de una venta (por ejemplo, marcar como COMPLETADO o CANCELADO)
    public function update(Request $request, $id)
    {
        //Validar el status
        $request->validate([
            'status' => 'required|in:PAGADO,CANCELADO'
        ]);

        //Buscar la venta
        return DB::transaction(function() use ($request, $id){
            $sale = Sale::with('details')->findOrFail($id);

            //Evitar cambios si se ha procesado la solicitud
            if ($sale->status === 'CANCELADO' || $sale->status === 'PAGADO') {
                return response()->json(['message' => 'No se puede modificar una venta ya procesada'], 400);
            }

            //Caso A: Aprobar la venta (confirmado)
            if($request->status === 'PAGADO'){
                $sale->update(['status' => 'PAGADO']);
                return response()->json(['message' => 'Venta APROBADA exitosamente']);
            }

            //Caso B: Cancelar la venta
            if($request->status === 'CANCELADO'){
                //Restaurar el stock de los productos
                foreach($sale->details as $detail){
                    Product::where('product_id', $detail->product_id)
                        ->increment('stock', $detail->quantity);
                }
                $sale->update(['status' => 'CANCELADO']);
                return response()->json(['message' => 'Venta CANCELADA exitosamente']);
            }
        });
    }
    //Bloquear la eliminacion de ventas
    public function destroy($id) {
        return response()->json(['message' => 'Acción no permitida. Use CANCELAR.'], 403);
    }
}


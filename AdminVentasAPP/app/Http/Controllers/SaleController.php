<?php
//adminventasapp/app/Http/Controllers/SaleController.php
//Controlador para gestionar las operaciones relacionadas con las ventas.
namespace App\Http\Controllers;
//Importar los modelos necesarios
use App\Models\Sale; 
use App\Models\SaleDetail;
use App\Models\Client;
use App\Models\Branch;
use App\Models\DespathGuide;
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
        $query = Sale::with(['client', 'user', 'details.product', 'despath_guide']); 

        //Si NO es OWNER, solo ve las ventas de su propia sucursal
        if ($user->role !== 'OWNER') {
            $query->where('branch_id', $user->branch_id);
        }

        //Aplicar filtros de búsqueda si se proporcionan
        return response()->json($query->latest()->paginate(10));
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
            'payment_reference' => 'nullable|string',
            // NUEVO: Aceptamos branch_id opcional
            'branch_id' => 'nullable|exists:branches,branch_id' 
        ]);

        $user = $request->user(); //Usuario autenticado

        //Determinar la sucursal para la venta
        $targetBranchId = null;

        //El vendedor DEBE tener una sede asignada para poder vender
        if($user->role === 'OWNER') {
            //Si es Owner, usamos la sucursal que eligió en el frontend.
            //Si no eligió ninguna, intenta usar su asignada (si tuviera).
            $targetBranchId = $request->branch_id ?? $user->branch_id;
        } else {
            //Si es Vendedor/Admin, FORZAMOS su propia sucursal por seguridad.
            $targetBranchId = $user->branch_id;
        }

        //Validación final: No se puede vender en el aire
        if (!$targetBranchId) {
            return response()->json(['message' => 'No se ha especificado una sucursal para la venta.'], 400);
        }

        try{
            //Iniciar la transaccion
            return DB::transaction(function () use ($request, $user, $targetBranchId) { 
                //Calcular el total de la venta y preparar los datos
                $totalSale = 0;
                $saleDetails = [];

                //Crear la cabecera de la venta
                $sale = Sale::create([
                    'user_id' => $request->user()->user_id, //Asignar el usuario autenticado como vendedor
                    'branch_id' => $targetBranchId, //Asignar la sucursal determinada
                    'client_id' => $request->client_id,
                    'sale_date' => now(),
                    'total' => 0, //Se actualizara luego
                    'status' => 'PENDIENTE',
                    'payment_method' => $request->payment_method,      
                    'payment_reference' => $request->payment_reference 
                ]);

                //Procesar cada producto
                foreach($request->products as $item){
                    //Validar Stock en la sucursal seleccionada
                    $branchProduct = DB::table('branch_product')
                        ->where('branch_id', $targetBranchId) //Sucursal seleccionada
                        ->where('product_id', $item['product_id']) //Producto actual
                        ->first();
                    
                    //Obtener el producto para el precio historico
                    $product = Product::find($item['product_id']);

                    //Obtener el producto para el precio historico
                    if (!$branchProduct || $branchProduct->stock < $item['quantity']) {
                        $prodName = Product::find($item['product_id'])->name;
                        throw new \Exception("Stock insuficiente en la sucursal seleccionada para: {$prodName}");
                    }

                    //Calcular subtotal
                    $product = Product::find($item['product_id']);
                    $subtotal = $product->price * $item['quantity'];

                    //Crear el detalle de venta
                    SaleDetail::create([
                        'sale_id' => $sale->sale_id,
                        'product_id' => $product->product_id,
                        'quantity' => $item['quantity'],
                        'price' => $product->price, //precio unitario Historico
                        'subtotal' => $subtotal,
                    ]);

                    //Descontar stock DE LA SUCURSAL (Tabla Pivote)
                    DB::table('branch_product')
                        ->where('branch_id', $targetBranchId)
                        ->where('product_id', $item['product_id'])
                        ->decrement('stock', $item['quantity']);

                    //Sumar al gran total
                    $totalSale += $subtotal;
                }

                //Actualizar el total de la venta
                $sale->update(['total' => $totalSale]);

                //Confirmar la transaccion
                DB::commit();

                //Retornar la respuesta
                return response()->json([
                    'message' => 'Venta registrada con exito',
                    'sale_id' => $sale->sale_id,
                ], 201);
            });
        }catch (\Exception $e){
            //En caso de error, revertir la transaccion
            DB::rollBack();
            return response()->json([
                'message' => 'Error al registrar la venta: ' . $e->getMessage()
            ], 500);
        }
    }
    
    //Funcion para Ver detalles de una venta
    public function show($id)
    {
        $user = auth()->user();
        $sale = Sale::with(['client', 'user', 'details.product'])->find($id);
        
        //Verificar si la venta existe
        if(!$sale){
            return response()->json(['message' => 'Venta no encontrada'], 404);
        }

        //Seguridad: Si no es OWNER, validar que la venta sea de su sucursal
        if ($user->role !== 'OWNER' && $sale->branch_id !== $user->branch_id) {
            return response()->json(['message' => 'No autorizado'], 403);
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
        //Iniciar la transaccion
        try{
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
                    //Devolver stock a la SUCURSAL DE LA VENTA ORIGINAL ($sale->branch_id)
                    foreach ($sale->details as $detail) {
                        DB::table('branch_product')
                            ->where('branch_id', $sale->branch_id) //Tomar la sucursal de la venta
                            ->where('product_id', $detail->product_id)
                            ->increment('stock', $detail->quantity);
                    }
                    //Actualizar el estado de la venta
                    $sale->update(['status' => 'CANCELADO']);
                    //Retornar respuesta
                    return response()->json(['message' => 'Venta ANULADA exitosamente']);
                }
            });

        }catch (\Exception $e){
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar la venta: ' . $e->getMessage()
            ], 500);
        }
    }
    //Bloquear la eliminacion de ventas
    public function destroy($id) {
        return response()->json(['message' => 'Acción no permitida. Use CANCELAR.'], 403);
    }
}


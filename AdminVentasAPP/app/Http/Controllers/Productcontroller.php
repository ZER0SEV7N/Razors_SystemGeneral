<?php
//AdminVentasAPP/app/Http/Controllers/ProductController.php
//Controlador para gestionar las operaciones relacionadas con los productos
// ---------------------------------------------------------------
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product; //Importa el modelo Product
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    //Funcion para mostrar todos los productos en formato JSON
    //Con un filtrado dependiendo de los parámetros de consulta
    public function index(Request $request)
    {
        $query = Product::query();
        //Cargar relaciones necesarias
        $query->with(['category', 'user', 'branches']);

        //1. Filtrar por estado (activo/inactivo)
        if ($request->boolean('show_inactive')){
            $query->where('is_active', false);
        } else {
            $query->where('is_active', true);
        }

        //2. Filtrar por nombre (Buscador general)
        $query->when($request->input('search'), function ($q, $search){
            return $q->where('name', 'like', "%{$search}%");
        });

        //3. Filtro por Categoria
        $query->when($request->input('category_id'), function ($q, $categoryId){
            return $q->where('category_id', $categoryId);
        });

        //4. Filtro por Stock Bajo (Alerta de stock)
        $query->when($request->boolean('low_stock'), function ($q){
            return $q->whereColumn('stock', '<=', 'min_stock');
        });

        //5. Filtro por Rango de Precio
        $query->when($request->input('price_min'), function ($q, $priceMin){
            return $q->where('price', '>=', $priceMin);
        });

        $query->when($request->input('price_max'), function ($q, $priceMax){
            return $q->where('price', '<=', $priceMax);
        });

        //Ordenamiento y Paginacion
        return response()->json(
            $query->latest()
                ->paginate(10)
        );
    }

    //Funcion para crear un nuevo producto 
    public function store(Request $request)
    {
        //Validar los datos de entrada
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,category_id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'nullable|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048', //Max 2MB
        ]);

        //En caso de que se suba una imagen, guardarla en el storage y enviar la ruta
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }
        //Asignar el ID del usuario autenticado como creador del producto
        $data['user_id'] = auth()->id();
        
        //Inicio de transacción para asegurar integridad de datos
        try {
            return DB::transaction(function () use ($data) {

                //Guardar el stock real en una variable aparte
                $realStock = $data['stock'];
                
                //Forzar que el stock "base" sea 0 para que no se sume doble en el frontend
                $data['stock'] = 0; 

                //1. Crear producto (con stock 0 en la tabla products)
                $product = Product::create($data); 

                //2. Asignar Stock REAL al "Almacén Central" (tabla pivote)
                $targetBranchId = $this->getCentralBranchId();
                
                //Insertar en la tabla pivote branch_product
                DB::table('branch_product')->insert([
                    'branch_id' => $targetBranchId,
                    'product_id' => $product->product_id,
                    'stock' => $realStock, //Aquí va el stock verdadero
                    'created_at' => now(), //Marcas de tiempo
                    'updated_at' => now()
                ]);

                //3. Retornar el producto creado
                return response()->json($product->fresh(), 201);
            });
        //En caso de error, retornar mensaje
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error backend: ' . $e->getMessage()], 500);
        }
    }

    //Funcion para mostrar un producto específico
    public function show(Product $product)
    {
        //Cargar relaciones necesarias y retornar el producto
        return response()->json($product->load(['category', 'user']));
    }

    //Funcion para actualizar un producto existente
    public function update(Request $request, $id)
    {
        //Buscar el producto por ID
        $product = Product::findOrFail($id);

        //Validar los datos de entrada
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'sometimes|required|exists:categories,category_id',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'min_stock' => 'nullable|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        //En caso de que se suba una nueva imagen, guardarla y eliminar la anterior
        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image); //Eliminar imagen anterior
            }
            $data['image'] = $request->file('image')->store('products', 'public'); //Guardar nueva imagen y obtener ruta
        }

        //Inicio de transacción para asegurar integridad de datos
        try {
            return DB::transaction(function () use ($request, $product, $data) {
                
                //Si se envía stock, actualizar la tabla pivote branch_product
                if ($request->has('stock')) {
                    //Guardamos el valor para usarlo en la sucursal
                    $realStock = $request->stock; 
                    
                    //Forzamos 0 en la tabla base para limpiar duplicados antiguos y prevenir nuevos
                    $data['stock'] = 0; 

                    //Actualizar Tabla Pivote (Aquí va el stock real)
                    $targetBranchId = $this->getCentralBranchId();

                    //Usamos updateOrInsert por si no existía el registro
                    DB::table('branch_product')->updateOrInsert(
                        [
                            'product_id' => $product->product_id, 
                            'branch_id' => $targetBranchId
                        ],
                        [
                            'stock' => $realStock, // 50
                            'updated_at' => now()
                        ]
                    );
                }

                //Actualizar Producto Base (con stock=0)
                $product->update($data); 

                //Retornar el producto actualizado
                return response()->json([
                    'message' => 'Producto actualizado correctamente',
                    'product' => $product->fresh() 
                ]);
            });
        //En caso de error, retornar mensaje
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }

    //Metodo privado para obtener la ID de la Sucursal Central
    private function getCentralBranchId()
    {
        //Primero, intentar obtener la sucursal marcada como principal
        $user = auth()->user();

        //Si el usuario tiene una sucursal asignada, usar esa
        if ($user && $user->branch_id) {
            return $user->branch_id;
        }

        //Segundo, intentar obtener una sucursal llamada "Central"
        $central = DB::table('branches')->where('is_main', true)->first();
        if ($central) return $central->branch_id;

        //Tercero, intentar obtener una sucursal llamada "Central"
        $centralByName = DB::table('branches')->where('name', 'like', '%Central%')->first();
        if ($centralByName) return $centralByName->branch_id;

        // Cuarto, crear una sucursal "Central" por defecto si no existe ninguna
        $company = DB::table('company')->first();
        if ($company) {
            $companyId = $company->company_id;
        } else {
            //Crear la empresa por defecto
            $companyId = DB::table('company')->insertGetId([
                'name' => 'Mi Empresa',
                'ruc' => '00000000000',
                'address' => 'Dirección Principal',
                'phone' => '-',
                'email' => 'admin@empresa.com',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        //Retornar el ID de la sucursal recién creada
        return DB::table('branches')->insertGetId([
            'company_id' => $companyId,
            'name' => 'Almacén Central',
            'address' => 'Oficina Principal',
            'phone' => '-',
            'code' => 'CENTRAL-01',
            'is_main' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    //Funcion para desactivar un producto (soft delete)
    public function destroy($id)
    {
        //Buscar el producto por ID
        $product = Product::findOrFail($id);
        if (!$product->is_active) {
            return response()->json(['message' => 'El producto ya está inactivo'], 400);
        }
        //Desactivar el producto
        $product->update(['is_active' => false]);
        return response()->json(['message' => 'Producto desactivado']);
    }

    //Funcion para reactivar un producto
    public function reactivate($id)
    {
        //Buscar el producto por ID
        $product = Product::findOrFail($id);
        //Verificar si ya está activo
        if ($product->is_active) {
            return response()->json(['message' => 'El producto ya está activo'], 400);
        }
        //Reactivar el producto
        $product->update(['is_active' => true]);
        return response()->json(['message' => 'Producto reactivado']);
    }

    //Funcion para eliminar un producto permanentemente (solo en entorno local)
    public function delete($id)
    {
        if (!app()->isLocal()) abort(403);
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(['message' => 'Eliminado permanentemente']);
    }
}
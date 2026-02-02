<?php
//Razors_SystemGeneral/AdminVentasAPP/Routes/api.php
//Api Routes para la aplicacion AdminVentasAPP, se definen las rutas que seran accedidas mediante peticiones API.
use App\Http\Controllers\{
    AuthController,
    ProfileController,
    UserController,
    CompanyController,
    BranchController,
    CategoryController,
    ProductController,
    SaleController,
    ClientController,
    ReportController,
    DespathGuideController,
    DashboardController,
    InventoryController,
};
use Illuminate\Support\Facades\Route;
    /*--------------------------------------------------------------------------
    | RUTAS PÚBLICAS (Sin Token)
    |--------------------------------------------------------------------------*/
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']); // Se deshabilita tras crear el primer usuario

    /*--------------------------------------------------------------------------
    | RUTAS PROTEGIDAS (Requieren Token)
    |--------------------------------------------------------------------------*/
    Route::middleware('auth:sanctum')->group(function () {

        // =========================================================================
        // 🟢 NIVEL 1: COMÚN (Todos - Siempre limitado a su Sucursal)
        // =========================================================================
        Route::controller(AuthController::class)->group(function () {
            Route::get('/profile', 'profile');
        });
        Route::put('/profile', [ProfileController::class, 'update']);

        // Lectura para Vender (Visualizar Catálogo Global)
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/products', [ProductController::class, 'index']); 
        Route::get('/products/{id}', [ProductController::class, 'show']);
        Route::apiResource('clients', ClientController::class);

        // Operativa de Ventas (Limitada por Sede en el Controlador)
        Route::controller(SaleController::class)->group(function () {
            Route::get('/sales', 'index');       
            Route::get('/sales/{id}', 'show');   
            Route::post('/sales', 'store');      
        });
        Route::get('/reports/sales/{id}', [ReportController::class, 'saleInvoice']);

    //=========================================================================
    //🟡 NIVEL 2: OPERATIVO DE SEDE (ADMIN, GERENTE)
    //=========================================================================
    //Nota: El OWNER también entra aquí por herencia de permisos (si lo deseas) 
    //o simplemente se le da acceso explícito. Para simplificar, asumimos que 
    //ADMIN gestiona la sede.
    Route::middleware(['role:OWNER,ADMIN,GERENTE'])->group(function () {
        
        // Aprobación de Ventas Locales
        Route::put('/sales/{id}', [SaleController::class, 'update']); 
        
        // Guías de Remisión
        Route::get('/guides/{id}', [DespathGuideController::class, 'show']);
        Route::get('/guides/{id}/pdf', [DespathGuideController::class, 'pdf']);
        Route::post('/guides', [DespathGuideController::class, 'store']); 
    });

    //=========================================================================
    //🟠 NIVEL 3: ADMINISTRACIÓN DE SEDE (Solo ADMIN y OWNER)
    //=========================================================================
    Route::middleware(['role:OWNER,ADMIN'])->group(function () {
        
        //Gestión de Usuarios (El controlador filtrará para que ADMIN solo vea los suyos)
        Route::apiResource('users', UserController::class);

        //Inventario y Reportes
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::controller(ReportController::class)->group(function () {
            Route::get('/reports/monthly', 'monthlySales');
            Route::get('/reports/inventory', 'inventoryReport');
        });

        //Movimiento de Inventario (Distribuir a SU sucursal)
        Route::controller(InventoryController::class)->group(function () {
            Route::post('/inventory/transfer', 'transferStock');
            Route::get('/inventory/branch/{id}', 'branchStock'); 
        });
    });

    //=========================================================================
    //🔴 NIVEL 4: DUEÑO SUPREMO (Solo OWNER)
    //=========================================================================
    Route::middleware(['role:OWNER'])->group(function () {
        
        //Gestión de la Empresa
        Route::controller(CompanyController::class)->group(function () {
            Route::get('/company', 'index');
            Route::match(['put', 'post'], '/company', 'update');
        });

        //Gestión de Estructura (Crear/Borrar Sucursales)
        Route::apiResource('branches', BranchController::class);

        //Gestión del Catálogo Global (Crear/Borrar Productos Globales)
        //El ADMIN solo ve el catálogo, el OWNER lo modifica.
        Route::controller(ProductController::class)->group(function () {
            Route::post('/products', 'store');
            Route::put('/products/{id}', 'update');
            Route::post('/products/{id}', 'update'); 
            Route::patch('/products/{id}/reactivate', 'reactivate');
            Route::delete('/products/{id}', 'destroy');
            Route::delete('/products/{id}/force', 'delete');
        });

        //Categorías Globales
        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
    });
});
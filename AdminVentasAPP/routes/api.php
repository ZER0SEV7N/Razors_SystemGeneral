<?php
//Razors_SystemGeneral/AdminVentasAPP/Routes/api.php
//Api Routes para la aplicacion AdminVentasAPP, se definen las rutas que seran accedidas mediante peticiones API.
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\DespathGuideController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CompanySettingController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

/*-------------------------------------------------------
---- RUTAS Publicas ------------------------------
--------------------------------------------------------*/

//Ruta para el login de usuarios
Route::post('/login', [AuthController::class, 'login']);
//Ruta para el registro de nuevos usuarios [solo si no hay usuarios registrados, Al crear el primero se deshabilita esta ruta]
//El primer usuario registrado sera el ADMIN del sistema
Route::post('/register', [AuthController::class, 'register']);

//Rutas protegidas que requieren autenticacion
Route::middleware('auth:sanctum')->group(function () {

    //==========================================================
    //NIVEL 1: ACCESO COMÚN (Vendedores, Gerentes, Admins)
    //==========================================================

    //Perfil Personal
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/profile', [ProfileController::class, 'update']); //Actualizar datos y foto

    //Ventas (Punto de Venta)
    Route::get('/sales', [SaleController::class, 'index']);      //Historial
    Route::get('/sales/{id}', [SaleController::class, 'show']);  //Detalle
    Route::post('/sales', [SaleController::class, 'store']);     //Registrar Venta (Nace PENDIENTE)
    
    //Reportes Básicos (Boleta/Factura individual para entregar al cliente)
    Route::get('/reports/sales/{id}', [ReportController::class, 'saleInvoice']);

    //Clientes (Necesario para vender)
    Route::apiResource('clients', ClientController::class);

    //Consulta de Inventario (Solo lectura para poder vender)
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::get('/categories', [CategoryController::class, 'index']);

    //Consultar las guias de remision
    Route::get('/guides/{id}', [DespathGuideController::class, 'show']); //Ver datos
    Route::get('/guides/{id}/pdf', [DespathGuideController::class, 'pdf']); //Descargar PDF
    
    //==========================================================
    //NIVEL 2: SUPERVISIÓN (ADMIN y GERENTE)
    //==========================================================
    Route::middleware(['role:ADMIN,GERENTE'])->group(function () {
        
        //Gestión de Productos (Crear, Editar, Desactivar)
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);  //Edición normal
        Route::post('/products/{id}', [ProductController::class, 'update']); //Fix para subir imagen en edición
        Route::patch('/products/{id}/reactivate', [ProductController::class, 'reactivate']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']); //Soft delete (Desactivar)

        //Gestión de Categorías
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        //Aprobación de Ventas (Confirmar pago o Anular)
        Route::put('/sales/{id}', [SaleController::class, 'update']);
        
        //Gestión de Guías de Despacho
        Route::post('/guides', [DespathGuideController::class, 'store']); //Crear guía desde venta

    });

    //==========================================================
    //NIVEL 3: SOLO DUEÑO (ADMIN)
    //==========================================================
    Route::middleware(['role:ADMIN'])->group(function () {
        
        //Gestión de Usuarios (Crear nuevos Vendedores/Gerentes)
        Route::apiResource('users', UserController::class);

        //Configuración Global (Logo, Nombre Empresa)
        Route::get('/settings/company', [CompanySettingController::class, 'index']);
        Route::post('/settings/company', [CompanySettingController::class, 'update']);

        //Datos Financieros y Reportes Globales
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/reports/monthly', [ReportController::class, 'monthlySales']);
        
        //Eliminación física (Solo Admin debería tener este poder destructivo)
        Route::delete('/products/{product}/force', [ProductController::class, 'delete']);

        //Gestión de Sedes (Sucursales)
        Route::apiResource('branches', BranchController::class);
    });
});
<?php
//Razors_SystemGeneral/AdminVentasAPP/Routes/api.php
//Api Routes para la aplicacion AdminVentasAPP, se definen las rutas que seran accedidas mediante peticiones API.
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

/*-------------------------------------------------------
---- RUTAS Publicas ------------------------------
--------------------------------------------------------*/

//Ruta para el login de usuarios
Route::post('/login', [AuthController::class, 'login']);
//Ruta para el registro de nuevos usuarios
Route::post('/register', [AuthController::class, 'register']);

//Rutas protegidas que requieren autenticacion
Route::middleware('auth:sanctum')->group(function () {

    /*-------------------------------------------------------
    ---- RUTAS PARA el usuario ------------------------------
    --------------------------------------------------------*/

    //Ruta para obtener el perfil del usuario autenticado
    Route::get('/me', [AuthController::class, 'profile']); //http://localhost:8000/api/me
    //Ruta para cerrar sesion del usuario autenticado
    Route::post('/logout', [AuthController::class, 'logout']); //http://localhost:8000/api/logout 

    /*-------------------------------------------------------
    ---- RUTA PARA DASHBOARD ------------------------------
    --------------------------------------------------------*/
    //Ruta para obtener las estadisticas del dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']); //http://localhost:8000/api/dashboard/stats

    /*-------------------------------------------------------
    ---- RUTAS PARA PRODUCTOS ------------------------------
    --------------------------------------------------------*/

    //Ruta para eliminar un producto de forma permanente <-- hard delete -->
    Route::delete('/products/{product}/force', [ProductController::class, 'delete']); //http://localhost:8000/api/products/{product}/force
    //Ruta para obtener productos inactivos
    Route::get('/products-inactive', [ProductController::class, 'inactive']); //http://localhost:8000/api/products-inactive
    //Ruta para reactivar un producto inactivo
    Route::put('/products/{product}/reactivate', [ProductController::class, 'reactivate']); //http://localhost:8000/api/products/{product}/reactivate
    //Ruta para buscar productos por nombre
    Route::get('/products/search/{name}', [ProductController::class, 'searchByName']); //http://localhost:8000/api/products/search/{name}
    //Rutas CRUD para la gestion de productos
    Route::apiResource('products', ProductController::class); //http://localhost:8000/api/products

    
    /*-------------------------------------------------------
    ---- RUTAS PARA CATEGORIAS ------------------------------
    --------------------------------------------------------*/

    //Rutas CRUD para la gestion de categorias
    Route::apiResource('categories', CategoryController::class); //http://localhost:8000/api/categories
});
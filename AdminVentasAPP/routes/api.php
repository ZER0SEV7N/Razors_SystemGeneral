<?php
//Razors_SystemGeneral/AdminVentasAPP/Routes/api.php
//Api Routes para la aplicacion AdminVentasAPP, se definen las rutas que seran accedidas mediante peticiones API.
use App\Http\Controllers\Authcontroller;
use App\Http\Controllers\Categorycontroller;
use App\Http\Controllers\Productcontroller;
use Illuminate\Support\Facades\Route;

//Ruta para el login de usuarios
Route::post('/login', [Authcontroller::class, 'login']);
//Ruta para el registro de nuevos usuarios
Route::post('/register', [Authcontroller::class, 'register']);

//Rutas protegidas que requieren autenticacion
Route::middleware('auth:sanctum')->group(function () {
    //Ruta para obtener el perfil del usuario autenticado
    Route::get('/me', [Authcontroller::class, 'profile']); //http://localhost:8000/api/me
    //Ruta para cerrar sesion del usuario autenticado
    Route::post('/logout', [Authcontroller::class, 'logout']); //http://localhost:8000/api/logout 

    //Ruta para eliminar un producto de forma permanente <-- hard delete -->
    Route::delete('/products/{product}/force', [Productcontroller::class, 'delete']); //http://localhost:8000/api/products/{product}/force
    //Ruta para obtener productos inactivos
    Route::get('/products-inactive', [Productcontroller::class, 'inactive']); //http://localhost:8000/api/products-inactive
    //Ruta para buscar productos por nombre
    Route::get('/products/search/{name}', [Productcontroller::class, 'searchByName']); //http://localhost:8000/api/products/search/{name}
    //Rutas CRUD para la gestion de productos
    Route::apiResource('products', Productcontroller::class); //http://localhost:8000/api/products

    //Rutas CRUD para la gestion de categorias
    Route::apiResource('categories', Categorycontroller::class); //http://localhost:8000/api/categories
});
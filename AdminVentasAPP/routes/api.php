<?php
//Razors_SystemGeneral/AdminVentasAPP/Routes/api.php
//Api Routes para la aplicacion AdminVentasAPP, se definen las rutas que seran accedidas mediante peticiones API.
use App\Http\Controllers\Authcontroller;

//Ruta para el login de usuarios
Route::post('/login', [Authcontroller::class, 'login']);
//Ruta para el registro de nuevos usuarios
Route::post('/register', [Authcontroller::class, 'register']);
//Ruta para cerrar sesion del usuario autenticado
Route::post('/logout', [Authcontroller::class, 'logout'])->middleware('auth:api');
//Ruta para obtener informacion del usuario autenticado
Route::middleware('auth:api')->get('/user', function () {
    return auth()->user();
    //Rutas protegidas que requieren autenticacion
});
<?php
//Razors_SystemGeneral/AdminVentasAPP/Routes/api.php
//Api Routes para la aplicacion AdminVentasAPP, se definen las rutas que seran accedidas mediante peticiones API.
use App\Http\Controllers\Authcontroller;
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
    //Ruta para actualizar el token JWT
    Route::post('/refresh', [Authcontroller::class, 'refresh']); //http://localhost:8000/api/refresh    
});
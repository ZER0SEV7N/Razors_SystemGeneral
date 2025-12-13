<?php
//AdminVentasAPP/app/Http/Controllers/Authcontroller.php
namespace App\Http\Controllers;
//Controlador para la autenticación de usuarios en la aplicación AdminVentasAPP
use App\Models\User; //Modelo de usuario
use Illuminate\Http\Request; //Manejo de solicitudes HTTP
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth; //Facades para JWT
use Illuminate\Support\Facades\Hash; //Facades para manejo de contraseñas

class Authcontroller extends Controller
{
    //Función para manejar el registro de nuevos usuarios
    public function register(Request $request)
    {
        //Validar los datos de entrada
        $validatedData = $request->validate([
            'name' => 'required|string|max:255', //nombre del usuario
            'last_name' => 'required|string|max:255', //apellido del usuario
            'email' => 'required|string|email|max:255|unique:users', //correo electrónico único
            'password' => 'required|string|min:6|confirmed', //contraseña con confirmación
            'phone' => 'nullable|string|max:20', //teléfono del usuario (opcional)
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'last_name' => $validatedData['last_name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'phone' => $validatedData['phone'] ?? null,
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json(['token' => $token], 201);
    }
    //Función para manejar el inicio de sesión de usuarios
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');
        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }
        return response()->json(['token' => $token]);
    }
}

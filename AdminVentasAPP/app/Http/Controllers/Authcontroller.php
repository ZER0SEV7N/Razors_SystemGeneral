<?php
//AdminVentasAPP/app/Http/Controllers/Authcontroller.php
namespace App\Http\Controllers;
//Controlador para la autenticación de usuarios en la aplicación AdminVentasAPP
use App\Models\User; //Modelo de usuario
use Illuminate\Http\Request; //Manejo de solicitudes HTTP
use Illuminate\Support\Facades\Hash; //Facades para manejo de contraseñas
class Authcontroller extends Controller
{
    //Función para manejar el registro de nuevos usuarios
    public function register(Request $request)
    {
        $request->headers->set('Accept', 'application/json');
        //Validar los datos de entrada
        $validatedData = $request->validate([
            'name' => 'required|string|max:255', //nombre del usuario
            'last_name' => 'required|string|max:255', //apellido del usuario
            'email' => 'required|string|email|max:255|unique:users', //correo electrónico único
            'password' => 'required|string|min:6', //contraseña con confirmación
            'phone' => 'nullable|string|max:20', //teléfono del usuario (opcional)
        ]);
        //Crear un nuevo usuario en la base de datos
        $user = User::create([
            'name' => $validatedData['name'],
            'last_name' => $validatedData['last_name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'phone' => $validatedData['phone'] ?? null,
        ]);
        #Generar el tokem
        $token = $user->createToken('auth_token')->plainTextToken;
        
        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }
    //Función para manejar el inicio de sesión de usuarios
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]); //Obtener credenciales de la solicitud
        $user = User::where('email', $credentials['email'])->first(); //Buscar usuario por correo electrónico

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        } //Verificar si el usuario existe y la contraseña es correcta

        //Generar token
        $token = $user->createToken('auth_token')->plainTextToken;

        //Retornar el token JWT generado
        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    //Funcion para obtener el perfil del usuario autenticado
    public function profile(Request $request)
    {
        return response()->json($request->user()); //Retornar los datos del usuario autenticado
    }

    //Funcion para cerrar sesión del usuario
    public function logout(Request $request)
    {
        //Invalidar el token actual
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
}

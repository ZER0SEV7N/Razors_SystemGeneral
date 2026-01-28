<?php
//adminventasapp/app/Http/Controllers/UserController.php
//Controlador para manejar las operaciones relacionadas con los usuarios
//Asignación de roles, gestión de usuarios, etc.
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule; 

class UserController extends Controller
{
    //Funcion para obtener la lista de usuarios
    public function index()
    {
        return User::with('branch')->orderBy('user_id', 'desc')->get();
    }

    //Funcion para Crear un nuevo usuario (solamente por el ADMIN)
    public function store(Request $request)
    {
        //Validar los datos de entrada
        $request->validate([
            'name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:OWNER,ADMIN,GERENTE,VENDEDOR',
            'phone' => 'nullable|string|max:20',
            'branch_id' => [Rule::requiredIf($request->role !== 'OWNER'), 
                'nullable', 
                'exists:branches,branch_id']
        ]);

        //Check si el rol es OWNER, solo un OWNER puede crear otro OWNER
        $currentUser = auth()->user();
        if ($request->role === 'OWNER' && $currentUser->role !== 'OWNER') {
            return response()->json(['message' => 'Solo un Dueño puede crear otros Dueños.'], 403);
        }

        //Crear un nuevo usuario en la base de datos
        $user = User::Create([
            'name' => $request->name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone ?? null,
            'branch_id' => $request->role === 'OWNER' ? null : $request->branch_id,
        ]);

        return response()->json([
            'message' => 'Usuario creado exitosamente',
            'user' => $user
        ], 201);
    }

    //Funcion para actualizar un usuario
    public function update(Request $request, $id)
    {
        //Buscar el usuario por ID
        $user = User::findOrFail($id);
        //Validar los datos de entrada
        $request->validate([
            'name' => 'required|string|max:255',      
            'last_name' => 'required|string|max:255', 
            'email' => 'required|email|unique:users,email,' . $id . ',user_id',
            'role' => 'required|in:ADMIN,VENDEDOR,GERENTE', 
            'password' => 'nullable|string|min:6',
            // LÓGICA CLAVE: branch_id requerido si NO es OWNER
            'branch_id' => [
                Rule::requiredIf($request->role !== 'OWNER'), 
                'nullable', 
                'exists:branches,branch_id'
            ]
        ]);

        //Asignar los nuevos valores
        $user->name = $request->name;
        $user->last_name = $request->last_name;
        $user->email = $request->email;
        $user->role = $request->role;
        $user->phone = $request->phone;
        $user->branch_id = $request->role === 'OWNER' ? null : $request->branch_id;

        //Si se proporciona una nueva contraseña, actualizarla
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        //Guardar los cambios
        $user->save();
        return response()->json($user);
    }

    //Funcion para eliminar un usuario
    public function destroy($id)
    {   
        //Buscar y eliminar el usuario
        $user = User::findOrFail($id);
        $currentUser = auth()->user();
        //1. Prevenir auto-eliminación
        if ($currentUser->user_id == $id) {
            return response()->json(['message' => 'No puedes eliminarte a ti mismo'], 400);
        }

        //2. PROTECCIÓN ABSOLUTA DEL DUEÑO (ID 1)
        //Nadie puede borrar al usuario con ID 1, ni siquiera otro Admin.
        if ($user->user_id == 1) {
            return response()->json(['message' => 'No se puede eliminar la cuenta del Dueño (Administrador Principal).'], 403);
        }

        //3. JERARQUÍA DE ADMINS
        //Si intentas borrar a un 'ADMIN', tú debes ser obligatoriamente el ID 1.
        //Esto evita que un Admin secundario borre a otro Admin.
        if ($user->role === 'ADMIN' && $currentUser->role !== 'OWNER') {
            return response()->json(['message' => 'Solo el Dueño puede eliminar a otros Administradores.'], 403);
        }

        $user->delete(); // El modelo se encarga de borrar el avatar
        return response()->json(['message' => 'Usuario eliminado']);
    }
}

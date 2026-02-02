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
        $currentUser = auth()->user(); //Obtener el usuario autenticado
        $query = User::with('branch')->orderBy('user_id', 'desc'); //Iniciar la consulta con la relación de sucursal

        // Si NO es OWNER, filtrar solo los usuarios de su propia sucursal
        if ($currentUser->role !== 'OWNER') {
            $query->where('branch_id', $currentUser->branch_id); //Filtrar por sucursal
        }

        return $query->get(); //Devolver la lista de usuarios
    }

    //Funcion para Crear un nuevo usuario (solamente por el ADMIN y OWNER)
    public function store(Request $request)
    {
        $currentUser = auth()->user();

        //Validar los datos de entrada
        $request->validate([
            'name'      => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email'     => 'required|string|email|max:255|unique:users',
            'password'  => 'required|string|min:6',
            'phone'     => 'nullable|string|max:20',
            'role'      => 'required|in:OWNER,ADMIN,GERENTE,VENDEDOR',
            //branch_id es opcional aquí porque lo controlamos por lógica abajo
            'branch_id' => [
                // Solo es obligatorio enviarlo si SOY OWNER y estoy creando un NO-OWNER
                Rule::requiredIf(fn() => auth()->user()->role === 'OWNER' && $request->role !== 'OWNER'), 
                'nullable', 
                'exists:branches,branch_id'
            ]
        ]);

        //2. Lógica de Asignación de Sucursal y Seguridad de Roles
        $targetBranchId = $request->branch_id;
        
        if ($currentUser->role !== 'OWNER') {
            //Un ADMIN solo puede crear usuarios para SU propia sucursal
            $targetBranchId = $currentUser->branch_id;

            //Un ADMIN no puede crear roles superiores o iguales (OWNER/ADMIN)
            if (in_array($request->role, ['OWNER', 'ADMIN'])) {
                return response()->json(['message' => 'No tienes permisos para crear este nivel de usuario.'], 403);
            }
        } else {
            //Si es OWNER creando otro OWNER, branch_id debe ser NULL
            if ($request->role === 'OWNER') {
                $targetBranchId = null;
            }
        }

        //3. Crear Usuario
        $user = User::create([
            'name'      => $request->name,
            'last_name' => $request->last_name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'role'      => $request->role,
            'phone'     => $request->phone,
            'branch_id' => $targetBranchId,
        ]);

        //Retornar respuesta
        return response()->json(['message' => 'Usuario creado exitosamente', 'user' => $user], 201);
    }

    //Funcion para actualizar un usuario
    public function update(Request $request, $id)
    {
        //Buscar el usuario por ID
        $user = User::findOrFail($id);
        //Verificar permisos del usuario autenticado
        $currentUser = auth()->user();
        // Seguridad: ADMIN no puede editar usuarios de OTRA sucursal
        if ($currentUser->role !== 'OWNER' && $user->branch_id !== $currentUser->branch_id) {
            return response()->json(['message' => 'No puedes editar usuarios de otra sede.'], 403);
        }
        //Validar los datos de entrada
        $request->validate([
            'name'      => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email,' . $id . ',user_id',
            'role'      => 'required|in:OWNER,ADMIN,VENDEDOR,GERENTE',
            'branch_id' => [
                //Solo es obligatorio enviarlo si SOY OWNER y estoy creando un NO-OWNER
                Rule::requiredIf(fn() => auth()->user()->role === 'OWNER' && $request->role !== 'OWNER'), 
                'nullable', 
                'exists:branches,branch_id'
            ]
        ]);

        //Asignar los nuevos valores
        $user->name = $request->name;
        $user->last_name = $request->last_name;
        $user->email = $request->email;
        $user->phone = $request->phone;

        //Solo OWNER puede cambiar el rol libremente. ADMIN limitado.
        if ($currentUser->role === 'OWNER') {
            $user->role = $request->role;
            $user->branch_id = ($request->role === 'OWNER') ? null : $request->branch_id;
        } else {
            //ADMIN no puede ascender a nadie a ADMIN u OWNER
            if (in_array($request->role, ['OWNER', 'ADMIN']) && $user->role !== $request->role) {
                return response()->json(['message' => 'No autorizado para asignar este rol.'], 403);
            }
            //ADMIN solo puede asignar roles inferiores al suyo mismo
            $user->role = $request->role;
        }

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
        $userToDelete = User::findOrFail($id);
        $currentUser = auth()->user();
        //1. Prevenir auto-eliminación
        if ($currentUser->user_id == $id) {
            return response()->json(['message' => 'No puedes eliminarte a ti mismo'], 400);
        }

        //Seguridad: ADMIN solo borra gente de SU sucursal
        if ($currentUser->role !== 'OWNER' && $userToDelete->branch_id !== $currentUser->branch_id) {
            return response()->json(['message' => 'No puedes eliminar usuarios de otra sede.'], 403);
        }

        // Protección de Jerarquía
        if ($userToDelete->role === 'OWNER') {
            return response()->json(['message' => 'No se puede eliminar al Dueño.'], 403);
        }
        if ($userToDelete->role === 'ADMIN' && $currentUser->role !== 'OWNER') {
            return response()->json(['message' => 'Solo el Dueño puede eliminar a otros Administradores.'], 403);
        }

        $userToDelete->is_active = false;
        $userToDelete->save();
        return response()->json(['message' => 'Usuario desactivado']);
    }
}

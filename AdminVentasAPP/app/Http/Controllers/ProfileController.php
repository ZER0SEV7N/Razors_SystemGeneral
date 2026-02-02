<?php
//adminventasapp/app/Http/Controllers/ProfileController.php
//Controlador para manejar las operaciones relacionadas con el perfil del usuario.
//Como cambiar contraseña, actualizar información personal, etc.
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    //Funcion para actualizar el perfil del usuario
    public function update(Request $request){
        $user = $request->user();

        //Validar los datos de entrada
        $request->validate([
            'name' => 'required|string|max:80',
            'last_name' => 'required|string|max:100',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->user_id, 'user_id')], //Unico excepto el propio
            'password' => 'nullable|string|min:6',
            'avatar' => 'nullable|image|max:2048', //Maximo 2MB
        ]);

        $user->name = $request->name; //Actualizar nombre
        $user->last_name = $request->last_name; //Actualizar apellido
        $user->email = $request->email; //Actualizar email

        //Si se proporciona una nueva contraseña, actualizarla
        if ($request->filled('password')){
            $user->password = Hash::make($request->password);
        }

        //---Manejo de Avatar---
        if($request->hasFile('avatar')){
            //Eliminar anterior avatar si existe
            if($user->avatar){
                Storage::disk('public')->delete($user->avatar);
            }
            //Guardar nuevo avatar
            $path = $request->file('avatar')->store('avatars', 'public');
            
            //Actualizar ruta del avatar en el usuario
            $user->avatar = $path;
        }

        $user->save(); //Guardar cambios en el usuario

        return response()->json(['message' => 'Perfil actualizado correctamente.'], 200);
    }
}

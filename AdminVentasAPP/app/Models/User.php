<?php
//Razors_SystemGeneral/AdminVentasAPP/app/Models/User.php
namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens;
    use HasFactory, Notifiable;
    protected $primaryKey = 'user_id'; //Clave primaria de la tabla users
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'last_name',
        'email',
        'password',
        'phone',
        'role',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];
    
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    //Relacion con los productos que administra o creó el usuario
    public function products()
    {
        return $this->hasMany(Product::class, 'user_id', 'user_id');
    }

    //--Evento para eliminar el avatar del usuario al ser eliminado--
    protected static function booted()
    {
        //Al eliminar un usuario, borrar su avatar si existe
        static::deleting(function ($user){
            if($user->avatar){
                Storage::delete($user->avatar);
            }
        });

        //Al actualizar un usuario, si se cambia el avatar, borrar el anterior
        static::updating(function ($user){
            if($user->isDirty('avatar')){
                $original = $user->getOriginal('avatar');
                if($original){
                    Storage::disk('public')->delete($original);
                }
            }
        });
    }
}

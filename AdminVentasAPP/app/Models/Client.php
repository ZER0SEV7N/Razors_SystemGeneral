<?php
//adminventasapp/app/Models/Client.php
//Modelo Eloquent para la tabla 'clients' en la base de datos.
 
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory; //usar HasFactory si es necesario
use Illuminate\Database\Eloquent\Model; //importar la clase Model

class Client extends Model
{
    use HasFactory; //usar el trait HasFactory si es necesario
    protected $primaryKey = 'client_id'; //Definir la llave primaria

    protected $fillable = [
        'name',
        'document_type', //DNI, RUC, etc.
        'document_number',
        'email',
        'phone',
        'address',
        'is_active',
    ];

    //Relacion con las ventas (sales)
    public function sales()
    {
        return $this->hasMany(Sale::class, 'client_id', 'client_id'); //Una cliente puede tener muchas ventas
    }
}

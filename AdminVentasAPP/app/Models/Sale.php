<?php
//adminventasapp/app/Models/Sale.php
//Modelo Eloquent para la tabla 'sales' en la base de datos.
//Representa una venta realizada en el sistema de administración de ventas.
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Sale extends Model
{
    use HasFactory;
    protected $primaryKey = 'sale_id'; //Definir la llave primaria
    protected $fillable = [
        'client_id', //clave foranea nula
        'user_id', //Clave foranea, referencia a usuario que realizó la venta
        'sale_date',
        'total',
        'status', //PENDIENTE, PAGADO, CANCELADO, ERROR
    ];
    //Castear la fecha de venta a objeto DateTime
    protected $casts = [
        'sale_date' => 'datetime',
        'total' => 'decimal:2', //Opcional: asegura que el total siempre tenga 2 decimales
    ];
    //Relacion con detalles de venta (sale_details)
    public function details()
    {
        return $this->hasMany(SaleDetail::class, 'sale_id', 'sale_id'); //Una venta tiene muchos detalles de venta
    }

    //Relacion con el cliente (clients)
    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id', 'client_id'); //Una venta pertenece a un cliente
    }

    //Relacion con el usuario (users)
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id'); //Una venta pertenece a un usuario
    }
}

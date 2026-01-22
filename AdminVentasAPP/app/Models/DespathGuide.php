<?php
//adminVentasapp/app/models/despathguide.php
//Modelo para la guía de despacho
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DespathGuide extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'guide_id'; //Clave primaria de la tabla

    protected $fillable = [
        'sale_id',
        'transfer_date',
        'motive',
        'origin_address',
        'destination_address',
        'driver_name',
        'driver_license',
        'vehicle_plate',
        'status',
    ]; //Campos que se pueden asignar masivamente

    //Relación con la Venta
    public function sale()
    {
        return $this->belongsTo(Sale::class, 'sale_id', 'sale_id');
    }
}

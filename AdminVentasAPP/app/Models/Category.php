<?php
//AdminVentasAPP/app/Models/Category.php
namespace App\Models;
//Modelo para la entidad Category en la aplicación AdminVentasAPP
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    //establecer las propiedades del modelo
    protected $fillable = [
        'name',
        'description',
        'is_active'
    ]; //Campos que se pueden asignar masivamente

    public function products()
    {
        return $this->hasMany(Product::class); //Relación uno a muchos con el modelo Product
    }
}

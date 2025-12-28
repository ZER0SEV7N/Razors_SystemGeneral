<?php
//AdminVentasAPP/app/Models/Product.php
//Modelo Eloquent para la tabla products
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; //Habilita el uso de fábricas para el modelo

class Product extends Model
{
    use HasFactory; //Incorpora la funcionalidad de fábricas
    protected $primaryKey = 'id'; //Clave primaria de la tabla

    protected $fillable = [
        'name',
        'description',
        'category_id',
        'price',
        'stock',
        'min_stock',
        'user_id',
        'is_active'
    ]; //Campos que se pueden asignar masivamente

    protected $casts = [
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'stock' => 'integer',
        'min_stock' => 'integer'
    ]; //Casteo de atributos a tipos específicos

    //Relación con la categoría del producto
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    //Relación con el usuario que creó o administra el producto
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

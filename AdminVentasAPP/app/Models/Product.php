<?php
//AdminVentasAPP/app/Models/Product.php
//Modelo Eloquent para la tabla products
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; //Habilita el uso de fábricas para el modelo
use Illuminate\support\Facades\Storage; //Para manejo de almacenamiento de archivos

class Product extends Model
{
    use HasFactory; //Incorpora la funcionalidad de fábricas
    protected $primaryKey = 'product_id'; //Clave primaria de la tabla

    protected $fillable = [
        'name',
        'description',
        'category_id',
        'image',
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
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }

    //Relación con el usuario que creó o administra el producto
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    //--Eventos del modelo de producto
    protected static function booted()
    {
        //Evento al eliminar un producto
        static::deleting(function ($product) {
            //Eliminar la imagen asociada al producto si existe
            if ($product->image) {
                Storage::disk('public')->delete($product->image);            
            }
        });

        //Evento al actualizar un producto
        static::updating(function ($product) {
            //Si la imagen ha cambiado, eliminar la imagen antigua
            if ($product->isDirty('image')) {
                $originalImage = $product->getOriginal('image');
                if ($originalImage) {
                    Storage::disk('public')->delete($originalImage);
                }
            }
        });
    }
}

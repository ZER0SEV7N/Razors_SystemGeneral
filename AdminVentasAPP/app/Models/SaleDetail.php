<?php
//adminventasapp/app/Models/SaleDetail.php
//Modelo Eloquent para la tabla 'sale_details' en la base de datos.
//Funciona como tabla intermedia entre 'sales' y 'products' para detallar los productos en cada venta.
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleDetail extends Model
{
    use HasFactory;
    protected $primaryKey = 'detail_id'; //Definir la llave primaria
    protected $fillable = [
        'sale_id', //clave foranea
        'product_id', //clave foranea
        'quantity',
        'price', //precio unitario
        'subtotal', //subtotal (quantity * price)
    ];

    //Relacion con la venta (sales)
    public function sale()
    {
        return $this->belongsTo(Sale::class, 'sale_id', 'sale_id'); //Un detalle pertenece a una venta
    }

    //Relacion con el producto (products)
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id'); //Un detalle pertenece a un producto
    }
}

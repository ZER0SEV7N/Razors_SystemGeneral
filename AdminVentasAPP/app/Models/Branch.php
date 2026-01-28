<?php
//adminVentasapp/app/models/branch.php
//Modelo para la sucursal
//Define la estructura y relaciones de la tabla branches
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Branch extends Model
{
    use HasFactory;

    protected $primaryKey = 'branch_id'; //Clave primaria de la tabla

    protected $fillable = [
        'name',
        'company_id',
        'address',
        'phone',
        'code',
        'is_main',
        'is_active',
    ]; //Campos que se pueden asignar masivamente

    //Relación: Una sucursal pertenece a una Compañía
    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id', 'company_id');
    }

    //Relación con los Usuarios asignados a esta Sucursal
    public function users()
    {
        return $this->hasMany(User::class, 'branch_id', 'branch_id');
    }

    //Relación con las Ventas realizadas en esta Sucursal
    public function sales()
    {
        return $this->hasMany(Sale::class, 'branch_id', 'branch_id');
    }

    //Relación: Una sucursal tiene muchos productos
    public function products()
    {
        return $this->belongsToMany(Product::class, 'branch_product', 'branch_id', 'product_id')
                    ->withPivot('stock')
                    ->withTimestamps();
    }
}

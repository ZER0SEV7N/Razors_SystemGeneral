<?php
//adminventasapp/app/models/company.php
//Modelo para la configuracion de la compañia
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Company extends Model
{
    use HasFactory;

    protected $table = 'company'; //Nombre de la tabla asociada al modelo
    protected $primaryKey = 'company_id'; //Clave primaria de la tabla

    protected $fillable = [
        'name',
        'ruc',         // Agregamos RUC (importante para facturación)
        'address',
        'phone',
        'email',       // Agregamos Email de contacto
        'website',     // Agregamos Web
        'logo_path',
    ]; //Campos que se pueden asignar masivamente

    //Relación: Una compañía tiene muchas sucursales
    public function branches()
    {
        return $this->hasMany(Branch::class, 'company_id', 'company_id');
    }

    //--Eventos del modelo de configuración de la compañía--
    protected static function booted()
    {
        //Evento al eliminar la configuración de la compañía
        static::deleting(function ($companySetting) {
            //Eliminar el logo asociado si existe
            if ($companySetting->logo_path) {
                Storage::disk('public')->delete($companySetting->logo_path);            
            }
        });
        //Evento al actualizar la configuración de la compañía
        static::updating(function ($companySetting) {
            //Si el logo ha cambiado, eliminar el logo antiguo
            if ($companySetting->isDirty('logo_path')) {
                $originalLogo = $companySetting->getOriginal('logo_path');
                if ($originalLogo) {
                    Storage::disk('public')->delete($originalLogo);
                }
            }
        });
    }
}

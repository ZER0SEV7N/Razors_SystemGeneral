<?php
//AdminVentasAPP/database/migrations/2026_01_12_213351_create_company_settings_table.php
//Migración para crear la tabla 'company_settings' con campos id, 'name', 'address', 'phone', 'logo_path', 'timestamps'.
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id('company_id');
            $table->string('name') ->default('My Company'); //Nombre de la empresa con valor por defecto
            $table->string('address') ->nullable(); //Dirección de la empresa, puede ser nulo
            $table->string('phone')->nullable(); //Teléfono de la empresa, puede ser nulo
            $table->string('logo_path')->nullable(); //Ruta del logo de la empresa, puede ser nulo
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};

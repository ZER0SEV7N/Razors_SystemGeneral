<?php
//adminventasapp/database/migrations/2026_01_04_171429_create_clients_table.php
//Migración para crear la tabla 'clients' en la base de datos.
//Contiene los métodos para ejecutar y revertir la migración.
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
        Schema::create('clients', function (Blueprint $table) {
            $table->id('client_id'); //clave primaria
            $table->string('name'); //nombre del cliente
            $table->string('document_type')->default('DNI'); //tipo de documento (DNI, RUC, etc.)
            $table->string('document_number')->unique(); //número de documento único
            $table->string('email')->nullable(); //correo electrónico (opcional)
            $table->string('phone')->nullable(); //número de teléfono (opcional)
            $table->string('address')->nullable(); //dirección del cliente (opcional)
            $table->boolean('is_active')->default(true); //estado del cliente (activo/inactivo)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};

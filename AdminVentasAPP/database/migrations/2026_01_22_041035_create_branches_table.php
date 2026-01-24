<?php
//adminVentasapp/database/migrations/2026_01_22_041035_create_branches_table.php
//Migración para crear la tabla de sucursales
//Define la estructura de la tabla en la base de datos
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branches', function (Blueprint $table) {
            $table->id('branch_id');
            $table->foreignId('company_id')
                  ->constrained('company', 'company_id')
                  ->onDelete('cascade');
            $table->string('name'); // Ej: Sede Central
            $table->string('address'); // Dirección de la sede
            $table->string('phone')->nullable();
            $table->string('code')->nullable(); // Ej: S001 (Para series de facturación)
            $table->boolean('is_main')->default(false); // ¿Es la sede principal?
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};
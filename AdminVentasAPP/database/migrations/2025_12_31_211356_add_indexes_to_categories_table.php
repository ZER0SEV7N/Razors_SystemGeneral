<?php
//adminVentasAPP/database/migrations/2025_12_31_211356_add_indexes_to_categories_table.php
//Migracion para agregar índices a la tabla 'categories' para optimizar consultas frecuentes
//Índices en las columnas: is_active, name
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
        Schema::table('categories', function (Blueprint $table) {
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
        });
    }
};

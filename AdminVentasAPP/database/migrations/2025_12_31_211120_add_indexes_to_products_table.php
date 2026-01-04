<?php
//adminVentasAPP/database/migrations/2025_12_31_211120_add_indexes_to_products_table.php
//Migracion para agregar índices a la tabla 'products' para optimizar consultas frecuentes
//Índices en las columnas: is_active, category_id, user_id, price
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
        //Indices para optimizar consultas frecuentes
        Schema::table('products', function (Blueprint $table) {
            $table->index('is_active');
            $table->index('category_id');
            $table->index('user_id');
            $table->index('price');
        });
    }
    /**
     * Reverse the migrations.
     */
    
    public function down(): void
    {
        //Eliminar índices si se revierte la migración
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
            $table->dropIndex(['category_id']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['price']);
        });
    }
};

<?php
//AdminVentasAPP/database/migrations/2025_12_11_220159_create_categories_table.php
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
        Schema::create('categories', function (Blueprint $table) {
            $table->id('category_id'); //Clave primaria de la tabla categories
            $table->string('name')->unique(); //Nombre de la categoría, único
            $table->text('description')->nullable(); //Descripción de la categoría (permite nulos)
            $table->boolean('is_active')->default(true); //Indica si la categoría está activa, valor por defecto true
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};

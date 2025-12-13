<?php

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
        #Esquema de la tabla products
        Schema::create('products', function (Blueprint $table) {
            $table->id(); #Primary key
            $table->string('name'); #Nombre del producto
            $table->text('description')->nullable(); #Descripción del producto (permite nulos)
            $table->decimal('price', 8, 2); #Precio del producto con 2 decimales
            $table->integer('stock'); #Cantidad en inventario
            $table->integer('min_stock')->default(0); #Stock mínimo con valor por defecto 0
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); #Clave foránea a la tabla users
            $table->timestamps(); #Campos created_at y updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};

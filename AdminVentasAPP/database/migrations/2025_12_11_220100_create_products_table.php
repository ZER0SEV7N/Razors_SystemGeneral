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
            $table->id('product_id'); #Primary key
            $table->string('name'); #Nombre del producto
            $table->text('description')->nullable(); #Descripción del producto (permite nulos)
            $table->unsignedBigInteger('category_id')->nullable(); #Clave foránea a la tabla categories
            $table->decimal('price', 8, 2); #Precio del producto con 2 decimales
            $table->unsignedInteger('stock'); #Cantidad en inventario
            $table->unsignedInteger('min_stock')->default(0); #Stock mínimo con valor por defecto 0
            $table->unsignedBigInteger('user_id')->nullable(); #Clave foránea a la tabla users (quien creó o administra el producto)
            $table->boolean('is_active')->default(true); #Indica si el producto está activo, valor por defecto true
            $table->timestamps(); #Campos created_at y updated_at

            //Claves foráneas
            //FK USUARIOS: Si se borra el usuario, poner NULL (para no perder el producto)
            $table->foreign('user_id')
                ->references('user_id')
                ->on('users')
                ->onDelete('set null'); 
                        
            //FK CATEGORIAS: Si se borra la categoria, poner NULL (o usa 'restrict' para impedir borrarla)
            $table->foreign('category_id')
                ->references('category_id')
                ->on('categories')
                ->onDelete('set null');
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

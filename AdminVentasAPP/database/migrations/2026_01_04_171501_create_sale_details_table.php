<?php
//adminventasapp/database/migrations/2026_01_04_171501_create_sale_details_table.php
//Migración para crear la tabla 'sale_details' en la base de datos.
//Funciona como tabla intermedia entre 'sales' y 'products' para detallar los productos en cada venta.
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
        Schema::create('sale_details', function (Blueprint $table) {
            $table->id('detail_id'); //clave primaria
            //Relacion con venta
            $table->unsignedBigInteger('sale_id'); //clave foranea
            //Relacion con producto
            $table->unsignedBigInteger('product_id'); //clave foranea
            $table->integer('quantity'); //cantidad vendida del producto
            $table->decimal('price', 10, 2); //precio unitario
            $table->decimal('subtotal', 10, 2); //subtotal (quantity * price)
            $table->timestamps();

            //FK SALES: Si se borra la venta, borrar los detalles (cascade)
            $table->foreign('sale_id')
                ->references('sale_id')
                ->on('sales')
                ->onDelete('cascade');
            //FK PRODUCTS: Si se borra el producto, impedir borrarlo (restrict)
            $table->foreign('product_id')
                ->references('product_id')
                ->on('products')
                ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_details');
    }
};

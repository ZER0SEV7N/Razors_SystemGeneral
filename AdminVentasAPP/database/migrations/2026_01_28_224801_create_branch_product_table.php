<?php
//AdminVentasAPP/database/migrations/2026_01_28_224801_create_branch_product_table.php
//Tabla pivote entre Sucursales y Productos para manejar el stock específico por sucursal
//Contiene referencias a las tablas branches y products, y un campo para el stock
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
        Schema::create('branch_product', function (Blueprint $table) {
            //Relación con Sucursal
            $table->foreignId('branch_id')->constrained('branches', 'branch_id')->onDelete('cascade');
            
            //Relación con Producto
            $table->foreignId('product_id')->constrained('products', 'product_id')->onDelete('cascade');
            
            //El stock ESPECÍFICO de esa sucursal
            $table->integer('stock')->default(0); 

            $table->timestamps();

            //Evitar duplicados: Un producto solo puede aparecer una vez por sucursal
            $table->unique(['branch_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branch_product');
    }
};

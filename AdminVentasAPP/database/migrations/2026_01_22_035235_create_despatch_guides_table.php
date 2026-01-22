<?php
//adminVentasapp/database/migrations/2026_01_22_035235_create_despatch_guides_table.php
//Migración para crear la tabla de guías de despacho
//Define la estructura de la tabla en la base de datos
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
        Schema::create('despatch_guides', function (Blueprint $table) {
            $table->id('guide_id'); //Clave primaria de la guía de despacho

            //Relación con la Venta (Una guía suele nacer de una venta)
            $table->unsignedBigInteger('sale_id');
            $table->foreign('sale_id')->references('sale_id')->on('sales')->onDelete('cascade');

            //Datos del Traslado
            $table->date('transfer_date'); // Fecha de inicio de traslado
            $table->string('motive')->default('VENTA'); // Venta, Traslado entre almacenes, etc.
            
            //Direcciones
            $table->string('origin_address');      // Dirección de partida (Tu empresa)
            $table->string('destination_address'); // Dirección de llegada (Cliente)

            //Datos del Transportista (Opcional)
            $table->string('driver_name')->nullable();
            $table->string('driver_license')->nullable();
            $table->string('vehicle_plate')->nullable();

            $table->string('status')->default('EMITIDO'); // EMITIDO, ANULADO
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('despatch_guides');
    }
};

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
        Schema::create('sales', function (Blueprint $table) {
            $table->id('sale_id'); //clave primaria
            //Relacion con la tabla clients
            $table->unsignedBigInteger('client_id')->nullable(); //clave foranea
            //Relacion con la tabla users
            $table->unsignedBigInteger('user_id'); //clave foranea
            $table->dateTime('sale_date'); //fecha de la venta
            $table->decimal('total', 10, 2); //Monto total de la venta
            $table->ENUM('status', ['PENDIENTE', 'PAGADO', 'CANCELADO', 'ERROR'])->default('PENDIENTE'); //estado de la venta
            $table->timestamps();

            //FK CLIENTS: Si se borra el cliente, poner NULL
            $table->foreign('client_id')
                ->references('client_id')
                ->on('clients')
                ->onDelete('set null');
            //FK USERS: Si se borra el usuario, impedir borrarlo (restrict)
            $table->foreign('user_id')
                ->references('user_id')
                ->on('users')
                ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};

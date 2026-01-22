<?php
//adminVentasapp/database/migrations/2026_01_22_041101_add_branch_id_to_users_and_sales.php
//Migración para agregar la columna branch_id a las tablas users y sales
//Establece las relaciones con la tabla branches
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        //Agregar branch_id a la tabla users
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('branch_id')->nullable()->after('role'); //Sucursal asignada al usuario
            $table->foreign('branch_id')->references('branch_id')->on('branches')->onDelete('set null'); //Si se elimina la sucursal, poner null
        });

        //Agregar branch_id a la tabla sales
        Schema::table('sales', function (Blueprint $table) {
            $table->unsignedBigInteger('branch_id')->nullable()->after('user_id'); //Sucursal donde se realizó la venta
            $table->foreign('branch_id')->references('branch_id')->on('branches')->onDelete('restrict'); //No permitir eliminar sucursal si hay ventas asociadas
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->dropColumn('branch_id');
        });
        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->dropColumn('branch_id');
        });
    }
};
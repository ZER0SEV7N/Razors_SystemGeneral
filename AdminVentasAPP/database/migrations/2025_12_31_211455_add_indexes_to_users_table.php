<?php
//adminVentasAPP/database/migrations/2025_12_31_211455_add_indexes_to_users_table.php
//Migracion para agregar índices a la tabla 'users' para optimizar consultas frecuentes
//Índices en las columnas: email, role
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
        Schema::table('users', function (Blueprint $table) {
            $table->index('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
        });
    }
};

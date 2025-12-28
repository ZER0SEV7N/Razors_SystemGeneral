<?php
//AdminVentasAPP/database/migrations/2025_12_11_220036_create_users_table.php
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
        Schema::create('users', function (Blueprint $table) {
            $table->id(); #Primary key
            $table->string('name'); #nombre del usuario
            $table->string('last_name'); #apellido del usuario
            $table->string('email')->unique(); #correo electrónico único
            $table->string('password'); #contraseña del usuario
            $table->string('phone')->nullable(); #teléfono del usuario (permite nulos)
            $table->string('role')->default('user'); #rol del usuario con valor por defecto 'user'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

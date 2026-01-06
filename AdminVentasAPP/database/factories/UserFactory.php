<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            // CAMBIO: Usamos firstName() para que sea coherente
            'name' => fake()->firstName(),
            
            // ✅ AGREGADO: Esto soluciona el error 1364
            'last_name' => fake()->lastName(),
            
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            
            // OJO: Si tienes un campo 'role' o 'is_active' que sean obligatorios en tu BD, 
            // agrégalos aquí también. Por ejemplo:
            // 'role' => 'admin',
            // 'is_active' => true,
        ];
    }
}
# 📦 Razors Administration System

![Laravel](https://img.shields.io/badge/laravel-%23FF2D20.svg?style=for-the-badge&logo=laravel&logoColor=white) ![PHP](https://img.shields.io/badge/php-%23777BB4.svg?style=for-the-badge&logo=php&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) ![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)

Este repositorio contiene el código fuente de **Razors Administration System**, un completo panel administrativo (Dashboard) Full Stack construido con **Laravel** en el Back End y **React + Vite** en el Front End. Desarrollado originalmente como una solución *freelance* para gestionar las operaciones de un negocio real, se ha consolidado como una pieza clave de mi portafolio para demostrar el manejo de arquitecturas desacopladas y la gestión segura de datos empresariales.

## 🎯 Objetivo del Proyecto
El objetivo principal es proporcionar un sistema centralizado, rápido y reactivo para administrar las operaciones comerciales críticas. El proyecto replica un ecosistema completo de **Gestión de Inventario** y **Facturación**, garantizando que la información financiera y de stock sea procesada correctamente y sea accesible únicamente por el personal autorizado.

## ⚙️ Características Principales
* **Interfaz Dinámica (SPA):** Interfaz de usuario construida con React y empaquetada con Vite, ofreciendo una experiencia fluida, transiciones rápidas y un entorno de desarrollo altamente optimizado.
* **Gestión de Inventario y Stock:** Operaciones CRUD completas para registrar, actualizar y rastrear productos, categorías y niveles de inventario en tiempo real.
* **Módulo de Facturación:** Cálculo y generación automatizada de registros de cobro para las transacciones de ventas.
* **Control de Acceso Basado en Roles (RBAC):** Implementación de roles y permisos estrictos. Los administradores y los empleados estándar tienen acceso aislado a módulos específicos del panel.
* **Autenticación por Tokens:** Comunicación segura entre el cliente React y la API de Laravel mediante autenticación por tokens, garantizando un manejo robusto de las sesiones.

## 🏗️ Arquitectura y Buenas Prácticas
Como inmersión profunda en el desarrollo Full Stack moderno, este proyecto aplica los siguientes estándares de la industria:
* **Separación de Responsabilidades:** El Front End (React) se encarga exclusivamente de la vista y la interacción del usuario, consumiendo la API RESTful provista por Laravel.
* **Eloquent ORM:** Manejo eficiente de consultas a la base de datos relacional y estructuración de relaciones complejas entre los modelos (Usuarios, Productos, Facturas).
* **Entorno de Alta Velocidad:** Uso de Vite como *bundler* para asegurar tiempos de compilación casi instantáneos (Hot Module Replacement) y *builds* optimizados para producción.

## 🚀 Requisitos e Instalación Local

1. Clonar el repositorio:
   ```bash
     git clone [https://github.com/ZER0SEV7N/Razors_SystemGeneral.git](https://github.com/ZER0SEV7N/Razors_SystemGeneral.git)
   ```

2. Navegar al directorio del proyecto e instalar las dependencias de Composer (Backend):
  ```bash
    composer install
  ```

3. Instalar las dependencias de Node.js (Frontend):
  ```bash
    npm install
  ```

4. Duplicar el archivo de entorno de ejemplo y renombrarlo a .env. Luego, configurar las credenciales de conexión a la base de datos MySQL local:
  ```bash
    cp .env.example .env
  ```

5. Generar la llave de seguridad de la aplicación de Laravel:
  ```bash
    php artisan key:generate
  ```

6. Ejecutar las migraciones para construir las tablas en la base de datos:
  ```bash
    php artisan migrate
  ```

7. Compilar los assets del Front End y levantar el servidor de desarrollo de Vite:
  ```bash
    npm run dev
  ```

8. En una terminal secundaria, levantar el servidor local de Laravel:
```bash
php artisan serve
```

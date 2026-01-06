<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReportController; 

Route::get('/', function () {
    return view('welcome');
});

// --- RUTAS DE REPORTES PDF ---
// No necesitan autenticación API, son rutas web normales
Route::controller(ReportController::class)->group(function () {
    // 1. Factura Individual (ej: /reports/sales/10)
    Route::get('/reports/sales/{id}', 'saleInvoice'); 
    
    // 2. Reporte Mensual (ej: /reports/monthly?month=1&year=2026)
    Route::get('/reports/monthly', 'monthlySales');
});
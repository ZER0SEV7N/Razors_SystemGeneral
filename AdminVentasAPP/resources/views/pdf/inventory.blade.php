<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte de Inventario</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        
        /* CABECERA (Igual que la boleta) */
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .logo { max-height: 70px; margin-bottom: 5px; }
        .company-name { font-size: 16px; font-weight: bold; margin: 5px 0; text-transform: uppercase; }
        
        /* INFO DEL REPORTE */
        .report-info { margin-bottom: 15px; width: 100%; }
        .report-title { font-size: 18px; font-weight: bold; text-align: center; background: #eee; padding: 5px; border: 1px solid #ccc; }
        
        /* TABLA DE PRODUCTOS */
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #2c3e50; color: white; padding: 6px; text-align: left; font-size: 11px; font-weight: bold; }
        td { border-bottom: 1px solid #ddd; padding: 6px; font-size: 11px; }
        
        /* ESTILOS DE COLUMNAS */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .badge-stock { color: #d35400; font-weight: bold; } /* Color naranja para stock */
        
        /* TOTALES */
        .total-section { margin-top: 15px; text-align: right; border-top: 2px solid #333; padding-top: 5px; }
        .total-label { font-weight: bold; font-size: 13px; margin-right: 10px; }
        .total-amount { font-size: 14px; font-weight: bold; color: #27ae60; }

        .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #777; border-top: 1px dashed #ccc; padding-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        
        <div class="company-name">{{ $company->name ?? 'EMPRESA' }}</div>
        <div>{{ $company->address ?? '---' }}</div>
        <div>RUC: {{ $company->ruc ?? '---' }} | Tel: {{ $company->phone ?? '---' }}</div>
    </div>

    <div class="report-info">
        <div class="report-title">REPORTE GENERAL DE INVENTARIO</div>
        <div style="text-align: right; margin-top: 5px; font-size: 10px;">
            Fecha de Emisión: {{ date('d/m/Y h:i A') }} <br>
            Generado por: Sistema
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 40%;">Producto / Descripción</th>
                <th style="width: 15%;">Categoría</th>
                <th style="width: 10%;" class="text-center">Stock</th>
                <th style="width: 15%;" class="text-right">P. Unitario</th>
                <th style="width: 15%;" class="text-right">Valor Total</th>
            </tr>
        </thead>
        <tbody>
            @php $count = 1; @endphp
            @forelse($products as $product)
            <tr>
                <td>{{ $count++ }}</td>
                <td>
                    <strong>{{ $product->name }}</strong>
                    @if(!$product->is_active) 
                        <span style="color: red; font-size: 9px;">(Inactivo)</span> 
                    @endif
                </td>
                {{-- Usamos optional() por si borraste la categoría --}}
                <td>{{ optional($product->category)->name ?? '---' }}</td>
                
                <td class="text-center">
                    <span class="{{ $product->stock <= 5 ? 'badge-stock' : '' }}">
                        {{ $product->stock }}
                    </span>
                </td>
                
                <td class="text-right">S/. {{ number_format($product->price, 2) }}</td>
                
                {{-- Calculamos Valor Total (Stock * Precio) --}}
                <td class="text-right">S/. {{ number_format($product->price * $product->stock, 2) }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="text-center" style="padding: 20px;">
                    No hay productos registrados en el inventario.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="total-section">
        <span class="total-label">VALORIZACIÓN TOTAL DEL INVENTARIO:</span>
        {{-- Usamos la variable $totalValue que calculaste en el controlador --}}
        <span class="total-amount">S/. {{ number_format($totalValue, 2) }}</span>
    </div>

    <div class="footer">
        Reporte de uso interno. | {{ $company->website ?? '' }}
    </div>
</body>
</html>
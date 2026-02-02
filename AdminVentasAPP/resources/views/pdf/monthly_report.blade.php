<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte Mensual</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; }
        .header { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #eee; border: 1px solid #999; padding: 5px; }
        td { border: 1px solid #ccc; padding: 5px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .summary-box { float: right; width: 300px; margin-top: 20px; border: 1px solid #000; padding: 10px; }
    </style>
</head>
<body>

    <div class="header">
        <h2>REPORTE MENSUAL DE VENTAS</h2>
        <h3>{{ $company->name }}</h3>
        <p>Periodo: {{ $month }}/{{ $year }} | Generado por: {{ $user->name }} ({{ $user->role }})</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Doc / Venta</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                {{-- Columnas Financieras --}}
                <th class="text-right">Base Imp.</th>
                <th class="text-right">IGV (18%)</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sales as $sale)
            @php
                // Cálculo por fila para visualización
                $rowBase = $sale->total / 1.18;
                $rowIGV = $sale->total - $rowBase;
            @endphp
            <tr>
                <td class="text-center">{{ $sale->sale_date->format('d/m/Y H:i') }}</td>
                <td class="text-center">#{{ str_pad($sale->sale_id, 6, '0', STR_PAD_LEFT) }}</td>
                <td>{{ optional($sale->client)->name ?? 'Público General' }}</td>
                <td>{{ optional($sale->user)->name }}</td>
                
                {{-- Montos --}}
                <td class="text-right">{{ number_format($rowBase, 2) }}</td>
                <td class="text-right">{{ number_format($rowIGV, 2) }}</td>
                <td class="text-right"><strong>{{ number_format($sale->total, 2) }}</strong></td>
            </tr>
            @endforeach
        </tbody>
    </table>

    {{-- CUADRO RESUMEN FINAL --}}
    <div class="summary-box">
        <h4 style="margin: 0 0 10px 0; text-align: center; border-bottom: 1px solid #ccc;">RESUMEN FINANCIERO</h4>
        <table style="border: none; margin: 0;">
            <tr>
                <td style="border: none;">Total Op. Gravada:</td>
                <td style="border: none;" class="text-right">S/. {{ number_format($totalBase, 2) }}</td>
            </tr>
            <tr>
                <td style="border: none;">Total IGV (18%):</td>
                <td style="border: none;" class="text-right">S/. {{ number_format($totalIGV, 2) }}</td>
            </tr>
            <tr>
                <td style="border: none; font-weight: bold; border-top: 1px solid #000;">TOTAL INGRESOS:</td>
                <td style="border: none; font-weight: bold; border-top: 1px solid #000;" class="text-right">S/. {{ number_format($totalIncome, 2) }}</td>
            </tr>
        </table>
    </div>
    <div class="footer" style="text-align: center; margin-top: 30px; font-size: 10px; color: #666;" >
        Sistema de Ventas Razors - Reporte Confidencial
    </div>
</body>
</html>
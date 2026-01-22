<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte Mensual</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #444; padding: 6px; }
        th { background-color: #eee; }
        .summary { margin-top: 20px; text-align: right; font-size: 14px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Reporte de Ventas Mensual</h2>
        <p>Periodo: {{ $month }} / {{ $year }}</p>
        <p>Generado el: {{ $dateGenerated->format('d/m/Y H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Método</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sales as $sale)
            <tr>
                <td>{{ $sale->sale_id }}</td>
                <td>{{ $sale->sale_date->format('d/m/Y') }}</td>
                <td>{{ $sale->client ? $sale->client->name : 'Público' }}</td>
                <td>{{ $sale->user->name }}</td>
                <td>{{ $sale->payment_method }}</td>
                <td style="text-align: right;">S/. {{ number_format($sale->total, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary">
        <div>Total Transacciones: {{ $totalTransactions }}</div>
        <div>Ingresos Totales: S/. {{ number_format($totalIncome, 2) }}</div>
    </div>

    <div class="footer">
        Sistema de Ventas Razors - Reporte Confidencial
    </div>
</body>
</html>
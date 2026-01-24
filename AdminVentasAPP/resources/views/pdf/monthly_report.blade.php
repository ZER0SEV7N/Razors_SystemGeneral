<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte Mensual</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .summary-box { background: #f8f9fa; padding: 10px; border: 1px solid #ddd; margin-bottom: 15px; text-align: center; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #333; color: white; padding: 6px; text-align: left; font-size: 11px; }
        td { border-bottom: 1px solid #ddd; padding: 6px; font-size: 11px; }
        .badge { padding: 2px 5px; border-radius: 3px; font-size: 9px; color: white; text-transform: uppercase; }
        .pagado { background: #28a745; } /* Verde */
        .cancelado { background: #dc3545; } /* Rojo */
        .pendiente { background: #ffc107; color: black; } /* Amarillo */
    </style>
</head>
<body>
    <div class="header">
        <h2 style="margin: 0;">REPORTE MENSUAL DE VENTAS</h2>
        <div style="font-size: 14px; color: #555;">{{ $company->name }}</div>
        <div>Período: {{ $month }}/{{ $year }}</div>
    </div>

    <div class="summary-box">
        <strong>Total Ingresos (Neto):</strong> S/. {{ number_format($totalIncome, 2) }} 
        &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; 
        <strong>Transacciones:</strong> {{ $totalTransactions }}
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Método</th>
                <th>Ref.</th>
                <th>Estado</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sales as $sale)
            <tr>
                <td>#{{ str_pad($sale->sale_id, 6, '0', STR_PAD_LEFT) }}</td>
                <td>{{ $sale->sale_date->format('d/m H:i') }}</td>
                <td>{{ $sale->client ? substr($sale->client->name, 0, 20) : '-' }}</td>
                <td>{{ substr($sale->user->name, 0, 15) }}</td>
                <td>{{ $sale->payment_method }}</td>
                <td>{{ $sale->payment_reference ?? '-' }}</td>
                <td>
                    <span class="badge {{ strtolower($sale->status) == 'completed' ? 'pagado' : 'cancelado' }}">
                        {{ $sale->status == 'COMPLETED' ? 'PAGADO' : $sale->status }}
                    </span>
                </td>
                <td style="text-align: right;">S/. {{ number_format($sale->total, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    <div class="footer">
        Sistema de Ventas Razors - Reporte Confidencial
    </div>
</body>
</html>
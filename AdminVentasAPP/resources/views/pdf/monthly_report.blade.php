<!DOCTYPE html>
<html>
<head>
    <title>Reporte Mensual</title>
    <style>
        body { font-family: sans-serif; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        .title { font-size: 24px; font-weight: bold; color: #1e3a8a; }
        .subtitle { color: #64748b; margin-top: 5px; }
        
        .summary-cards { width: 100%; margin-bottom: 20px; }
        .card { background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; }
        .card h3 { margin: 0; font-size: 14px; color: #64748b; }
        .card p { margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #333; }

        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
        th { background: #3b82f6; color: white; padding: 10px; text-align: left; }
        td { border-bottom: 1px solid #e2e8f0; padding: 8px; }
        tr:nth-child(even) { background-color: #f8fafc; }
        
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">REPORTE DE VENTAS MENSUAL</div>
        <div class="subtitle">Período: {{ $month }} / {{ $year }}</div>
        <small>Generado el: {{ $dateGenerated->format('d/m/Y H:i') }}</small>
    </div>

    <table class="summary-cards">
        <tr>
            <td width="50%" style="border:none; padding: 0 10px 0 0;">
                <div class="card">
                    <h3>Total Ingresos</h3>
                    <p>S/. {{ number_format($totalIncome, 2) }}</p>
                </div>
            </td>
            <td width="50%" style="border:none; padding: 0 0 0 10px;">
                <div class="card">
                    <h3>Transacciones</h3>
                    <p>{{ $totalTransactions }} Ventas</p>
                </div>
            </td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Vendedor</th>
                <th>Estado</th>
                <th style="text-align: right;">Monto</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sales as $sale)
            <tr>
                <td>#{{ $sale->sale_id }}</td>
                <td>{{ $sale->sale_date->format('d/m/Y H:i') }}</td>
                <td>{{ $sale->user->name }}</td>
                <td>{{ $sale->status }}</td>
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
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Boleta de Venta</title>
    <style>
        body { font-family: sans-serif; font-size: 13px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
        .info { margin-bottom: 20px; }
        .info div { margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #f2f2f2; border-bottom: 2px solid #ddd; padding: 8px; text-align: left; }
        td { border-bottom: 1px solid #ddd; padding: 8px; }
        .total-section { margin-top: 20px; text-align: right; }
        .total-label { font-weight: bold; font-size: 16px; }
        .total-amount { font-size: 18px; color: #2c3e50; font-weight: bold; }
        .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #777; }
        .logo { max-height: 80px; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="header">
        @if(isset($company) && $company->logo_path)
            <img src="{{ public_path('storage/'.$company->logo_path) }}" class="logo">
        @else
            <h1>{{ $company->name ?? 'Zentech' }}</h1>
        @endif
        
        <div>{{ $company->address ?? 'Dirección Principal' }}</div>
        <div>Tel: {{ $company->phone ?? '999-999-999' }}</div>
    </div>

    <div class="info">
        <h3>BOLETA DE VENTA #{{ str_pad($sale->sale_id, 6, '0', STR_PAD_LEFT) }}</h3>
        <div><strong>Fecha:</strong> {{ $sale->sale_date->format('d/m/Y h:i A') }}</div>
        <div><strong>Cliente:</strong> {{ $sale->client ? $sale->client->name : 'Público General' }}</div>
        <div><strong>Vendedor:</strong> {{ $sale->user->name }} {{ $sale->user->last_name }}</div>
        <div><strong>Método de Pago:</strong> {{ $sale->payment_method }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Producto</th>
                <th style="text-align: center;">Cant.</th>
                <th style="text-align: right;">P. Unit</th>
                <th style="text-align: right;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sale->details as $detail)
            <tr>
                <td>{{ $detail->product->name }}</td>
                <td style="text-align: center;">{{ $detail->quantity }}</td>
                <td style="text-align: right;">S/. {{ number_format($detail->price, 2) }}</td>
                <td style="text-align: right;">S/. {{ number_format($detail->subtotal, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total-section">
        <span class="total-label">TOTAL A PAGAR:</span>
        <span class="total-amount">S/. {{ number_format($sale->total, 2) }}</span>
    </div>

    <div class="footer">
        Gracias por su compra. Conserve este documento.<br>
        Sistema desarrollado por Zentech
    </div>
</body>
</html>
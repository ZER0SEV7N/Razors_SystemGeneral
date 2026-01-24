<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Boleta de Venta</title>
    <style>
        body { font-family: sans-serif; font-size: 13px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #f2f2f2; border-bottom: 2px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        td { border-bottom: 1px solid #ddd; padding: 8px; }
        .total-section { margin-top: 20px; text-align: right; }
        .total-label { font-weight: bold; font-size: 14px; margin-right: 10px; }
        .total-amount { font-size: 16px; color: #2c3e50; font-weight: bold; }
        .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #777; border-top: 1px dashed #ccc; padding-top: 10px; }
        .logo { max-height: 80px; margin-bottom: 5px; }
        .company-name { font-size: 18px; font-weight: bold; margin: 5px 0; text-transform: uppercase; }
    </style>
</head>
<body>
    <div class="header">

        
        <div class="company-name">{{ $company->name ?? 'EMPRESA' }}</div>
        <div><strong>RUC: {{ $company->ruc ?? '---' }}</strong></div>
        <div>{{ $company->address ?? 'Dirección Principal' }}</div>
        <div>Tel: {{ $company->phone ?? '---' }} | {{ $company->email ?? '' }}</div>
    </div>

    <div class="info">
        <table style="width: 100%; border: none; margin: 0;">
            <tr>
                <td style="border: none; vertical-align: top; width: 60%;">
                    {{-- BLINDAJE DE CLIENTE: Usamos optional() --}}
                    <strong>Cliente:</strong> {{ optional($sale->client)->name ?? 'Público General' }}<br>
                    <strong>Vendedor:</strong> {{ optional($sale->user)->name ?? 'Cajero' }} {{ optional($sale->user)->last_name ?? '' }}<br>
                    <strong>Método de Pago:</strong> {{ $sale->payment_method }}
                </td>
                <td style="border: none; vertical-align: top; text-align: right;">
                    <div style="font-size: 16px; font-weight: bold;">BOLETA DE VENTA</div>
                    <div style="color: #c0392b; font-size: 14px;">#{{ str_pad($sale->sale_id, 6, '0', STR_PAD_LEFT) }}</div>
                    <div>Fecha: {{ $sale->sale_date->format('d/m/Y h:i A') }}</div>
                </td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th>Producto</th>
                <th style="text-align: center; width: 10%;">Cant.</th>
                <th style="text-align: right; width: 20%;">P. Unit</th>
                <th style="text-align: right; width: 20%;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sale->details as $detail)
            <tr>
                {{-- BLINDAJE DE PRODUCTO --}}
                <td>{{ optional($detail->product)->name ?? '(Producto Eliminado)' }}</td>
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
        {{ $company->website ?? '' }}
    </div>
</body>
</html>
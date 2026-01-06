<!DOCTYPE html>
<html>
    <head>
        <title>Comprobante de venta</title>
        <style>
        body { font-family: sans-serif; font-size: 13px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #aaa; padding-bottom: 10px; }
        .header h1 { margin: 0; font-size: 20px; }
        .info-table { width: 100%; margin-bottom: 15px; }
        .products-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .products-table th { background: #eee; padding: 5px; text-align: left; border-bottom: 1px solid #ddd; }
        .products-table td { padding: 5px; border-bottom: 1px solid #eee; }
        .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
        .totals { margin-top: 15px; text-align: right; font-size: 16px; font-weight: bold; }
    </style>
    </head>
    <body>
        <div class="header">
            <H1>RAZORS STORE</H1>
            <p>RUC: 12345678902</p>
            <p>Av. Principal 123, Lima - Peru</p>
            <p>Tel: (01) 234-5678</p>
            <p>Ticket de Venta #{{ str_pad($sale->sale_id, 6, '0', STR_PAD_LEFT) }}</p>
        </div>

        <table class="info-table">
            <tr>
                <td><strong>Cliente:</strong> {{ $sale->client ? $sale->client->name : 'Público General' }}</td>
                <td style="text-align: right;"><strong>Fecha:</strong> {{ $sale->sale_date->format('d/m/Y H:i') }}</td>
            </tr>
            <tr>
                <td><strong>Vendedor:</strong> {{ $sale->user->name }}</td>
                <td style="text-align: right;"><strong>Estado:</strong> {{ $sale->status }}</td>
            </tr>
        </table>

        <table class="products-table">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th style="text-align: center;">Cant.</th>
                    <th style="text-align: right;">Precio</th>
                    <th style="text-align: right;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($sale->details as $detail)
                <tr>
                    <td>{{ $detail->product->name }}</td>
                    <td style="text-align: center;">{{ $detail->quantity }}</td>
                    <td style="text-align: right;">{{ number_format($detail->price, 2) }}</td>
                    <td style="text-align: right;">{{ number_format($detail->subtotal, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="totals">
            TOTAL: S/. {{ number_format($sale->total, 2) }}
        </div>

        <div class="footer">
            <p>¡Gracias por su compra!</p>
            <p>Este documento es un comprobante interno del sistema.</p>
        </div>
    </body>
</html>
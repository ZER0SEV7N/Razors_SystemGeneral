<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Guía de Remisión</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .header { width: 100%; border-bottom: 2px solid #333; margin-bottom: 20px; padding-bottom: 10px; }
        .box { border: 1px solid #333; padding: 10px; text-align: center; float: right; width: 30%; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background: #333; color: white; padding: 5px; }
        td { border: 1px solid #ddd; padding: 5px; }
        .clearfix { clear: both; }
    </style>
</head>
<body>
    <div class="header">
        <div class="box">
            <h3>GUÍA DE REMISIÓN</h3>
            <p>Nº {{ str_pad($guide->guide_id, 6, '0', STR_PAD_LEFT) }}</p>
        </div>
        <div>
            <h1>RAZORS SYSTEM</h1>
            <p>{{ $guide->sale->branch->address ?? 'Dirección Central' }}</p>
            <p>Fecha Emisión: {{ $guide->created_at->format('d/m/Y') }}</p>
        </div>
        <div class="clearfix"></div>
    </div>

    <h3>Datos del Traslado</h3>
    <p><strong>Motivo:</strong> {{ $guide->motive }}</p>
    <p><strong>Conductor:</strong> {{ $guide->driver_name }} (Lic: {{ $guide->driver_license }})</p>
    <p><strong>Vehículo:</strong> {{ $guide->vehicle_plate }}</p>

    <h3>Puntos de Partida y Llegada</h3>
    <table style="border: none;">
        <tr>
            <td style="border:none"><strong>Origen:</strong> <br> {{ $guide->origin_address }}</td>
            <td style="border:none"><strong>Destino:</strong> <br> {{ $guide->destination_address }}</td>
        </tr>
    </table>

    <h3>Productos</h3>
    <table>
        <thead>
            <tr>
                <th>Cant.</th>
                <th>Descripción</th>
                <th>Código</th>
            </tr>
        </thead>
        <tbody>
            @foreach($guide->sale->details as $detail)
            <tr>
                <td style="text-align:center">{{ $detail->quantity }}</td>
                <td>{{ $detail->product->name }}</td>
                <td style="text-align:center">PROD-{{ $detail->product_id }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
        <div style="margin-top: 50px; text-align: center;">
        __________________________<br>
        Firma del Recibido
    </div>
</body>
</html>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Guía de Remisión</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; border: 1px solid #000; padding: 10px; margin-bottom: 20px; }
        .info-box { border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; }
        .title { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #000; padding: 5px; }
        th { background-color: #eee; }
    </style>
</head>
<body>
    <div class="header">
        @if(isset($company) && $company->logo_path)
            <img src="{{ public_path('storage/'.$company->logo_path) }}" style="max-height: 50px;"> <br>
        @endif
        <h2 style="margin:5px;">GUÍA DE REMISIÓN REMITENTE</h2>
        <p>{{ $company->name ?? 'Zentech' }}</p>
        <p>RUC: 20000000001</p> {{-- Puedes agregar RUC a CompanySettings si quieres --}}
        <h3>N° T001-{{ str_pad($guide->guide_id, 6, '0', STR_PAD_LEFT) }}</h3>
    </div>

    <div class="info-box">
        <strong>Fecha de Emisión:</strong> {{ $guide->created_at->format('d/m/Y') }} <br>
        <strong>Fecha de Traslado:</strong> {{ $guide->transfer_date->format('d/m/Y') }} <br>
        <strong>Motivo:</strong> {{ $guide->motive }}
    </div>

    <div class="info-box">
        <table style="border: none; margin: 0;">
            <tr style="border: none;">
                <td style="border: none; width: 50%; vertical-align: top;">
                    <strong>PUNTO DE PARTIDA:</strong><br>
                    {{ $guide->origin_address }}
                </td>
                <td style="border: none; width: 50%; vertical-align: top;">
                    <strong>PUNTO DE LLEGADA:</strong><br>
                    {{ $guide->destination_address }}<br>
                    (Cliente: {{ $guide->sale->client->name }})
                </td>
            </tr>
        </table>
    </div>

    @if($guide->driver_name)
    <div class="info-box">
        <strong>Transportista:</strong> {{ $guide->driver_name }} | 
        <strong>Placa:</strong> {{ $guide->vehicle_plate ?? '-' }}
    </div>
    @endif

    <h3>Bienes a Transportar</h3>
    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Unidad</th>
                <th>Cantidad</th>
            </tr>
        </thead>
        <tbody>
            @foreach($guide->sale->details as $detail)
            <tr>
                <td>{{ $detail->product->product_id }}</td>
                <td>{{ $detail->product->name }}</td>
                <td style="text-align: center;">UND</td>
                <td style="text-align: center;">{{ $detail->quantity }}</td>
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
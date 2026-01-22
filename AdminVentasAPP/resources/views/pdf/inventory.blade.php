<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte de Inventario</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #aaa; padding: 5px; }
        th { background-color: #ddd; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Reporte de Inventario Valorizado</h2>
        <p>{{ $company->name ?? 'Mi Empresa' }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>P. Venta</th>
                <th>Valor Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($products as $product)
            <tr>
                <td>{{ $product->name }}</td>
                <td>{{ $product->category ? $product->category->name : 'Sin cat.' }}</td>
                <td style="text-align: center;">{{ $product->stock }}</td>
                <td style="text-align: right;">S/. {{ number_format($product->price, 2) }}</td>
                <td style="text-align: right;">S/. {{ number_format($product->price * $product->stock, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <h3 style="text-align: right; margin-top: 20px;">
        Valor Total del Inventario: S/. {{ number_format($totalValue, 2) }}
    </h3>
</body>
</html>
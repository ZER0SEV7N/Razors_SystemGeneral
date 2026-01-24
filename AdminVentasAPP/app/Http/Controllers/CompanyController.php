<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    public function index()
    {
        // CORRECCIÓN: Buscamos por company_id, no por id
        return response()->json(Company::firstOrNew(['company_id' => 1]));
    }

    public function update(Request $request)
    {
        $request->validate([
            'name'    => 'required|string',
            'ruc'     => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'phone'   => 'nullable|string',
            'email'   => 'nullable|email',
            'website' => 'nullable|string',
            'logo'    => 'nullable|image|max:2048',
        ]);

        $company = Company::firstOrNew(['company_id' => 1]);

        $company->fill($request->only([
            'name', 'ruc', 'address', 'phone', 'email', 'website'
        ]));

        if ($request->hasFile('logo')) {
            if ($company->logo_path) {
                Storage::disk('public')->delete($company->logo_path);
            }
            $path = $request->file('logo')->store('company', 'public');
            $company->logo_path = $path;
        }

        $company->save();

        return response()->json($company);
    }
}
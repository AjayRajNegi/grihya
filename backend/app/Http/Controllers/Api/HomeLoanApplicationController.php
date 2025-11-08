<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeLoanApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HomeLoanApplicationController extends Controller
{
    // Compute EMI (server-side)
    protected function computeEmi(int $P, float $annualRate, int $years): int
    {
        $r = $annualRate / 12 / 100;
        $n = $years * 12;
        if ($r == 0) {
            return (int) round($P / $n);
        }
        $emi = ($P * $r * pow(1 + $r, $n)) / (pow(1 + $r, $n) - 1);
        return (int) round($emi);
    }

    public function store(Request $request)
    {
        $v = Validator::make($request->all(), [
            'full_name'      => 'required|string|max:120',
            'phone'          => 'required|string|regex:/^\d{10}$/',
            'email'          => 'required|email|max:160',
            'city'           => 'nullable|string|max:120',

            'loan_amount'    => 'required|integer|min:1',
            'property_value' => 'required|integer|min:1',
            'tenure_years'   => 'required|integer|min:1|max:35',
            'rate'           => 'required|numeric|min:0|max:99.99',
            'employment'     => 'required|in:salaried,self',
            'monthly_income' => 'nullable|integer|min:0',
            'existing_emi'   => 'nullable|integer|min:0',
            'preferred_bank' => 'nullable|string|max:64',

            'notes'          => 'nullable|string',
            'consent'        => 'required|boolean',
        ], [
            'phone.regex'      => 'Please enter a valid 10-digit phone number.',
            'consent.required' => 'Please accept the consent to proceed.',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $data = $v->validated();

        $ltv = $data['property_value'] > 0
            ? ($data['loan_amount'] / $data['property_value']) * 100
            : 0.0;

        $estEmi = $this->computeEmi((int) $data['loan_amount'], (float) $data['rate'], (int) $data['tenure_years']);
        $pfEst  = (int) round($data['loan_amount'] * 0.005); // ~0.5% illustrative

        $app = HomeLoanApplication::create([
            ...$data,
            'ltv_pct'            => round($ltv, 2),
            'est_emi'            => $estEmi,
            'processing_fee_est' => $pfEst,
            'ip'                 => $request->ip(),
            'user_agent'         => $request->userAgent(),
            'status'             => 'new',
        ]);

        return response()->json([
            'ok'          => true,
            'id'          => $app->id,
            'application' => $app,
        ], 201);
    }
}

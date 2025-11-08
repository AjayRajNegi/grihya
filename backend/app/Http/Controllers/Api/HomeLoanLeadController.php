<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeLoanLead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HomeLoanLeadController extends Controller
{
    public function store(Request $request)
    {
        $v = Validator::make($request->all(), ['full_name' => 'required|string|max:120', 'phone' => 'required|string|regex:/^\d{10}$/', 'email' => 'required|email|max:160', 'city' => 'nullable|string|max:120', 'partner_slug' => 'required|string|max:64', 'loan_amount' => 'required|integer|min:1', 'tenure_years' => 'required|integer|min:1|max:35', 'monthly_income' => 'nullable|integer|min:0', 'existing_emi' => 'nullable|integer|min:0', 'notes' => 'nullable|string', 'consent' => 'required|boolean',], ['phone.regex' => 'Please enter a valid 10-digit phone number.', 'consent.required' => 'Please accept the consent to proceed.',]);
        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }
        $data = $v->validated();
        $lead = HomeLoanLead::create([...$data, 'status' => 'new', 'ip' => $request->ip(), 'user_agent' => $request->userAgent(),]);
        return response()->json(['ok' => true, 'id' => $lead->id, 'lead' => $lead,], 201);
    }
}

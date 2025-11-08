<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeLoanApplication extends Model
{
    protected $fillable = ['full_name', 'phone', 'email', 'city', 'loan_amount', 'property_value', 'tenure_years', 'rate', 'employment', 'monthly_income', 'existing_emi', 'preferred_bank', 'consent', 'notes', 'est_emi', 'ltv_pct', 'processing_fee_est', 'status', 'ip', 'user_agent',];
}

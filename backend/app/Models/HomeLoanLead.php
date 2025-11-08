<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeLoanLead extends Model
{
    protected $fillable = ['full_name', 'phone', 'email', 'city', 'partner_slug', 'loan_amount', 'tenure_years', 'monthly_income', 'existing_emi', 'consent', 'notes', 'status', 'ip', 'user_agent',];
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreShareTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = Auth::user();
        if (! $user) {
            return false;
        }

        $somitiId = $this->input('somiti_id');

        return $user->isMemberOfSomiti($somitiId)
            || $user->isManagerOfSomiti($somitiId)
            || $user->isOwnerOfSomiti($somitiId);
    }

    public function rules(): array
    {
        return [
            'somiti_id' => 'required|exists:somitis,id',
            'financial_year_id' => 'required|exists:financial_years,id',
            'to_user_id' => 'required|exists:users,id|different:from_user_id',
            'quantity' => 'required|integer|min:1',
            'price_per_share' => 'required|numeric|min:0.01',
            'transfer_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}

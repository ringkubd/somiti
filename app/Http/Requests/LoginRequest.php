<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Accept either a "login" field (email or phone) or a "phone" field.
     * At least one of login or phone is required.
     */
    public function rules(): array
    {
        return [
            'login' => 'required_without:phone|string',
            'phone' => 'required_without:login|string',
            'password' => 'required|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'login.required_without' => 'The email or phone field is required.',
            'phone.required_without' => 'The email or phone field is required.',
        ];
    }
}
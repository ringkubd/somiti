<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     * After first registration, user is redirected to create their first Somiti.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'phone' => [
                'required_without:email',
                'string',
                'max:20',
                Rule::unique(User::class),
            ],
            'email' => [
                'required_without:phone',
                'nullable',
                'string',
                'email',
                'max:255',
                'unique:users,email',
            ],
            'password' => $this->passwordRules(),
        ], [
            'phone.required_without' => 'The email or phone field is required.',
            'email.required_without' => 'The email or phone field is required.',
        ])->validate();

        return User::create([
            'name' => $input['name'],
            'phone' => $input['phone'] ?? null,
            'email' => $input['email'] ?? null,
            'password' => $input['password'],
            'status' => 'active',
        ]);
    }
}

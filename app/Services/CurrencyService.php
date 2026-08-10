<?php

namespace App\Services;

class CurrencyService
{
    /**
     * Supported currencies for somiti settings (code, symbol, name).
     */
    public static function all(): array
    {
        return [
            ['code' => 'BDT', 'symbol' => '৳', 'name' => 'Bangladeshi Taka'],
            ['code' => 'USD', 'symbol' => '$', 'name' => 'US Dollar'],
            ['code' => 'EUR', 'symbol' => '€', 'name' => 'Euro'],
            ['code' => 'GBP', 'symbol' => '£', 'name' => 'British Pound'],
            ['code' => 'INR', 'symbol' => '₹', 'name' => 'Indian Rupee'],
            ['code' => 'PKR', 'symbol' => '₨', 'name' => 'Pakistani Rupee'],
            ['code' => 'SAR', 'symbol' => '﷼', 'name' => 'Saudi Riyal'],
            ['code' => 'AED', 'symbol' => 'د.إ', 'name' => 'UAE Dirham'],
            ['code' => 'QAR', 'symbol' => '﷼', 'name' => 'Qatari Riyal'],
            ['code' => 'JPY', 'symbol' => '¥', 'name' => 'Japanese Yen'],
            ['code' => 'CNY', 'symbol' => '¥', 'name' => 'Chinese Yuan'],
            ['code' => 'MYR', 'symbol' => 'RM', 'name' => 'Malaysian Ringgit'],
            ['code' => 'SGD', 'symbol' => 'S$', 'name' => 'Singapore Dollar'],
            ['code' => 'AUD', 'symbol' => 'A$', 'name' => 'Australian Dollar'],
            ['code' => 'CAD', 'symbol' => 'C$', 'name' => 'Canadian Dollar'],
            ['code' => 'NPR', 'symbol' => 'रू', 'name' => 'Nepalese Rupee'],
            ['code' => 'LKR', 'symbol' => '₨', 'name' => 'Sri Lankan Rupee'],
        ];
    }

    public static function codes(): array
    {
        return array_column(static::all(), 'code');
    }

    public static function isValid(string $code): bool
    {
        return in_array(strtoupper($code), static::codes(), true);
    }
}

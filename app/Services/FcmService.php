<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

/**
 * Pure Firebase Cloud Messaging (HTTP v1) via the service account.
 */
class FcmService
{
    private static ?array $config = null;

    public static function config(): array
    {
        if (self::$config !== null) {
            return self::$config;
        }

        $path = config('services.firebase.credentials');
        self::$config = $path && is_readable($path)
            ? (json_decode((string) file_get_contents($path), true) ?: [])
            : [];

        return self::$config;
    }

    public static function isConfigured(): bool
    {
        $cfg = self::config();

        return ! empty($cfg) && isset($cfg['client_email'], $cfg['private_key']) && self::projectId();
    }

    public static function projectId(): ?string
    {
        $cfg = self::config();

        return config('services.firebase.project_id') ?: ($cfg['project_id'] ?? null);
    }

    private static function accessToken(): ?string
    {
        $cfg = self::config();
        if (empty($cfg)) {
            return null;
        }

        $cacheKey = 'somiti_fcm_access_token';
        $cached = cache()->get($cacheKey);
        if ($cached) {
            return $cached;
        }

        $now = time();
        $header = self::b64url(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
        $claims = self::b64url(json_encode([
            'iss' => $cfg['client_email'],
            'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
            'aud' => 'https://oauth2.googleapis.com/token',
            'iat' => $now,
            'exp' => $now + 3600,
        ]));
        $input = "{$header}.{$claims}";

        openssl_sign($input, $signature, $cfg['private_key'], 'sha256WithRSAEncryption');
        $assertion = $input.'.'.self::b64url($signature);

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $assertion,
        ]);

        if (! $response->successful() || ! $response->json('access_token')) {
            return null;
        }

        $token = $response->json('access_token');
        cache()->put($cacheKey, $token, now()->addMinutes(55));

        return $token;
    }

    /**
     * Send a push message to a device token.
     *
     * @return string 'ok' | 'unregistered' | 'error'
     */
    public static function send(string $deviceToken, string $title, string $body, array $data = []): string
    {
        if (! self::isConfigured() || ! $deviceToken) {
            return 'error';
        }

        $accessToken = self::accessToken();
        if (! $accessToken) {
            return 'error';
        }

        $payload = [
            'message' => [
                'token' => $deviceToken,
                'notification' => [
                    'title' => mb_substr($title, 0, 100),
                    'body' => mb_substr($body, 0, 240),
                ],
                'data' => array_map('strval', $data),
                'android' => ['priority' => 'HIGH'],
            ],
        ];

        $response = Http::withToken($accessToken)
            ->post('https://fcm.googleapis.com/v1/projects/'.self::projectId().'/messages:send', $payload);

        if ($response->successful()) {
            return 'ok';
        }

        $code = $response->json('error.status');

        return in_array($code, ['UNREGISTERED', 'INVALID_ARGUMENT'], true) ? 'unregistered' : 'error';
    }

    private static function b64url(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}

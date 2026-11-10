<?php

declare(strict_types=1);

namespace App\Tests;

use App\Entity\RefreshToken;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class AuthTest extends WebTestCase
{
    private const EMAIL = 'rex@example.com';
    private const PASSWORD = 'long-enough-password';

    private KernelBrowser $client;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        // The limiter state lives in the filesystem cache and outlives a test run.
        static::getContainer()->get('cache.rate_limiter')->clear();
    }

    public function test_register_creates_an_account_without_exposing_the_password(): void
    {
        $body = $this->register(' Rex@Example.com ', self::PASSWORD);

        self::assertResponseStatusCodeSame(201);
        self::assertSame(self::EMAIL, $body['email']);
        self::assertMatchesRegularExpression('#^/api/users/[0-9a-f-]{36}$#', $body['@id']);
        self::assertArrayNotHasKey('password', $body);
        self::assertArrayNotHasKey('plain_password', $body);
    }

    public function test_register_refuses_an_email_already_taken(): void
    {
        $this->register(self::EMAIL, self::PASSWORD);
        $body = $this->register(self::EMAIL, self::PASSWORD);

        self::assertResponseStatusCodeSame(422);
        self::assertSame('email', $body['violations'][0]['propertyPath']);
    }

    public function test_register_refuses_a_password_under_ten_characters(): void
    {
        $body = $this->register(self::EMAIL, '123456789');

        self::assertResponseStatusCodeSame(422);
        self::assertSame('password', $body['violations'][0]['propertyPath']);
    }

    public function test_login_returns_an_access_token_whatever_the_email_case(): void
    {
        $this->register(self::EMAIL, self::PASSWORD);
        $body = $this->login('REX@example.com', self::PASSWORD);

        self::assertResponseStatusCodeSame(200);
        self::assertNotEmpty($body['token']);
    }

    public function test_login_refuses_a_wrong_password(): void
    {
        $this->register(self::EMAIL, self::PASSWORD);
        $this->login(self::EMAIL, 'wrong-password');

        self::assertResponseStatusCodeSame(401);
    }

    public function test_login_answers_429_after_repeated_failures(): void
    {
        $this->register(self::EMAIL, self::PASSWORD);

        for ($attempt = 0; $attempt < 5; ++$attempt) {
            $this->login(self::EMAIL, 'wrong-password');
            self::assertResponseStatusCodeSame(401);
        }

        $this->login(self::EMAIL, self::PASSWORD);
        self::assertResponseStatusCodeSame(429);
    }

    public function test_refresh_works_with_an_expired_access_token(): void
    {
        $this->register(self::EMAIL, self::PASSWORD);
        $refresh_token = $this->login(self::EMAIL, self::PASSWORD)['refresh_token'];

        $cookie = $this->client->getResponse()->headers->getCookies()[0];
        self::assertSame('/api/auth', $cookie->getPath());
        self::assertSame('lax', $cookie->getSameSite());
        self::assertTrue($cookie->isHttpOnly());

        $body = $this->post(
            '/api/auth/refresh',
            'application/json',
            ['refresh_token' => $refresh_token],
            ['HTTP_AUTHORIZATION' => 'Bearer '.$this->expiredAccessToken()],
        );

        self::assertResponseStatusCodeSame(200);
        self::assertNotEmpty($body['token']);
        self::assertSame($refresh_token, $body['refresh_token']);

        $stored = static::getContainer()->get('doctrine')->getRepository(RefreshToken::class)->findAll();
        self::assertNotSame($refresh_token, $stored[0]->getRefreshToken());
    }

    public function test_logout_invalidates_the_refresh_token(): void
    {
        $this->register(self::EMAIL, self::PASSWORD);
        $payload = ['refresh_token' => $this->login(self::EMAIL, self::PASSWORD)['refresh_token']];

        $this->post(
            '/api/auth/logout',
            'application/json',
            $payload,
            ['HTTP_AUTHORIZATION' => 'Bearer '.$this->expiredAccessToken()],
        );
        self::assertResponseStatusCodeSame(200);

        $this->post('/api/auth/refresh', 'application/json', $payload);
        self::assertResponseStatusCodeSame(401);
    }

    private function expiredAccessToken(): string
    {
        return static::getContainer()->get(JWTEncoderInterface::class)
            ->encode(['username' => self::EMAIL, 'exp' => time() - 60]);
    }

    /** @return array<string, mixed> */
    private function register(string $email, string $password): array
    {
        return $this->post('/api/auth/register', 'application/ld+json', ['email' => $email, 'password' => $password]);
    }

    /** @return array<string, mixed> */
    private function login(string $email, string $password): array
    {
        return $this->post('/api/auth/login', 'application/json', ['email' => $email, 'password' => $password]);
    }

    /**
     * @param array<string, string> $payload
     * @param array<string, string> $headers
     *
     * @return array<string, mixed>
     */
    private function post(string $uri, string $format, array $payload, array $headers = []): array
    {
        $this->client->request(
            'POST',
            $uri,
            server: ['CONTENT_TYPE' => $format, 'HTTP_ACCEPT' => $format, ...$headers],
            content: json_encode($payload, JSON_THROW_ON_ERROR),
        );

        return json_decode((string) $this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
    }
}

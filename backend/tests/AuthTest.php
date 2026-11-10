<?php

declare(strict_types=1);

namespace App\Tests;

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

    /** @return array<string, mixed> */
    private function register(string $email, string $password): array
    {
        $this->client->request(
            'POST',
            '/api/auth/register',
            server: ['CONTENT_TYPE' => 'application/ld+json', 'HTTP_ACCEPT' => 'application/ld+json'],
            content: json_encode(['email' => $email, 'password' => $password], JSON_THROW_ON_ERROR),
        );

        return json_decode((string) $this->client->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
    }
}

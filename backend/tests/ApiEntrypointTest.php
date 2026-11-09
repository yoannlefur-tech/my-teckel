<?php

declare(strict_types=1);

namespace App\Tests;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class ApiEntrypointTest extends WebTestCase
{
    public function test_api_entrypoint_responds_ok(): void
    {
        static::createClient()->request('GET', '/api');

        self::assertResponseStatusCodeSame(200);
    }
}

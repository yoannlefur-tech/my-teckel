<?php

declare(strict_types=1);

namespace App\EventListener;

use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationFailureEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Lexik\Bundle\JWTAuthenticationBundle\Response\JWTAuthenticationFailureResponse;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\TooManyLoginAttemptsAuthenticationException;

// Lexik answers 401 to every authentication failure, including throttled logins.
#[AsEventListener(event: Events::AUTHENTICATION_FAILURE)]
final class LoginThrottledListener
{
    public function __invoke(AuthenticationFailureEvent $event): void
    {
        $exception = $event->getException();

        if ($exception instanceof TooManyLoginAttemptsAuthenticationException) {
            $event->setResponse(new JWTAuthenticationFailureResponse(
                strtr($exception->getMessageKey(), $exception->getMessageData()),
                Response::HTTP_TOO_MANY_REQUESTS,
            ));
        }
    }
}

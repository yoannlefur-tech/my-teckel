<?php

declare(strict_types=1);

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/** @implements ProcessorInterface<User, User> */
final class UserPasswordHasherProcessor implements ProcessorInterface
{
    /** @param ProcessorInterface<User, User> $persist_processor */
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private readonly ProcessorInterface $persist_processor,
        private readonly UserPasswordHasherInterface $password_hasher,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): User
    {
        $data->setPassword($this->password_hasher->hashPassword($data, (string) $data->getPlainPassword()));

        return $this->persist_processor->process($data, $operation, $uriVariables, $context);
    }
}

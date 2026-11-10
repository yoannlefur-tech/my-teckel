# myTeckel — suivi santé d'un(e) teckel nain(e)

Application de suivi pour teckels (profil, santé, puis éducation, balades,
communauté et boutique). Le MVP se limite au socle, au profil du chien et à
la santé (poids, vaccins, vermifuges, rendez-vous, rappels).

## Principes de simplicité

- Écrire le code le plus simple qui satisfait le besoin actuel : pas de
  fonctionnalité, d'option ou d'abstraction « au cas où ».
- Pas de helper, hook ou composant extrait avant son deuxième usage.
- Une fonction fait une chose et tient sur un écran. Un composant dépasse
  rarement 100 lignes.
- Un commentaire explique le pourquoi, jamais le quoi.
- Préférer MUI, React Router et TanStack Query au code maison.
- Pas de nouvelle dépendance sans la justifier dans le plan.

## Principes de test

- Tester le comportement visible et les règles métier, pas l'implémentation.
- Backend : un test par règle métier et par règle de sécurité.
- Frontend : tests unitaires des fonctions pures qui portent une règle, et un ou deux tests de parcours par écran. Pas de test par composant.

## Règles de travail

- Plan court avant de coder : étapes testables, chaque nouveau fichier
  justifié.
- Un commit par étape, tests et lint verts avant chaque commit.
- Ne jamais modifier une migration déjà commitée.
- Aucun secret dans un fichier versionné.

## Stack

- `backend/` : PHP 8.3, Symfony 7.4 LTS, API Platform, Doctrine (attributs
  PHP 8, jamais YAML), PostgreSQL 16
- `frontend/` : React, TypeScript, Vite, MUI, TanStack Query, React Router
- Docker Compose en dev, tout passe par `docker compose exec` (WSL2)

## Conventions

- PHP : PSR-12, `declare(strict_types=1)`, snake_case, identifiants UUID v7
- React : composants fonctionnels et hooks, camelCase, MUI sans CSS global
- Code, entités, routes et commits en anglais, interface en français
- Le JSON de l'API est en snake_case : les types TS le reflètent tel quel,
  générés par `npm run types:api`, jamais écrits à la main
- Dates calendaires au format `Y-m-d` : jamais `toISOString()` ni
  `new Date('Y-m-d')`, qui passent par UTC
- API Platform : `POST` en `application/ld+json`, `PATCH` en
  `application/merge-patch+json`

## Commandes

- Démarrer : `docker compose up -d`
- Console : `docker compose exec backend bin/console ...`
- Composer : `docker compose exec backend composer ...`
- Tests PHP : `docker compose exec backend bin/phpunit`
- Style PHP :
  `docker compose exec backend vendor/bin/php-cs-fixer fix --dry-run --diff`
- Front : `docker compose exec frontend npm run lint`, `npm run test`,
  `npx tsc -b`, `npm run types:api`
- URLs : API `http://localhost:8003`, front `http://localhost:5175`,
  Adminer `http://localhost:8083` (serveur `db`)

## Pièges Docker

- `php -S` doit router vers `public/index.php`, sinon `/api/docs.json`
  répond 404.
- Ports publiés sur `127.0.0.1` uniquement.
- Une variable définie dans le compose écrase `backend/.env.local` et
  `.env.test` : ne pas y mettre de secret ni de `DATABASE_URL`.
- `vendor/` et `node_modules/` sont sur l'hôte (ignorés par git) : après un
  changement de dépendances, `docker compose exec backend composer install` ou
  `docker compose exec frontend npm install`.
- `backend` et `frontend` tournent avec `HOST_UID` et `HOST_GID` : les fichiers
  qu'ils créent appartiennent à l'utilisateur de l'hôte.
- Après un changement d'environnement dans le compose : `docker compose up -d`,
  pas `restart`.
- `DB_PASSWORD` n'est appliqué par Postgres qu'à la création du volume.

## Installation d'un nouveau poste

1. `cp .env.example .env`, `cp backend/.env.local.example backend/.env.local`
   et `cp backend/.env.test.local.example backend/.env.test.local`, puis
   remplir `backend/.env.local` et `backend/.env.test.local`. Ce dernier pointe
   vers `my_teckel` : Doctrine ajoute le suffixe `_test` en environnement de
   test.
2. `docker compose up -d`
3. `docker compose exec backend composer install`
4. Bases de dev et de test :
   `docker compose exec backend bin/console doctrine:migrations:migrate`, puis
   `doctrine:database:create --env=test` et `doctrine:migrations:migrate
   --env=test`.
5. Clés JWT de dev, après avoir choisi `JWT_PASSPHRASE` dans
   `backend/.env.local` :
   `docker compose exec backend bin/console lexik:jwt:generate-keypair`.

## Limites connues

- L'inscription permet l'énumération d'emails : un email déjà pris est signalé.
- L'inscription n'a pas de limitation de débit.
- Pas de vérification d'email ni de mot de passe oublié.

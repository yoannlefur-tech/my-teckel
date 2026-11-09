# Init backend

## Contexte

Monorepo "my-teckel" (git initialisé, CLAUDE.md à lire d'abord, branche
`init-project` créée depuis `develop`). Le compose et les Dockerfiles existent
déjà (prompt init-docker) : le backend tourne avec mon utilisateur
(`HOST_UID` et `HOST_GID` du `.env` racine) et `vendor/` est sur l'hôte,
ignoré par git. Ne pas modifier le compose ni les Dockerfiles sans me le
dire. `backend/` est vide. WSL2, commandes via `docker compose exec`.

## Objectif

Installer le backend jusqu'à pouvoir ouvrir l'API, sans authentification ni entité :

1. Skeleton Symfony 7.4 LTS dans `backend/`, créé avec mon utilisateur
   (`docker compose run --rm backend`). Régler `extra.symfony.docker` à
   `false` pour que Flex ne génère pas de `compose.yaml` dans `backend/`.
2. Paquets : `api`, `orm-pack`, `symfony/uid`. En dev : `maker-bundle`,
   `test-pack`, `symfony/http-client`, `dama/doctrine-test-bundle`,
   `friendsofphp/php-cs-fixer` (règles `@PSR12` et `declare_strict_types`,
   avec `setRiskyAllowed(true)`).
3. Configuration :
   - `backend/.env.local` (ignoré par git) : `DATABASE_URL` (base
     `my_teckel`, utilisateur `app`, hôte `db`) et `APP_SECRET`. Un
     `backend/.env.local.example` versionné, sans valeur réelle.
   - `backend/.env.test.local` (ignoré) : `DATABASE_URL` de la base
     `my_teckel_test`, car Symfony ne charge jamais `.env.local` en test.
     Base de test créée et migrée, DAMA activé dans `phpunit.dist.xml`.
   - Ne définir aucune de ces variables dans le compose : elles écraseraient
     les fichiers `.env`.
   - `public/index.php` : `php -S` avec un routeur envoie tout à Symfony, y
     compris les fichiers statiques (CSS et JS de Swagger UI). Ajouter le
     retour `false` pour les fichiers existants, protégé par
     `PHP_SAPI === 'cli-server'` et commenté.
4. Un test fonctionnel : `GET /api` répond 200.
5. Reformatage du code généré avec php-cs-fixer, dans un commit `style:`
   séparé.

## Contraintes

- Conventions de CLAUDE.md : PSR-12, `strict_types`, snake_case, attributs
  Doctrine (jamais YAML).
- Un commit par étape (skeleton, paquets, configuration, test, style).
- Aucun secret dans un fichier versionné.
- Ne pas modifier CLAUDE.md, le compose ni les Dockerfiles sans me le dire.
- Solution la plus simple : aucune option ni abstraction non demandée, et
  chaque fichier créé est justifié dans le plan.
- Proposer le plan avant d'écrire du code et attendre mon accord.

## Critères de fin

- `docker compose up -d db adminer backend` : les trois services tournent (le
  frontend n'existe pas encore).
- `http://localhost:8003/api` affiche la documentation API Platform, avec son
  CSS et son JS.
- `curl http://localhost:8003/api/docs.jsonopenapi` répond 200.
- `bin/console doctrine:migrations:status` répond sans erreur.
- `bin/phpunit` est vert et php-cs-fixer ne signale aucun écart.
- `ls -l backend/var` : tout appartient à mon utilisateur.
- `git status` est propre et les fichiers `.env.local` sont ignorés.

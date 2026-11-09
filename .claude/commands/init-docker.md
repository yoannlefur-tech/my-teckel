# Init Docker

## Contexte

Monorepo "my-teckel" (git initialisé, CLAUDE.md à lire d'abord, branche
`init-project` créée depuis `develop`). Ce prompt ne prépare que
l'infrastructure : `backend/` et `frontend/` n'existent pas encore, les
prompts init-backend et init-frontend s'en chargeront. WSL2, commandes via
`docker compose exec`.

## Objectif

1. `docker-compose.yaml` avec quatre services :
   - `db` : `postgres:16`, base `my_teckel`, utilisateur `app`, mot de passe
     `${DB_PASSWORD:-changeMe}`, volume nommé `postgres_data`, healthcheck
     `pg_isready -U app -d my_teckel`.
   - `adminer` : dépend de `db`.
   - `backend` : image construite depuis `docker/backend`, dossier
     `./backend:/app`, dépend de `db` en bonne santé.
   - `frontend` : image construite depuis `docker/frontend`, dossier
     `./frontend:/app`.
2. Ports publiés sur `127.0.0.1` uniquement : db 5435, adminer 8083, backend
   8003 vers 8000, frontend 5175 vers 5173.
3. Backend et frontend tournent avec mon utilisateur, pas en root :
   `user: "${HOST_UID:-1000}:${HOST_GID:-1000}"`, `COMPOSER_HOME=/tmp/composer`
   pour le backend, `HOME=/tmp` et un cache npm dans `/tmp` pour le frontend.
   Aucun volume anonyme : `vendor/` et `node_modules/` vivent sur l'hôte et
   sont ignorés par git.
4. `docker/backend/Dockerfile` : `php:8.3-cli`, extensions `pdo_pgsql`, `intl`
   et `opcache`, composer, commande
   `php -S 0.0.0.0:8000 -t public public/index.php`.
5. `docker/frontend/Dockerfile` : `node:22-alpine`, commande
   `npm install && npm run dev -- --host 0.0.0.0`.
6. `.env.example` (`DB_PASSWORD=changeMe`, `HOST_UID=1000`, `HOST_GID=1000`),
   un `.env` ignoré avec mon vrai UID et GID (`id -u`, `id -g`), et un
   `.gitignore` racine qui ignore `.env`, `docker-compose.override.yaml` et
   `backup_*.sql`.
7. Créer les dossiers vides `backend/` et `frontend/` avec mon utilisateur,
   sans `.gitkeep`.

## Contraintes

- Un commit par étape (compose, Dockerfiles, fichiers d'environnement).
- Aucun secret réel dans un fichier versionné.
- Solution la plus simple : aucune option ni abstraction non demandée, et
  chaque fichier créé est justifié dans le plan.
- Proposer le plan avant d'écrire du code et attendre mon accord.

## Critères de fin

- `docker compose config` est valide et `docker compose build` passe.
- `docker compose up -d db adminer` : `db` est healthy, et `docker compose ps`
  montre les ports sur `127.0.0.1`.
- Adminer répond sur `http://localhost:8083`, et la connexion avec le serveur
  `db` fonctionne.
- `git status` est propre et `.env` est ignoré.

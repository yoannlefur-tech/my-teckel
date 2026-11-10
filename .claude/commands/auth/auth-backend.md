# Authentification backend

## Contexte

Projet my-teckel (CLAUDE.md à lire d'abord), branche `feature/auth-backend`
depuis `develop`. Le backend est installé, sans entité ni authentification.
Le frontend web viendra dans un prompt séparé, puis une application mobile :
ne pas toucher à `frontend/`.

## Objectif

1. `User` : email (unique, normalisé en minuscules), mot de passe hashé,
   roles, UUID v7, `created_at` et `updated_at`. Migration.
2. Inscription publique : email et mot de passe (10 caractères minimum). Le
   mot de passe n'est jamais renvoyé. Pas de vérification d'email pour
   l'instant.
3. Login : `POST /api/auth/login` renvoie un access token JWT de 15 minutes
   (`lexik/jwt-authentication-bundle`). Anti brute-force avec
   `login_throttling`, qui doit répondre 429.
4. Refresh et logout avec `gesdinet/jwt-refresh-token-bundle` (vérifier la
   compatibilité avec Symfony 7.4 et PHP 8.3 avant d'installer) :
   - refresh token de 30 jours, sans rotation, posé en cookie HttpOnly
     (SameSite=Lax, path `/api/auth`, Secure hors dev) et laissé aussi dans
     le corps de la réponse, pour un futur client mobile,
   - `POST /api/auth/refresh` et `POST /api/auth/logout` (invalide le token),
     qui doivent fonctionner avec un access token expiré.
5. `GET /api/me` : id, email et roles, jamais le hash.
6. Tout `/api` exige un token, sauf l'inscription, le login, le refresh, le
   logout et la documentation.
7. Clés JWT : celles de dev sont générées et ignorées par git, avec la
   passphrase dans `backend/.env.local`. Les clés de test sont dédiées et
   commitées dans `config/jwt/test/`, avec une passphrase non secrète dans
   `.env.test`. Documenter les variables dans `.env.local.example`. Ne
   définir aucune de ces variables dans le compose.

## Contraintes

- Conventions de CLAUDE.md.
- Un commit par étape (User, inscription, login, refresh et logout, `/api/me`,
  sécurité).
- Tests : un par règle, dix au maximum :
  - inscription : OK, email déjà pris, mot de passe trop court,
  - login : OK, mauvais mot de passe, 429 après des échecs répétés,
  - 401 sans token, `/api/me`,
  - refresh avec un access token expiré, logout.
- Solution la plus simple : aucune option ni abstraction non demandée, et
  chaque fichier créé est justifié dans le plan.
- Proposer le plan avant d'écrire du code et attendre mon accord.

## Critères de fin

- Avec `curl` : inscription, login (token reçu), `/api/me` en 200 avec le
  token et en 401 sans, refresh, logout, puis un nouveau refresh en 401.
- `http://localhost:8003/api/docs.jsonopenapi` décrit les routes d'auth et le
  schéma Bearer.
- `bin/phpunit` est vert et php-cs-fixer ne signale aucun écart.
- `git status` est propre et aucun secret n'est versionné.

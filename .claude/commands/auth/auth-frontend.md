# Authentification frontend

## Contexte

Projet my-teckel (CLAUDE.md à lire d'abord), branche `feature/auth-frontend`
depuis `develop` (backend d'authentification fusionné). L'API exige un Bearer
sur tout `/api`, sauf `GET /api`, l'inscription, le login, le refresh, le
logout et la documentation. L'access token JWT dure 15 minutes et arrive dans
le corps de la réponse du login et du refresh. Le refresh token dure 30 jours
dans un cookie HttpOnly (path `/api/auth`), sans rotation : plusieurs refresh
simultanés sont donc sans danger. Le proxy Vite pour `/api` existe déjà, le
front appelle l'API en relatif. Aucun écran d'authentification pour l'instant.

## Objectif

1. Régénérer le schéma avec `npm run types:api` (inscription, `/api/me`) et
   commiter le résultat.
2. Client HTTP dans `src/api/` : un petit wrapper autour de `fetch`.
   - L'access token reste en mémoire, jamais dans localStorage,
     sessionStorage ni IndexedDB.
   - Il ajoute `Authorization: Bearer`.
   - Sur un 401 hors `/api/auth/*` : un refresh, puis un seul rejeu. Si le
     refresh échoue, la session est vidée.
   - Les refresh en cours partagent une seule promesse.
3. Session : `AuthProvider` et `useAuth()` (`user`, `status` parmi `loading`,
   `authenticated` et `anonymous`, `login`, `register`, `logout`).
   - Au chargement : refresh silencieux puis `GET /api/me`. Pendant
     `loading`, afficher un indicateur MUI, sans rediriger.
   - Logout : appel à l'API (un échec réseau ne bloque pas la déconnexion
     locale), token effacé et cache TanStack Query vidé.
4. Pages `/login` et `/register` en MUI avec react-hook-form, textes en
   français et attributs `autoComplete`.
   - Login : 401 « Identifiants invalides », 429 « Trop de tentatives,
     réessayez plus tard ».
   - Inscription : les erreurs 422 (`violations`) s'affichent sous le champ
     concerné, avec un message français.
   - Le login se fait en `application/json`, l'inscription en
     `application/ld+json`.
5. `ProtectedRoute` : redirige vers `/login` en gardant la destination.
   Après connexion, retour à cette destination seulement si c'est un chemin
   interne (commence par un seul `/`). Page 404.
6. Accueil protégé : barre MUI avec l'email de l'utilisateur et un bouton de
   déconnexion.
7. Documentation : section « Authentification frontend » dans CLAUDE.md, de
   10 lignes au plus (token en mémoire, refresh unique, ajouter une route
   protégée).

## Contraintes

- Conventions de CLAUDE.md. Types issus du schéma généré, jamais écrits à la
  main.
- Nouvelles dépendances : seulement `react-hook-form` et `msw`, à justifier
  dans le plan. Installer avec `docker compose exec frontend npm install`.
- Un commit par étape. Lint, tests et `tsc` verts avant chaque commit.
- Tests, huit au maximum :
  - 401 suivi d'un seul rejeu, sans boucle si le refresh échoue,
  - `ProtectedRoute` : redirection, retour à la destination, rejet d'une
    destination externe,
  - login : succès, 401, 429,
  - inscription : succès, erreur 422 sur le champ,
  - logout : cache vidé.
- Jamais de token ni de mot de passe dans les logs, les snapshots ou les
  commits.
- Solution la plus simple : aucune abstraction ni option non demandée, et
  chaque fichier créé est justifié dans le plan.
- Proposer le plan avant d'écrire du code et attendre mon accord.

## Critères de fin

- Sans session, `http://localhost:5175` redirige vers `/login`.
- Je crée un compte depuis `/register` : l'accueil affiche mon email.
- Recharger la page conserve la session.
- Logout : retour à `/login`, rechargement anonyme.
- Tests, lint, `tsc` et `docker compose build frontend` verts.

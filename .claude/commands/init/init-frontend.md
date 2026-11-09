# Init frontend

## Contexte

Monorepo "my-teckel" (git initialisé, CLAUDE.md à lire d'abord, branche
`init-project` créée depuis `develop`). Le compose et les Dockerfiles existent
déjà (prompt init-docker) et le backend est installé et en marche (prompt
init-backend). Le service `frontend` tourne avec mon utilisateur
(`HOST_UID` et `HOST_GID` du `.env` racine), avec un cache npm dans `/tmp`, et
`node_modules/` est sur l'hôte, ignoré par git. Ne pas modifier le compose ni
les Dockerfiles sans me le dire. `frontend/` est vide. WSL2, commandes via
`docker compose exec`.

## Objectif

Installer le frontend jusqu'à voir un premier écran qui interroge l'API :

1. Projet Vite `react-ts` dans `frontend/`, créé sans interaction avec
   `docker compose run --rm frontend`.
2. Dépendances : `@mui/material`, `@emotion/react`, `@emotion/styled`,
   `@tanstack/react-query`, `react-router-dom`. En dev : `openapi-typescript`,
   `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`.
3. Pas de CSS global : supprimer `index.css`, `App.css` et les ressources
   inutiles du template, les remplacer par `CssBaseline` et un `ThemeProvider`
   MUI.
4. Proxy de dev : Vite proxifie `/api` vers `API_PROXY_TARGET` (défaut
   `http://backend:8000`, variable sans préfixe `VITE_` pour ne pas
   l'exposer au navigateur). Le front appelle `/api` en relatif.
5. Script `types:api` : génère `src/api/schema.d.ts` depuis
   `http://backend:8000/api/docs.jsonopenapi`. Lancer le script une fois et
   commiter le schéma.
6. Premier écran : une page MUI qui appelle `GET /api` avec TanStack Query et
   affiche « API joignable » ou une erreur.
7. Tests : script `test` avec `TZ=Europe/Paris`, et un test de fumée de
   l'écran (réponse de l'API simulée avec `vi.stubGlobal`).

## Contraintes

- Conventions de CLAUDE.md : composants fonctionnels et hooks, pas de CSS
  global, types générés par `types:api` et jamais écrits à la main.
- Un commit par étape (projet, dépendances et thème, proxy et types, écran,
  tests).
- Ne pas modifier CLAUDE.md sans me le dire.
- Solution la plus simple : aucune option ni abstraction non demandée, et
  chaque fichier créé est justifié dans le plan.
- Proposer le plan avant d'écrire du code et attendre mon accord.

## Critères de fin

- `docker compose up -d` : db, adminer, backend et frontend tournent.
- `http://localhost:5175` affiche la page avec « API joignable ».
- `npm run lint`, `npx tsc -b`, `npm run test` et `npm run build` passent.
- `types:api` fonctionne et `docker compose build frontend` passe.
- `ls -l frontend` : tout appartient à mon utilisateur.
- `git status` est propre.

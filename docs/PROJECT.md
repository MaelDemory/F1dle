# F1dle

Jeu de devinettes Formula 1 inspiré de Wordle. Devinez le pilote caché en 6 tentatives grâce aux indices sur son équipe, sa nationalité, ses points, ses victoires et ses titres de champion du monde.

**En ligne : [f1dle-md.fly.dev](https://f1dle-md.fly.dev)**

> **Périmètre de ce document.** Il décrit le projet complet, réparti sur deux
> dépôts : [MaelDemory/F1dle](https://github.com/MaelDemory/F1dle) pour le
> frontend — celui qui contient ce fichier — et
> [MaelDemory/F1dle-API](https://github.com/MaelDemory/F1dle-API) pour l'API.
>
> L'arborescence ci-dessous est celle d'un dossier de travail réunissant les
> deux dépôts côte à côte, ce que `docker-compose.yml` suppose (il référence
> `./F1dle-API`). Les fichiers marqués *(hors dépôt)* ne sont versionnés dans
> aucun des deux : `monitoring/`, `docker-compose.monitoring.yml` et
> `fly/db/fly.toml`.

---

## Fonctionnalités

### Modes de jeu

| Mode | Route | Description |
|---|---|---|
| **Classique** | `/game` | Devinez un pilote en 6 essais grâce à ses stats. Deux plateaux au choix (voir ci-dessous) |
| **Par écuries** | `/guess-by-teams` | Identifiez un pilote historique (≥1 victoire) à partir de toutes les écuries de sa carrière |
| **Remplir la grille** | `/fill-the-grid` | Nommez le Champion du Monde F1 pour chaque saison de 2025 à 1950, avec indice et option de passer |
| **Grille Constructeurs** | `/constructor-grid` | Nommez le champion constructeur de chaque saison |
| **Duel de stats** | `/higher-lower` | Plus haut ou plus bas : comparez deux pilotes sur une statistique, avec score de série |
| **Connexions** | `/connections` | 8 puzzles, 4 catégories de 4 éléments à regrouper |

Le mode **Classique** propose deux plateaux, via une bascule en haut de page :

| Plateau | Vivier | Colonnes comparées |
|---|---|---|
| **Grille actuelle** | Les pilotes de la saison en cours | Équipe · Nationalité · Points · Participations · Victoires · Titres |
| **All Time** | **Les 881 pilotes depuis 1950**, sans filtre | Écuries · Nationalité · Points · Saisons · Victoires · Titres |

Deux colonnes diffèrent sur le plateau All Time, par nécessité. `historical_drivers` n'a aucun compteur de courses, donc les **saisons courues** remplacent les participations. Et un pilote historique a souvent piloté pour plusieurs écuries : la colonne **Écuries** passe donc au vert dès qu'une écurie est commune aux deux carrières, une égalité stricte sur la dernière équipe ne matchant presque jamais.

Tous les modes : autocomplétion, confettis, modal de victoire, interface EN/FR.

**Remplir la grille** en plus : score en temps réel (trouvés / indices / skips), modal d'indice avec la fiche complète du pilote, progression sauvegardée en localStorage.

### Pilotes — `/drivers`
- **Grille actuelle** : statistiques des pilotes en activité (victoires, titres, points, courses)
- **All Time** : tous les pilotes depuis 1950, avec filtres par nationalité, décennie, champions/vainqueurs seulement ; tri par victoires, points ou saisons ; historique d'équipes

### Résultats de saisons — `/results`
- Parcourir les résultats course par course de 1950 à 2024 (75 saisons, 1 114 courses en base)
- Statistiques par saison : nombre de courses, vainqueurs différents, circuits
- Tableau détaillé par course : position, pilote, équipe, grille de départ, tours, temps, points
- Mise en évidence du tour le plus rapide
- Données des saisons passées mises en cache en base de données

### Interface
- Interface entièrement traduite en **français** et **anglais**, préférence persistée en localStorage
- **Thème clair / sombre / système** au choix, avec révélation circulaire animée partant du bouton cliqué (API View Transitions, repli instantané si non supportée ou si `prefers-reduced-motion` est actif)
- « Système » est l'état par défaut et reste sélectionnable à tout moment : il suit `prefers-color-scheme`

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18, TypeScript, React Router v6 |
| Styling | Tailwind CSS (tokens sémantiques, voir [DESIGN.md](DESIGN.md)) |
| Icônes | Lucide React |
| Backend | Laravel 11, PHP 8.2+ |
| Base de données | MySQL 8.0 |
| ORM | Eloquent |
| Conteneurisation | Docker, Docker Compose |
| Serveur web | Nginx (Alpine) |
| Animations | Motion (ex Framer Motion) v12 · View Transitions API |
| Tests | Jest + React Testing Library (72 tests) |
| Déploiement | Fly.io (3 apps, région `cdg`) |
| Monitoring | Prometheus, Grafana |
| Exporters | mysqld-exporter, nginx-exporter |

---

## Architecture

```
F1dle/
├── docker-compose.yml            # App principale
├── docker-compose.monitoring.yml # Stack monitoring (opt-in) — hors dépôt
├── DEPLOY.md                     # Procédure de déploiement Fly.io
├── fly/
│   └── db/fly.toml               # App Fly MySQL — hors dépôt
├── monitoring/                   # hors dépôt
│   ├── prometheus/prometheus.yml  # Config scrape Prometheus
│   └── grafana/
│       ├── provisioning/          # Datasource + dashboard auto-provisionnés
│       └── dashboards/            # Dashboard JSON pré-configuré
├── F1dle/                        # Frontend React
│   ├── fly.toml                  # App Fly frontend (public)
│   ├── nginx.conf.template       # ${API_UPSTREAM} interpolé au démarrage
│   ├── src/
│   │   ├── pages/
│   │   │   ├── WelcomePage.tsx
│   │   │   ├── Game.tsx          # Classique : bascule Grille actuelle / All Time
│   │   │   ├── GuessByTeams.tsx
│   │   │   ├── FillTheGrid.tsx
│   │   │   ├── ConstructorGrid.tsx
│   │   │   ├── HigherLower.tsx
│   │   │   ├── Connections.tsx
│   │   │   ├── Drivers.tsx       # Grille actuelle + All Time
│   │   │   └── RaceResults.tsx   # Résultats par saison
│   │   ├── game/                 # ★ Domaine des plateaux de devinettes — aucun JSX
│   │   │   ├── timings.ts        # Constantes d'animation, source de vérité
│   │   │   ├── types.ts          # GuessIdentity / GuessMode / GuessColumn
│   │   │   ├── comparators.ts    # compareText / compareNumber / compareSet
│   │   │   ├── board.ts          # Construction des lignes et tuiles
│   │   │   ├── useGuessSession.ts # ★ Une manche : essais, verdict, saisie, victoire
│   │   │   ├── useGuessGame.ts   # État des essais et doublons
│   │   │   ├── useGuessSuggestions.ts
│   │   │   ├── useVictoryReveal.ts
│   │   │   ├── useGuessRound.ts  # Chargement des données d'une manche
│   │   │   └── modes/            # Un mode = une valeur, pas un composant
│   │   │       ├── currentGrid.tsx
│   │   │       ├── allTime.tsx
│   │   │       └── byTeams.tsx
│   │   ├── theme/                # ★ Thème clair / sombre / système
│   │   │   ├── theme.ts          # Domaine pur : états, classes, résolution
│   │   │   ├── ThemeContext.tsx  # Provider, persistance, theme-color
│   │   │   └── viewTransition.ts # Révélation circulaire (View Transitions)
│   │   ├── components/
│   │   │   ├── guess/            # ★ Présentation des plateaux — aucun état métier
│   │   │   │   ├── GuessGame.tsx      # Plateau à colonnes
│   │   │   │   ├── GuessRound.tsx
│   │   │   │   ├── GuessBoard.tsx · GuessCell.tsx
│   │   │   │   ├── GuessSearchPanel.tsx · GuessStatusLine.tsx
│   │   │   │   ├── GuessVerdictList.tsx  # Plateau à liste binaire
│   │   │   │   ├── TeamsCluePanel.tsx
│   │   │   │   └── VictoryDialog.tsx
│   │   │   └── ui/               # Primitives du design system (voir DESIGN.md)
│   │   ├── api/f1dleApi.ts       # Couche d'appels API
│   │   ├── hooks/                # Hooks partagés (useTeamLogos, useScrollEdge…)
│   │   ├── i18n/                 # Contexte de traduction (EN/FR)
│   │   └── types/                # Types TypeScript
│   └── Dockerfile
│
└── F1dle-API/                    # Backend Laravel
    ├── fly.toml                  # App Fly API (privée)
    ├── app/
    │   ├── Http/Controllers/API/
    │   │   ├── DriverController.php         # Pilotes actuels + random + historique
    │   │   ├── SeasonRaceController.php     # Résultats de saisons (cache BD)
    │   │   └── SeasonChampionController.php # Champions par année
    │   ├── Models/
    │   │   ├── Driver.php
    │   │   ├── HistoricalDriver.php
    │   │   ├── SeasonRace.php
    │   │   ├── SeasonChampion.php
    │   │   └── Team.php
    │   └── Console/Commands/
    │       ├── SeedAll.php                  # ★ Seed complet (point d'entrée recommandé)
    │       ├── SeedDriversFromApi.php       # Pilotes grille actuelle + équipes
    │       ├── SyncHistoricalDrivers.php    # Pilotes historiques (1950–aujourd'hui)
    │       ├── SyncSeasonChampions.php      # Champions du monde par saison
    │       └── SyncSeasonRaces.php          # Résultats de courses (cache BD)
    ├── routes/api.php
    ├── database/migrations/
    └── Dockerfile
```

### Flux de données

```
Navigateur
    │
    ├── /api/drivers                    → DriverController        → drivers
    ├── /api/random                     → DriverController        → drivers
    ├── /api/historical-drivers         → DriverController        → historical_drivers
    ├── /api/random-historical-driver   → DriverController        → historical_drivers  (les 881)
    ├── /api/random-historical-winner   → DriverController        → historical_drivers  (≥1 victoire)
    ├── /api/teams                      → DriverController        → teams
    ├── /api/season-champions           → SeasonChampionController → season_champions
    └── /api/season-races/{year}        → SeasonRaceController    → season_races
```

**Les contrôleurs ne lisent que la base de données.** Il n'y a aucun repli vers
l'API Jolpica à la requête : une table vide renvoie une réponse vide. Le
peuplement est un acte explicite, via les commandes artisan ci-dessous.

### Base de données

| Table | Contenu |
|---|---|
| `drivers` | Pilotes de la grille actuelle |
| `teams` | Écuries avec logos (base64) |
| `historical_drivers` | Tous les pilotes depuis 1950, stats agrégées |
| `season_champions` | Champion du monde par saison (1950–2025) |
| `season_races` | Résultats de courses mis en cache (1 ligne = 1 course, résultats JSON) |

S'y ajoutent les tables d'infrastructure Laravel (`migrations`, `cache`, `jobs`,
`sessions`, `users`…), créées par les migrations mais inutilisées par le jeu :
l'API est en lecture seule pour les clients, sans authentification ni file
d'attente.

---

## Lancer le projet

### Prérequis

- Docker et Docker Compose installés

### Démarrage

```bash
git clone <repo>
cd F1dle
docker compose up --build
```

L'application est disponible sur **http://localhost:3000**
L'API est disponible sur **http://localhost:8000**

### Peupler la base de données

Une fois les conteneurs démarrés, lancez la commande de seed complète :

```bash
docker compose exec api php artisan app:seed --with-stats
```

Elle enchaîne automatiquement dans l'ordre :
1. **Pilotes & équipes** de la grille actuelle (`drivers:seed-from-api`)
2. **Pilotes historiques** depuis 1950 (`historical-drivers:sync`)
3. **Champions du monde** par saison 1950–2025 (`season-champions:sync`)

> ⚠️ **`--with-stats` n'est pas optionnel en pratique.** Sans lui, `app:seed`
> saute les appels API par pilote et laisse `entries`, `pole`, `podium` et
> `fastest_laps` à 0 pour toute la grille — or la colonne « Participations » du
> mode Classique lit `entries`. Le jeu affiche alors « 0 » pour tous les pilotes.
> Compter ~10 min de plus.

#### Options disponibles

```bash
# Inclure les stats détaillées par pilote (poles, entrées, fastest laps — ~10 min)
docker compose exec api php artisan app:seed --with-stats

# Inclure aussi les résultats de courses en cache (~1h, rate limit Ergast)
docker compose exec api php artisan app:seed --with-races

# Vider toutes les tables avant de resynchroniser
docker compose exec api php artisan app:seed --fresh

# Spécifier la saison pour la grille actuelle (défaut : année courante)
docker compose exec api php artisan app:seed --season=2024

# Combinaison complète
docker compose exec api php artisan app:seed --fresh --with-stats --with-races
```

> `app:seed` sans options lit les victoires directement depuis les standings et
> ignore les appels API par pilote : c'est rapide (~2 min) mais incomplet, comme
> expliqué ci-dessus. N'utilisez ce mode que pour amorcer une base de test.
>
> `season-races:sync` écrit en `updateOrCreate` et accepte `--year=`, donc une
> interruption est sans risque et une reprise ciblée est possible — utile, l'API
> Jolpica plafonnant à ~500 requêtes/heure. **Ne lancez jamais deux commandes de
> seed en parallèle** : elles se disputent ce quota et les 429 qui en résultent
> laissent des pilotes à 0 avec un simple avertissement.

#### Commandes individuelles

Chaque étape peut être lancée séparément si besoin :

```bash
# Grille actuelle + équipes
docker compose exec api php artisan drivers:seed-from-api

# Pilotes historiques
docker compose exec api php artisan historical-drivers:sync

# Champions par saison
docker compose exec api php artisan season-champions:sync

# Résultats de courses (tester une année d'abord)
docker compose exec api php artisan season-races:sync --year=2023
docker compose exec api php artisan season-races:sync   # toutes les saisons, ~1h
```

> Toutes les commandes de sync supportent `--fresh` pour vider la table avant de recommencer.

### Développement local (sans Docker)

**Backend :**

```bash
cd F1dle-API
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve           # http://localhost:8000
```

**Frontend :**

```bash
cd F1dle
npm install
REACT_APP_API_URL=http://localhost:8000/api npm start   # http://localhost:3000
```

---

## API

| Route | Méthode | Description |
|---|---|---|
| `/api/drivers` | GET | Pilotes de la grille actuelle |
| `/api/random` | GET | Pilote aléatoire (mode Classique) |
| `/api/random-historical-winner` | GET | Pilote historique aléatoire avec ≥1 victoire (mode Par écuries) |
| `/api/random-historical-driver` | GET | Pilote historique aléatoire parmi les 881, sans seuil (plateau All Time) |
| `/api/historical-drivers` | GET | Tous les pilotes depuis 1950 |
| `/api/teams` | GET | Écuries avec logos |
| `/api/season-champions` | GET | Champions du monde par saison (2025→1950, mode Fill the Grid) |
| `/api/season-races/{year}` | GET | Résultats de la saison `{year}` |
| `/metrics` | GET | Métriques Prometheus (app status, counts BD) |

Les données proviennent de [l'API Jolpica/Ergast](https://api.jolpi.ca/ergast/f1),
importées une fois par les commandes de seed puis servies depuis MySQL. Aucune
requête utilisateur ne sort vers Jolpica.

---

## Tests

Le domaine des plateaux de devinettes et celui du thème sont couverts par des
tests unitaires. Ils portent sur la logique pure et les hooks, pas sur le rendu :
c'est ce découpage qui les rend possibles.

```bash
cd F1dle
CI=true npm test            # 72 tests
npx tsc --noEmit            # vérification de types
npm run build               # build de production
```

| Fichier | Ce qu'il verrouille |
|---|---|
| `game/timings.test.ts` | Les constantes d'animation, et que `victoryRevealDelayMs(7) === 890` — la modal de victoire est calée sur la fin de l'animation des tuiles |
| `game/comparators.test.ts` | Égalité texte, direction des flèches, intersection d'ensembles (dont deux ensembles vides, qui ne comptent pas comme une correspondance) |
| `game/useGuessGame.test.ts` | Refus des doublons, victoire au bon essai, défaite au 6ᵉ et pas au 5ᵉ |
| `game/modes/currentGrid.test.ts` | **Non-régression** : les tons, flèches et libellés du plateau classique, tels qu'avant l'extraction du monolithe |
| `game/modes/allTime.test.ts` | Les colonnes du plateau All Time, dont les pilotes à une seule course que le vivier non filtré contient |
| `game/modes/byTeams.test.tsx` | L'identité du plateau Par écuries, dont ses termes de recherche d'avant migration |
| `theme/theme.test.ts` | Que `system` ne pose aucune classe, et le rejet d'une valeur de `localStorage` corrompue |
| `theme/ThemeContext.test.tsx` | Application et retrait des classes, persistance, `theme-color`, et le chemin animé qui écrit la classe lui-même |
| `theme/viewTransition.test.ts` | Les quatre raisons de ne pas animer, dont `prefers-reduced-motion` |

---

## Déploiement

Le projet se déploie sur **Fly.io** en trois apps, région `cdg` (Paris) :

```
Internet ──► f1dle-md        nginx + build React      public, HTTPS
                │  /api/ → proxy_pass
                ▼
             f1dle-api-md    php-fpm + nginx          privé (Flycast)
                │
                ▼
             f1dle-db-md     mysql:8.0 + volume       privé (6PN)
```

Seul le frontend est exposé publiquement, et il proxifie `/api/` vers l'API :
le navigateur ne parle donc qu'à une seule origine, sans CORS.

```bash
cd fly/db     && fly deploy   # base de données (+ volume et secrets)
cd F1dle-API  && fly deploy   # API
cd F1dle      && fly deploy   # frontend
```

La procédure complète — création des apps, volume, secrets, passage de l'API en
privé, seed initial, vérifications et sauvegardes — est dans **[DEPLOY.md](DEPLOY.md)**.

## Monitoring

Stack Prometheus + Grafana dans des conteneurs séparés, opt-in via un docker-compose dédié.

### Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Grafana   │◄────│   Prometheus     │────►│ Laravel API  │
│  :3001      │     │   :9090          │     │ /metrics     │
└─────────────┘     └──────┬───┬───────┘     └─────────────┘
                           │   │
                ┌──────────┘   └──────────┐
                ▼                         ▼
       ┌────────────────┐       ┌──────────────────┐
       │ mysqld-exporter │       │  nginx-exporter   │
       │ :9104           │       │  :9113            │
       └───────┬────────┘       └────────┬─────────┘
               │                          │
               ▼                          ▼
          MySQL :3306              nginx stub_status
                                   (api:8081)
```

### Lancement

```bash
# 1. Démarrer l'app
docker compose up -d

# 2. Démarrer le monitoring
docker compose -f docker-compose.monitoring.yml up -d
```

### Accès

| Service | URL |
|---|---|
| Grafana | http://localhost:3001 (admin / admin) |
| Prometheus | http://localhost:9090 |
| Targets Prometheus | http://localhost:9090/targets |

Un dashboard **F1dle - Overview** est pré-provisionné dans Grafana (20 panels) :

- **Statut** : app up/down, targets Prometheus, mémoire PHP, uptime MySQL
- **HTTP** : requêtes/s par route, latence p50/p95/p99, latence par route, taux d'erreurs 4xx/5xx, requêtes en cours, taille des réponses, répartition par status code
- **Base de données** : queries/s par type (SELECT/INSERT/UPDATE), latence p50/p95/p99, compteurs de lignes par table
- **Infrastructure** : nginx req/s, connexions actives, MySQL threads/connexions

### Métriques exposées par l'API (`/metrics`)

Les métriques sont collectées via `promphp/prometheus_client_php` avec stockage APCu (partagé entre les workers PHP-FPM).

**Application**

| Métrique | Type | Labels | Description |
|---|---|---|---|
| `f1dle_up` | gauge | — | Application en ligne |
| `f1dle_php_info` | gauge | `version` | Version PHP |
| `f1dle_php_memory_usage_bytes` | gauge | — | Mémoire PHP utilisée |
| `f1dle_php_memory_peak_bytes` | gauge | — | Pic mémoire PHP |
| `f1dle_drivers_total` | gauge | — | Pilotes actuels en BD |
| `f1dle_historical_drivers_total` | gauge | — | Pilotes historiques en BD |
| `f1dle_season_races_total` | gauge | — | Courses cachées en BD |
| `f1dle_teams_total` | gauge | — | Écuries en BD |

**HTTP (via middleware)**

| Métrique | Type | Labels | Description |
|---|---|---|---|
| `f1dle_http_requests_total` | counter | `method`, `route`, `status` | Total requêtes HTTP |
| `f1dle_http_request_duration_seconds` | histogram | `method`, `route`, `status` | Latence des requêtes |
| `f1dle_http_response_size_bytes` | histogram | `method`, `route` | Taille des réponses |
| `f1dle_http_requests_in_progress` | gauge | `method` | Requêtes en cours |

**Base de données (via DB::listen)**

| Métrique | Type | Labels | Description |
|---|---|---|---|
| `f1dle_db_queries_total` | counter | `type` | Total queries (SELECT, INSERT...) |
| `f1dle_db_query_duration_seconds` | histogram | `type` | Latence des queries |
| `f1dle_db_threads_connected` | gauge | — | Threads MySQL connectés |
| `f1dle_db_threads_running` | gauge | — | Threads MySQL actifs |
| `f1dle_db_uptime` | gauge | — | Uptime MySQL (secondes) |
| `f1dle_db_slow_queries` | gauge | — | Nombre de slow queries |

# Déploiement — Fly.io

## Topologie

```
Internet ──► f1dle-md        nginx + build React      public, HTTPS
                │  location /api/ → proxy_pass
                ▼
             f1dle-api-md    php-fpm + nginx          privé, f1dle-api-md.flycast:80
                │
                ▼
             f1dle-db-md     mysql:8.0 + volume       privé, f1dle-db-md.internal:3306
```

Région : `cdg` (Paris). Seul `f1dle-md` possède une IP publique.

Le navigateur ne parle qu'à une seule origine : `/api/` est proxifié côté nginx.
Conséquence, **le CORS ne s'applique jamais** en production ; `config/cors.php` et
`FRONTEND_URL` ne servent que de garde-fou.

| Fichier de config | App |
|---|---|
| `fly/db/fly.toml` | `f1dle-db-md` |
| `F1dle-API/fly.toml` | `f1dle-api-md` |
| `F1dle/fly.toml` | `f1dle-md` |

## Secrets

Jamais dans les `fly.toml`. À définir via `fly secrets set`.

| App | Secret | Contrainte |
|---|---|---|
| `f1dle-db-md` | `MYSQL_ROOT_PASSWORD` | libre |
| `f1dle-db-md` | `MYSQL_PASSWORD` | **doit être identique** à `DB_PASSWORD` de l'API |
| `f1dle-api-md` | `DB_PASSWORD` | idem ci-dessus |
| `f1dle-api-md` | `APP_KEY` | `base64:` + 32 octets. L'entrypoint refuse de démarrer sans, en `APP_ENV=production` |

## Déploiement initial

### 0. Authentification

`flyctl auth login` a besoin d'un terminal interactif : à lancer dans une
fenêtre Terminal, pas depuis un environnement headless.

```sh
flyctl auth login
flyctl auth whoami   # doit afficher le compte
```

### 1. Base de données

```sh
cd fly/db

# Mot de passe applicatif, réutilisé par l'API à l'étape 2.
# Les caractères /+= sont retirés pour ne pas gêner l'écriture du .env runtime.
DB_PASS="$(openssl rand -base64 24 | tr -d '/+=')"
echo "$DB_PASS"   # à conserver le temps de l'étape 2

fly apps create f1dle-db-md
fly volumes create mysql_data --size 1 --region cdg -a f1dle-db-md
fly secrets set \
  MYSQL_ROOT_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=')" \
  MYSQL_PASSWORD="$DB_PASS" \
  -a f1dle-db-md
fly deploy --ha=false
```

Vérification :

```sh
fly ssh console -a f1dle-db-md -C "mysqladmin ping -h 127.0.0.1 -u root -p$MYSQL_ROOT_PASSWORD"
```

### 2. API

```sh
cd ../../F1dle-API

fly apps create f1dle-api-md
fly secrets set \
  APP_KEY="base64:$(openssl rand -base64 32)" \
  DB_PASSWORD="$DB_PASS" \
  -a f1dle-api-md
fly deploy --ha=false
```

Rendre l'app privée, avec une adresse Flycast :

```sh
fly ips allocate-v6 --private -a f1dle-api-md
fly ips list -a f1dle-api-md   # doit ne lister QUE 'private ingress'
```

> **Comportement observé au premier deploy.** `fly deploy` tente d'allouer des IP
> publiques d'office dès qu'un `[http_service]` est déclaré, mais l'opération
> échoue avec :
>
> ```
> Failed to provision IP addresses. ERROR: error allocating ipv6 after detecting
> first deploy and presence of services: failed to add ip to app: org_slug is
> only supported with private_v6 type
> ```
>
> Le déploiement aboutit malgré tout, et l'app se retrouve sans aucune IP — ce
> qui est précisément l'état voulu ici. Aucun `fly ips release` n'est donc
> nécessaire. En revanche il faut allouer les IP publiques du frontend à la main
> (étape 4).

Les migrations tournent à chaque boot depuis l'entrypoint :

```sh
fly logs -a f1dle-api-md   # chercher la sortie de 'php artisan migrate'
```

### 3. Seed initial (une seule fois, ~25 min)

Le seed n'est **pas** dans l'entrypoint : il interroge l'API Jolpica pendant des
dizaines de minutes, ce qui dépasserait tout délai de health check raisonnable.

Lancer avec `--with-stats`, détaché — sans ce flag, `entries`, `pole`, `podium`
et `fastest_laps` restent à 0 pour toute la grille (voir *Pièges connus*) :

```sh
fly ssh console -a f1dle-api-md
# dans la machine :
nohup php artisan app:seed --with-stats > /tmp/seed.log 2>&1 &
tail -f /tmp/seed.log
```

`app:seed` couvre les pilotes de la grille, les pilotes historiques depuis 1950
et les champions du monde. Il **laisse `season_races` vide**, ce qui rend la page
« Résultats de saisons » (`/race-results`) fonctionnelle mais sans données.

Pour la remplir, lancer la synchro des courses séparément. Sur une base déjà
seedée, préférer `season-races:sync` à `app:seed --with-races` : la seconde
refait aussi les étapes 1 à 4, soit ~15 min pour rien.

```sh
fly ssh console -a f1dle-api-md
# dans la machine :
nohup php artisan season-races:sync > /tmp/races.log 2>&1 &
tail -f /tmp/races.log
```

75 saisons (1950-2024), ~2 s entre requêtes, compter ~1 h. C'est aussi la raison
pour laquelle `f1dle-api-md` est configurée en `auto_stop_machines = "off"` :
l'autostop de Fly tuerait ce run, qui ne génère aucun trafic HTTP.

Options utiles : `--year=2024` pour une saison unique, `--fresh` pour purger la
table avant.

### 4. Frontend

```sh
cd ../F1dle
fly apps create f1dle-md
fly deploy --ha=false

# L'auto-provisioning échoue (voir l'encadré de l'étape 2) : allouer à la main.
# L'IPv4 partagée est gratuite, contrairement à une dédiée.
fly ips allocate-v4 --shared -a f1dle-md
fly ips allocate-v6 -a f1dle-md
fly ips list -a f1dle-md
```

`REACT_APP_API_URL=/api` est injecté au build (`[build.args]`) : CRA inline les
variables d'environnement dans le bundle, elles ne sont pas lisibles au runtime.

## Vérification

```sh
APP=https://f1dle-md.fly.dev

curl -sSI  $APP/                       # 200, sert index.html
curl -sS   $APP/api/drivers      | head -c 300   # JSON non vide → chaîne web → api → db OK
curl -sS   $APP/api/season-champions | head -c 300   # → le seed historique a abouti
curl -sS   $APP/api/teams        | head -c 200

fly logs -a f1dle-md
fly logs -a f1dle-api-md
```

Puis, dans un navigateur : `/game`, `/guess-by-teams`, `/fill-the-grid`,
`/drivers`, `/race-results`.

Persistance du volume :

```sh
fly machine restart <machine-id> -a f1dle-db-md
curl -sS $APP/api/drivers | head -c 200   # les données doivent survivre
```

## Pièges connus

### Statistiques par pilote : le piège de `--with-stats`

`app:seed` sans `--with-stats` passe `--no-stats` à l'étape 1, ce qui **saute les
appels API par pilote**. Résultat : `entries`, `pole`, `podium` et `fastest_laps`
restent à 0 pour toute la grille, alors que `career_points`, `win`,
`world_championship` et `first_entry` sont corrects (remplis par le backfill de
l'étape 3 depuis `historical_drivers`).

Le symptôme côté jeu : « nombre de participations » à 0 pour tous les pilotes.

Pour corriger sans tout re-seeder :

```sh
fly ssh console -a f1dle-api-md
nohup php artisan drivers:seed-from-api 2026 > /tmp/drivers.log 2>&1 &
```

**Sans aucun flag.** Deux pièges à éviter :

- `--no-career-data` remettrait `career_points` et `world_championship` à 0 :
  `SeedDriversFromApi` écrit toujours ces colonnes depuis `$careerData`, qui est
  vide quand ce flag est actif. Sur une base déjà backfillée, c'est une
  régression.
- `app:seed --with-stats` marche aussi mais refait les étapes 2 à 4
  (881 pilotes historiques, 76 champions), soit ~15 min pour rien.

Comme la commande réécrit `career_points` depuis l'API, un 429 en cours de route
peut dégrader des données correctes. Filet de sécurité avant de lancer :

```sh
fly ssh console -a f1dle-db-md -C "sh -c 'mysql -u root -p\$MYSQL_ROOT_PASSWORD f1dle \
  -e \"DROP TABLE IF EXISTS drivers_backup; CREATE TABLE drivers_backup AS SELECT * FROM drivers;\"'"
```

### Ne pas faire tourner deux seeds en parallèle

L'API Jolpica plafonne à ~500 requêtes/heure. Deux commandes concurrentes se
disputent ce budget et déclenchent des 429 : `fetchDriverStats` renvoie alors
`null` et le pilote concerné garde ses stats à 0, avec un simple warning. Lancer
les seeds l'un après l'autre.

### Vérifier qu'un seed tourne encore

> **Piège de vérification.** Pour tester si un seed tourne encore,
> `pgrep -f 'artisan app:seed'` renvoie un faux positif : le motif apparaît dans
> la ligne de commande du shell qui exécute le `pgrep`, qui se matche donc
> lui-même. Utiliser `pgrep -f '[a]rtisan app:seed'`.

## Exploitation

### Mises à jour

```sh
cd F1dle-API && fly deploy    # API
cd F1dle     && fly deploy    # frontend
```

### Rafraîchir les données F1

```sh
fly ssh console -a f1dle-api-md -C "php artisan app:seed --fresh"
```

### Sauvegardes

Le volume MySQL est un point unique de défaillance sans réplication, mais Fly
active des **snapshots planifiés par défaut** à la création du volume (rétention
5 jours, visible dans la sortie de `fly volumes create`). Pour les inspecter ou
en déclencher un à la demande :

```sh
fly volumes list -a f1dle-db-md
fly volumes snapshots list <volume-id>
fly volumes snapshots create <volume-id>
```

Filet de sécurité : le jeu de données est entièrement reconstructible depuis
l'API Jolpica via `app:seed`, une perte du volume coûte du temps, pas des données
irrécupérables.

### Coûts

`f1dle-api-md` est volontairement toujours active (voir le commentaire dans son
`fly.toml`) : une machine `shared-cpu-1x` 512 Mo en continu. `f1dle-md` s'arrête
quand elle est inactive et redémarre à la première visite (~1-2 s). `f1dle-db-md`
tourne en continu, 1 Go.

## Développement local

Inchangé, `docker-compose.yml` fonctionne toujours :

```sh
docker compose up --build
# frontend http://localhost:3000 · API http://localhost:8000
```

Deux points à connaître :

- **Le proxy `/api/` est paramétrable.** `F1dle/nginx.conf.template` utilise
  `${API_UPSTREAM}`, interpolé au démarrage du conteneur par l'entrypoint de
  l'image nginx. Valeur par défaut dans le `Dockerfile` : `api:80` (le hostname
  Compose). `F1dle/fly.toml` la surcharge avec `f1dle-api-md.flycast:80`.
  `NGINX_ENVSUBST_FILTER=API_UPSTREAM` restreint la substitution à cette seule
  variable, pour que `$host`, `$uri` et les autres variables runtime de nginx
  survivent.
- **Le seed n'est plus automatique au premier boot.** À lancer à la main :
  ```sh
  docker compose exec api php artisan app:seed
  ```

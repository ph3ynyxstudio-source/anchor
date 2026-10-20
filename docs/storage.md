STOCKAGE — Anchor

Objectif

Ce document décrit la structure de données locale, le schéma SQL et les règles de rétention.
Il ne décrit PAS la mise en page ni les composants graphiques.

Schéma relationnel SQLite (anchor.db)

CREATE TABLE IF NOT EXISTS mood_entries (
    id TEXT PRIMARY KEY NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    emotion_1_label TEXT NOT NULL,
    emotion_1_intensity INTEGER NOT NULL CHECK (emotion_1_intensity BETWEEN 1 AND 10),
    emotion_2_label TEXT,
    emotion_2_intensity INTEGER CHECK (emotion_2_intensity IS NULL OR (emotion_2_intensity BETWEEN 1 AND 10)),
    emotion_3_label TEXT,
    emotion_3_intensity INTEGER CHECK (emotion_3_intensity IS NULL OR (emotion_3_intensity BETWEEN 1 AND 10)),
    dominant_event TEXT NOT NULL,
    is_deleted INTEGER DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
);


Arbitrage des conflits

Stratégie : Last-Write-Wins (LWW)
Clé de comparaison : updated_at (horodatage ISO 8601 UTC)
Suppression : Marquage logique via is_deleted = 1 propagé lors du sync


Règles strictes

Règle 1 : Tous les identifiants uniques (id) sont générés côté client au format UUIDv4 aléatoire.
Règle 2 : Le code PIN est stocké haché dans app_config, jamais en clair.
Règle 3 : Aucune donnée utilisateur ne doit transiter par le localStorage du navigateur.


À éviter

- Ne pas utiliser d'identifiants auto-incrémentés incompatibles avec une réplication multi-appareils.
- Ne pas supprimer physiquement des lignes sans passer par le drapeau is_deleted sous peine de réapparition au sync.


Phrase simple

Une base SQLite locale unique.
Des UUIDv4 pour éviter les collisions.
La date la plus récente gagne en cas de conflit.

use chrono::Utc;
use serde::{Deserialize, Serialize};
use sqlx::{sqlite::SqlitePoolOptions, Pool, Row, Sqlite};
use std::path::PathBuf;
use tauri_plugin_sql::{Migration, MigrationKind};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct MoodEntry {
    pub id: String,
    pub created_at: String,
    pub updated_at: String,
    pub emotion_1_label: String,
    pub emotion_1_intensity: i64,
    pub emotion_2_label: Option<String>,
    pub emotion_2_intensity: Option<i64>,
    pub emotion_3_label: Option<String>,
    pub emotion_3_intensity: Option<i64>,
    pub dominant_event: String,
    pub is_deleted: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoodEntryInput {
    pub emotion_1_label: String,
    pub emotion_1_intensity: i64,
    pub emotion_2_label: Option<String>,
    pub emotion_2_intensity: Option<i64>,
    pub emotion_3_label: Option<String>,
    pub emotion_3_intensity: Option<i64>,
    pub dominant_event: String,
}

pub fn get_migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "create_initial_tables",
        sql: "CREATE TABLE IF NOT EXISTS mood_entries (
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
        );",
        kind: MigrationKind::Up,
    }]
}

pub async fn init_db_pool(db_path: &PathBuf) -> Result<Pool<Sqlite>, String> {
    if let Some(parent) = db_path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }

    let conn_str = format!(
        "sqlite://{}?mode=rwc",
        db_path.to_string_lossy().replace('\\', "/")
    );

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&conn_str)
        .await
        .map_err(|e| format!("Failed to connect to SQLite: {}", e))?;

    // Ensure tables exist
    sqlx::query(
        r#"
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
        "#,
    )
    .execute(&pool)
    .await
    .map_err(|e| format!("Failed to execute initial schema: {}", e))?;

    Ok(pool)
}

pub async fn save_new_entry(
    pool: &Pool<Sqlite>,
    input: MoodEntryInput,
) -> Result<MoodEntry, String> {
    if input.emotion_1_label.trim().is_empty() {
        return Err("Primary emotion is required".to_string());
    }
    if !(1..=10).contains(&input.emotion_1_intensity) {
        return Err("Primary emotion intensity must be between 1 and 10".to_string());
    }

    let now = Utc::now().to_rfc3339();
    let id = Uuid::new_v4().to_string();

    let entry = MoodEntry {
        id,
        created_at: now.clone(),
        updated_at: now,
        emotion_1_label: input.emotion_1_label.trim().to_string(),
        emotion_1_intensity: input.emotion_1_intensity,
        emotion_2_label: input.emotion_2_label.map(|s| s.trim().to_string()).filter(|s| !s.is_empty()),
        emotion_2_intensity: input.emotion_2_intensity,
        emotion_3_label: input.emotion_3_label.map(|s| s.trim().to_string()).filter(|s| !s.is_empty()),
        emotion_3_intensity: input.emotion_3_intensity,
        dominant_event: input.dominant_event.trim().to_string(),
        is_deleted: 0,
    };

    sqlx::query(
        r#"
        INSERT INTO mood_entries (
            id, created_at, updated_at,
            emotion_1_label, emotion_1_intensity,
            emotion_2_label, emotion_2_intensity,
            emotion_3_label, emotion_3_intensity,
            dominant_event, is_deleted
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
        "#,
    )
    .bind(&entry.id)
    .bind(&entry.created_at)
    .bind(&entry.updated_at)
    .bind(&entry.emotion_1_label)
    .bind(entry.emotion_1_intensity)
    .bind(&entry.emotion_2_label)
    .bind(entry.emotion_2_intensity)
    .bind(&entry.emotion_3_label)
    .bind(entry.emotion_3_intensity)
    .bind(&entry.dominant_event)
    .bind(entry.is_deleted)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to insert mood entry: {}", e))?;

    Ok(entry)
}

pub async fn get_active_entries(pool: &Pool<Sqlite>) -> Result<Vec<MoodEntry>, String> {
    sqlx::query_as::<_, MoodEntry>(
        r#"
        SELECT id, created_at, updated_at,
               emotion_1_label, emotion_1_intensity,
               emotion_2_label, emotion_2_intensity,
               emotion_3_label, emotion_3_intensity,
               dominant_event, is_deleted
        FROM mood_entries
        WHERE is_deleted = 0
        ORDER BY created_at DESC
        "#,
    )
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Failed to fetch mood entries: {}", e))
}

pub async fn get_all_entries(pool: &Pool<Sqlite>) -> Result<Vec<MoodEntry>, String> {
    sqlx::query_as::<_, MoodEntry>(
        r#"
        SELECT id, created_at, updated_at,
               emotion_1_label, emotion_1_intensity,
               emotion_2_label, emotion_2_intensity,
               emotion_3_label, emotion_3_intensity,
               dominant_event, is_deleted
        FROM mood_entries
        ORDER BY created_at ASC
        "#,
    )
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Failed to fetch all mood entries: {}", e))
}

pub async fn soft_delete_entry(pool: &Pool<Sqlite>, id: &str) -> Result<(), String> {
    let now = Utc::now().to_rfc3339();
    sqlx::query(
        r#"
        UPDATE mood_entries
        SET is_deleted = 1, updated_at = ?1
        WHERE id = ?2
        "#,
    )
    .bind(now)
    .bind(id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to delete entry: {}", e))?;

    Ok(())
}

/// Last-Write-Wins (LWW) reconciliation based on updated_at
pub async fn reconcile_sync(
    pool: &Pool<Sqlite>,
    incoming_entries: Vec<MoodEntry>,
) -> Result<Vec<MoodEntry>, String> {
    for incoming in incoming_entries {
        let existing = sqlx::query_as::<_, MoodEntry>(
            "SELECT * FROM mood_entries WHERE id = ?1",
        )
        .bind(&incoming.id)
        .fetch_optional(pool)
        .await
        .map_err(|e| format!("Failed to query entry for sync: {}", e))?;

        match existing {
            None => {
                // Insert new incoming entry
                sqlx::query(
                    r#"
                    INSERT INTO mood_entries (
                        id, created_at, updated_at,
                        emotion_1_label, emotion_1_intensity,
                        emotion_2_label, emotion_2_intensity,
                        emotion_3_label, emotion_3_intensity,
                        dominant_event, is_deleted
                    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
                    "#,
                )
                .bind(&incoming.id)
                .bind(&incoming.created_at)
                .bind(&incoming.updated_at)
                .bind(&incoming.emotion_1_label)
                .bind(incoming.emotion_1_intensity)
                .bind(&incoming.emotion_2_label)
                .bind(incoming.emotion_2_intensity)
                .bind(&incoming.emotion_3_label)
                .bind(incoming.emotion_3_intensity)
                .bind(&incoming.dominant_event)
                .bind(incoming.is_deleted)
                .execute(pool)
                .await
                .map_err(|e| format!("Failed to insert synced entry: {}", e))?;
            }
            Some(local) => {
                // Last-Write-Wins based on ISO 8601 string comparison
                if incoming.updated_at > local.updated_at {
                    sqlx::query(
                        r#"
                        UPDATE mood_entries
                        SET updated_at = ?1,
                            emotion_1_label = ?2,
                            emotion_1_intensity = ?3,
                            emotion_2_label = ?4,
                            emotion_2_intensity = ?5,
                            emotion_3_label = ?6,
                            emotion_3_intensity = ?7,
                            dominant_event = ?8,
                            is_deleted = ?9
                        WHERE id = ?10
                        "#,
                    )
                    .bind(&incoming.updated_at)
                    .bind(&incoming.emotion_1_label)
                    .bind(incoming.emotion_1_intensity)
                    .bind(&incoming.emotion_2_label)
                    .bind(incoming.emotion_2_intensity)
                    .bind(&incoming.emotion_3_label)
                    .bind(incoming.emotion_3_intensity)
                    .bind(&incoming.dominant_event)
                    .bind(incoming.is_deleted)
                    .bind(&incoming.id)
                    .execute(pool)
                    .await
                    .map_err(|e| format!("Failed to update synced entry: {}", e))?;
                }
            }
        }
    }

    // Return the updated full set of entries for bilateral sync
    get_all_entries(pool).await
}

pub async fn generate_markdown_export(pool: &Pool<Sqlite>) -> Result<String, String> {
    let entries = get_active_entries(pool).await?;

    let mut md = String::new();
    md.push_str("# ANCHOR — Journal Chronologique / Mood Journal\n\n");
    md.push_str(&format!(
        "> Export généré le : {}\n> Nombre d'entrées : {}\n\n---\n\n",
        Utc::now().format("%Y-%m-%d %H:%M:%S UTC"),
        entries.len()
    ));

    if entries.is_empty() {
        md.push_str("*Aucune entrée enregistrée pour le moment.*\n");
        return Ok(md);
    }

    for entry in entries {
        md.push_str(&format!("### ⚓ {}\n\n", entry.created_at));
        md.push_str(&format!(
            "- **Émotion principale** : {} (Intensité : {}/10)\n",
            entry.emotion_1_label, entry.emotion_1_intensity
        ));
        if let Some(e2) = &entry.emotion_2_label {
            let intensity_str = entry
                .emotion_2_intensity
                .map(|i| format!(" (Intensité : {}/10)", i))
                .unwrap_or_default();
            md.push_str(&format!("- **Émotion secondaire** : {}{}\n", e2, intensity_str));
        }
        if let Some(e3) = &entry.emotion_3_label {
            let intensity_str = entry
                .emotion_3_intensity
                .map(|i| format!(" (Intensité : {}/10)", i))
                .unwrap_or_default();
            md.push_str(&format!("- **Émotion complémentaire** : {}{}\n", e3, intensity_str));
        }
        md.push_str(&format!(
            "- **Événement déclencheur** :\n  > {}\n\n---\n\n",
            entry.dominant_event.replace('\n', "\n  > ")
        ));
    }

    Ok(md)
}

pub async fn set_config(pool: &Pool<Sqlite>, key: &str, value: &str) -> Result<(), String> {
    sqlx::query(
        "INSERT INTO app_config (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = ?2",
    )
    .bind(key)
    .bind(value)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to set config: {}", e))?;

    Ok(())
}

pub async fn get_config(pool: &Pool<Sqlite>, key: &str) -> Result<Option<String>, String> {
    let row = sqlx::query("SELECT value FROM app_config WHERE key = ?1")
        .bind(key)
        .fetch_optional(pool)
        .await
        .map_err(|e| format!("Failed to get config: {}", e))?;

    Ok(row.map(|r| r.get("value")))
}

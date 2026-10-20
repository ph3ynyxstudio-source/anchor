use crate::db::{self, MoodEntry};
use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use local_ip_address::local_ip;
use serde::{Deserialize, Serialize};
use sqlx::{Pool, Sqlite};
use std::sync::atomic::AtomicBool;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

#[derive(Clone)]
pub struct AppState {
    pub pool: Pool<Sqlite>,
    pub is_pinned: Arc<AtomicBool>,
    pub is_detached: Arc<AtomicBool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StatusResponse {
    pub status: String,
    pub app: String,
    pub version: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncInfoResponse {
    pub ip: String,
    pub port: u16,
    pub sync_url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncRequest {
    pub device_id: Option<String>,
    pub entries: Vec<MoodEntry>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncResponse {
    pub status: String,
    pub entries: Vec<MoodEntry>,
}

pub fn get_local_ip_address() -> String {
    match local_ip() {
        Ok(ip) => ip.to_string(),
        Err(_) => "127.0.0.1".to_string(),
    }
}

pub fn create_router(state: Arc<AppState>) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .route("/api/status", get(handle_status))
        .route("/api/info", get(handle_info))
        .route("/api/sync", post(handle_sync).get(handle_get_sync))
        .layer(cors)
        .with_state(state)
}

async fn handle_status() -> Json<StatusResponse> {
    Json(StatusResponse {
        status: "ok".to_string(),
        app: "anchor".to_string(),
        version: "0.1.0".to_string(),
    })
}

async fn handle_info() -> Json<SyncInfoResponse> {
    let ip = get_local_ip_address();
    let port = 45455;
    let sync_url = format!("http://{}:{}/api/sync", ip, port);
    Json(SyncInfoResponse {
        ip,
        port,
        sync_url,
    })
}

async fn handle_get_sync(
    State(state): State<Arc<AppState>>,
) -> Result<Json<SyncResponse>, (StatusCode, String)> {
    let entries = db::get_all_entries(&state.pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;

    Ok(Json(SyncResponse {
        status: "success".to_string(),
        entries,
    }))
}

async fn handle_sync(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<SyncRequest>,
) -> Result<Json<SyncResponse>, (StatusCode, String)> {
    let reconciled = db::reconcile_sync(&state.pool, payload.entries)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;

    Ok(Json(SyncResponse {
        status: "success".to_string(),
        entries: reconciled,
    }))
}

pub async fn run_sync_server(state: Arc<AppState>, port: u16) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let app = create_router(state);
    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    println!("Anchor Wi-Fi P2P sync server listening on http://{}", addr);
    axum::serve(listener, app).await?;
    Ok(())
}

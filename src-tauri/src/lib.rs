mod commands;
mod db;
mod server;

#[cfg(desktop)]
mod tray;

use db::get_migrations;
use server::AppState;
use std::sync::atomic::AtomicBool;
use std::sync::Arc;
use tauri::Manager;
#[cfg(desktop)]
use tauri::WindowEvent;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:anchor.db", get_migrations())
                .build(),
        )
        .setup(|app| {
            // Resolve app data directory for anchor.db
            let app_data = app
                .path()
                .app_data_dir()
                .expect("Failed to resolve app data dir");
            let db_path = app_data.join("anchor.db");

            // Initialize sqlx pool synchronously on async runtime
            let pool = tauri::async_runtime::block_on(async {
                db::init_db_pool(&db_path)
                    .await
                    .expect("Failed to initialize SQLite database pool")
            });

            let is_pinned = Arc::new(AtomicBool::new(false));
            let is_detached = Arc::new(AtomicBool::new(false));

            let state = AppState {
                pool: pool.clone(),
                is_pinned: is_pinned.clone(),
                is_detached: is_detached.clone(),
            };

            // Register AppState for Tauri commands
            app.manage(state.clone());

            // Start Axum P2P Wi-Fi Sync server on Tokio in background (port 45455)
            let server_state = Arc::new(state);
            tauri::async_runtime::spawn(async move {
                if let Err(e) = server::run_sync_server(server_state, 45455).await {
                    eprintln!("Wi-Fi sync server error: {}", e);
                }
            });

            #[cfg(desktop)]
            {
                let app_handle = app.handle().clone();
                // Setup system tray
                tray::setup_tray(&app_handle).expect("Failed to setup system tray");
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            #[cfg(desktop)]
            {
                // When close button 'X' is clicked, hide window to tray instead of terminating
                if let WindowEvent::CloseRequested { api, .. } = event {
                    let _ = window.hide();
                    api.prevent_close();
                }
            }
            #[cfg(not(desktop))]
            {
                let _ = (window, event);
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::save_entry,
            commands::get_entries,
            commands::delete_entry,
            commands::export_markdown,
            commands::get_sync_info,
            commands::hide_window,
            commands::toggle_pin,
            commands::get_pin_state,
            commands::toggle_detach,
            commands::get_detach_state,
            commands::set_pin,
            commands::verify_pin,
            commands::is_pin_configured,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use crate::db::{self, MoodEntry, MoodEntryInput};
use crate::server::{get_local_ip_address, AppState, SyncInfoResponse};
use std::sync::atomic::Ordering;
use tauri::{State, WebviewWindow, Window};

#[tauri::command]
pub async fn save_entry(
    input: MoodEntryInput,
    state: State<'_, AppState>,
    window: Window,
) -> Result<MoodEntry, String> {
    let entry = db::save_new_entry(&state.pool, input).await?;
    let pinned = state.is_pinned.load(Ordering::Relaxed);
    let detached = state.is_detached.load(Ordering::Relaxed);
    if !pinned && !detached {
        let _ = window.hide();
    }
    Ok(entry)
}

#[tauri::command]
pub async fn get_entries(state: State<'_, AppState>) -> Result<Vec<MoodEntry>, String> {
    db::get_active_entries(&state.pool).await
}

#[tauri::command]
pub async fn delete_entry(id: String, state: State<'_, AppState>) -> Result<(), String> {
    db::soft_delete_entry(&state.pool, &id).await
}

#[tauri::command]
pub async fn export_markdown(state: State<'_, AppState>) -> Result<String, String> {
    db::generate_markdown_export(&state.pool).await
}

#[tauri::command]
pub fn get_sync_info() -> SyncInfoResponse {
    let ip = get_local_ip_address();
    let port = 45455;
    let sync_url = format!("http://{}:{}/api/sync", ip, port);
    SyncInfoResponse {
        ip,
        port,
        sync_url,
    }
}

#[tauri::command]
pub fn hide_window(window: Window) -> Result<(), String> {
    window.hide().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn toggle_pin(state: State<'_, AppState>) -> bool {
    let current = state.is_pinned.load(Ordering::Relaxed);
    let new_val = !current;
    state.is_pinned.store(new_val, Ordering::Relaxed);
    new_val
}

#[tauri::command]
pub fn get_pin_state(state: State<'_, AppState>) -> bool {
    state.is_pinned.load(Ordering::Relaxed)
}

#[tauri::command]
pub fn toggle_detach(
    window: WebviewWindow,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let current = state.is_detached.load(Ordering::Relaxed);
    let new_val = !current;
    state.is_detached.store(new_val, Ordering::Relaxed);

    if new_val {
        // Detached mode: Standard Windows window
        let _ = window.set_decorations(true);
        let _ = window.set_resizable(true);
        let _ = window.set_skip_taskbar(false);
        let _ = window.set_always_on_top(false);
        let _ = window.set_size(tauri::LogicalSize::new(540.0, 680.0));
        let _ = window.center();
        let _ = window.set_focus();
    } else {
        // Docked mode: Floating tray widget
        let _ = window.set_decorations(false);
        let _ = window.set_resizable(false);
        let _ = window.set_skip_taskbar(true);
        let _ = window.set_always_on_top(true);
        let _ = window.set_size(tauri::LogicalSize::new(380.0, 520.0));
        crate::tray::position_window(&window, tauri::Rect::default());
        let _ = window.set_focus();
    }

    Ok(new_val)
}

#[tauri::command]
pub fn get_detach_state(state: State<'_, AppState>) -> bool {
    state.is_detached.load(Ordering::Relaxed)
}

#[tauri::command]
pub async fn set_pin(pin: String, state: State<'_, AppState>) -> Result<(), String> {
    if pin.len() != 4 || !pin.chars().all(|c| c.is_ascii_digit()) {
        return Err("PIN must be exactly 4 digits".to_string());
    }
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut hasher = DefaultHasher::new();
    format!("anchor_pin_salt_{}", pin).hash(&mut hasher);
    let hashed = format!("{:x}", hasher.finish());

    db::set_config(&state.pool, "pin_hash", &hashed).await
}

#[tauri::command]
pub async fn verify_pin(pin: String, state: State<'_, AppState>) -> Result<bool, String> {
    let stored = db::get_config(&state.pool, "pin_hash").await?;
    match stored {
        None => Ok(true), // No PIN configured yet
        Some(expected) => {
            use std::collections::hash_map::DefaultHasher;
            use std::hash::{Hash, Hasher};
            let mut hasher = DefaultHasher::new();
            format!("anchor_pin_salt_{}", pin).hash(&mut hasher);
            let hashed = format!("{:x}", hasher.finish());
            Ok(hashed == expected)
        }
    }
}

#[tauri::command]
pub async fn is_pin_configured(state: State<'_, AppState>) -> Result<bool, String> {
    let stored = db::get_config(&state.pool, "pin_hash").await?;
    Ok(stored.is_some())
}

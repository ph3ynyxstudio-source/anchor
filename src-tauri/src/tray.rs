use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, PhysicalPosition, WebviewWindow,
};

pub fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let icon = match app.default_window_icon() {
        Some(icon) => icon.clone(),
        None => return Err("Failed to get default window icon".into()),
    };

    TrayIconBuilder::new()
        .icon(icon)
        .tooltip("Anchor — Carnet Émotionnel")
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                rect,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    toggle_window(&window, rect);
                }
            }
        })
        .build(app)?;

    Ok(())
}

pub fn toggle_window(window: &WebviewWindow, tray_rect: tauri::Rect) {
    let is_visible = window.is_visible().unwrap_or(false);
    if is_visible {
        let _ = window.hide();
    } else {
        position_window(window, tray_rect);
        let _ = window.show();
        let _ = window.set_focus();
    }
}

pub fn position_window(window: &WebviewWindow, tray_rect: tauri::Rect) {
    let width = 380.0;
    let height = 520.0;

    let _ = window.set_size(tauri::LogicalSize::new(width, height));
    let _ = window.set_always_on_top(true);

    let monitor = match window.current_monitor() {
        Ok(Some(m)) => Some(m),
        _ => match window.primary_monitor() {
            Ok(Some(m)) => Some(m),
            _ => None,
        },
    };

    if let Some(monitor) = monitor {
        let scale_factor = monitor.scale_factor();
        let monitor_size = monitor.size();
        let monitor_pos = monitor.position();

        let physical_width = (width * scale_factor) as i32;
        let physical_height = (height * scale_factor) as i32;
        let margin = (12.0 * scale_factor) as i32;

        let (rect_x, rect_y) = match tray_rect.position {
            tauri::Position::Physical(p) => (p.x, p.y),
            tauri::Position::Logical(l) => ((l.x * scale_factor) as i32, (l.y * scale_factor) as i32),
        };

        let (rect_w, rect_h) = match tray_rect.size {
            tauri::Size::Physical(s) => (s.width as i32, s.height as i32),
            tauri::Size::Logical(l) => ((l.width * scale_factor) as i32, (l.height * scale_factor) as i32),
        };

        let (x, y) = if rect_w > 0 && rect_h > 0 {
            let center_x = rect_x + (rect_w / 2);
            let mut calculated_x = center_x - (physical_width / 2);

            let min_x = monitor_pos.x + margin;
            let max_x = monitor_pos.x + monitor_size.width as i32 - physical_width - margin;
            calculated_x = calculated_x.clamp(min_x, max_x);

            let calculated_y = if rect_y > monitor_pos.y + (monitor_size.height as i32 / 2) {
                // Taskbar at bottom: window sits above the taskbar
                rect_y - physical_height - margin
            } else {
                // Taskbar at top: window sits below the taskbar
                rect_y + rect_h + margin
            };

            (calculated_x, calculated_y)
        } else {
            // Default bottom-right corner dock
            let x = monitor_pos.x + monitor_size.width as i32 - physical_width - margin;
            let y = monitor_pos.y + monitor_size.height as i32 - physical_height - (48.0 * scale_factor) as i32;
            (x, y)
        };

        let _ = window.set_position(PhysicalPosition::new(x, y));
    }
}

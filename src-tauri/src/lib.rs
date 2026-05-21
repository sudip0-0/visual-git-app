mod app;
mod commands;
mod errors;
mod git;
mod models;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::repository_commands::validate_repository
        ])
        .run(tauri::generate_context!())
        .expect("failed to run Tauri application");
}

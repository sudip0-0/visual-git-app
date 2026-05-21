mod app;
mod commands;
mod errors;
mod git;
mod graph;
mod models;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::repository_commands::validate_repository,
            commands::repository_commands::list_branches,
            commands::repository_commands::list_tags,
            commands::repository_commands::load_recent_commits,
            commands::graph_commands::load_commit_graph
        ])
        .run(tauri::generate_context!())
        .expect("failed to run Tauri application");
}

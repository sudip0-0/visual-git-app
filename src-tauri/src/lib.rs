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
            commands::repository_commands::clone_repository_from_url,
            commands::repository_commands::list_branches,
            commands::repository_commands::list_tags,
            commands::repository_commands::load_recent_commits,
            commands::repository_commands::load_commit_changed_files,
            commands::repository_commands::load_commit_file_diff,
            commands::repository_commands::compare_branches,
            commands::repository_commands::load_git_internals,
            commands::graph_commands::load_commit_graph
        ])
        .run(tauri::generate_context!())
        .expect("failed to run Tauri application");
}

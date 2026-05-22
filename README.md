# Visual Git Commit Graph Desktop

A read-only desktop app for exploring local Git history as an interactive graph.

The app opens a local repository, reads commit history with Rust and `git2`, and renders branches, tags, merges, diffs, branch comparison, and Git internals in a Tauri + React interface. It is built as a visual learning tool, not a Git client.

## Screenshots

Screenshots are planned for the portfolio release:

- `docs/screenshots/main-graph.png` - main graph view
- `docs/screenshots/commit-details.png` - commit details and diff viewer
- `docs/screenshots/git-internals.png` - HEAD, refs, and commit object view

## Features

- Open a local Git repository with the native folder picker.
- Validate repository paths with safe Rust errors.
- Remember recent repositories locally.
- Load 500 recent commits by default.
- Render an SVG commit graph with parent and merge edges.
- Select commits and inspect commit metadata.
- Search by hash, message, or author.
- Highlight commits reachable from a selected branch.
- Show local branches, remote branches, tags, and HEAD.
- Show changed files and load file diffs only on request.
- Truncate large diffs and handle binary files safely.
- Compare branches with ahead, behind, and merge base data.
- Explain HEAD, refs, object paths, and commit structure in Git Internals mode.
- Demonstrate a separate educational loose commit object parser.

## Keyboard Shortcuts

- `Ctrl`/`Cmd` + `O`: open repository
- `/`: focus commit search
- `0`: reset graph view

## Local Setup

Prerequisites:

- Node.js 22 or newer
- npm 10 or newer
- Rust toolchain with `cargo` available on `PATH`

Install dependencies:

```bash
npm install
```

Run the desktop app:

```bash
npm run tauri:dev
```

Run the frontend dev server only:

```bash
npm run dev
```

## Commands

Frontend checks:

```bash
npm run typecheck
npm run lint
npm run test
```

Rust checks:

```bash
cd src-tauri
cargo fmt --check
cargo check
cargo clippy -- -D warnings
cargo test
```

Package the app:

```bash
npm run tauri build
```

## Read-Only Scope

The MVP does not modify repositories.

Not included:

- commit creation
- checkout
- branch creation or deletion
- tag creation or deletion
- reset
- merge
- rebase
- push
- pull
- fetch
- stash apply or pop
- repository script execution
- cloud sync or telemetry

## Performance Notes

- Initial graph loading is capped at 500 commits.
- The graph can explicitly load more commits in 500-commit steps, capped at 2,000 commits.
- Diffs are lazy-loaded only after a file is selected.
- Large textual diffs are truncated for safety.
- Binary diffs are not rendered.
- SVG rendering is used for inspectability; Canvas or virtualization can be added later for very large histories.

## Limitations

- Packfiles are not parsed by the educational custom parser yet.
- The custom parser only handles loose commit objects.
- The graph layout is intentionally simple and deterministic.
- File watching is not implemented.
- Packaging has been tested only on the current Windows development environment.

## Roadmap

- Add graph virtualization or Canvas rendering for very large repositories.
- Add tree and blob internals viewers.
- Add packfile parser support.
- Add a graph minimap.
- Add exportable screenshots or graph image export.
- Add Playwright end-to-end tests once the MVP shell stabilizes.
- Add polished portfolio screenshots and demo video.

## Architecture Summary

- Tauri provides the desktop shell.
- Rust owns repository validation, Git reads, graph data, and parser logic.
- `git2` is the production Git provider.
- The custom loose-object parser is separate and educational.
- React and TypeScript own UI state, graph rendering, and user interaction.

## License

Choose a license before publishing. MIT is a good default for an open-source portfolio project.

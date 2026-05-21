# Visual Git Commit Graph Desktop

A desktop application for visualizing local Git repository history as an interactive commit graph.

The app opens a local Git repository, reads commit history, branches, tags, and HEAD information, then renders an interactive branch tree and commit visualizer. The first version is read-only. Later versions can add diff viewing, commit comparison, Git internals exploration, and custom `.git` parsing.

## Project Status

Current phase: project foundation.

The project has a Tauri 2 + React + TypeScript + Tailwind CSS foundation with a placeholder desktop shell. Git repository loading and graph data are not implemented yet.

## Recommended Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Tauri 2 |
| Backend | Rust |
| Git engine | `git2` crate first, custom parser later |
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| State management | Zustand or TanStack Store |
| Graph rendering | SVG for MVP, Canvas/WebGL later |
| File watching | Later phase; likely Rust `notify` crate |
| Testing | Rust tests, Vitest, React Testing Library, Playwright later |

## Product Goal

Build a desktop app that helps developers understand Git history visually.

The app should show:

- commit history
- branch relationships
- merge commits
- tags
- current HEAD
- local and remote branches
- commit details
- branch divergence in a later phase
- Git internals explanations in later phases

## MVP Scope

The MVP is a read-only Git visualizer.

MVP includes:

- Open a local folder
- Validate whether it is a Git repository
- Read current branch and HEAD
- List local branches
- List remote branches
- List tags
- Load recent commits
- Build commit-parent relationships
- Render a basic commit graph
- Click commit to view details
- Search commits by hash, message, or author
- Filter by branch
- Remember recent repositories

MVP excludes:

- commit creation
- push
- pull
- merge
- rebase
- reset
- stash management
- conflict resolution
- GitHub/GitLab login
- cloud sync

## Why This Project Is Advanced

This project includes:

- Rust systems programming
- Git object and reference modeling
- graph data structures
- graph layout algorithms
- desktop app development
- local filesystem access
- large-data rendering challenges
- performance optimization
- developer-focused UX

## Suggested Folder Structure

```txt
visual-git-commit-graph/
  README.md
  PRODUCT.md
  ARCHITECTURE.md
  TASKS.md
  PROGRESS.md
  DECISIONS.md
  TESTING.md
  SECURITY.md
  PROMPTS.md
  AGENTS.md

  src-tauri/
    src/
      main.rs
      commands/
      git/
      models/
      errors.rs

  src/
    app/
    components/
    stores/
    types/
    utils/
```

## Development Workflow

1. Read `PRODUCT.md`.
2. Read `ARCHITECTURE.md`.
3. Pick one task from `TASKS.md`.
4. Implement one small task only.
5. Run tests.
6. Update `PROGRESS.md`.
7. Update `DECISIONS.md` if architecture changed.
8. Commit the change.

## Agentic Coding Workflow

Use agents in roles:

| Role | Best Use |
|---|---|
| Planner | Convert product goals into tasks |
| Builder | Implement one task |
| Reviewer | Inspect changes without editing |
| Tester | Add tests and find regressions |
| Documenter | Update docs after changes |

Do not let multiple agents edit the same area at the same time.

## Local Setup

Prerequisites:

- Node.js 22 or newer
- npm 10 or newer
- Rust toolchain with `cargo` available on `PATH`

Install dependencies:

```bash
npm install
```

Run the frontend dev server:

```bash
npm run dev
```

Run the desktop app:

```bash
npm run tauri dev
```

Frontend checks:

```bash
npm run test
npm run lint
npm run typecheck
```

Rust checks:

```bash
cd src-tauri
cargo fmt --check
cargo check
cargo clippy
cargo test
```

## Build Strategy

Start with a working read-only app.

Recommended order:

1. Create Tauri app
2. Add repo opener
3. Validate Git repository
4. Read HEAD/current branch
5. Read branches and tags
6. Load recent commits
7. Show commit list
8. Render basic graph
9. Add commit detail panel
10. Add search and filter
11. Phase 2: add diff viewer
12. Later phase: add Git internals mode

## License

Choose a license before publishing.

Recommended options:

- MIT for open source portfolio use
- Apache-2.0 for more formal open source use
- Private license if commercial use is planned

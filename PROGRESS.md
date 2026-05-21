# Progress

## Current Project Status

Git data engine, graph engine, and basic graph UI with pan and zoom implemented.

The app can open a native folder picker, validate a selected local Git repository in Rust, load read-only repository metadata through a `GitProvider` abstraction, list local and remote branches, list tags, load recent commits with parent hashes and merge detection, build graph-ready commit data with lanes, edges, refs, and HEAD markers, and render a scrollable SVG commit graph with selectable commits plus pan and zoom controls. Rust and frontend checks pass.

## Current Phase

Phase 5: Graph UI

## Current Focus

Ready for TASK-0601: Search commits.

## Completed

### 2026-05-21

- Created initial project documentation pack.
- Defined MVP as a read-only Git commit graph visualizer.
- Chose Rust + Tauri + React + TypeScript.
- Recommended `git2` for MVP.
- Recommended custom `.git` parser for later educational mode.
- Defined task-based development workflow.
- Defined security and testing rules.

## In Progress

None.

## Blocked

None.

## Next Recommended Task

None.

## 2026-05-21

### Phase 5 quality check

Status: Done

Summary:

- Verified graph loading is triggered after repository validation succeeds.
- Verified loading, empty, and error states exist in the graph viewport.
- Verified commit nodes, parent edges, merge edges, selected commit highlighting, branch/tag refs, and details panel updates are implemented from the typed graph response.
- Verified TypeScript graph types match the Rust graph response shape.
- Restored native graph viewport scrollability while preserving drag pan and zoom controls.
- Confirmed no app-flow Git write operations, shell execution, repository script execution, or network calls were added.

Files changed:

- `src/components/graph/GraphViewport.tsx`
- `PROGRESS.md`

Tests run:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `cargo check`
- `cargo test`
- Browser smoke check at `http://127.0.0.1:1420/`
- Source/config safety scan for Git write operations, shell execution, repository script execution, and network calls

Result:

- Passed.

Issues found:

- Graph viewport used drag pan but had `overflow-hidden`, so native scrollability was missing; changed it to `overflow-auto`.
- `npm run test` passed with no frontend test files found.

Next recommended task:

- TASK-0601: Search commits.

### TASK-0503: Add graph pan and zoom

Status: Done

Summary:

- Added a lightweight UI store for graph zoom and pan state.
- Added SVG graph toolbar controls for zoom in, zoom out, and reset.
- Enabled drag-to-pan behavior on the graph viewport.
- Kept the graph scrollable while preserving the existing SVG commit rendering.
- Verified the controls remain usable above the graph surface.

Files changed:

- `src/components/graph/GraphToolbar.tsx`
- `src/components/graph/GraphViewport.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/GraphArea.tsx`
- `src/stores/uiStore.ts`
- `PROGRESS.md`

Tests run:

- `npm run typecheck`
- `npm run lint`
- `cargo fmt --check`
- `cargo check`
- `cargo test`
- Browser smoke check at `http://127.0.0.1:1420/`

Result:

- Passed.

Issues found:

- Browser smoke check confirmed the shell and toolbar presence, but not a fully loaded repository pan/zoom interaction because that path depends on a selected local repository in the Tauri runtime.

Next recommended task:

- TASK-0601: Search commits.

### TASK-0501 to TASK-0502: Basic graph UI and commit selection

Status: Done

Summary:

- Added modular SVG graph components for commit nodes, parent edges, merge edges, and the scrollable graph viewport.
- Loaded the graph response after a repository opens and stored selected commit state in the graph store.
- Highlighted the selected commit and defaulted selection to the latest loaded commit.
- Replaced the placeholder graph area with loading, empty, error, and rendered graph states.
- Added selected commit details in the right panel, including parent hashes, branches, and tags.
- Kept graph rendering in React and Git reading in Rust/Tauri.

Files changed:

- `src/components/commit/CommitDetailsPanel.tsx`
- `src/components/graph/CommitEdge.tsx`
- `src/components/graph/CommitGraph.tsx`
- `src/components/graph/CommitNode.tsx`
- `src/components/graph/GraphViewport.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/DetailsPanel.tsx`
- `src/components/layout/GraphArea.tsx`
- `src/stores/graphStore.ts`
- `PROGRESS.md`

Tests run:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `cargo fmt --check`
- `cargo check`
- `cargo test`
- Browser smoke check at `http://127.0.0.1:1420/`
- Source/config safety scan for Git write operations, shell execution, repository script execution, and network calls

Result:

- Passed.

Issues found:

- Plain Vite browser smoke testing can verify the shell and empty state, but the folder picker and Tauri command invocation require the Tauri desktop runtime.

Next recommended task:

- TASK-0601: Search commits.

### Phase 4 quality check

Status: Done

Summary:

- Verified graph models are serializable and graph command returns typed frontend data.
- Verified graph builder accepts commits, branches, tags, and repository HEAD data.
- Verified parent edges, merge edges, branch labels, tag labels, HEAD marking, node coordinates, lanes, and deterministic layout behavior.
- Added focused graph tests for branch label mapping and deterministic layout.
- Confirmed no app-flow Git write operations, shell execution, repository script execution, or network calls were added.

Files changed:

- `src-tauri/src/graph/graph_builder.rs`
- `PROGRESS.md`

Tests run:

- `cargo fmt --check`
- `cargo check`
- `cargo test`
- `npm run typecheck`
- Source/config safety scan for Git write operations, shell execution, repository script execution, and network calls

Result:

- Passed.

Issues found:

- Existing graph tests covered branch lanes and tag mapping, but branch label mapping and layout determinism were not asserted directly; added coverage.

Next recommended task:

- TASK-0501: Render basic commit graph.

### TASK-0401 to TASK-0403: Graph Engine

Status: Done

Summary:

- Added graph models for commit nodes, edges, and the commit graph response.
- Built deterministic graph data from commits, branches, tags, and HEAD.
- Added parent and merge edges plus simple lane assignment and SVG-ready coordinates.
- Added a thin Tauri graph loading command and matching frontend graph types/store.
- Added Rust unit tests for linear, branch, merge, tag, and HEAD cases.

Files changed:

- `src-tauri/src/app/graph_service.rs`
- `src-tauri/src/app/mod.rs`
- `src-tauri/src/commands/graph_commands.rs`
- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/graph/graph_builder.rs`
- `src-tauri/src/graph/mod.rs`
- `src-tauri/src/lib.rs`
- `src-tauri/src/models/graph.rs`
- `src-tauri/src/models/mod.rs`
- `src/stores/graphStore.ts`
- `src/types/graph.ts`
- `PROGRESS.md`

Tests run:

- `cargo fmt --check`
- `cargo fmt`
- `cargo check`
- `cargo test`
- `cargo clippy -- -D warnings`
- `npm run typecheck`
- `npm run lint`

Result:

- Passed.

Issues found:

- None.

Next recommended task:

- TASK-0501: Render basic commit graph.

### Phase 3 quality check

Status: Done

Summary:

- Verified the `GitProvider` abstraction and `Git2Provider` implementation exist.
- Verified Tauri commands remain thin and delegate through the service layer.
- Verified repository summary, current branch, detached HEAD, empty repository handling, branch listing, tag listing, recent commit loading, parent hashes, and merge detection are covered by Rust tests.
- Verified errors are mapped to typed, safe app messages.
- Confirmed no app-flow Git write operations, shell execution, repository script execution, or unsafe HTML rendering were added.

Files changed:

- `PROGRESS.md`

Tests run:

- `cargo fmt --check`
- `cargo check`
- `cargo clippy -- -D warnings`
- `cargo test`
- `npm run typecheck`
- Source/config safety scan for Git write operations, shell execution, repository script execution, and unsafe HTML rendering

Result:

- Passed.

Issues found:

- None.

Next recommended task:

- TASK-0401: Build graph response model.

## 2026-05-21

### TASK-0301 to TASK-0304: Git data engine

Status: Done

Summary:

- Added a read-only `GitProvider` abstraction and `Git2Provider` implementation.
- Added typed Rust models for repository summaries, branches, tags, and commits.
- Added thin Tauri commands for branch listing, tag listing, and recent commit loading.
- Added repository summary support for detached HEAD status.
- Loaded serialized Git data in the frontend store after repository validation.
- Displayed basic branch, tag, and commit metadata without adding graph rendering or Git mutation behavior.
- Added Rust tests for empty repositories, detached HEAD, local and remote branches, lightweight and annotated tags, linear commits, and merge commits.

Files changed:

- `src-tauri/src/app/repository_service.rs`
- `src-tauri/src/commands/repository_commands.rs`
- `src-tauri/src/git/git2_provider.rs`
- `src-tauri/src/git/mod.rs`
- `src-tauri/src/git/provider.rs`
- `src-tauri/src/git/repository_validator.rs`
- `src-tauri/src/lib.rs`
- `src-tauri/src/models/branch.rs`
- `src-tauri/src/models/commit.rs`
- `src-tauri/src/models/mod.rs`
- `src-tauri/src/models/repository.rs`
- `src-tauri/src/models/tag.rs`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/DetailsPanel.tsx`
- `src/components/layout/GraphArea.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/stores/repositoryStore.ts`
- `src/types/git.ts`
- `src/types/repository.ts`
- `TASKS.md`
- `PROGRESS.md`

Tests run:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npx vite build`
- `cargo fmt --check`
- `cargo check`
- `cargo clippy -- -D warnings`
- `cargo test`
- Source/config safety scan for Git write operations, shell execution, repository script execution, and unsafe HTML rendering

Result:

- Passed.

Issues found:

- The first merge-commit test setup did not make the current tip match the first parent; corrected the test setup and reran the Rust test suite.

Next recommended task:

- TASK-0401: Build graph response model.

## Last Agent Run Summary

Date: 2026-05-21

Agent: ChatGPT

Task: Create detailed markdown files for Visual Git Commit Graph Desktop.

Files created:

- `README.md`
- `PRODUCT.md`
- `ARCHITECTURE.md`
- `TASKS.md`
- `PROGRESS.md`
- `DECISIONS.md`
- `TESTING.md`
- `SECURITY.md`
- `PROMPTS.md`
- `AGENTS.md`

Tests run:

- Not applicable. Documentation-only task.

Result:

- Documentation pack completed.

## 2026-05-21

### Phase 2 quality check

Status: Done

Summary:

- Reviewed repository opening flow across frontend state, Tauri command, Rust service, and Git validation layer.
- Confirmed command handlers remain thin and validation stays in Rust service/Git code.
- Confirmed selected repository data and error states are rendered as React text.
- Confirmed native folder picker cancel returns without changing app state or crashing.
- Confirmed no app-flow Git write operations, repository file execution, arbitrary shell commands, or unsafe HTML rendering were added.
- Added Rust coverage for a normal Git repository with `HEAD`, missing paths, typed error codes, and validation not changing `HEAD`.

Files changed:

- `src-tauri/src/app/repository_service.rs`
- `src-tauri/src/errors.rs`
- `src-tauri/src/git/repository_validator.rs`
- `PROGRESS.md`

Tests run:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `cargo fmt --check`
- `cargo check`
- `cargo clippy -- -D warnings`
- `cargo test`
- `npm run tauri dev`
- Manual code inspection of Tauri input validation, frontend error states, and Rust path handling
- Source/config safety scan for Git write operations, shell execution, repository script execution, and unsafe HTML rendering

Result:

- Passed.

Issues found:

- Existing tests covered empty repositories and invalid folders, but not a normal repository with `HEAD`; added coverage.
- Existing tests asserted messages but not typed error codes; added coverage.

Next recommended task:

- TASK-0301: Add Git provider abstraction.

### TASK-0201 to TASK-0204: Repository opening

Status: Done

Summary:

- Added a Tauri native folder picker through the official dialog plugin.
- Added a thin `validate_repository` Tauri command.
- Added Rust repository validation through the app service and Git validation layer.
- Added safe handling for valid Git repositories, invalid folders, empty paths, file paths, empty repositories, and permission-style read failures where detectable.
- Added frontend repository state, selected repository display, safe error messaging, and recent repository storage in local storage.
- Kept the implementation read-only: no Git CLI, no repository script execution, and no Git write operations.

Files changed:

- `package.json`
- `package-lock.json`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/capabilities/default.json`
- `src-tauri/gen/schemas/acl-manifests.json`
- `src-tauri/gen/schemas/capabilities.json`
- `src-tauri/gen/schemas/desktop-schema.json`
- `src-tauri/gen/schemas/windows-schema.json`
- `src-tauri/src/lib.rs`
- `src-tauri/src/app/mod.rs`
- `src-tauri/src/app/repository_service.rs`
- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/commands/repository_commands.rs`
- `src-tauri/src/errors.rs`
- `src-tauri/src/git/mod.rs`
- `src-tauri/src/git/repository_validator.rs`
- `src-tauri/src/models/mod.rs`
- `src-tauri/src/models/repository.rs`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/DetailsPanel.tsx`
- `src/components/layout/GraphArea.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/TopBar.tsx`
- `src/components/repository/OpenRepositoryButton.tsx`
- `src/components/repository/RecentRepositories.tsx`
- `src/components/repository/RepositoryStatus.tsx`
- `src/stores/repositoryStore.ts`
- `src/types/repository.ts`
- `TASKS.md`
- `PROGRESS.md`

Tests run:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npx vite build`
- `cargo fmt --check`
- `cargo check`
- `cargo clippy -- -D warnings`
- `cargo test`
- `npm run tauri dev`
- Browser smoke check at `http://localhost:1420/`
- Source/config safety scan for Git write operations, shell execution, and unsafe HTML rendering

Result:

- Passed.

Issues found:

- `cargo fmt --check` found a Rust formatting change; fixed with `cargo fmt`.
- A Rust test initially moved a temporary path out of a cleanup wrapper; fixed by cloning the test path.

Next recommended task:

- TASK-0301: Add Git provider abstraction.

### Phase 1 quality check

Status: Done

Summary:

- Rechecked Phase 1 scope and source files.
- Verified Tauri dev launch starts successfully.
- Verified React renders the top bar, sidebar, graph area, details panel, and empty repository state.
- Verified TypeScript, linting, Rust formatting, Rust compilation, Clippy, and tests.
- Confirmed no Git parsing, Git write operations, Tauri filesystem/dialog/shell plugins, process spawning, or unsafe HTML rendering were added.
- Pointed the Tauri bundle icon config at the existing icon asset.

Files changed:

- `src-tauri/tauri.conf.json`
- `PROGRESS.md`

Tests run:

- `npm install`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npx vite build`
- `cargo fmt --check`
- `cargo check`
- `cargo clippy -- -D warnings`
- `cargo test`
- `npm run tauri dev`
- Browser smoke check at `http://localhost:1420/`
- Source/config safety scan for premature Git parsing and write-capable APIs

Result:

- Passed.

Issues found:

- Tauri bundle config did not reference the icon asset even though the required icon existed.

Next recommended task:

- TASK-0201: Add folder picker.

### TASK-0101 to TASK-0103: Project foundation

Status: Done

Summary:

- Created a Vite React TypeScript frontend.
- Added Tailwind CSS styling through the Vite Tailwind plugin.
- Added a modular placeholder desktop shell with top bar, left sidebar, graph workspace, right details panel, and empty state.
- Added a minimal Tauri 2 Rust project structure with no Git commands and no repository mutation behavior.
- Added the required Tauri Windows icon asset.
- Added npm scripts for frontend dev, Tauri dev, type checking, linting, and tests.
- Updated README setup and check commands.
- Verified Rust after adding `C:\Users\sudip\.cargo\bin` to PATH for this shell.

Files changed:

- `.gitignore`
- `package.json`
- `package-lock.json`
- `index.html`
- `tsconfig.json`
- `vite.config.ts`
- `eslint.config.js`
- `src/main.tsx`
- `src/styles.css`
- `src/app/App.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/TopBar.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/GraphArea.tsx`
- `src/components/layout/DetailsPanel.tsx`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/build.rs`
- `src-tauri/src/main.rs`
- `src-tauri/src/lib.rs`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`
- `src-tauri/icons/icon.ico`
- `README.md`
- `PROGRESS.md`
- `TASKS.md`

Tests run:

- `npm install`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npx vite build`
- Browser smoke check at `http://127.0.0.1:1420/`
- `cargo check`
- `cargo fmt --check`
- `cargo clippy`
- `cargo test`
- `npm run tauri dev`

Result:

- Frontend checks passed.
- Browser smoke check passed.
- Rust checks passed.
- Tauri dev launch passed.

Issues found:

- Rust was installed under `C:\Users\sudip\.cargo\bin`, but the current shell did not have that directory on PATH.
- Tauri required `src-tauri/icons/icon.ico` for Windows resource generation.

Next recommended task:

- TASK-0201: Add folder picker.

### Documentation pack validation

Status: Done

Summary:

- Reviewed `README.md`, `PRODUCT.md`, `ARCHITECTURE.md`, `TASKS.md`, `PROGRESS.md`, `DECISIONS.md`, `TESTING.md`, `SECURITY.md`, `PROMPTS.md`, and `AGENTS.md`.
- Confirmed MVP scope is read-only and uses Rust + Tauri + React + TypeScript.
- Confirmed task order starts with foundation work before Git data, graph engine, graph UI, search, and Phase 2 features.
- Clarified that diff viewing, changed files, and branch divergence/ahead-behind comparison are Phase 2 or later, not MVP.
- Clarified that file watching is a later-phase capability, not an MVP dependency.

Files changed:

- `README.md`
- `PRODUCT.md`
- `ARCHITECTURE.md`
- `SECURITY.md`
- `AGENTS.md`
- `PROGRESS.md`

Tests run:

- Documentation review only.

Result:

- Passed.

Issues found:

- Minor scope ambiguity around changed files, diff viewing, branch divergence, and file watching.

Next recommended task:

- TASK-0101: Initialize Tauri project.

## Development Log Template

Use this format after every task.

```md
## YYYY-MM-DD

### TASK-ID: Task name

Status: Done / Blocked / Review

Summary:

Files changed:

Tests run:

Result:

Issues found:

Next recommended task:
```

## Known Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Graph layout becomes complex | Medium | Start with simple deterministic layout |
| Custom `.git` parsing becomes too hard | High | Use `git2` first |
| UI freezes on large repositories | High | Limit commits and add loading states |
| App accidentally mutates repo | High | Keep MVP read-only |
| Agents overbuild features | Medium | Follow `TASKS.md` and `AGENTS.md` |
| Large SVG becomes slow | Medium | Add virtualization later |

## Open Questions

- Should the first version use SVG only? Answered for MVP: yes.
- Should Git internals mode be included in first public demo? Current docs place it after MVP.
- Should app support Linux/macOS immediately or Windows first only?

## Metrics To Track Later

- app startup time
- repository load time
- 500 commit graph load time
- graph render time
- memory usage
- number of commits rendered smoothly
- invalid repo error rate during testing

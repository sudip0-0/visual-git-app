# Progress

## Current Project Status

Project foundation scaffold completed.

The app has a Tauri 2 + React + TypeScript + Tailwind CSS foundation and renders a dark placeholder desktop shell. Rust and frontend checks pass.

## Current Phase

Phase 2: Repository Opening

## Current Focus

Ready for TASK-0201: Add folder picker.

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

TASK-0201: Add folder picker.

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
- `npm run tauri dev`
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

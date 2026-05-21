# Tasks

## Task Rules

- Work on one task at a time.
- Do not start a new task until the current task passes checks.
- Keep every task small and reviewable.
- Do not modify unrelated files.
- Update `PROGRESS.md` after every completed task.
- Update `DECISIONS.md` when architecture decisions change.
- Run relevant tests before marking a task complete.
- MVP is read-only.
- Do not add Git write operations.

## Status Legend

| Status | Meaning |
|---|---|
| Todo | Not started |
| Doing | In progress |
| Blocked | Cannot continue |
| Review | Needs review |
| Done | Completed |

## Phase 0: Planning and Documentation

### TASK-0001: Create project documentation

Status: Done

Description:
Create the initial documentation files for the project.

Acceptance Criteria:

- `README.md` exists.
- `PRODUCT.md` exists.
- `ARCHITECTURE.md` exists.
- `TASKS.md` exists.
- `PROGRESS.md` exists.
- `DECISIONS.md` exists.
- `TESTING.md` exists.
- `SECURITY.md` exists.
- `PROMPTS.md` exists.
- `AGENTS.md` exists.

---

## Phase 1: Project Foundation

### TASK-0101: Initialize Tauri project

Status: Done

Description:
Create the base Tauri 2 project with React and TypeScript.

Acceptance Criteria:

- Tauri app starts successfully.
- React frontend renders a placeholder app shell.
- TypeScript is enabled.
- Rust backend compiles.
- Basic project scripts exist.
- README setup commands are updated.

Likely Files:

- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/src/main.rs`
- `src/App.tsx`
- `README.md`

Checks:

- `npm install`
- `npm run tauri dev`
- `cargo check`

---

### TASK-0102: Add formatting and linting

Status: Done

Description:
Configure code quality tools.

Acceptance Criteria:

- Rust formatting works.
- Rust clippy works.
- TypeScript linting works.
- TypeScript type checking works.
- Formatting commands are documented.

Likely Files:

- `package.json`
- `eslint.config.*`
- `tsconfig.json`
- `README.md`
- `TESTING.md`

Checks:

- `cargo fmt --check`
- `cargo clippy`
- `npm run lint`
- `npm run typecheck`

---

### TASK-0103: Create base app layout

Status: Done

Description:
Create the initial desktop layout.

Acceptance Criteria:

- App has top bar.
- App has sidebar.
- App has graph area.
- App has details panel.
- Layout works in dark mode.
- Empty state is shown before opening repository.

Likely Files:

- `src/components/layout/AppShell.tsx`
- `src/components/layout/TopBar.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/DetailsPanel.tsx`
- `src/app/App.tsx`

Checks:

- `npm run typecheck`
- `npm run lint`

---

## Phase 2: Repository Opening

### TASK-0201: Add folder picker

Status: Done

Description:
Allow user to select a local folder from the desktop app.

Acceptance Criteria:

- User can click "Open Repository".
- Native folder picker opens.
- Selected path is stored in frontend state.
- Canceling folder picker does not crash.
- Invalid selection shows safe message.

Likely Files:

- `src/components/repository/OpenRepositoryButton.tsx`
- `src/stores/repositoryStore.ts`
- `src-tauri/src/commands/repository_commands.rs`

Checks:

- manual folder picker test
- `npm run typecheck`
- `cargo check`

---

### TASK-0202: Validate Git repository

Status: Done

Description:
Add Rust command to validate whether a selected folder is a Git repository.

Acceptance Criteria:

- Valid repo returns success.
- Invalid folder returns clear error.
- Empty path is rejected.
- Permission errors are handled.
- Frontend displays validation result.

Likely Files:

- `src-tauri/src/commands/repository_commands.rs`
- `src-tauri/src/app/repository_service.rs`
- `src-tauri/src/errors.rs`
- `src/types/repository.ts`

Checks:

- Rust unit tests for valid and invalid path handling
- manual test with Git and non-Git folder

---

### TASK-0203: Load repository summary

Status: Done

Description:
Read basic repo information.

Acceptance Criteria:

- App shows repository name.
- App shows path.
- App shows current branch if available.
- App shows HEAD hash if available.
- Detached HEAD is handled.
- Empty repository is handled.

Likely Files:

- `src-tauri/src/models/repository.rs`
- `src-tauri/src/git/git2_provider.rs`
- `src-tauri/src/app/repository_service.rs`
- `src/stores/repositoryStore.ts`
- `src/components/repository/RepositoryStatus.tsx`

Checks:

- test normal repo
- test detached HEAD repo
- test empty repo

---

### TASK-0204: Recent repositories

Status: Done

Description:
Remember recently opened repositories.

Acceptance Criteria:

- App stores recent repositories locally.
- Recent repo list appears on start screen.
- Clicking recent repo opens it.
- Removed or invalid recent repo shows error.
- User can remove a repo from recent list.

Likely Files:

- `src/stores/repositoryStore.ts`
- `src/components/repository/RecentRepositories.tsx`
- local storage utility

Checks:

- manual recent repo test
- frontend unit tests if setup exists

---

## Phase 3: Git Data Engine

### TASK-0301: Add Git provider abstraction

Status: Done

Description:
Create Rust Git provider trait and `git2` implementation shell.

Acceptance Criteria:

- `GitProvider` trait exists.
- `Git2Provider` struct exists.
- Tauri commands use service layer, not direct Git logic.
- Future custom parser can be added without changing command API.

Likely Files:

- `src-tauri/src/git/provider.rs`
- `src-tauri/src/git/git2_provider.rs`
- `src-tauri/src/git/mod.rs`

Checks:

- `cargo check`
- basic unit test compiles

---

### TASK-0302: List branches

Status: Done

Description:
Read local and remote branches.

Acceptance Criteria:

- Local branches are listed.
- Remote branches are listed.
- Current branch is marked.
- Branch target commit is included when available.
- Branch read errors are handled.

Likely Files:

- `src-tauri/src/models/branch.rs`
- `src-tauri/src/git/git2_provider.rs`
- `src-tauri/src/app/repository_service.rs`
- `src/components/branches/BranchList.tsx`

Checks:

- test repo with local branch
- test repo with remote branches

---

### TASK-0303: List tags

Status: Done

Description:
Read repository tags.

Acceptance Criteria:

- Tags are listed.
- Tag target commit is resolved when possible.
- Lightweight tags are supported.
- Annotated tags are handled if possible.
- UI displays tags in sidebar.

Likely Files:

- `src-tauri/src/models/tag.rs`
- `src-tauri/src/git/git2_provider.rs`
- `src/components/branches/TagList.tsx`

Checks:

- test repo with lightweight tag
- test repo with annotated tag

---

### TASK-0304: Load recent commits

Status: Done

Description:
Load recent commits from repository.

Acceptance Criteria:

- App loads default 500 commits.
- Commit hash, message, author, date, and parents are returned.
- Merge commits are marked.
- Empty repo is handled.
- Loading does not freeze UI.

Likely Files:

- `src-tauri/src/models/commit.rs`
- `src-tauri/src/git/git2_provider.rs`
- `src-tauri/src/app/commit_service.rs`
- `src/types/git.ts`

Checks:

- test repo with linear history
- test repo with merge commits
- test empty repo

---

## Phase 4: Graph Engine

### TASK-0401: Build graph response model

Status: Todo

Description:
Combine commits, refs, branches, and tags into a graph response.

Acceptance Criteria:

- Graph response includes commits.
- Graph response includes edges.
- Graph response includes branch names on matching commits.
- Graph response includes tag names on matching commits.
- HEAD commit is marked.

Likely Files:

- `src-tauri/src/models/graph.rs`
- `src-tauri/src/graph/graph_builder.rs`
- `src-tauri/src/app/graph_service.rs`

Checks:

- Rust unit tests for graph builder

---

### TASK-0402: Implement simple lane assignment

Status: Todo

Description:
Assign graph lanes for visual rendering.

Acceptance Criteria:

- Each commit gets x, y, and lane values.
- Linear history stays in one lane.
- Feature branch uses separate lane.
- Merge commit connects lanes.
- Layout is deterministic.

Likely Files:

- `src-tauri/src/graph/lane_assignment.rs`
- `src-tauri/src/graph/layout.rs`

Checks:

- unit test linear graph
- unit test branch graph
- unit test merge graph

---

### TASK-0403: Add graph loading command

Status: Todo

Description:
Expose graph loading through Tauri.

Acceptance Criteria:

- Frontend can request commit graph.
- Graph loading supports commit limit.
- Errors are serialized safely.
- Loading state appears in frontend.

Likely Files:

- `src-tauri/src/commands/graph_commands.rs`
- `src/stores/graphStore.ts`
- `src/types/graph.ts`

Checks:

- manual repo graph load
- `cargo check`
- `npm run typecheck`

---

## Phase 5: Graph UI

### TASK-0501: Render basic commit graph

Status: Todo

Description:
Render nodes and edges using SVG.

Acceptance Criteria:

- Commit nodes are visible.
- Parent edges are visible.
- Merge edges are visible.
- Latest commit appears near top.
- Graph scrolls vertically.
- Graph does not crash with 500 commits.

Likely Files:

- `src/components/graph/CommitGraph.tsx`
- `src/components/graph/CommitNode.tsx`
- `src/components/graph/CommitEdge.tsx`
- `src/components/graph/GraphViewport.tsx`

Checks:

- manual rendering test
- frontend type check

---

### TASK-0502: Select commit and show details

Status: Todo

Description:
Click a commit node to display details.

Acceptance Criteria:

- Commit node is clickable.
- Selected node is highlighted.
- Details panel shows commit metadata.
- Parents are shown as short hashes.
- Branches and tags are shown when available.

Likely Files:

- `src/components/commit/CommitDetailsPanel.tsx`
- `src/components/graph/CommitNode.tsx`
- `src/stores/graphStore.ts`

Checks:

- manual click test
- component test if setup exists

---

### TASK-0503: Add graph pan and zoom

Status: Todo

Description:
Add basic graph navigation.

Acceptance Criteria:

- User can zoom in.
- User can zoom out.
- User can reset zoom.
- User can pan graph area.
- Controls remain usable.

Likely Files:

- `src/components/graph/GraphViewport.tsx`
- `src/components/graph/GraphToolbar.tsx`
- `src/stores/uiStore.ts`

Checks:

- manual interaction test

---

## Phase 6: Search and Filters

### TASK-0601: Commit search

Status: Todo

Description:
Search commits by hash, message, or author.

Acceptance Criteria:

- Search input exists.
- Search matches short hash.
- Search matches full hash.
- Search matches message.
- Search matches author.
- Matching commits are highlighted.
- Search results list is clickable.

Likely Files:

- `src/components/search/CommitSearch.tsx`
- `src/components/search/SearchResults.tsx`
- `src/stores/graphStore.ts`

Checks:

- frontend unit tests for search helper
- manual search test

---

### TASK-0602: Branch filter

Status: Todo

Description:
Filter or highlight graph by branch.

Acceptance Criteria:

- Sidebar lists branches.
- Clicking branch applies filter or highlight.
- Current branch is visually distinct.
- User can clear branch filter.
- Graph remains stable after filtering.

Likely Files:

- `src/components/branches/BranchList.tsx`
- `src/components/branches/BranchFilter.tsx`
- `src/stores/graphStore.ts`

Checks:

- manual branch filter test

---

### TASK-0603: Tag markers

Status: Todo

Description:
Show tags on commit graph.

Acceptance Criteria:

- Tags appear near commit nodes.
- Multiple tags on one commit are handled.
- Tag list appears in sidebar.
- Clicking a tag focuses its commit.

Likely Files:

- `src/components/graph/CommitNode.tsx`
- `src/components/branches/TagList.tsx`

Checks:

- manual test with tagged repo

---

## Phase 7: Phase 2 Features

### TASK-0701: Commit changed files

Status: Todo

Description:
Show files changed in selected commit.

Acceptance Criteria:

- Selected commit shows changed files.
- File status is shown where possible.
- Large file lists are handled.
- Errors are safe.

---

### TASK-0702: Diff viewer

Status: Todo

Description:
Show file diff for selected commit.

Acceptance Criteria:

- User can click changed file.
- App displays diff.
- Large diffs are truncated or loaded safely.
- Binary files are handled gracefully.

---

### TASK-0703: Compare branches

Status: Todo

Description:
Show ahead/behind and merge base between two branches.

Acceptance Criteria:

- User selects base branch.
- User selects target branch.
- App shows ahead count.
- App shows behind count.
- App shows merge base when available.
- App highlights divergence point.

---

## Phase 8: Git Internals Mode

### TASK-0801: HEAD and refs explorer

Status: Todo

Description:
Show how HEAD resolves to branch and commit.

Acceptance Criteria:

- App shows raw HEAD value.
- App shows current ref path.
- App shows ref target commit.
- App explains detached HEAD.

---

### TASK-0802: Raw object viewer

Status: Todo

Description:
Show raw Git object data for selected commit.

Acceptance Criteria:

- App shows object type.
- App shows object hash.
- App shows parent links.
- App shows tree hash.
- App shows author and committer raw metadata.
- App explains object path.

---

### TASK-0803: Custom `.git` parser prototype

Status: Todo

Description:
Create educational custom parser for loose commit objects.

Acceptance Criteria:

- Parser reads loose object by hash.
- Parser decompresses object.
- Parser identifies object type.
- Parser parses commit object.
- Parser is read-only.
- Parser is separate from production `git2` provider.

---

## Completion Definition

A task is complete when:

- implementation matches acceptance criteria
- relevant checks pass
- no unrelated files changed
- no Git write behavior added
- `PROGRESS.md` updated
- `DECISIONS.md` updated if needed

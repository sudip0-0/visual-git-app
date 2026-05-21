# Architecture

## Overview

Visual Git Commit Graph Desktop is a local-first desktop application built with Tauri, Rust, React, and TypeScript.

The Rust backend reads Git repository data and transforms it into graph-friendly models. The frontend renders an interactive graph and user interface.

The MVP uses the `git2` Rust crate for repository access. A custom `.git` parser can be added later as an advanced educational module.

## Architecture Goals

- Keep the MVP read-only.
- Keep Git parsing logic separate from UI logic.
- Keep Tauri command handlers thin.
- Make graph data serializable.
- Avoid blocking the UI during repository loading.
- Support large repository improvements later.
- Allow custom `.git` parser to be added without rewriting the app.
- Keep frontend state predictable.
- Keep testing practical.

## High-Level Architecture

```txt
User
  ↓
Tauri Desktop Window
  ↓
React + TypeScript Frontend
  ↓
Tauri Commands
  ↓
Rust Application Layer
  ↓
Git Engine
  ↓
Local Git Repository
```

## Main Layers

### 1. Frontend Layer

Responsible for:

- layout
- graph rendering
- user interactions
- search input
- filters
- commit detail panel
- loading states
- error states

Recommended stack:

- React
- TypeScript
- Tailwind CSS
- Zustand or TanStack Store
- SVG graph rendering for MVP

### 2. Tauri Command Layer

Responsible for exposing Rust functions to the frontend.

This layer should be thin.

MVP examples:

- `open_repository(path)`
- `load_repository_summary(path)`
- `load_commit_graph(path, limit)`
- `load_commit_details(path, commit_hash)`

Phase 2 example:

- `compare_branches(path, base, target)`

Tauri commands should not contain complex Git logic.

### 3. Rust Application Layer

Responsible for orchestration.

Examples:

- validating repository path
- calling Git engine
- transforming data into frontend models
- handling errors
- enforcing read-only behavior

### 4. Git Engine Layer

Responsible for Git-specific operations.

MVP implementation:

- use `git2`
- read HEAD
- read branches
- read tags
- walk commits
- calculate parents
- detect merge commits
- calculate branch mappings

Future implementation:

- custom `.git` parser
- object database reader
- refs reader
- packfile reader
- tree/blob parser

### 5. Graph Engine Layer

Responsible for turning Git data into visual graph data.

Tasks:

- topological sorting
- lane assignment
- parent edge creation
- merge edge creation
- branch color assignment
- viewport-friendly model generation

## Suggested Folder Structure

```txt
src-tauri/
  src/
    main.rs
    commands/
      mod.rs
      repository_commands.rs
      graph_commands.rs
      commit_commands.rs
      branch_commands.rs
    app/
      mod.rs
      repository_service.rs
      graph_service.rs
      commit_service.rs
    git/
      mod.rs
      provider.rs
      git2_provider.rs
      custom_provider.rs
      repository_reader.rs
      refs_reader.rs
      commit_reader.rs
      diff_reader.rs
    graph/
      mod.rs
      graph_builder.rs
      layout.rs
      lane_assignment.rs
      traversal.rs
    models/
      mod.rs
      repository.rs
      commit.rs
      branch.rs
      tag.rs
      graph.rs
      diff.rs
    errors.rs

src/
  app/
    App.tsx
    routes/
  components/
    layout/
      AppShell.tsx
      TopBar.tsx
      Sidebar.tsx
      DetailsPanel.tsx
    graph/
      CommitGraph.tsx
      CommitNode.tsx
      CommitEdge.tsx
      GraphViewport.tsx
      GraphToolbar.tsx
    repository/
      OpenRepositoryButton.tsx
      RecentRepositories.tsx
      RepositoryStatus.tsx
    branches/
      BranchList.tsx
      BranchBadge.tsx
      BranchFilter.tsx
    commit/
      CommitDetailsPanel.tsx
      CommitMetadata.tsx
      CommitParents.tsx
      CommitChangedFiles.tsx
    search/
      CommitSearch.tsx
      SearchResults.tsx
    common/
      ErrorState.tsx
      EmptyState.tsx
      LoadingState.tsx
  stores/
    repositoryStore.ts
    graphStore.ts
    uiStore.ts
  types/
    git.ts
    graph.ts
    repository.ts
  utils/
    formatDate.ts
    shortHash.ts
    graphHelpers.ts
```

## Rust Data Models

### RepositorySummary

```rust
#[derive(Debug, Clone, serde::Serialize)]
pub struct RepositorySummary {
    pub path: String,
    pub name: String,
    pub current_branch: Option<String>,
    pub head_hash: Option<String>,
    pub is_bare: bool,
    pub is_empty: bool,
}
```

### CommitInfo

```rust
#[derive(Debug, Clone, serde::Serialize)]
pub struct CommitInfo {
    pub id: String,
    pub short_id: String,
    pub message: String,
    pub summary: String,
    pub author_name: String,
    pub author_email: String,
    pub author_time: i64,
    pub committer_name: String,
    pub committer_email: String,
    pub committer_time: i64,
    pub parents: Vec<String>,
    pub is_merge: bool,
}
```

### BranchInfo

```rust
#[derive(Debug, Clone, serde::Serialize)]
pub struct BranchInfo {
    pub name: String,
    pub full_name: String,
    pub target: Option<String>,
    pub is_current: bool,
    pub is_remote: bool,
}
```

### TagInfo

```rust
#[derive(Debug, Clone, serde::Serialize)]
pub struct TagInfo {
    pub name: String,
    pub target: String,
}
```

### CommitGraphResponse

```rust
#[derive(Debug, Clone, serde::Serialize)]
pub struct CommitGraphResponse {
    pub repository: RepositorySummary,
    pub commits: Vec<GraphCommitNode>,
    pub edges: Vec<GraphEdge>,
    pub branches: Vec<BranchInfo>,
    pub tags: Vec<TagInfo>,
    pub head: Option<String>,
    pub current_branch: Option<String>,
}
```

### GraphCommitNode

```rust
#[derive(Debug, Clone, serde::Serialize)]
pub struct GraphCommitNode {
    pub id: String,
    pub short_id: String,
    pub summary: String,
    pub author_name: String,
    pub author_time: i64,
    pub parents: Vec<String>,
    pub branch_names: Vec<String>,
    pub tag_names: Vec<String>,
    pub x: i32,
    pub y: i32,
    pub lane: i32,
    pub is_merge: bool,
    pub is_head: bool,
}
```

### GraphEdge

```rust
#[derive(Debug, Clone, serde::Serialize)]
pub struct GraphEdge {
    pub from: String,
    pub to: String,
    pub lane_from: i32,
    pub lane_to: i32,
    pub edge_type: GraphEdgeType,
}

#[derive(Debug, Clone, serde::Serialize)]
pub enum GraphEdgeType {
    Parent,
    Merge,
}
```

## Frontend TypeScript Types

```ts
export type RepositorySummary = {
  path: string;
  name: string;
  currentBranch?: string;
  headHash?: string;
  isBare: boolean;
  isEmpty: boolean;
};

export type CommitNode = {
  id: string;
  shortId: string;
  summary: string;
  authorName: string;
  authorTime: number;
  parents: string[];
  branchNames: string[];
  tagNames: string[];
  x: number;
  y: number;
  lane: number;
  isMerge: boolean;
  isHead: boolean;
};

export type GraphEdge = {
  from: string;
  to: string;
  laneFrom: number;
  laneTo: number;
  edgeType: "Parent" | "Merge";
};

export type BranchInfo = {
  name: string;
  fullName: string;
  target?: string;
  isCurrent: boolean;
  isRemote: boolean;
};

export type TagInfo = {
  name: string;
  target: string;
};

export type CommitGraph = {
  repository: RepositorySummary;
  commits: CommitNode[];
  edges: GraphEdge[];
  branches: BranchInfo[];
  tags: TagInfo[];
  head?: string;
  currentBranch?: string;
};
```

## Tauri Commands

### `validate_repository`

Input:

```ts
{
  path: string
}
```

Output:

```ts
{
  valid: boolean;
  reason?: string;
}
```

### `load_repository_summary`

Input:

```ts
{
  path: string
}
```

Output:

```ts
RepositorySummary
```

### `load_commit_graph`

Input:

```ts
{
  path: string;
  limit: number;
  branch?: string;
}
```

Output:

```ts
CommitGraph
```

### `load_commit_details`

Input:

```ts
{
  path: string;
  commitHash: string;
}
```

Output:

```ts
CommitDetails
```

### `compare_branches`

Phase 2.

Input:

```ts
{
  path: string;
  baseBranch: string;
  targetBranch: string;
}
```

Output:

```ts
{
  baseBranch: string;
  targetBranch: string;
  ahead: number;
  behind: number;
  mergeBase?: string;
}
```

## Git Provider Abstraction

Use a trait so the app can swap `git2` with custom parsing later.

```rust
pub trait GitProvider {
    fn open(path: &str) -> Result<Self, GitAppError>
    where
        Self: Sized;

    fn repository_summary(&self) -> Result<RepositorySummary, GitAppError>;
    fn branches(&self) -> Result<Vec<BranchInfo>, GitAppError>;
    fn tags(&self) -> Result<Vec<TagInfo>, GitAppError>;
    fn commits(&self, limit: usize) -> Result<Vec<CommitInfo>, GitAppError>;
    fn commit_details(&self, commit_hash: &str) -> Result<CommitDetails, GitAppError>;
}
```

MVP implementation:

```rust
pub struct Git2Provider {
    repo: git2::Repository,
}
```

Future implementation:

```rust
pub struct CustomGitProvider {
    git_dir: PathBuf,
    worktree_dir: PathBuf,
}
```

## Graph Layout Strategy

### MVP Layout

Use a simple vertical graph.

- Y-axis: commit order
- X-axis: branch lane
- latest commits at top
- parent links go downward
- merge links connect across lanes

Algorithm:

1. Load commits in topological order.
2. Assign row number by traversal order.
3. Maintain active branch lanes.
4. Assign commits to lanes based on branch/ref reachability.
5. Create edges from each commit to parent commits.
6. Mark merge edges when a commit has more than one parent.

### Future Layout Improvements

- reduce edge crossing
- support collapsed branches
- virtualized rendering
- minimap
- time-based graph mode
- branch-focused graph mode

## Rendering Strategy

### MVP

Use SVG.

Pros:

- easy to implement
- easy to inspect
- simple click/hover interactions
- good enough for hundreds of commits

Cons:

- may slow down with thousands of commits

### Phase 2

Add virtualization.

Render only visible commit rows.

### Phase 3

Consider Canvas or WebGL.

Use this if the app needs to handle very large repositories.

## State Management

Suggested stores:

### `repositoryStore`

- selected repository path
- recent repositories
- repository summary
- loading state
- error state

### `graphStore`

- commits
- edges
- branches
- tags
- selected commit
- active branch filter
- search query
- highlighted commits

### `uiStore`

- theme
- sidebar width
- details panel visibility
- graph zoom
- graph pan
- active modal

## Error Handling

All Rust errors should be mapped into user-safe messages.

Error categories:

- invalid path
- not a Git repository
- empty repository
- permission denied
- corrupted repository
- unsupported repository structure
- commit not found
- Git read failure
- serialization failure
- unknown error

Frontend should never display raw Rust panic output.

## Security Architecture

The app is local-first.

Security rules:

- No repository data leaves the machine.
- No network calls in MVP.
- No Git write operations in MVP.
- No shelling out to arbitrary commands.
- No execution of repository files.
- No loading scripts from repository.
- Validate all paths from frontend.
- Avoid following unsafe paths outside expected repository operations.

## Performance Architecture

MVP assumptions:

- Load 500 commits by default.
- Add "Load more" later.
- Keep parsing in Rust.
- Send compact JSON to frontend.
- Do not send full file diffs unless requested.
- Avoid rendering all huge graph elements at once.

Future:

- background loading
- graph cache
- incremental parsing
- virtualized graph rendering
- worker-based layout calculation

## Testing Architecture

Rust:

- unit test Git provider behavior with test repositories
- unit test graph layout
- unit test error handling

Frontend:

- test components
- test stores
- test graph interactions

Integration:

- test open repo flow
- test invalid repo flow
- test commit selection flow

End-to-end:

- Playwright after MVP stabilizes

## Read-Only Guarantee

MVP must not call any Git operation that mutates repository state.

Forbidden in MVP:

- checkout
- reset
- branch create/delete
- commit
- merge
- rebase
- stash apply/pop
- push
- pull
- fetch
- clean

Allowed:

- read refs
- read objects
- read commits
- read tags
- read trees
- read diffs only when a scoped task includes read-only diff support
- read status if implemented safely

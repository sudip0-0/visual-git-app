# Product Requirements

## Product Name

Visual Git Commit Graph Desktop

## One-Line Description

A Rust + Tauri desktop app that opens local Git repositories and visualizes commit history, branch relationships, tags, and Git internals through an interactive graph.

## Product Vision

Most Git GUI tools help users perform Git actions. This app focuses on helping developers understand Git history.

The product should answer questions like:

- Where did this branch come from?
- When did this branch diverge from main?
- Which commits belong to this feature?
- Which commit does this branch point to?
- What does HEAD point to?
- Where did this merge happen?
- Why is this branch ahead or behind?
- What is inside the `.git` directory?

## Target Users

### Primary Users

Intermediate developers who use Git but struggle to understand branch history visually.

### Secondary Users

- students learning Git internals
- developers debugging messy branch histories
- open-source contributors exploring unfamiliar repositories
- educators teaching Git
- advanced developers who want a fast local Git visualizer

## User Problems

### Problem 1: Git history is hard to understand

Git history is a graph, but many developers only see it as a list of commits.

### Problem 2: Existing Git clients are action-focused

Most tools focus on commit, push, pull, merge, and conflict resolution. This app focuses on understanding history.

### Problem 3: Git internals are hidden

Developers often do not know how HEAD, refs, branches, tags, objects, and commits connect.

### Problem 4: Branch divergence is unclear

Developers often ask:

- Is my branch ahead?
- Is my branch behind?
- When did it diverge?
- What commits are unique to this branch?

## Product Positioning

This app is not trying to be a full Git client at first.

It is:

```txt
A visual Git history explorer and Git internals learning tool.
```

It is not:

```txt
A GitHub Desktop clone.
A full GitKraken replacement.
A command-line Git wrapper.
```

## MVP Statement

The MVP is a read-only desktop app that opens a local Git repository, reads recent commit history using Rust, builds a commit graph, and displays an interactive branch graph with commit details, branch filters, and search.

## MVP Functional Requirements

### Repository Opening

- User can open a local folder.
- App validates whether the folder is a Git repository.
- App supports repositories where `.git` is a folder.
- App should show a clear error for invalid folders.
- App remembers recently opened repositories.

### Git Data Loading

- App reads current HEAD.
- App detects current branch.
- App lists local branches.
- App lists remote branches.
- App lists tags.
- App loads recent commits.
- App reads commit parent relationships.
- App identifies merge commits.
- App maps refs to commit hashes.

### Graph Visualization

- App renders commit nodes.
- App renders parent-child edges.
- App shows branch lanes.
- App highlights the current branch.
- App marks tags.
- App supports zoom and pan.
- App supports clicking commits.
- App supports selecting a branch.
- App supports search by hash, message, and author.

### Commit Details

When a commit is selected, show:

- full hash
- short hash
- commit message
- author name
- author email
- author date
- committer name
- committer date
- parent commits
- branches pointing to the commit
- tags pointing to the commit
- changed files in Phase 2

### Error Handling

- Invalid repository
- Empty repository
- Detached HEAD
- Corrupted repository
- Permission denied
- Repository loading failed
- Too many commits to render at once

## MVP Non-Functional Requirements

- App should be read-only.
- App must not modify Git repository state.
- App should work offline.
- App should not send repository data to external services.
- App should load 500 recent commits in a normal repository without freezing the UI.
- App should handle large repositories by limiting initial commit loading.
- App should show loading states.
- App should show empty states.
- App should show clear error messages.
- App should support Windows first.
- App should be designed for future Linux and macOS support.

## Out of Scope for MVP

The MVP must not include:

- commit creation
- branch creation
- branch deletion
- push
- pull
- fetch
- merge
- rebase
- reset
- checkout
- stash apply
- conflict resolution
- GitHub login
- GitLab login
- remote API integrations
- automatic background sync
- repository mutation

## Phase 2 Features

- Diff viewer
- Changed files per commit
- Compare two commits
- Branch ahead/behind explanation
- Merge base finder
- Author filter
- Date range filter
- Recent repository dashboard
- Keyboard shortcuts
- Export graph as image
- File watcher for repository updates

## Phase 3 Features

- Git internals mode
- Raw commit object viewer
- HEAD and refs explorer
- Tree object viewer
- Blob preview
- Reflog visualizer
- Stash visualizer
- Worktree support
- Submodule support
- Time travel slider
- Graph minimap

## Phase 4 Features

- Custom `.git` object parser
- Packfile reader
- Educational explanations
- Interactive rebase preview
- Merge conflict visual explanation
- Blame visualization
- Performance mode for huge repositories
- Git learning exercises

## Main User Flows

### Flow 1: Open Repository

1. User launches app.
2. User clicks "Open Repository".
3. User selects a local folder.
4. App validates Git repository.
5. App loads repository metadata.
6. App displays graph.

### Flow 2: Explore Commit

1. User sees commit graph.
2. User clicks a commit node.
3. App opens commit detail panel.
4. User views commit hash, message, author, date, parents, branches, and tags.

### Flow 3: Filter by Branch

1. User selects branch from sidebar.
2. App highlights commits reachable from that branch.
3. App dims unrelated commits.
4. User can reset filter.

### Flow 4: Search Commit

1. User types search term.
2. App searches commit hash, message, and author.
3. Matching commits are highlighted.
4. User clicks a result.
5. App focuses the graph on the selected commit.

### Flow 5: Understand Branch Divergence (Phase 2)

1. User selects a branch.
2. App compares it with main or selected base branch.
3. App shows ahead/behind counts.
4. App highlights divergence point.

## UX Principles

- Make Git history readable.
- Never hide important Git state.
- Prefer visual explanation over raw output.
- Use plain language for Git concepts.
- Do not overwhelm beginners.
- Keep advanced information available but not forced.
- Show safe read-only behavior clearly.
- Make selected state obvious.
- Keep the graph fast and smooth.

## Success Criteria

The MVP is successful when:

- A user can open a repo and see a useful commit graph.
- A user can click a commit and understand its details.
- A user can identify the current branch.
- A user can see merge commits.
- A user can search commits.
- A user can filter by branch.
- The app does not modify the repo.
- The app feels useful on a real repository.

## Portfolio Success Criteria

The project is portfolio-ready when it includes:

- polished UI screenshots
- demo GIF or video
- clear README
- architecture diagram
- explanation of Git DAG
- explanation of Rust Git engine
- performance notes
- testing notes
- comparison against Git CLI output
- roadmap

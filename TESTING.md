# Testing Guide

## Testing Philosophy

This project handles local repositories. Testing must focus on correctness, safety, and predictable behavior.

The app must never damage a repository during MVP.

Testing priorities:

1. read-only safety
2. correct Git data
3. graph correctness
4. stable UI behavior
5. performance on real repositories
6. clear errors

## Required Checks Before Completing a Task

Run the relevant checks before marking any task as complete.

### Rust Checks

```bash
cargo fmt --check
cargo check
cargo clippy
cargo test
```

### Frontend Checks

```bash
npm run typecheck
npm run lint
npm run test
```

### Tauri Dev Check

```bash
npm run tauri dev
```

Use the exact commands defined in `package.json` after project setup.

## Test Types

## 1. Rust Unit Tests

Use for:

- Git provider logic
- repository validation
- graph building
- lane assignment
- error mapping
- branch comparison
- parsing utilities

Example test areas:

```txt
git/
  validates normal repository
  rejects invalid repository
  handles empty repository
  reads current branch
  handles detached HEAD
  lists branches
  lists tags
  loads commits
  detects merge commits

graph/
  builds edges from parent relationships
  assigns lanes to linear history
  assigns lanes to branch history
  handles merge commits
  keeps layout deterministic
```

## 2. Frontend Unit Tests

Use for:

- stores
- utility functions
- search logic
- filtering logic
- formatting logic
- small presentational components

Example test areas:

```txt
search/
  matches commit hash
  matches commit message
  matches author
  handles empty search

filters/
  filters by selected branch
  clears selected branch
  highlights current branch

utils/
  formats date
  shortens hash
  sorts commits
```

## 3. Component Tests

Use for:

- branch list
- commit detail panel
- graph toolbar
- empty state
- error state
- loading state

Test examples:

```txt
CommitDetailsPanel:
  shows selected commit
  handles no selected commit
  shows merge commit parents
  shows tags and branches

BranchList:
  shows local branches
  shows remote branches
  marks current branch

CommitGraph:
  renders nodes
  renders edges
  selects node on click
```

## 4. Integration Tests

Use for full feature flows.

Important flows:

```txt
Open valid repository
Open invalid folder
Open public GitHub URL
Reject invalid GitHub URL
Open empty repository
Load graph
Select commit
Search commit
Filter branch
Handle detached HEAD
```

## 5. End-to-End Tests

Add after MVP stabilizes.

Recommended tool:

- Playwright

E2E flows:

```txt
App launches
User opens test repo
Graph appears
User clicks commit
Details panel updates
User searches commit
User filters branch
```

## Test Repositories

Create small test repositories for predictable Git history.

Recommended fixtures:

```txt
fixtures/
  linear-repo/
  branch-repo/
  merge-repo/
  tags-repo/
  empty-repo/
  detached-head-repo/
```

Generated test repositories are better than committed `.git` folders.

Create helper scripts that generate them during tests.

## Required Fixture Scenarios

### Linear Repository

```txt
A --- B --- C
```

Must test:

- commit count
- parent edges
- one lane

### Branch Repository

```txt
A --- B --- C main
       \
        D --- E feature
```

Must test:

- branch refs
- lane assignment
- branch filter

### Merge Repository

```txt
A --- B ------- M main
       \       /
        D --- E feature
```

Must test:

- merge commit detection
- multiple parents
- merge edge

### Tagged Repository

```txt
A --- B(tag:v1.0.0) --- C
```

Must test:

- tag reading
- tag mapping to commit
- tag display

### Empty Repository

Must test:

- no crash
- clear empty state
- no graph rendering error

### Detached HEAD Repository

Must test:

- no current branch
- HEAD hash still shown
- UI explains detached HEAD

## Manual Testing Checklist

Before each milestone:

```md
- [ ] App launches
- [ ] Open repository works
- [ ] Invalid folder shows error
- [ ] Empty repository shows safe state
- [ ] Current branch is correct
- [ ] Local branches are listed
- [ ] Remote branches are listed
- [ ] Tags are listed
- [ ] Commit graph renders
- [ ] Merge commits display correctly
- [ ] Commit selection works
- [ ] Search works
- [ ] Branch filter works
- [ ] App does not modify repository
- [ ] No sensitive data is logged
- [ ] UI remains responsive
```

## Read-Only Safety Tests

The MVP must not mutate repositories.

Before and after opening a repository, verify:

```bash
git status
git rev-parse HEAD
git branch --show-current
```

Expected:

- no branch changed
- no files modified by app
- no commits created
- no refs changed
- no index changes caused by app

## Performance Testing

Initial targets:

| Scenario | Target |
|---|---|
| Open small repo | under 1 second |
| Load 500 commits | under 2 seconds |
| Render 500 commits | no noticeable freeze |
| Search 500 commits | instant |
| Click commit | instant |

Future targets:

| Scenario | Target |
|---|---|
| Load 5,000 commits | under 5 seconds with progress state |
| Render 5,000 commits | virtualized |
| Large diff | lazy-loaded |

## Error Testing

Test these cases:

- folder does not exist
- folder is not a Git repository
- folder permission denied
- repository has no commits
- repository is corrupted
- branch points to missing object
- tag points to missing object
- invalid GitHub URL
- private GitHub repository URL
- cached GitHub clone exists
- path contains spaces
- path contains Unicode characters

## Testing Rules for Agents

Agents must:

- add tests for new logic
- avoid deleting tests to make checks pass
- not weaken assertions without reason
- report any skipped tests
- update this file if test commands change
- not claim tests pass unless they were run

## Bug Report Template

```md
# Bug Report

## Summary

## Steps to reproduce

## Expected result

## Actual result

## Repository scenario

## Logs or screenshots

## Suspected cause

## Suggested fix
```

## Test Completion Format

When a task is done, report:

```txt
Tests run:
- cargo check
- cargo test
- npm run typecheck
- npm run lint

Result:
- Passed / Failed

Notes:
- Any skipped checks and why
```

# Security Rules

## Security Goal

The app must safely inspect local Git repositories without modifying them, leaking data, or executing untrusted code.

## MVP Security Position

The MVP is:

```txt
Local-first
Offline
Read-only
No network sync
No Git write operations
No execution of repository files
```

## Core Rules

### 1. Never Modify the Repository in MVP

Forbidden Git operations in MVP:

- commit
- checkout
- reset
- merge
- rebase
- branch create
- branch delete
- tag create
- tag delete
- stash apply
- stash pop
- push
- pull
- fetch
- clean
- index write
- worktree modification

Allowed operations:

- read commits
- read refs
- read HEAD
- read branches
- read tags
- read trees
- read diffs only when a scoped task includes read-only diff support
- read repository status if implemented safely

### 2. Do Not Execute Repository Code

Never execute files from the selected repository.

Forbidden:

- running package scripts from selected repo
- executing shell scripts from selected repo
- loading JavaScript from selected repo into the app
- evaluating code from repository files
- running hooks
- running build commands from repository

### 3. Avoid Shelling Out

Prefer Rust libraries over shell commands.

If a shell command is ever needed later:

- command must be fixed, not user-controlled
- arguments must be sanitized
- no shell string concatenation
- no arbitrary command execution
- no repository script execution
- document the decision in `DECISIONS.md`

MVP should avoid Git CLI calls.

### 4. Path Safety

All file paths from the frontend must be validated.

Rules:

- use `PathBuf`
- avoid manual string path concatenation
- handle spaces in paths
- handle Unicode paths
- reject empty paths
- handle missing folders
- handle permission errors
- do not expose unrestricted filesystem browsing beyond user-selected paths

### 5. No Network Calls in MVP

The MVP should not send data anywhere.

Forbidden in MVP:

- analytics
- telemetry
- crash reports with repository data
- GitHub API calls
- GitLab API calls
- remote sync
- cloud backups

If network features are added later:

- user must opt in
- document what data is sent
- never send repository content without explicit consent
- support disabling network features

### 6. Protect Repository Privacy

Repository content can contain private code, secrets, API keys, emails, and business logic.

Rules:

- do not upload repository data
- do not log full file contents
- do not show secrets in logs
- do not store unnecessary commit data permanently
- do not include repository content in error reports
- keep recent repo paths local only

### 7. Logging Rules

Allowed logs:

- high-level app events
- safe error categories
- timing metrics without file content
- selected repository name if needed for debugging

Do not log:

- tokens
- passwords
- private keys
- full file contents
- full diffs by default
- environment variables
- credentials
- `.env` contents
- sensitive config files

### 8. Error Message Safety

Frontend errors should be useful but safe.

Good:

```txt
This folder is not a Git repository.
Could not read repository. Permission denied.
This repository has no commits yet.
```

Bad:

```txt
Raw Rust panic output
Full internal stack trace
Full path to sensitive internal file if not needed
Full file content
```

### 9. Dependency Security

Rules:

- keep dependencies minimal
- avoid unmaintained packages
- avoid unnecessary native dependencies
- review new dependencies before adding
- document major dependency choices in `DECISIONS.md`
- do not add analytics SDKs in MVP

Recommended checks later:

```bash
cargo audit
npm audit
```

### 10. Frontend Security

The frontend must not render untrusted content as HTML.

Rules:

- do not use `dangerouslySetInnerHTML` for commit messages
- treat commit messages as untrusted text
- escape all user/repository-provided strings
- sanitize markdown if markdown rendering is ever added
- avoid loading remote images/scripts

### 11. Commit Message Safety

Commit messages can contain malicious-looking strings or HTML.

Rules:

- render as plain text
- do not execute links
- do not auto-open URLs
- do not parse as HTML
- truncate very long messages safely

### 12. Diff Safety

Diffs can contain secrets or huge content.

Rules for Phase 2:

- load diffs only when requested
- truncate huge diffs
- do not log diffs
- render diffs as escaped text
- handle binary files safely
- warn before copying large diff content

### 13. Recent Repository Storage

Recent repositories should be stored locally.

Rules:

- store only path and last opened time
- do not store commit data unless needed
- allow user to remove recent repos
- handle deleted paths gracefully

### 14. Tauri Security Rules

Tauri command surface should be minimal.

Rules:

- expose only needed commands
- validate command inputs
- return typed responses
- map internal errors to safe errors
- do not expose generic filesystem read command
- do not expose shell execution command

### 15. Git Hooks

Do not run Git hooks.

The app should not trigger operations that execute:

- pre-commit
- post-commit
- pre-push
- post-checkout
- post-merge
- custom hooks

Since MVP is read-only, hooks should not run.

## Threat Model

### Threat: Malicious repository

A repository may contain malicious filenames, commit messages, huge files, or crafted Git objects.

Mitigation:

- use safe Git library for MVP
- render text safely
- avoid executing files
- handle errors
- limit loaded data

### Threat: Accidental repository mutation

A bug may change user repository state.

Mitigation:

- MVP read-only
- no write commands
- no checkout/reset/merge operations
- tests verify no state change

### Threat: Data leakage

Private repository data may leak through logs, telemetry, or error reports.

Mitigation:

- no network calls in MVP
- safe logging
- no telemetry
- local-only storage

### Threat: UI freeze from large repository

Large data may freeze the app.

Mitigation:

- commit limit
- loading states
- future virtualization
- lazy load diffs

### Threat: Unsafe path handling

Bad paths may cause crashes or unexpected file access.

Mitigation:

- validate paths
- use Rust path APIs
- handle permissions
- avoid manual path concatenation

## Security Checklist

Before MVP release:

```md
- [ ] No Git write operation exists
- [ ] No shell execution command exists
- [ ] No network calls exist
- [ ] No repository files are executed
- [ ] Commit messages render as text
- [ ] Errors are safe
- [ ] Logs do not include secrets
- [ ] Invalid paths are handled
- [ ] Permission errors are handled
- [ ] Empty repos are handled
- [ ] Large commit histories are limited
- [ ] Recent repository storage is local only
```

## Security Review Prompt

Use this with a reviewer agent:

```txt
Review this project for security issues.

Focus on:
- accidental Git repository mutation
- unsafe path handling
- shell command injection
- unsafe frontend rendering
- sensitive data logging
- unnecessary network calls
- unsafe Tauri commands
- dependency risks

Do not edit files yet.
Return critical, important, and nice-to-have issues.
```

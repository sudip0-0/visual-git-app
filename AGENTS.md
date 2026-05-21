# Agent Instructions

These instructions apply to all coding agents working on this repository.

## Project Summary

Visual Git Commit Graph Desktop is a Rust + Tauri desktop app that opens local Git repositories and visualizes commit history as an interactive graph.

The MVP is read-only.

The app must not modify Git repositories.

## Priority Order

When instructions conflict, follow this order:

1. User instruction for the current task
2. `SECURITY.md`
3. `PRODUCT.md`
4. `ARCHITECTURE.md`
5. `TASKS.md`
6. `TESTING.md`
7. `DECISIONS.md`
8. `README.md`
9. `PROMPTS.md`

## Core Product Rules

- MVP is a read-only Git visualizer.
- Do not add Git write operations.
- Do not build a full Git client in MVP.
- Do not add GitHub/GitLab integration in MVP.
- Do not add network calls in MVP.
- Do not execute files from selected repositories.
- Do not shell out to Git CLI unless explicitly approved and documented.
- Prefer `git2` for MVP Git access.
- Keep custom `.git` parsing as a later feature.

## Working Rules

Before editing:

1. Read the current task in `TASKS.md`.
2. Read relevant architecture sections.
3. Inspect existing files.
4. Identify files likely to change.
5. Make a short plan.

During editing:

- Work on one task only.
- Keep changes small.
- Preserve existing behavior unless task requires change.
- Do not modify unrelated files.
- Do not introduce new dependencies without reason.
- Do not change the tech stack without approval.
- Do not rewrite the app from scratch.
- Keep frontend and backend responsibilities separate.
- Keep Tauri command handlers thin.
- Keep Rust Git logic in the Git/app service layers.
- Keep React components focused on UI.

After editing:

1. Run relevant checks.
2. Update `PROGRESS.md`.
3. Update `DECISIONS.md` if an architecture decision changed.
4. Update `README.md` if commands or setup changed.
5. Report files changed.
6. Report tests run.
7. Report known risks.

## Completion Rules

A task is complete only when:

- acceptance criteria are met
- relevant tests/checks pass
- no unrelated files changed
- no forbidden Git write behavior added
- `PROGRESS.md` is updated
- `DECISIONS.md` is updated if needed
- remaining risks are reported

## Stop Rules

Stop and ask before:

- changing the tech stack
- deleting many files
- rewriting more than 5 files
- adding a major dependency
- changing the Git provider strategy
- adding Git write operations
- adding shell command execution
- adding network calls
- changing Tauri permissions
- changing security model
- changing database/storage strategy
- adding authentication
- adding cloud sync

## Strictly Forbidden in MVP

Do not implement:

- commit
- checkout
- reset
- merge
- rebase
- push
- pull
- fetch
- stash apply
- stash pop
- branch creation
- branch deletion
- tag creation
- tag deletion
- destructive file operations
- arbitrary command execution
- repository script execution
- telemetry
- cloud sync

## Allowed in MVP

Allowed:

- read repository metadata
- read HEAD
- read refs
- read branches
- read tags
- read commits
- read commit parents
- read trees
- read diffs only when a scoped task includes read-only diff support
- build graph data
- render graph
- search commits
- filter branches
- remember recent repositories locally

## Architecture Rules

### Rust

- Use Rust for Git and filesystem logic.
- Use typed models.
- Use structured errors.
- Avoid panics in app flow.
- Avoid `unwrap()` in production logic.
- Prefer `Result<T, AppError>`.
- Keep command handlers thin.
- Put Git logic in `git/`.
- Put orchestration in `app/`.
- Put graph logic in `graph/`.
- Put shared structs in `models/`.

### Frontend

- Use TypeScript.
- Keep components small.
- Keep business logic out of UI components.
- Use stores for shared state.
- Render untrusted repository data as text.
- Do not use `dangerouslySetInnerHTML` for commit data.
- Add loading, empty, and error states.

### Tauri

- Expose minimal commands.
- Validate all command inputs.
- Return typed responses.
- Map internal errors to safe messages.
- Do not expose generic filesystem APIs unnecessarily.
- Do not expose shell execution.

## Git Provider Rules

Use a provider abstraction.

MVP:

```txt
GitProvider trait/interface
→ Git2Provider implementation
```

Future:

```txt
CustomGitProvider for educational .git parsing
```

Do not mix Git parsing code directly into Tauri commands.

## Graph Rules

- Git history is a DAG.
- A commit can have zero, one, or multiple parents.
- Merge commits have multiple parents.
- Layout must be deterministic.
- Start simple.
- Do not over-optimize before the graph works.
- Add tests for graph layout logic.

## Testing Rules

Agents must not claim tests passed unless they were actually run.

If tests cannot be run, say why.

Expected checks:

Rust:

```bash
cargo fmt --check
cargo check
cargo clippy
cargo test
```

Frontend:

```bash
npm run typecheck
npm run lint
npm run test
```

Tauri:

```bash
npm run tauri dev
```

Run only relevant checks when the project is not fully set up yet.

## Documentation Rules

Update docs when behavior changes.

- `PROGRESS.md`: update after every task
- `DECISIONS.md`: update for major architecture choices
- `README.md`: update when setup or commands change
- `TESTING.md`: update when test commands change
- `SECURITY.md`: update if security model changes
- `TASKS.md`: update task status if appropriate

Do not mark tasks done unless they are actually complete.

## Response Format After Work

Use this format:

```txt
Summary:
- ...

Files changed:
- ...

Tests run:
- ...

Result:
- Passed / Failed / Not run

Risks:
- ...

Next recommended task:
- ...
```

## Review Agent Instructions

If you are reviewing:

- Do not edit files unless asked.
- Focus on correctness.
- Check for scope creep.
- Check read-only safety.
- Check missing tests.
- Check security risks.
- Check architecture consistency.

Return:

```txt
Critical issues:
Important issues:
Nice-to-have:
Suggested fix order:
Accept or reject:
```

## Builder Agent Instructions

If you are implementing:

- Read task first.
- Make minimal changes.
- Run checks.
- Update progress.
- Do not expand scope.

## Debugger Agent Instructions

If you are debugging:

- Reproduce or inspect first.
- Identify root cause.
- Apply smallest safe fix.
- Add regression test if possible.
- Do not hide the error.
- Do not remove functionality to make tests pass.

## Refactor Agent Instructions

If you are refactoring:

- Preserve behavior.
- Keep diff focused.
- Do not add features.
- Run tests before and after if possible.
- Explain what improved.

## Documentation Agent Instructions

If you are updating docs:

- Do not invent completed features.
- Keep status accurate.
- Mark future features clearly.
- Keep language clear and direct.



## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

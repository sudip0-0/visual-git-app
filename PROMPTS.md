# Prompt Library

Use these prompts with Codex, Claude Code, ChatGPT, or other agentic coding tools.

## General Rules

- Give agents one task at a time.
- Ask agents to inspect before editing.
- Ask for a plan before implementation.
- Use a reviewer agent after major changes.
- Never let an agent rewrite the whole project without approval.
- Always require tests or checks.
- Always update `PROGRESS.md`.

---

# 1. Project Initialization Prompt

```txt
We are building Visual Git Commit Graph Desktop.

Tech stack:
- Rust
- Tauri 2
- React
- TypeScript
- Tailwind CSS

Product:
A read-only desktop app that opens a local Git repository, reads commit history, branches, tags, and HEAD information, then renders an interactive commit graph.

Before coding:
1. Read README.md.
2. Read PRODUCT.md.
3. Read ARCHITECTURE.md.
4. Read TASKS.md.
5. Read SECURITY.md.
6. Read TESTING.md.
7. Read AGENTS.md.

Task:
Implement TASK-0101 from TASKS.md: initialize the Tauri project.

Rules:
- Do not implement Git features yet.
- Do not add unnecessary dependencies.
- Keep the app minimal.
- Update PROGRESS.md after completion.

After implementation:
- List files changed.
- List commands run.
- Report any issues.
- Recommend the next task.
```

---

# 2. Task Implementation Prompt

```txt
Implement this task from TASKS.md:

TASK-ID:
TASK NAME:

Before editing:
- Inspect the existing codebase.
- Read relevant docs.
- Identify files likely to change.
- Give a short implementation plan.

Scope:
- Implement only this task.
- Do not add unrelated features.
- Do not change the tech stack.
- Do not modify Git repository state.
- Follow AGENTS.md, ARCHITECTURE.md, SECURITY.md, and TESTING.md.

Acceptance criteria:
Paste the acceptance criteria from TASKS.md here.

After editing:
- Run relevant checks.
- Update PROGRESS.md.
- Update DECISIONS.md if architecture changed.
- Report files changed.
- Report tests run.
- Report risks or follow-up work.
```

---

# 3. Code Review Prompt

```txt
Review the latest changes.

Do not edit files yet.

Check:
- correctness
- architecture consistency
- security
- read-only Git safety
- error handling
- type safety
- duplicated code
- unnecessary dependencies
- missing tests
- performance risks
- UI/UX issues

Use these files as references:
- PRODUCT.md
- ARCHITECTURE.md
- TASKS.md
- TESTING.md
- SECURITY.md
- AGENTS.md

Return:
1. Critical issues
2. Important issues
3. Nice-to-have improvements
4. Files that need changes
5. Recommended fix order
6. Whether the task should be accepted or rejected
```

---

# 4. Fix Review Issues Prompt

```txt
Apply fixes from this review.

Rules:
- Fix only critical and important issues.
- Do not add new features.
- Do not refactor unrelated files.
- Preserve the intended architecture.
- Keep MVP read-only.
- Run relevant checks.
- Update PROGRESS.md.

Review issues to fix:
Paste review here.
```

---

# 5. Architecture Review Prompt

```txt
Review the architecture of this project.

Focus on:
- Rust/Tauri separation
- Git provider abstraction
- frontend/backend data contracts
- graph layout design
- read-only safety
- future custom `.git` parser support
- scalability for large repositories
- testability

Do not edit files.

Return:
1. Strengths
2. Weaknesses
3. Architecture risks
4. Missing abstractions
5. Over-engineered areas
6. Under-designed areas
7. Recommended changes
```

---

# 6. Security Review Prompt

```txt
Review this project for security risks.

Focus on:
- accidental Git repository mutation
- unsafe Tauri commands
- shell command execution
- path traversal
- unsafe frontend rendering
- sensitive data logging
- network calls
- dependency risks
- repository privacy
- malicious commit messages
- malicious filenames

Do not edit files.

Return:
1. Critical security risks
2. Important security risks
3. Low-priority risks
4. Exact files involved
5. Recommended fixes
```

---

# 7. Testing Improvement Prompt

```txt
Improve the test coverage for the current implementation.

Before editing:
- Inspect TESTING.md.
- Inspect existing tests.
- Identify missing tests.

Focus on:
- repository validation
- Git provider logic
- graph builder logic
- lane assignment
- frontend search/filter logic
- error states

Rules:
- Do not change production behavior unless needed for testability.
- Do not delete existing tests.
- Do not weaken assertions.
- Run relevant checks.
- Update PROGRESS.md.

Return:
- tests added
- bugs found
- commands run
- remaining gaps
```

---

# 8. Git Engine Implementation Prompt

```txt
Implement the Git data engine for the current task.

Use:
- Rust
- git2 crate
- GitProvider abstraction from ARCHITECTURE.md

Rules:
- MVP is read-only.
- Do not shell out to Git CLI.
- Do not mutate repository state.
- Keep Tauri command handlers thin.
- Map errors to safe app errors.
- Add tests for Git logic where practical.

Required output:
- Rust models
- Git2Provider implementation
- service layer function
- Tauri command if needed
- tests
- PROGRESS.md update
```

---

# 9. Graph Layout Prompt

```txt
Implement or improve the commit graph layout.

Context:
The graph is a Git commit DAG.
Each commit has zero, one, or multiple parents.
Merge commits have multiple parents.

MVP layout:
- vertical graph
- latest commit near top
- y = commit order
- x = lane
- deterministic output
- simple lane assignment is acceptable

Rules:
- Keep layout logic separate from UI.
- Add unit tests.
- Handle linear, branch, and merge histories.
- Do not over-engineer.
- Update PROGRESS.md.

Return:
- algorithm summary
- files changed
- tests run
- known limitations
```

---

# 10. UI Implementation Prompt

```txt
Implement the UI for this task.

Design goals:
- polished desktop layout
- dark mode first
- clear graph area
- left sidebar for branches/tags
- right panel for commit details
- top bar for open repo/search/current branch
- readable empty/loading/error states

Rules:
- Use existing components and styles.
- Keep components small.
- Keep Git logic out of React components.
- Use TypeScript types.
- Do not add heavy UI libraries unless justified.
- Update PROGRESS.md.

After implementation:
- run typecheck
- run lint
- report files changed
```

---

# 11. Refactor Prompt

```txt
Refactor the specified area.

Area:
PASTE AREA HERE

Goals:
- improve readability
- reduce duplication
- improve separation of concerns
- preserve behavior
- improve testability

Rules:
- Do not add new features.
- Do not change public behavior.
- Do not change architecture without updating DECISIONS.md.
- Run tests before and after if possible.
- Update PROGRESS.md.

Return:
- what changed
- why it improved the code
- tests run
- risks
```

---

# 12. Debugging Prompt

```txt
Debug this issue.

Issue:
PASTE ERROR OR DESCRIPTION HERE

Before fixing:
- Inspect relevant files.
- Identify likely cause.
- Explain the cause.
- Propose a minimal fix.

Rules:
- Do not rewrite unrelated code.
- Do not suppress errors without understanding them.
- Add regression test if possible.
- Run relevant checks.
- Update PROGRESS.md.

Return:
- root cause
- fix applied
- files changed
- tests run
- remaining risk
```

---

# 13. Documentation Update Prompt

```txt
Update project documentation after the latest implementation.

Read:
- README.md
- PRODUCT.md
- ARCHITECTURE.md
- TASKS.md
- PROGRESS.md
- DECISIONS.md
- TESTING.md
- SECURITY.md

Rules:
- Do not invent completed features.
- Keep docs accurate.
- Update setup commands if changed.
- Update PROGRESS.md.
- Add DECISIONS.md entry only for important architecture choices.
- Keep wording clear and practical.

Return:
- docs updated
- why they changed
- any stale docs found
```

---

# 14. Release Checklist Prompt

```txt
Prepare this project for an MVP release review.

Check:
- README accuracy
- setup commands
- build commands
- test commands
- security checklist
- known limitations
- screenshots/demo instructions
- packaging notes
- unresolved blockers

Do not implement new features unless they are small fixes.

Return:
1. Release readiness score out of 10
2. Blocking issues
3. Important fixes
4. Nice-to-have polish
5. Suggested release notes
```

---

# 15. Agent Handoff Prompt

```txt
You are taking over work on this project.

First:
- Read README.md
- Read PRODUCT.md
- Read ARCHITECTURE.md
- Read TASKS.md
- Read PROGRESS.md
- Read DECISIONS.md
- Read TESTING.md
- Read SECURITY.md
- Read AGENTS.md

Then:
- Summarize current project state.
- Identify the next best task.
- Explain why that task is next.
- Wait for confirmation before editing.

Do not code yet.
```

---

# 16. Feature Expansion Prompt

```txt
Explore possible feature expansion for this project.

Current product:
Visual Git Commit Graph Desktop is a read-only Git commit graph visualizer.

Suggest features in these categories:
1. Better Git visualization
2. Git internals learning
3. Developer productivity
4. Performance improvements
5. UI/UX polish
6. Portfolio wow factor
7. Monetizable product features

For each feature include:
- user value
- implementation difficulty
- dependencies
- risks
- recommended phase
- whether it belongs in MVP
```

---

# 17. Missing Feature Finder Prompt

```txt
Review the current product and codebase to find missing features.

Use:
- PRODUCT.md
- TASKS.md
- current implementation

Find:
- MVP gaps
- UX gaps
- error handling gaps
- security gaps
- testing gaps
- architecture gaps
- documentation gaps

Return:
1. Must-fix before MVP
2. Should-fix soon
3. Can wait
4. Features to reject for scope control
```

---

# 18. Performance Review Prompt

```txt
Review this project for performance risks.

Focus on:
- loading large repositories
- serializing too much data from Rust to frontend
- SVG rendering limits
- unnecessary React re-renders
- graph layout complexity
- large diffs
- memory usage
- blocking Tauri commands

Do not edit files yet.

Return:
1. Critical performance risks
2. Important improvements
3. Future optimizations
4. Measurement plan
```

---

# 19. Commit Message Prompt

```txt
Generate a clean Git commit message for these changes.

Changes:
PASTE SUMMARY OR DIFF HERE

Use format:
type(scope): short summary

Body:
- what changed
- why
- tests run

Keep it concise.
```

---

# 20. Final Polish Prompt

```txt
Polish this feature for portfolio quality.

Feature:
PASTE FEATURE HERE

Improve:
- UI clarity
- loading state
- empty state
- error state
- accessibility
- keyboard support if relevant
- code readability
- tests
- documentation

Rules:
- Do not expand scope.
- Do not add unrelated features.
- Keep changes focused.
- Update PROGRESS.md.
```

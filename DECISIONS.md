# Architecture Decisions

This file records important project decisions.

Use this format:

```md
## ADR-000X: Title

Date:
Status: Proposed / Accepted / Rejected / Superseded

Context:

Decision:

Reason:

Tradeoffs:

Consequences:
```

---

## ADR-0001: Use Tauri for desktop shell

Date: 2026-05-21

Status: Accepted

Context:

The app needs to run as a desktop application and access local repositories. It should feel native, stay lightweight, and use Rust for backend logic.

Decision:

Use Tauri 2 as the desktop application shell.

Reason:

Tauri fits the project because it uses Rust for backend commands and a web frontend for UI. This allows the app to combine Rust Git parsing with a modern React interface.

Tradeoffs:

- Requires understanding both Rust and frontend tooling.
- Some desktop APIs may require Tauri-specific plugins.
- Packaging requires platform-specific testing.

Consequences:

- Rust backend can safely handle filesystem and Git logic.
- Frontend can focus on interactive graph UI.
- App can later support Windows, Linux, and macOS.

---

## ADR-0002: Use Rust for Git and filesystem logic

Date: 2026-05-21

Status: Accepted

Context:

The app must read local Git repository data and build graph structures. This logic needs performance, safety, and good filesystem access.

Decision:

Use Rust for repository loading, Git data extraction, graph building, and backend command handling.

Reason:

Rust is suitable for local systems work, performance-sensitive parsing, and safe file handling.

Tradeoffs:

- More complex than Node.js for beginners.
- Requires careful error handling.
- Requires serialization between Rust and TypeScript.

Consequences:

- Backend logic will be fast and safe.
- Git parsing can grow into a serious portfolio feature.
- More effort is needed for Rust tests and models.

---

## ADR-0003: Use React and TypeScript for frontend

Date: 2026-05-21

Status: Accepted

Context:

The app needs an interactive graph UI with panels, filters, search, and rich interactions.

Decision:

Use React with TypeScript for frontend.

Reason:

React has a strong ecosystem for building interactive interfaces. TypeScript makes data contracts safer between Rust and frontend.

Tradeoffs:

- Requires managing frontend state carefully.
- Graph rendering can become complex.
- Type definitions must stay aligned with Rust models.

Consequences:

- UI can be built quickly.
- Graph components can be modular.
- Rust response models need matching TypeScript types.

---

## ADR-0004: Use `git2` for MVP

Date: 2026-05-21

Status: Accepted

Context:

The product idea includes parsing `.git` structures. However, manually parsing Git objects, refs, tags, and packfiles from the beginning would delay a working MVP.

Decision:

Use the Rust `git2` crate for the MVP Git engine.

Reason:

`git2` provides reliable Git repository access and helps the project reach a working state faster.

Tradeoffs:

- Less impressive than fully manual parsing at first.
- Depends on libgit2 behavior.
- Some educational Git internals value is deferred.

Consequences:

- MVP can focus on product value and graph visualization.
- Custom parser can be added later behind a provider abstraction.
- The app is more likely to become usable quickly.

---

## ADR-0005: Add custom `.git` parser later

Date: 2026-05-21

Status: Accepted

Context:

The project should stand out as an advanced portfolio project. Manually parsing Git internals would show deeper systems knowledge.

Decision:

Add a custom `.git` parser as a later educational and advanced feature, not as the MVP foundation.

Reason:

This balances shipping a working app with long-term technical depth.

Tradeoffs:

- Manual parser work is delayed.
- Some README claims should avoid saying the MVP is fully custom parsed.
- Maintaining two Git providers may add complexity.

Consequences:

- Architecture must use a Git provider abstraction.
- Git internals mode can show custom parsing later.
- MVP remains achievable.

---

## ADR-0006: MVP is read-only

Date: 2026-05-21

Status: Accepted

Context:

Git write operations can damage user repositories if implemented incorrectly. The core value of the MVP is visualization and understanding, not repository mutation.

Decision:

The MVP must be read-only.

Reason:

Read-only behavior reduces risk and keeps scope focused.

Tradeoffs:

- Users cannot commit, checkout, merge, or rebase.
- App may feel less like a full Git client.
- Some users may expect Git actions.

Consequences:

- Safer MVP.
- Clear product positioning.
- Easier testing.
- Lower chance of destructive bugs.

---

## ADR-0007: Use SVG for MVP graph rendering

Date: 2026-05-21

Status: Accepted

Context:

The app needs to render commit nodes, edges, merge lines, and labels. The first version should be easy to implement and debug.

Decision:

Use SVG for MVP graph rendering.

Reason:

SVG is simple, inspectable, and works well for interactive nodes and edges at small to medium scale.

Tradeoffs:

- May not perform well with very large histories.
- Virtualization may be needed later.
- Canvas or WebGL may be better for huge repositories.

Consequences:

- MVP graph can be built quickly.
- Click, hover, and selection are straightforward.
- Later performance work may require abstraction.

---

## ADR-0008: Load 500 commits by default

Date: 2026-05-21

Status: Accepted

Context:

Large repositories can contain tens of thousands of commits. Loading everything immediately can freeze the UI and create poor UX.

Decision:

Load 500 recent commits by default in MVP.

Reason:

500 commits is enough to demonstrate value while reducing performance risk.

Tradeoffs:

- User may not see full history immediately.
- Branch relationships beyond loaded range may be incomplete.
- Need a "Load more" feature later.

Consequences:

- Faster first render.
- More predictable performance.
- Graph model should support pagination or incremental loading later.

---

## ADR-0009: Windows-first development

Date: 2026-05-21

Status: Accepted

Context:

The initial developer environment is assumed to be Windows.

Decision:

Optimize first development and manual testing for Windows.

Reason:

This keeps early setup practical and reduces cross-platform complexity.

Tradeoffs:

- macOS and Linux packaging may require later testing.
- Path handling must still be written cross-platform.
- Some filesystem behavior differs by OS.

Consequences:

- First release can target Windows.
- Rust path handling should use `PathBuf`, not string concatenation.
- Cross-platform support remains a later goal.

---

## ADR-0010: Keep Git internals parser educational and separate

Date: 2026-05-22

Status: Accepted

Context:

Phase 8 adds Git internals mode. The product roadmap calls for a future custom `.git` parser, but the production repository reader already uses `git2` and should remain reliable and read-only.

Decision:

Add a separate loose commit object parser for educational display only. Continue using `Git2Provider` for production repository state, HEAD/ref resolution, graph data, and selected commit metadata.

Reason:

Loose commit parsing demonstrates how Git stores objects without taking on packfile, tree, blob, or full provider complexity. Keeping it separate prevents the educational parser from weakening the production path.

Tradeoffs:

- Packed objects are not parsed by the prototype.
- The internals panel may show that a selected commit is not available as a loose object.
- A direct `flate2` dependency is needed to decompress loose objects.

Consequences:

- Git internals mode can teach HEAD, refs, object paths, and commit structure now.
- Future parser work can add packfiles, trees, and blobs without replacing the `git2` provider.
- The MVP remains read-only and avoids Git CLI calls.

---

## ADR-0011: Support public GitHub URL clones in app cache

Date: 2026-05-22

Status: Accepted

Context:

The original MVP was offline and local-only. A post-MVP feature should let users paste a GitHub repository link and visualize its history without turning the app into a full Git client or adding account integration.

Decision:

Support public `https://github.com/owner/repo` URLs only. Clone the repository with `git2` into an app-managed cache directory, then open the cached local clone through the existing read-only repository and graph flow.

Reason:

This gives users a convenient way to visualize public repositories while preserving the existing command/service boundaries and avoiding Git CLI shell execution.

Tradeoffs:

- The feature introduces network access outside the original offline MVP.
- Private repositories, tokens, SSH, refresh, fetch, pull, and submodules remain unsupported.
- Cached clones can become stale because the first version intentionally does not update them.

Consequences:

- Security documentation must distinguish local repository opening from opt-in public GitHub cloning.
- URL validation must stay strict before any clone starts.
- Clone output must remain inside the app-managed cache.

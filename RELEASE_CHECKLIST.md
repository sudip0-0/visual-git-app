# Release Checklist

Use this checklist before publishing an MVP portfolio build.

## Product

- [ ] Main graph screenshot captured.
- [ ] Commit details screenshot captured.
- [ ] Git internals screenshot captured.
- [ ] README screenshots section updated with real image paths.
- [ ] Roadmap reflects only planned work.
- [ ] Known limitations are accurate.

## Safety

- [ ] No Git write operation exists in production code.
- [ ] No shell execution command exists.
- [ ] No network, telemetry, or cloud sync exists.
- [ ] Repository files are not executed.
- [ ] Commit messages and diffs render as text, not HTML.
- [ ] Diff contents are not logged.
- [ ] Recent repositories store only path, name, and last-opened time.

## Checks

- [ ] `cargo fmt --check`
- [ ] `cargo check`
- [ ] `cargo clippy -- -D warnings`
- [ ] `cargo test`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run tauri build`

## Manual Smoke Test

- [ ] App launches.
- [ ] Open valid repository works.
- [ ] Invalid folder shows a safe error.
- [ ] Empty repository shows a clear empty state.
- [ ] Search focuses with `/`.
- [ ] Reset graph view works with `0`.
- [ ] Commit selection updates details.
- [ ] Branch filter is clearable.
- [ ] Diff loads only after selecting a changed file.
- [ ] Git Internals remains collapsed until opened.

export function GraphArea() {
  return (
    <main className="relative overflow-hidden bg-[#0c1018]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="relative flex h-full min-h-[calc(100vh-3.5rem)] items-center justify-center p-8">
        <section className="w-full max-w-xl rounded-lg border border-slate-800 bg-slate-950/90 p-8 text-center shadow-2xl shadow-black/30">
          <div className="mx-auto mb-5 h-12 w-12 rounded-full border border-cyan-400/40 bg-cyan-400/10" />
          <h2 className="text-xl font-semibold text-slate-100">
            Open a repository to begin
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            The graph workspace will show commits, parent links, branches, tags,
            and selected commit details after repository loading is implemented.
          </p>
        </section>
      </div>
    </main>
  );
}

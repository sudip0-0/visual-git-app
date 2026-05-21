import { DetailsPanel } from "./DetailsPanel";
import { GraphArea } from "./GraphArea";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-[#090b10] text-slate-100">
      <TopBar />
      <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)_320px] border-t border-slate-800">
        <Sidebar />
        <GraphArea />
        <DetailsPanel />
      </div>
    </div>
  );
}

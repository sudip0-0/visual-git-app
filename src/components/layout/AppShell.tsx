import { DetailsPanel } from "./DetailsPanel";
import { GraphArea } from "./GraphArea";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useRepositoryStore } from "../../stores/repositoryStore";

export function AppShell() {
  const repositoryStore = useRepositoryStore();

  return (
    <div className="flex min-h-screen flex-col bg-[#090b10] text-slate-100">
      <TopBar
        isLoading={repositoryStore.isLoading}
        onOpenRepository={repositoryStore.openRepositoryPicker}
        repository={repositoryStore.repository}
      />
      <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)_320px] border-t border-slate-800">
        <Sidebar
          isLoading={repositoryStore.isLoading}
          onOpenRecentRepository={repositoryStore.validateRepositoryPath}
          onRemoveRecentRepository={repositoryStore.removeRecentRepository}
          recentRepositories={repositoryStore.recentRepositories}
          repository={repositoryStore.repository}
        />
        <GraphArea
          error={repositoryStore.error}
          isLoading={repositoryStore.isLoading}
          onOpenRepository={repositoryStore.openRepositoryPicker}
          repository={repositoryStore.repository}
        />
        <DetailsPanel repository={repositoryStore.repository} />
      </div>
    </div>
  );
}

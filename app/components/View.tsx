import Panel from "./Panel";

export default function View({ commit }: { commit?: string }) {
  const src = commit ? `/content/${commit}` : "/content";
  return (
    <main className="relative h-screen w-screen">
      <iframe src={src} className="h-full w-full border-0" title="content" />
      <Panel />
    </main>
  );
}

import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router";
import { useLogs } from "../lib/logs";
import Panel from "./Panel";

const MAX_MOUNTED = 3; // ponytail: small LRU pool of live iframes, raise if nav ever feels laggy

function touch(mounted: string[], commit: string): string[] {
  return [commit, ...mounted.filter((c) => c !== commit)].slice(0, MAX_MOUNTED);
}

export default function View() {
  const { commit } = useParams();
  const logs = useLogs();
  const active = commit ?? logs?.[0]?.commit;
  const [mounted, setMounted] = useState<string[]>([]);

  useEffect(() => {
    if (active) setMounted((prev) => touch(prev, active));
  }, [active]);

  function preload(target: string) {
    setMounted((prev) => (prev.includes(target) ? prev : touch(prev, target)));
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {mounted.map((c) => (
        <iframe
          key={c}
          src={`/content/${c}/index.html`}
          className="absolute inset-0 h-full w-full border-0"
          style={{ visibility: c === active ? "visible" : "hidden" }}
          title={c}
        />
      ))}
      <Panel logs={logs} active={active} onPreload={preload} />
      <Outlet />
    </main>
  );
}

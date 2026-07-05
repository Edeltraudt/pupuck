import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import { useLogs, type LogEntry } from "../lib/logs";
import Loader from "./Loader";
import Panel from "./Panel";
import Stage from "./Stage";

const MAX_MOUNTED = 6; // ponytail: live-iframe RAM cap, meant to stay well under the full commit list as it grows past ~12.
const WARM_DELAY_MS = 400; // let the active commit's iframe claim bandwidth first

function touch(
  mounted: string[],
  target: string,
  active: string | undefined,
): string[] {
  const next = [target, ...mounted.filter((c) => c !== target)];
  if (next.length <= MAX_MOUNTED) return next;
  const kept = next.slice(0, MAX_MOUNTED);
  // never let LRU pressure evict the commit currently on screen
  if (active && !kept.includes(active)) kept[kept.length - 1] = active;
  return kept;
}

// nearest commits first (both directions from active), so idle warm-up spends
// its limited slots on what the user is likely to click next, not list order
function byDistance(logs: LogEntry[], active: string | undefined): string[] {
  const idx = active ? logs.findIndex((e) => e.commit === active) : -1;
  if (idx === -1) return logs.map((e) => e.commit);
  const ordered = [logs[idx].commit];
  for (let d = 1; idx - d >= 0 || idx + d < logs.length; d++) {
    if (idx + d < logs.length) ordered.push(logs[idx + d].commit);
    if (idx - d >= 0) ordered.push(logs[idx - d].commit);
  }
  return ordered;
}

export default function View() {
  const { commit } = useParams();
  const logs = useLogs();
  const navigate = useNavigate();

  const [mounted, setMounted] = useState<string[]>([]);
  const [ready, setReady] = useState<Set<string>>(new Set());

  const active = commit ?? logs?.commits[0]?.commit;

  useEffect(() => {
    if (!logs) return;
    const commits = logs.commits;

    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      const target = e.target as HTMLElement | null;

      if (target?.isContentEditable) {
        return;
      }

      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) {
        return;
      }

      let step = 0;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          step = 1;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          step = -1;
          break;
        default:
          return;
      }

      const idx = commits.findIndex((c) => c.commit === active) + step;

      if (idx < 0 || idx >= commits.length) {
        return;
      }

      e.preventDefault();
      navigate(`/${commits[idx].commit}`);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [logs, active, navigate]);

  useEffect(() => {
    if (active) setMounted((prev) => touch(prev, active, active));
  }, [active]);

  useEffect(() => {
    // drop ready-flags for anything LRU-evicted, so a later re-mount waits for its own load
    setReady((prev) => {
      const filtered = new Set([...prev].filter((c) => mounted.includes(c)));
      return filtered.size === prev.size ? prev : filtered;
    });
  }, [mounted]);

  useEffect(() => {
    if (!logs) {
      return;
    }

    const id = setTimeout(() => {
      setMounted((prev) => {
        // touch farthest-first so the nearest neighbors end up most-recently-touched,
        // i.e. last to be evicted once the list outgrows MAX_MOUNTED. touch() caps
        // and protects `active` on every call, so it's fine to run it for the full list.
        let next = prev;
        for (const commit of [...byDistance(logs.commits, active)].reverse()) {
          next = touch(next, commit, active);
        }
        return next;
      });
    }, WARM_DELAY_MS);

    return () => clearTimeout(id);
  }, [logs, active]);

  function preload(target: string) {
    setMounted((prev) =>
      prev.includes(target) ? prev : touch(prev, target, active),
    );
  }

  function markReady(c: string) {
    setReady((prev) => (prev.has(c) ? prev : new Set(prev).add(c)));
  }

  return (
    <main
      className="grid h-screen w-screen gap-4 overflow-hidden p-8
        portrait:grid-cols-[1fr] portrait:grid-rows-[1fr_auto]
        landscape:grid-cols-[1fr_auto] landscape:grid-rows-[1fr]"
    >
      <Stage projectName={logs?.project.name} activeCommit={commit}>
        {active && !ready.has(active) && <Loader />}
        {mounted.map((commit) => {
          const shown = commit === active && ready.has(commit);
          return (
            <iframe
              key={commit}
              src={`/content/${commit}/index.html`}
              onLoad={() => markReady(commit)}
              className={`absolute h-full w-full border-0 transition-opacity duration-150 ease-out ${
                shown
                  ? "visible pointer-events-auto opacity-100"
                  : "invisible pointer-events-none opacity-0"
              }`}
              title={commit}
            />
          );
        })}
      </Stage>
      <Panel logs={logs?.commits ?? null} active={active} onPreload={preload} />
      <Outlet />
    </main>
  );
}

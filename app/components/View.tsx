import { useEffect, useRef, useState } from "react";
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

  const stageRef = useRef<HTMLDivElement>(null);
  // "latest" ref so the listeners below (window + each iframe, attached once)
  // always see current logs/active without re-attaching
  const keyHandler = useRef<(e: KeyboardEvent) => void>(null);

  keyHandler.current = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.altKey || e.metaKey || !logs) {
      return;
    }

    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
    ) {
      return;
    }

    if (e.key === "Escape") {
      // projects opt out of shell-Esc via preventDefault (or stopPropagation,
      // which keeps the event from ever bubbling to us)
      if (e.defaultPrevented) {
        return;
      }
      const stage = stageRef.current;
      const inStage =
        !!stage &&
        (document.activeElement === stage ||
          stage.contains(document.activeElement));
      if (inStage) {
        // out of the stage, back to the commit list
        document
          .querySelector<HTMLAnchorElement>("nav a[aria-current='page']")
          ?.focus();
      }
      return;
    }

    // j/k instead of arrows: works from anywhere without hijacking
    // arrow keys from screen readers or iframe content
    const step =
      e.key === "j" || e.key === "J"
        ? -1
        : e.key === "k" || e.key === "K"
          ? 1
          : 0;
    if (step === 0) {
      return;
    }

    const commits = logs.commits;
    const idx = commits.findIndex((c) => c.commit === active) + step;

    if (idx < 0 || idx >= commits.length) {
      return;
    }

    e.preventDefault();
    navigate(`/${commits[idx].commit}`);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => keyHandler.current?.(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // commit navigation (j/k or clicking an entry) lands focus on the stage;
  // Esc brings it back to the active entry
  const prevActive = useRef<string | undefined>(undefined);
  useEffect(() => {
    const entry = document.querySelector<HTMLAnchorElement>(
      "nav a[aria-current='page']",
    );
    if (prevActive.current !== undefined && prevActive.current !== active) {
      stageRef.current?.focus();
      entry?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else if (active) {
      // deep link / first load: land with the active entry visible
      entry?.scrollIntoView({ block: "nearest" });
    }
    prevActive.current = active;
  }, [active]);

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
      <Stage
        ref={stageRef}
        projectName={logs?.project}
        activeCommit={active}
      >
        {active && !ready.has(active) && <Loader />}
        {mounted.map((commit) => {
          const shown = commit === active && ready.has(commit);
          return (
            <iframe
              key={commit}
              src={`/content/${commit}/index.html`}
              onLoad={(e) => {
                markReady(commit);
                // same-origin: forward keys so shell navigation keeps working
                // while focus sits inside the iframe
                e.currentTarget.contentWindow?.addEventListener(
                  "keydown",
                  (ev) => keyHandler.current?.(ev),
                );
              }}
              className={`absolute h-full w-full border-0 transition-[opacity,visibility] ease-out ${
                shown
                  ? "visible pointer-events-auto opacity-100 duration-500"
                  : "invisible pointer-events-none opacity-0 duration-500"
              }`}
              title={commit}
            />
          );
        })}
      </Stage>
      <Panel logs={logs?.commits} active={active} onPreload={preload} />
      <Outlet />
    </main>
  );
}

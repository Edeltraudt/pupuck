import { Link } from "react-router";
import type { LogEntry } from "../lib/logs";

type Props = {
  logs: LogEntry[] | null;
  active?: string;
  onPreload: (commit: string) => void;
};

export default function Panel({ logs, active, onPreload }: Props) {
  return (
    <nav className="w-64 min-h-0 min-w-0 overflow-y-auto rounded-2xl border border-zinc-300 bg-white/90 p-2 backdrop-blur portrait:max-h-64 portrait:w-full">
      {logs?.map((entry) => {
        const activeStyles =
          entry.commit === active ? "bg-black text-white" : "hover:bg-gray-100";
        return (
          <Link
            key={entry.commit}
            to={`/${entry.commit}`}
            onMouseEnter={() => onPreload(entry.commit)}
            onFocus={() => onPreload(entry.commit)}
            className={`block rounded px-3 py-2 text-sm ${activeStyles}`}
          >
            {entry.title}
          </Link>
        );
      })}
    </nav>
  );
}

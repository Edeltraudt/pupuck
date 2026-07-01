import { Link } from "react-router";
import type { LogEntry } from "../lib/logs";

type Props = {
  logs: LogEntry[] | null;
  active?: string;
  onPreload: (commit: string) => void;
};

export default function Panel({ logs, active, onPreload }: Props) {
  return (
    <nav className="fixed right-4 top-4 bottom-4 w-64 overflow-y-auto rounded border bg-white/90 p-2 backdrop-blur">
      {logs?.map((entry) => (
        <Link
          key={entry.commit}
          to={`/${entry.commit}`}
          onMouseEnter={() => onPreload(entry.commit)}
          onFocus={() => onPreload(entry.commit)}
          className={`block rounded px-3 py-2 text-sm ${
            entry.commit === active ? "bg-black text-white" : "hover:bg-gray-100"
          }`}
        >
          {entry.title}
        </Link>
      ))}
    </nav>
  );
}

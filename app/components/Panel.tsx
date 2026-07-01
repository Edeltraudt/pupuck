import { Link } from "react-router";
import type { LogEntry } from "../lib/logs";
import Key from "./Key";
import { EntryItem } from "./EntryItem";

type Props = {
  logs: LogEntry[] | null;
  active?: string;
  onPreload: (commit: string) => void;
};

export default function Panel({ logs, active, onPreload }: Props) {
  return (
    <section className="w-96 min-h-0 min-w-0 overflow-y-auto bg-theme-50 rounded-2xl shadow-theme-800/15 shadow-2xl border border-theme-700/30 portrait:max-h-64 portrait:w-full">
      <header className="border-b border-theme-200 py-4 px-5">
        <h2 className="sr-only">Design decisions</h2>
        {/* Keyboard navigation hint */}
        <div className="flex gap-1 items-center">
          <Key keyLabel="↑" />
          <Key keyLabel="↓" />
          <p className="ml-2 text-theme-950/60 text-sm font-medium">
            Explore history of design decisions
          </p>
        </div>
      </header>
      <nav className="py-2 px-2">
        <ol>
          {logs?.map((entry) => {
            const isActive = entry.commit === active;
            const activeClass = isActive
              ? "bg-white border border-theme-200 rounded-lg"
              : "";
            return (
              <li key={entry.commit}>
                <Link
                  to={`/${entry.commit}`}
                  onMouseEnter={() => onPreload(entry.commit)}
                  onFocus={() => onPreload(entry.commit)}
                >
                  <EntryItem
                    entry={entry}
                    isActive={isActive}
                    onPreload={onPreload}
                  />
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </section>
  );
}

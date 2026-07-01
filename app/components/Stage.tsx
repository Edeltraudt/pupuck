import { Link } from "react-router";
import type { PropsWithChildren } from "react";

type Props = {
  projectName?: string;
  activeCommit?: string;
};

export default function Stage({
  children,
  projectName,
  activeCommit,
}: PropsWithChildren<Props>) {
  if (!projectName && !activeCommit) {
    return null;
  }

  return (
    <div className="relative min-h-0 min-w-0 overflow-hidden rounded-2xl border border-theme-700/30 shadow-theme-800/15 shadow-2xl">
      <div className="absolute z-10 flex w-full items-center gap-1 p-3">
        <div className="rounded-full border border-theme-700/30 bg-accent-200/20 px-3 py-1 font-mono text-sm text-stone-950/60 backdrop-blur-lg">
          <h1 className="inline">{projectName}</h1>
          {activeCommit && (
            <p className="inline"> @ {activeCommit.slice(0, 7)}</p>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

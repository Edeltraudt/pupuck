import { Link } from "react-router";
import type { PropsWithChildren } from "react";

type Props = {
  projectName: string;
  activeCommit?: string;
};

export default function Stage({
  children,
  projectName,
  activeCommit,
}: PropsWithChildren<Props>) {
  return (
    <div className="relative min-h-0 min-w-0 overflow-hidden rounded-2xl border border-stone-950/20">
      <div className="absolute z-10 flex w-full items-center gap-1 p-3">
        <div className="rounded-full border border-stone-950/20 bg-white/20 px-3 py-1 font-mono text-sm text-stone-950/60 backdrop-blur-lg">
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

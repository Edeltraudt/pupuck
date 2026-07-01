import type { LogEntry } from "~/lib/logs";

type Props = {
  entry: LogEntry;
  isActive: boolean;
  onPreload: (commit: string) => void;
};

export function EntryItem({ entry, isActive, onPreload }: Props) {
  const circleClass = isActive
    ? "bg-white border-theme-200 rounded-lg shadow-md shadow-theme-200/20"
    : "border-transparent hover:underline";

  const lineClass = isActive ? "top-0 bottom-0" : "-top-3 -bottom-3";

  const headingClass = isActive ? "text-md" : "text-sm";

  return (
    <div className={`py-3 pl-4 pr-6 flex gap-5 border -m-px ${circleClass}`}>
      <div className="relative flex justify-center">
        <span
          className={`absolute ${lineClass} border-l-2 border-theme-950/20 `}
        ></span>
        {isActive ? (
          <>
            <span className="absolute top-2 w-4 h-4 bg-accent-200 rounded-full "></span>
            <span className="absolute top-3 w-2 h-2 bg-accent-600 rounded-full"></span>
          </>
        ) : (
          <>
            <span className="absolute top-2.5 w-2.5 h-2.5 bg-theme-50 rounded-full "></span>
            <span className="absolute top-3 w-1.5 h-1.5 bg-theme-950/40 rounded-full"></span>
          </>
        )}
      </div>

      <div className="pt-0.5 pb-2">
        <span
          aria-label="Category"
          className="text-xs text-theme-950/60 font-mono leading-none"
        >
          <span className="capitalize">{entry.category}</span>
          {" • "}
          <span className="text-xs font-mono">{entry.commit.slice(0, 7)}</span>
        </span>
        <h3
          className={`font-medium text-theme-950 mt-1 mb-2 leading-none ${headingClass}`}
        >
          {entry.title}
        </h3>

        {isActive && (
          <>
            {entry.text.map((text) => (
              <p className="text-sm mb-2 leading-relaxed">{text}</p>
            ))}

            <p aria-label="Tags">
              {entry.tags.map((tag) => (
                <span className="text-xs rounded bg-accent-300/20 border border-accent-300/80 text-accent-700 py-1 px-2 inline-block mr-1 text-2xs font-mono">
                  {tag}
                </span>
              ))}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

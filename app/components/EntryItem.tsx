import type { LogEntry } from "~/lib/logs";

type Props = {
  entry: LogEntry;
  isActive: boolean;
  onPreload: (commit: string) => void;
};

export function EntryItem({ entry, isActive, onPreload }: Props) {
  const containerClass = isActive
    ? "pb-3 bg-white border-theme-200 rounded-lg shadow-md shadow-theme-200/20"
    : "border-transparent hover:underline";

  const lineClass = isActive ? "top-0 bottom-0" : "-top-3 bottom-0";
  const circle1Class = isActive ? "bg-accent-200" : "scale-75 bg-theme-50";
  const circle2Class = isActive ? "bg-accent-600" : "scale-75 bg-theme-950/40";

  return (
    <div className={`pt-3 pl-4 pr-6 flex gap-5 border -m-px ${containerClass}`}>
      <div className="relative flex justify-center">
        <span
          className={`absolute ${lineClass} border-l-2 border-theme-950/20 `}
        ></span>

        <span
          className={`absolute top-2 w-4 h-4 ${circle1Class} rounded-full ease-in duration-100`}
        ></span>
        <span
          className={`absolute top-3 w-2 h-2 ${circle2Class} rounded-full ease-in duration-100`}
        ></span>
      </div>

      <div className={`pt-0.5 ${isActive ? "pb-2" : ""}`}>
        <span
          aria-label="Category"
          className="text-xs text-theme-950/60 font-mono leading-none"
        >
          <span className="capitalize">{entry.category}</span>
          {" • "}
          <span className="text-xs font-mono">{entry.commit.slice(0, 7)}</span>
        </span>
        <h3 className="text-sm font-medium text-theme-950 mt-1 mb-2 leading-tight text-balance">
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

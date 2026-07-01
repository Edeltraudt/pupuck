type Props = {
  keyLabel?: string;
};

export default function Key({ keyLabel = "⌘K" }: Props) {
  return (
    <kbd className="inline-flex items-center rounded-md border border-theme-200 bg-white py-0.5 leading-non px-1 min-w-5 justify-center font-mono text-xs font-medium text-theme-950/60 shadow-sm dark:border-theme-700 dark:bg-theme-800 dark:text-theme-200">
      {keyLabel}
    </kbd>
  );
}

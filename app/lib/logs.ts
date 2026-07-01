import { useEffect, useState } from "react";

export type LogEntry = {
  id: string;
  title: string;
  category: string;
  commit: string;
  targets: string[];
  tags: string[];
  text: string[];
};

let cache: Promise<LogEntry[]> | null = null;

function loadLogs(): Promise<LogEntry[]> {
  cache ??= fetch("/logs.json").then((r) => r.json());
  return cache;
}

export function useLogs(): LogEntry[] | null {
  const [logs, setLogs] = useState<LogEntry[] | null>(null);
  useEffect(() => {
    loadLogs().then(setLogs);
  }, []);
  return logs;
}

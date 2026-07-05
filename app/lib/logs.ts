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

export type Project = {
  name: string;
  themeColor?: string;
  accentColor?: string;
};

export type Logs = {
  project: Project;
  commits: LogEntry[];
};

let cache: Promise<Logs> | null = null;

function loadLogs(): Promise<Logs> {
  cache ??= fetch("/content/logs.json").then((r) => r.json());
  return cache;
}

export function useLogs(): Logs | null {
  const [logs, setLogs] = useState<Logs | null>(null);
  useEffect(() => {
    loadLogs().then(setLogs);
  }, []);
  return logs;
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ensureSeed } from "@/lib/seed";

export function DbProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureSeed();
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Không mở được IndexedDB");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-red-600 dark:text-red-400">{err}</p>
        <p className="text-sm text-neutral-500">
          Thử mở bằng HTTPS hoặc localhost; một số trình duyệt chặn storage ở chế độ riêng tư.
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

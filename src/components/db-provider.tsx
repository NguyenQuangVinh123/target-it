"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ensureServerSeed } from "@/actions/budget";

export function DbProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureServerSeed();
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) {
          setErr(
            e instanceof Error
              ? e.message
              : "Không kết nối được database. Kiểm tra DATABASE_URL trong .env"
          );
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
        <p className="text-red-400">{err}</p>
        <p className="text-sm text-teal-500">
          Tạo file <code className="rounded bg-teal-950 px-1">.env</code> với{" "}
          <code className="rounded bg-teal-950 px-1">DATABASE_URL</code> và{" "}
          <code className="rounded bg-teal-950 px-1">DATABASE_URL_UNPOOLED</code>{" "}
          (Neon), rồi chạy{" "}
          <code className="rounded bg-teal-950 px-1">npx prisma migrate deploy</code>
          .
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

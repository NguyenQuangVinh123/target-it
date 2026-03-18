"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const nav = [
  { href: "/", label: "Tổng quan", icon: "◉" },
  { href: "/chi-tieu", label: "Chi tiêu", icon: "¥" },
  { href: "/thu-nhap", label: "Thu nhập", icon: "+" },
  { href: "/muc-tieu", label: "Mục tiêu", icon: "◎" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))]">
      <header className="sticky top-0 z-10 border-b border-teal-900/10 bg-teal-950/90 px-4 py-3 backdrop-blur-md dark:border-teal-100/10 dark:bg-teal-950/95">
        <h1 className="text-lg font-semibold tracking-tight text-teal-50">
          TargetIt
        </h1>
        <p className="text-xs text-teal-200/80">Quản lý chi tiêu · dữ liệu trên máy</p>
      </header>
      <main className="flex-1 px-4 py-4">{children}</main>
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-teal-900/20 bg-teal-950/95 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md dark:border-teal-100/10"
        aria-label="Điều hướng chính"
      >
        <ul className="mx-auto flex max-w-lg justify-around">
          {nav.map(({ href, label, icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex min-w-[4.5rem] flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-xs transition-colors ${
                    active
                      ? "text-teal-300"
                      : "text-teal-400/70 hover:text-teal-200"
                  }`}
                >
                  <span className="text-lg leading-none" aria-hidden>
                    {icon}
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

# TargetIt

Web app + PWA quản lý chi tiêu (local-first, IndexedDB). Stack: **Next.js 15**, **TypeScript**, **Tailwind**, **Dexie**, **@ducanh2912/next-pwa**.

## Chạy local

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Build & PWA

```bash
npm run build
npm start
```

Service worker **chỉ bật ở production** (`NODE_ENV=production`). Để thử cài PWA và offline:

1. Build và chạy `npm start` (hoặc deploy lên Vercel — HTTPS có sẵn).
2. Chrome/Edge: biểu tượng **cài đặt** trên thanh địa chỉ → **Cài đặt TargetIt**.
3. **DevTools → Application → Service Workers**: xác nhận `sw.js` đang active.
4. **Application → Manifest**: kiểm tra tên, icon, `display: standalone`.
5. **Offline**: DevTools → Network → **Offline**, reload — shell và các route đã precache vẫn mở được (dữ liệu vẫn từ IndexedDB trên máy).

## Dữ liệu

Toàn bộ lưu trong **IndexedDB** (`targetit`) trên trình duyệt — không đồng bộ giữa thiết bị.

## Triển khai Vercel

Import repo → Build: `next build`, Output mặc định. Không cần biến môi trường cho Phase 1.

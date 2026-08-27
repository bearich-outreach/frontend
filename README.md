# Bearich Outreach — Frontend

UI untuk sistem otomasi outreach & pipeline freelance web developer. Dibangun dengan Next.js (App Router) + TypeScript + Tailwind.

Backend terpisah: lihat repo **bearich-backend** (Express + MySQL). Frontend hanya berkomunikasi dengan backend lewat HTTP.

## Menjalankan lokal

```bash
npm install
npm run dev     # http://localhost:3000
```

Pastikan backend berjalan (repo backend, `http://localhost:4000`).

Konfigurasi URL backend di `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Buka `http://localhost:3000` → login dengan kredensial dari backend (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).

## Deploy ke Vercel

1. Push repo ini ke GitHub, import di Vercel (framework: **Next.js**).
2. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://bearich-outreach.duckdns.org
   ```
3. Deploy. Frontend statis — tanpa perlu database.

## Fitur

- Dashboard (metrik pipeline: reply rate, close rate, revenue, antrian harian)
- Outreach Queue (generate pesan + follow-up terjadwal)
- Manajemen prospek + CSV import/export
- Pipeline status: new → contacted → replied → interested → closed/dead
- Settings (profil bisnis, sequence follow-up, DeepSeek)
- Login & dark mode

## Struktur

```
src/
  app/          # halaman (App Router, client components)
  components/   # UI components
  lib/          # api client, types, format
```

## Catatan auth

Frontend (Vercel) dan backend (duckdns) adalah dua situs berbeda. Cookie session dibuat oleh backend dengan `SameSite=None; Secure`. Semua request API memakai `credentials: 'include'` (di `src/lib/api.ts`).
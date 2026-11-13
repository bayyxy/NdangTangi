# Design Direction: NdangTangi (WakeForce)

## Soul & Identity
- **Product**: NdangTangi (WakeForce) — Aplikasi alarm disiplin berbasis tantangan interaktif untuk mengatasi bangun kesiangan.
- **Personality**: Taktikal, tegas, fungsional, dan energetik. Bukan sekadar jam weker pasif, melainkan asisten bangun pagi yang menuntut komitmen.
- **Dials**: ENERGY 2 / RHYTHM 2 / MOTION 2

## Palette (R-29: Max 2-3 Core + 1 Accent)
- **Background Utama**: `#0B0C10` (Charcoal Matte — solid, gelap tanpa rona ungu generik)
- **Card Surface**: `#15171E` (Elevated dark slate dengan border `#232733`)
- **Card Surface Highlighted**: `#1C1F2A`
- **Text Primary**: `#FFFFFF` (Kontras 16:1 terhadap latar)
- **Text Secondary / Muted**: `#8E97A8` (Kontras 5.2:1, lolos WCAG AA)
- **Accent Color**: `#FF5500` (Solar Blaze — oranye darurat/energi, digunakan hemat hanya pada status aktif, tombol aksi utama, dan timer)
- **Status Semantic**:
  - Hijau: `#10B981` (Tantangan Mudah / Sukses)
  - Amber: `#F59E0B` (Tantangan Sedang)
  - Merah: `#EF4444` (Tantangan Sulit / Batalkan / Bahaya)

## Tipografi & Hirarki
- **Jam Digital**: Ukuran besar, bold ('900'), font proporsional dengan spacing ketat agar menyerupai jam digital presisi.
- **Label & Navigasi**: Bersih, tanpa dekorasi emoji berlebihan di setiap header form.
- **Informasi Nyata**: Tampilkan estimasi waktu tidur ("Berdering dalam X jam Y menit") untuk memberikan nilai nyata bagi pengguna.

## Prinsip Interaksi (Anti-Slop)
- Tidak ada emoji dekoratif di setiap label section form (`⏰ Waktu` diubah menjadi label tipografi bersih `WAKTU ALARM`).
- Tidak ada tombol mati atau link kosong.
- Kartu alarm memiliki hirarki jelas: Waktu utama -> Label & hari -> Chip tantangan -> Switch aktif.
- Animasi transisi yang halus namun tidak berlebihan (fokus pada kepastian feedback saat tap dan alarm bunyi).

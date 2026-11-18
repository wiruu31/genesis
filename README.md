# Genesis v2.1.0

Web app interaktif berbahasa Indonesia untuk belajar Bitcoin, blockchain, dan kriptografi Bitcoin. Pelajari mekanismenya lewat lesson pendek, kuis, dan lab yang bisa diutak-atik.

Semua lab adalah **simulasi edukasi**. Genesis tidak tersambung ke jaringan Bitcoin, tidak menyimpan uang, dan tidak pernah meminta kunci privat atau seed phrase.

## Yang baru di v2.1.0

Redesain tampilan total. Konten, logika, dan tes tidak berubah dari v2.0.0.

- Arah visual baru: kertas krem, tinta gelap, satu aksen amber, judul serif. Mode gelap hangat penuh.
- Beranda baru: hero dengan empat blok Bitcoin asli yang bertaut lewat hash, strip progres, peta level, dan daftar lab.
- Lesson dua kolom di desktop: sidebar "Di halaman ini" yang menandai bagian aktif, plus bilah progres baca. Di ponsel daftar isi menjadi akordeon.
- Lab dengan "layar" gelap untuk hash dan ringkasan transaksi, panel dua kolom di desktop.
- Header satu baris, pencarian lewat dialog, tombol tema terang dan gelap.
- Font dari Google Fonts (Fraunces dan Plus Jakarta Sans), lihat catatan privasi di bawah.

## Fitur utama

- Jalur belajar Level 0 sampai 4: 29 lesson (L0: 1, L1: 6, L2: 7, L3: 6, L4: 9). Tiap lesson punya hook, penjelasan, visual, versi teknis (akordeon), miskonsepsi, ringkasan, dan kuis.
- Checkpoint per level. Status lesson: belum mulai, sedang belajar, selesai, dikuasai.
- 6 lab: double spending, hash playground, kunci dan tanda tangan, mengubah blockchain, penyusun UTXO, proof of work dan fork.
- Glosarium dengan pencarian, halaman referensi ke sumber primer.
- Progres tersimpan lokal di peramban, bisa diekspor dan dihapus.
- Mode terang dan gelap, opsi kurangi gerak, navigasi keyboard.
- PWA: bisa dibuka offline setelah kunjungan pertama.
- Level 5 sampai 8 dan capstone berstatus rencana dan ditampilkan apa adanya.

## Tech stack

HTML, CSS, JavaScript vanilla. Tanpa build, tanpa pustaka JavaScript. Satu-satunya sumber luar adalah font dari Google Fonts (dengan font cadangan sistem). Hash router, service worker, localStorage. Hash SHA-256, RIPEMD-160, dan ECDSA secp256k1 ditulis sendiri (hanya untuk belajar, label TEST ONLY).

## Prasyarat

- Peramban modern (Chrome, Firefox, Safari, Edge dua versi terakhir) dengan dukungan BigInt.
- Untuk menjalankan lokal: Python 3 atau Node.js 18 ke atas.
- Untuk tes: Node.js 20 ke atas (diuji di Node 22).

## Instalasi

Tidak ada langkah instal. Salin folder proyek.

## Menjalankan untuk development

Service worker dan modul butuh HTTP, bukan `file://`. Jalankan server statis dari folder proyek:

```
python3 -m http.server 8080
```

atau

```
npx serve .
```

Buka `http://localhost:8080/genesis.html`.

## Build dan production

Tidak ada build. Folder yang sama langsung dipakai sebagai situs statis. Untuk production, unggah isi folder ke hosting statis (lihat bagian deployment).

## Privasi dan font

Saat halaman dibuka, peramban meminta CSS dan berkas font ke `fonts.googleapis.com` dan `fonts.gstatic.com`. Google dapat melihat alamat IP dan user agent. Progres, jawaban kuis, dan data lab tidak dikirim ke mana pun. Setelah font termuat sekali, service worker menyimpannya sehingga tetap tampil offline. Bila font tidak termuat, Genesis memakai serif dan sans sistem dan tetap utuh.

Ingin tanpa pihak ketiga? Unduh berkas `.woff2` Fraunces dan Plus Jakarta Sans, simpan di folder proyek, ganti tiga tag `<link>` font di `genesis.html` dengan `@font-face` di `genesis.css`, dan tambahkan berkasnya ke daftar `BERKAS` di `sw.js`.

## Variabel environment

Tidak ada. Genesis tidak memakai backend, API key, atau `.env`. Tidak ada secrets yang perlu diatur.

## Struktur folder

```
genesis.html               kerangka halaman
genesis.css                gaya, tema terang dan gelap
genesis-app.js             router dan tampilan
genesis-core.js            penyimpanan, progres, kuis, aturan mastery (logika murni)
genesis-data.js            registri konten dan validator
genesis-konten-level0-1.js lesson dan glosarium Level 0 dan 1
genesis-konten-level2-3.js lesson dan glosarium Level 2 dan 3
genesis-konten-level4.js   lesson dan glosarium Level 4
genesis-diagram.js         diagram SVG
genesis-lab-logika.js      logika deterministik enam lab (reducer, validasi, selector); tampilan lab ada di genesis-app.js
genesis-hash.js            SHA-256, RIPEMD-160, HMAC, Base58Check, Merkle, header blok
genesis-kunci.js           secp256k1, ECDSA, alamat (TEST ONLY)
sw.js                      service worker
manifest.webmanifest       manifest PWA
genesis-ikon.svg           ikon
test/*.test.js             tes node --test
docs/                      PRD, ADR, ERD, UI_UX
```

## Tes dan lint

```
node --test
```

Tes mencakup hash dan kunci (vektor uji publik), validator konten, reducer lab, aturan mastery, dan penyimpanan. Tidak ada linter bawaan. Uji antarmuka dilakukan manual memakai daftar periksa di `docs/UI_UX.md` bagian 13 dan 14.

### Status uji

Dijalankan pada 18 November 2026 di lingkungan pengembangan (Node v22, Chromium lewat Playwright).

| Pemeriksaan | Hasil |
|---|---|
| `node --test` (27 tes: konten, kuis, mastery, penyimpanan, hash, kunci, 6 lab) | 27 lulus, 0 gagal |
| Klik-tembus 46 kontrol: 5 tab nav, tombol hero, daftar isi sidebar, bilah progres baca, tombol tema (dua arah), kuis (kosong, terjawab, coba lagi), tandai selesai, dialog cari (buka, Escape, Tutup, kirim, saran kata, hasil kosong), 8 jenis halaman, filter glosarium, 6 lab (4 diinteraksikan), pengaturan (ukuran teks, tema, reset dibatalkan), keyboard, reduced motion | Lulus semua, tanpa galat konsol |
| Tangkapan layar 1280 px dan 390 px, terang dan gelap (beranda, lesson, level, lab, dialog, pengaturan): tanpa gulir horizontal | Lulus |
| Kontras 24 pasangan token (terang dan gelap), semua minimal 4,5:1 | Lulus (dihitung) |
| Font Google Fonts | Tidak terlihat di lingkungan uji (jaringan keluar diblokir). Tampilan diuji dengan font cadangan. Periksa tampilan dengan font asli saat deploy |
| Mode offline lewat service worker | Tidak diuji ulang di v2.1.0 (`sw.js` berubah: ada cache font). Uji muat ulang tanpa jaringan setelah deploy |
| Safari, Firefox, perangkat sentuh sungguhan | Belum dijalankan |
| Pembaca layar (NVDA, VoiceOver) | Belum dijalankan |
| Lighthouse dan metrik performa | Tidak diukur |

## Catatan deployment

- GitHub Pages: unggah isi folder ke cabang yang dipublikasikan. Berkas masuk akhir adalah `genesis.html`. Bila ingin URL akar, tambahkan salinan atau pengalihan sesuai kebutuhan Anda.
- Setiap rilis: naikkan nama cache di `sw.js` (`genesis-v2.1.0` dan seterusnya) agar pengguna mendapat versi baru.
- Service worker hanya aktif lewat HTTPS atau `localhost`.

## Batasan yang diketahui

- Kriptografi ditulis sendiri untuk belajar. Tidak tahan serangan waktu dan belum diaudit. Jangan dipakai menjaga dana nyata.
- Progres hanya ada di satu peramban. Membersihkan data situs menghapusnya. Gunakan Pengaturan, Ekspor progres (JSON) untuk cadangan dan Impor untuk memulihkan.
- Uji antarmuka belum menjadi suite otomatis di repositori. Klik-tembus peramban dijalankan satu kali saat verifikasi (lihat Status uji), skripnya tidak disertakan.
- Ulasan soal salah disederhanakan: daftar lesson dan checkpoint dengan soal salah pada percobaan terakhir.
- Konten Level 2 dan 3 menyebut kerentanan duplikasi transaksi pohon Merkle (CVE-2012-2459). Cek ke dokumentasi Bitcoin Core sebelum dipublikasikan luas.
- Font Google Fonts melibatkan permintaan ke pihak ketiga (lihat Privasi dan font).
- Level 5 sampai 8 dan capstone belum ditulis. Lab proof of work dan fork tersedia sebagai pratinjau Level 5.

## Troubleshooting

| Masalah | Penyebab dan solusi |
|---|---|
| Halaman kosong saat dibuka dari berkas | Buka lewat server statis, bukan `file://`. |
| Perubahan tidak muncul | Cache service worker. Muat ulang keras atau naikkan nama cache. |
| Progres tidak tersimpan | Mode privat atau penyimpanan diblokir. Banner di aplikasi akan memberi tahu. |
| Tes gagal dengan galat BigInt | Gunakan Node 20 ke atas. |
| Judul tampil dengan font biasa | Font Google belum termuat (offline atau diblokir). Tampilan tetap berfungsi. Muat ulang saat online, atau pakai font lokal (lihat Privasi dan font). |

## Rencana pengembangan

| Versi | Isi |
|---|---|
| 2.2.0 | Level 5: mining dan konsensus, ulasan berjarak lebih kaya |
| 2.3.0 | Level 6 (wallet dan keamanan) dan Level 7 (script dan Taproot) |
| 3.0.0 | Level 8 dan capstone |

## Dokumen

- [docs/PRD.md](docs/PRD.md)
- [docs/ADR.md](docs/ADR.md)
- [docs/ERD.md](docs/ERD.md)
- [docs/UI_UX.md](docs/UI_UX.md)

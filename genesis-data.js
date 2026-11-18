/* Genesis v2.0.0, genesis-data.js
 * Registri konten (level, lesson, glosarium, lab, sumber) dan validator.
 * Konten ditulis di berkas genesis-konten-*.js dan didaftarkan lewat GenesisData.add*().
 * UI hanya membaca dari sini, tidak menyimpan teks pelajaran sendiri.
 */
(function (root) {
  'use strict';

  const store = { levels: [], lessons: [], glossary: [], labs: [], sources: [] };

  const LEVELS = [
    { id: 0, slug: 'level-0', title: 'Orientasi', status: 'tersedia', desc: 'Peta belajar, cara memakai Genesis, dan apa yang tidak dilakukan situs ini.' },
    { id: 1, slug: 'level-1', title: 'Uang dan masalah digital', status: 'tersedia', desc: 'Dari fungsi uang sampai kenapa uang digital butuh cara mencegah pemakaian ganda.' },
    { id: 2, slug: 'level-2', title: 'Jaringan dan kriptografi dasar', status: 'tersedia', desc: 'Jaringan terdesentralisasi, hash, kunci publik dan privat, tanda tangan digital.' },
    { id: 3, slug: 'level-3', title: 'Arsitektur Bitcoin', status: 'tersedia', desc: 'Blok, header, pohon Merkle, node, relay, wallet, alamat, dan script.' },
    { id: 4, slug: 'level-4', title: 'Transaksi Bitcoin', status: 'tersedia', desc: 'UTXO, input, output, TXID, kembalian, fee, tanda tangan, validasi, dan konfirmasi.' },
    { id: 5, slug: 'level-5', title: 'Mining dan konsensus', status: 'rencana', desc: 'Proof of work, target kesulitan, rantai terberat, fork, dan reorg. Lab pratinjau sudah tersedia.' },
    { id: 6, slug: 'level-6', title: 'Wallet dan keamanan', status: 'rencana', desc: 'Seed, derivasi kunci, dan kebiasaan aman. Belum ditulis.' },
    { id: 7, slug: 'level-7', title: 'Script dan Taproot', status: 'rencana', desc: 'Script lanjutan, multisig, dan Taproot. Belum ditulis.' },
    { id: 8, slug: 'level-8', title: 'Proyek akhir', status: 'rencana', desc: 'Capstone yang menyatukan semua level. Belum ditulis.' },
  ];

  const LABS = [
    { id: 'lab-double-spend', slug: 'double-spending', title: 'Double spending', level: 1, mainFor: 1, desc: 'Kirim koin yang sama ke dua penerima dan lihat bagaimana urutan di buku besar menentukan mana yang sah.' },
    { id: 'lab-hash', slug: 'hash-playground', title: 'Hash playground', level: 2, mainFor: 2, desc: 'Ubah satu karakter, lihat hash SHA-256 berubah total. Bandingkan dua teks sebelah-menyebelah.' },
    { id: 'lab-signature', slug: 'kunci-dan-tanda-tangan', title: 'Kunci dan tanda tangan', level: 2, mainFor: null, desc: 'Buat kunci uji sementara, tandatangani pesan, lalu coba verifikasi dengan pesan yang diubah.' },
    { id: 'lab-tamper', slug: 'blockchain-diubah', title: 'Mengubah blockchain', level: 3, mainFor: 3, desc: 'Ubah isi satu blok dan lihat hash blok sesudahnya tidak cocok lagi.' },
    { id: 'lab-utxo', slug: 'penyusun-utxo', title: 'Penyusun UTXO', level: 4, mainFor: 4, desc: 'Pilih input, atur output, hitung kembalian dan fee, lalu lihat apakah transaksi valid.' },
    { id: 'lab-pow', slug: 'proof-of-work', title: 'Proof of work dan fork', level: 5, mainFor: null, desc: 'Cari nonce untuk target tertentu, lalu bandingkan dua rantai berdasarkan total kerja. Pratinjau Level 5.' },
  ];

  const SOURCES = [
    { id: 'src-whitepaper', title: 'Bitcoin: A Peer-to-Peer Electronic Cash System', author: 'Satoshi Nakamoto', year: 2008, url: 'https://bitcoin.org/bitcoin.pdf', note: 'Makalah asli, 31 Oktober 2008.' },
    { id: 'src-devdocs', title: 'Bitcoin Developer Documentation', author: 'bitcoin.org', year: null, url: 'https://developer.bitcoin.org/', note: 'Penjelasan transaksi, blok, dan jaringan untuk pengembang.' },
    { id: 'src-bips', title: 'Bitcoin Improvement Proposals (BIP)', author: 'Komunitas Bitcoin', year: null, url: 'https://github.com/bitcoin/bips', note: 'Spesifikasi resmi usulan perubahan dan standar.' },
    { id: 'src-bitcoincore', title: 'Bitcoin Core', author: 'Proyek Bitcoin Core', year: null, url: 'https://bitcoincore.org/', note: 'Implementasi referensi dan dokumentasinya.' },
    { id: 'src-masteringbitcoin', title: 'Mastering Bitcoin, edisi ke-3', author: 'Andreas M. Antonopoulos dan David A. Harding', year: 2023, url: 'https://github.com/bitcoinbook/bitcoinbook', note: 'Buku terbuka, tersedia gratis di GitHub.' },
    { id: 'src-fips180', title: 'FIPS 180-4, Secure Hash Standard', author: 'NIST', year: 2015, url: 'https://csrc.nist.gov/pubs/fips/180-4/upd1/final', note: 'Spesifikasi SHA-256.' },
    { id: 'src-sec2', title: 'SEC 2: Recommended Elliptic Curve Domain Parameters', author: 'Certicom Research', year: 2010, url: 'https://www.secg.org/sec2-v2.pdf', note: 'Parameter kurva secp256k1.' },
    { id: 'src-rfc6979', title: 'RFC 6979, Deterministic Usage of DSA and ECDSA', author: 'T. Pornin', year: 2013, url: 'https://www.rfc-editor.org/rfc/rfc6979', note: 'Nonce deterministik untuk tanda tangan.' },
  ];

  const D = {
    store,
    levels: LEVELS,
    labs: LABS,
    sources: SOURCES,

    addLessons(list) { store.lessons.push(...list); },
    addGlossary(list) { store.glossary.push(...list); },

    lessons() { return store.lessons.slice().sort((a, b) => a.level - b.level || a.order - b.order); },
    lessonsOfLevel(levelId) { return D.lessons().filter((l) => l.level === levelId); },
    lessonById(id) { return store.lessons.find((l) => l.id === id) || null; },
    lessonBySlug(slug) { return store.lessons.find((l) => l.slug === slug) || null; },
    levelById(id) { return LEVELS.find((l) => l.id === Number(id)) || null; },
    labById(id) { return LABS.find((l) => l.id === id) || null; },
    labBySlug(slug) { return LABS.find((l) => l.slug === slug) || null; },
    glossary() { return store.glossary.slice().sort((a, b) => a.term.localeCompare(b.term, 'id')); },
    termById(id) { return store.glossary.find((g) => g.id === id) || null; },
    sourceById(id) { return SOURCES.find((s) => s.id === id) || null; },

    /* Urutan belajar tunggal: dipakai tombol "Lanjut" dan jalur belajar. */
    sequence() { return D.lessons().filter((l) => D.levelById(l.level).status === 'tersedia'); },

    /* Checkpoint level: ambil hingga `jumlah` soal, bergilir antar-lesson, soal aplikasi lebih dulu. Deterministik. */
    checkpointQuestions(levelId, jumlah = 8) {
      const lessons = D.lessonsOfLevel(levelId);
      const pools = lessons.map((l) => l.quiz.slice().sort((a, b) => Number(!!b.application) - Number(!!a.application)).map((q) => Object.assign({ lessonId: l.id }, q)));
      const out = [];
      let round = 0;
      while (out.length < jumlah && pools.some((p) => p.length > round)) {
        for (const p of pools) { if (p[round] && out.length < jumlah) out.push(p[round]); }
        round++;
      }
      return out;
    },

    /* Cari teks di judul lesson, ringkasan, dan glosarium. Mengembalikan hasil terurut sederhana. */
    search(query) {
      const q = String(query || '').trim().toLowerCase();
      if (q.length < 2) return [];
      const hasil = [];
      for (const l of D.lessons()) {
        const judul = l.title.toLowerCase();
        const badan = (l.hook + ' ' + l.summary.join(' ')).toLowerCase();
        if (judul.includes(q)) hasil.push({ tipe: 'lesson', id: l.id, label: l.title, skor: 3, ket: 'Level ' + l.level });
        else if (badan.includes(q)) hasil.push({ tipe: 'lesson', id: l.id, label: l.title, skor: 1, ket: 'Level ' + l.level });
      }
      for (const g of store.glossary) {
        const t = g.term.toLowerCase();
        if (t.includes(q) || (g.aliases || []).some((a) => a.toLowerCase().includes(q))) hasil.push({ tipe: 'istilah', id: g.id, label: g.term, skor: 3, ket: 'Glosarium' });
        else if (g.definition.toLowerCase().includes(q)) hasil.push({ tipe: 'istilah', id: g.id, label: g.term, skor: 1, ket: 'Glosarium' });
      }
      return hasil.sort((a, b) => b.skor - a.skor || a.label.localeCompare(b.label, 'id'));
    },

    /* Validasi seluruh konten. Dipakai tes dan juga ditampilkan pada halaman Tentang bila ada galat. */
    validate() {
      const errors = [];
      const err = (m) => errors.push(m);
      const ids = new Set();
      const slugs = new Set();
      const EM = '\u2014';
      const cekTeks = (konteks, teks) => { if (typeof teks === 'string' && teks.includes(EM)) err(konteks + ': mengandung tanda pisah panjang'); };

      for (const l of store.lessons) {
        const k = 'Lesson ' + l.id;
        if (!l.id || ids.has(l.id)) err(k + ': ID kosong atau ganda');
        ids.add(l.id);
        if (!l.slug || slugs.has(l.slug)) err(k + ': slug kosong atau ganda');
        slugs.add(l.slug);
        if (!D.levelById(l.level)) err(k + ': level tidak ada');
        if (!l.title) err(k + ': judul kosong');
        if (!l.hook) err(k + ': hook kosong');
        if (!Array.isArray(l.objectives) || l.objectives.length < 1) err(k + ': tujuan belajar kosong');
        if (!Array.isArray(l.sections) || l.sections.length < 1) err(k + ': tidak punya bagian penjelasan');
        for (const s of l.sections || []) { if (!s.h || !Array.isArray(s.p) || !s.p.length) err(k + ': bagian tanpa judul atau paragraf'); cekTeks(k + ' bagian', s.h + ' ' + (s.p || []).join(' ')); }
        if (!l.technical || !l.technical.title || !Array.isArray(l.technical.p) || !l.technical.p.length) err(k + ': versi teknis kosong');
        if (!Array.isArray(l.misconceptions) || l.misconceptions.length < 1) err(k + ': miskonsepsi kosong');
        if (!Array.isArray(l.summary) || l.summary.length < 2) err(k + ': ringkasan kurang dari 2 poin');
        if (!Array.isArray(l.quiz) || l.quiz.length < 3) err(k + ': kuis kurang dari 3 soal');
        else if (!l.quiz.some((q) => q.application)) err(k + ': tidak ada soal aplikasi');
        const qids = new Set();
        for (const q of l.quiz || []) {
          if (!q.id || qids.has(q.id)) err(k + ': ID soal kosong atau ganda');
          qids.add(q.id);
          if (!q.q || !Array.isArray(q.options) || q.options.length < 3) err(k + ' soal ' + q.id + ': pertanyaan atau opsi kurang');
          else if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) err(k + ' soal ' + q.id + ': indeks jawaban tidak valid');
          if (!q.explain) err(k + ' soal ' + q.id + ': penjelasan kosong');
          cekTeks(k + ' soal ' + q.id, q.q + ' ' + (q.options || []).join(' ') + ' ' + q.explain);
        }
        cekTeks(k + ' ringkasan', (l.summary || []).join(' ') + ' ' + l.hook);
        for (const g of l.glossary || []) if (!D.termById(g)) err(k + ': istilah glosarium tidak ada: ' + g);
        for (const lb of l.labs || []) if (!D.labById(lb)) err(k + ': lab tidak ada: ' + lb);
        for (const sr of l.sources || []) if (!D.sourceById(sr)) err(k + ': sumber tidak ada: ' + sr);
      }
      for (const l of store.lessons) {
        for (const p of l.prerequisites || []) if (!ids.has(p)) err('Lesson ' + l.id + ': prasyarat tidak ada: ' + p);
      }
      /* siklus prasyarat */
      const status = {};
      const visit = (id, jalur) => {
        if (status[id] === 2) return;
        if (status[id] === 1) { err('Siklus prasyarat: ' + jalur.concat(id).join(' > ')); return; }
        status[id] = 1;
        const l = D.lessonById(id);
        for (const p of (l && l.prerequisites) || []) visit(p, jalur.concat(id));
        status[id] = 2;
      };
      for (const l of store.lessons) visit(l.id, []);

      const tids = new Set();
      for (const g of store.glossary) {
        if (!g.id || tids.has(g.id)) err('Istilah ' + g.id + ': ID kosong atau ganda');
        tids.add(g.id);
        if (!g.term || !g.definition) err('Istilah ' + g.id + ': istilah atau definisi kosong');
        cekTeks('Istilah ' + g.id, g.term + ' ' + g.definition);
      }
      for (const g of store.glossary) for (const r of g.related || []) if (!tids.has(r)) err('Istilah ' + g.id + ': relasi tidak ada: ' + r);
      return { ok: errors.length === 0, errors };
    },
  };

  root.GenesisData = D;
  if (typeof module !== 'undefined' && module.exports) module.exports = D;
})(typeof self !== 'undefined' ? self : globalThis);

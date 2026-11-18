/* Genesis v2.1.0, genesis-app.js
 * Router berbasis hash, tampilan, kuis, dan lab. Logika ada di genesis-core.js dan genesis-lab-logika.js.
 * Semua teks dari konten disisipkan lewat createTextNode, bukan innerHTML, kecuali SVG diagram buatan sendiri.
 */
(function () {
  'use strict';
  const D = window.GenesisData;
  const C = window.GenesisCore;
  const LAB = window.GenesisLab;
  const DG = window.GenesisDiagram;
  const Hs = window.Hash;

  let ls = null;
  try { ls = window.localStorage; } catch (e) { ls = null; }
  const repo = C.createRepo(C.createStorage(ls), D).load();

  const app = document.getElementById('app');
  const navEl = document.getElementById('nav');

  /* ---------- helper DOM ---------- */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === false || v === null || v === undefined) continue;
        if (k === 'class') el.className = v;
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'value') el.value = v;
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, v);
      }
    }
    add(el, kids);
    return el;
  }
  function add(el, kids) {
    for (const k of kids) {
      if (k === null || k === undefined || k === false) continue;
      if (Array.isArray(k)) add(el, k);
      else if (k instanceof Node) el.appendChild(k);
      else el.appendChild(document.createTextNode(String(k)));
    }
  }
  /* Markup mini: **tebal** dan `kode`. Hasilnya node, aman dari injeksi. */
  function mk(text) {
    const frag = document.createDocumentFragment();
    String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/).forEach((part) => {
      if (!part) return;
      if (part.startsWith('**')) frag.appendChild(h('strong', null, part.slice(2, -2)));
      else if (part.startsWith('`')) frag.appendChild(h('code', null, part.slice(1, -1)));
      else frag.appendChild(document.createTextNode(part));
    });
    return frag;
  }
  const para = (t) => h('p', null, mk(t));
  const link = (href, ...k) => h('a', { href }, ...k);
  const rupiahNo = (n) => String(n);

  function icon(nama) {
    const p = {
      home: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
      buku: 'M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6M20 4v14h-6',
      lab: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3',
      istilah: 'M5 4h14v16H5zM9 9h6M9 13h6',
      atur: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3',
    }[nama];
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(ns, 'path'); path.setAttribute('d', p); svg.appendChild(path);
    return svg;
  }

  /* SVG statis buatan sendiri (tanpa data pengguna), jadi aman lewat innerHTML. */
  function svgNode(str) { const w = document.createElement('div'); w.innerHTML = str; return w.firstElementChild; }
  /* Pekerjaan setelah halaman terpasang (pengamat scroll) dan pembersihnya saat pindah halaman. */
  let pascaRender = null; let pembersih = [];

  let toastEl = null; let toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = h('div', { class: 'banner banner-ok', role: 'status', style: 'position:fixed;left:16px;right:16px;bottom:84px;z-index:60;max-width:520px;margin:0 auto;display:none' });
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg; toastEl.style.display = 'block';
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastEl.style.display = 'none'; }, 4000);
  }

  /* ---------- tema ---------- */
  function applyPrefs() {
    const p = repo.prefs;
    const root = document.documentElement;
    if (p.theme === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', p.theme);
    if (p.textSize === 'large') root.setAttribute('data-size', 'large'); else root.removeAttribute('data-size');
    if (p.reducedMotion === 'on') root.setAttribute('data-motion', 'off'); else root.removeAttribute('data-motion');
    segarTombolTema();
  }
  const IKON_BULAN = 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z';
  const IKON_MATAHARI = 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1';
  function temaGelap() {
    const t = document.documentElement.getAttribute('data-theme');
    return t === 'dark' || (t !== 'light' && !!window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
  function segarTombolTema() {
    const gelap = temaGelap();
    const btn = document.getElementById('btn-tema'); const jalur = document.getElementById('ikon-tema');
    if (btn) btn.setAttribute('aria-label', gelap ? 'Ganti ke tema terang' : 'Ganti ke tema gelap');
    if (jalur) jalur.setAttribute('d', gelap ? IKON_MATAHARI : IKON_BULAN);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', gelap ? '#14151A' : '#FAF6EE');
  }

  /* ---------- label status ---------- */
  const STATUS_LABEL = { 'not-started': 'Belum dimulai', 'in-progress': 'Sedang dipelajari', completed: 'Selesai dibaca', mastered: 'Dikuasai' };
  const STATUS_MARK = { 'not-started': '', 'in-progress': '...', completed: 'OK', mastered: 'A+' };
  function nodeKelas(st) { return st === 'mastered' ? 'node kuasai' : st === 'completed' ? 'node selesai' : st === 'in-progress' ? 'node jalan' : 'node'; }

  /* ---------- kuis ---------- */
  function buatKuis(questions, kunci, lessonId, opsi) {
    opsi = opsi || {};
    const form = h('form', { class: 'kuis', novalidate: true });
    const wadahHasil = h('div', { 'aria-live': 'polite' });
    const galatEl = h('div', { role: 'alert' });
    const jawab = {};
    const soalEls = [];

    function bangun() {
      form.innerHTML = '';
      Object.keys(jawab).forEach((k) => delete jawab[k]);
      soalEls.length = 0;
      form.appendChild(h('h2', { style: 'margin-top:0' }, opsi.judul || 'Cek pemahaman'));
      if (opsi.petunjuk) form.appendChild(h('p', { class: 'muted' }, opsi.petunjuk));
      questions.forEach((q, i) => {
        const nama = 'q-' + kunci + '-' + q.id;
        const opsiEls = q.options.map((teks, j) => {
          const id = nama + '-' + j;
          const input = h('input', { type: 'radio', name: nama, id, value: String(j), onchange: () => { jawab[q.id] = j; galatEl.textContent = ''; } });
          return h('label', { class: 'opsi', for: id }, input, h('span', null, mk(teks)));
        });
        const umpan = h('div');
        const fs = h('fieldset', null, h('legend', null, (i + 1) + '. ', mk(q.q), q.application ? h('span', { class: 'tag tag-info', style: 'margin-left:8px' }, 'Soal penerapan') : null), opsiEls, umpan);
        const wrap = h('div', { class: 'soal' }, fs);
        soalEls.push({ q, opsiEls, umpan });
        form.appendChild(wrap);
      });
      form.appendChild(galatEl);
      form.appendChild(h('div', { class: 'baris' }, h('button', { class: 'btn btn-utama', type: 'submit' }, 'Periksa jawaban')));
      form.appendChild(wadahHasil);
      wadahHasil.innerHTML = '';
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const belum = questions.filter((q) => !Number.isInteger(jawab[q.id])).length;
      if (belum) { galatEl.innerHTML = ''; galatEl.appendChild(h('p', { class: 'banner banner-err' }, belum + ' soal belum dijawab. Jawab semua soal dulu, lalu periksa.')); return; }
      const hasil = repo.catatKuis(kunci, questions, jawab, lessonId);
      soalEls.forEach(({ q, opsiEls, umpan }) => {
        const benar = jawab[q.id] === q.answer;
        opsiEls.forEach((lab, j) => {
          const inp = lab.querySelector('input'); inp.disabled = true;
          if (j === q.answer) { lab.classList.add('benar'); lab.appendChild(h('span', { class: 'pil' }, '(jawaban benar)')); }
          else if (j === jawab[q.id]) { lab.classList.add('salah'); lab.appendChild(h('span', { class: 'pil' }, '(jawabanmu)')); }
        });
        umpan.className = 'umpan';
        umpan.appendChild(h('strong', null, benar ? 'Benar. ' : 'Belum tepat. '));
        umpan.appendChild(mk(q.explain));
      });
      form.querySelector('button[type="submit"]').disabled = true;
      const lulus = C.lessonMasteredBy(hasil);
      let pesan;
      if (opsi.checkpoint) {
        const lab = D.labs.find((l) => l.mainFor === opsi.level);
        const labOk = lab ? repo.labSelesai(lab.id) : true;
        if (hasil.pct >= C.AMBANG && labOk) pesan = 'Skor checkpoint memenuhi batas 80% dan lab utama sudah selesai. Level ini dikuasai.';
        else if (hasil.pct >= C.AMBANG) pesan = 'Skor sudah memenuhi batas 80%. Level dikuasai setelah lab utama "' + lab.title + '" selesai.';
        else pesan = 'Batas penguasaan level adalah 80%. Baca ulang lesson pada soal yang salah, lalu coba lagi.';
      } else if (lulus) pesan = 'Lesson ini dikuasai: skor minimal 80% dan soal penerapan terjawab benar.';
      else if (hasil.pct >= C.AMBANG) pesan = 'Skor sudah 80% atau lebih, tetapi soal penerapan belum terjawab benar. Coba lagi untuk menguasai lesson ini.';
      else pesan = 'Skor di bawah 80%. Lesson tetap tercatat selesai. Baca ulang bagian yang meragukan lalu coba lagi.';
      wadahHasil.innerHTML = '';
      wadahHasil.appendChild(h('div', { class: 'hasil ' + (hasil.pct >= C.AMBANG && (opsi.checkpoint || lulus) ? 'ok' : 'belum') },
        h('strong', null, 'Skor ' + hasil.score + ' dari ' + hasil.total + ' (' + hasil.pct + '%)'), h('p', { style: 'margin:.5em 0 0' }, pesan),
        h('div', { class: 'baris', style: 'margin-top:12px' }, h('button', { class: 'btn', type: 'button', onclick: () => { bangun(); form.scrollIntoView({ block: 'start' }); } }, 'Coba lagi'))));
      if (opsi.onSelesai) opsi.onSelesai(hasil);
    });
    bangun();
    return form;
  }

  /* ---------- tampilan: beranda ---------- */
  function rantaiHero() {
    const B = [
      ['Blok 0', '000000000019d668', '0000000000000000'],
      ['Blok 1', '00000000839a8e68', '000000000019d668'],
      ['Blok 2', '000000006a625f06', '00000000839a8e68'],
      ['Blok 3', '0000000082b50155', '000000006a625f06'],
    ];
    const P = 108; const T = 88; let s = '';
    B.forEach(([nama, hash, prev], i) => {
      const y = 12 + i * P;
      s += '<g class="rt-b rt-b' + (i + 1) + '"><rect class="rt-blok" x="12" y="' + y + '" width="488" height="' + T + '" rx="14"/>' +
        '<text class="rt-judul" x="32" y="' + (y + 30) + '">' + nama + '</text>' +
        '<text class="rt-label" x="32" y="' + (y + 56) + '">hash</text><text class="' + (i < 3 ? 'rt-cocok' : 'rt-hash') + '" x="82" y="' + (y + 56) + '">' + hash + '...</text>' +
        '<text class="rt-label" x="32" y="' + (y + 78) + '">prev</text><text class="' + (i > 0 ? 'rt-cocok' : 'rt-hash') + '" x="82" y="' + (y + 78) + '">' + prev + '...</text></g>';
      if (i < 3) {
        const a = y + 51; const b = y + P + 73;
        s += '<g class="rt-t rt-t' + (i + 1) + '"><path class="rt-tali" d="M290 ' + a + ' H470 V' + b + ' H290"/><circle class="rt-simpul" cx="290" cy="' + a + '" r="4"/><circle class="rt-simpul" cx="290" cy="' + b + '" r="4"/></g>';
      }
    });
    return '<svg viewBox="0 0 512 436" role="img" aria-labelledby="rh-j rh-d" focusable="false"><title id="rh-j">Empat blok pertama Bitcoin</title>' +
      '<desc id="rh-d">Empat blok berurutan. Hash tiap blok tertulis lagi sebagai hash blok sebelumnya di blok berikutnya, ditandai garis putus-putus.</desc>' + s + '</svg>';
  }

  function viewHome() {
    const lanjut = repo.lanjut();
    const seq = D.sequence();
    const kuasai = seq.filter((l) => repo.statusLesson(l.id) === 'mastered').length;
    const selesai = seq.filter((l) => ['completed', 'mastered'].includes(repo.statusLesson(l.id))).length;
    const mulaiBaru = !seq.some((l) => repo.statusLesson(l.id) !== 'not-started');
    const labSelesai = D.labs.filter((lb) => repo.labSelesai(lb.id)).length;
    const pctTotal = seq.length ? Math.round((selesai / seq.length) * 100) : 0;
    const hero = h('section', { class: 'hero' },
      h('div', null,
        h('h1', null, 'Bitcoin, dijelaskan dari uang sampai transaksi'),
        h('p', { class: 'hero-lead' }, 'Satu konsep per pelajaran, kuis kecil di akhir, dan lab yang bisa kamu ubah-ubah sendiri. Tidak perlu latar belakang teknis.'),
        h('div', { class: 'baris' },
          lanjut ? h('a', { class: 'btn btn-utama', href: '#/learn/lesson/' + lanjut.slug }, mulaiBaru ? 'Mulai dari lesson pertama' : 'Lanjut: ' + lanjut.title) : h('a', { class: 'btn btn-utama', href: '#/learn' }, 'Lihat semua level'),
          h('a', { class: 'btn', href: '#/learn/path' }, 'Lihat jalur belajar')),
        h('ul', { class: 'bukti' },
          h('li', null, 'Bisa dipakai offline setelah dibuka sekali'),
          h('li', null, 'Semua lab berupa simulasi, tanpa dana atau kunci asli'),
          h('li', null, 'Progres tersimpan di perangkatmu, tanpa akun'))),
      h('figure', { class: 'hero-visual' }, svgNode(rantaiHero()),
        h('figcaption', null, 'Empat blok pertama Bitcoin yang asli. Tiap blok menyimpan hash blok di atasnya, dan itulah yang membuatnya jadi rantai.')));

    const ring = h('div', { class: 'ring', role: 'img', 'aria-label': pctTotal + ' persen lesson selesai dibaca' },
      svgNode('<svg viewBox="0 0 36 36" aria-hidden="true" focusable="false"><circle class="lat" cx="18" cy="18" r="15.5" fill="none" stroke-width="4"/><circle class="isi" cx="18" cy="18" r="15.5" fill="none" stroke-width="4" stroke-dasharray="97.4" stroke-dashoffset="' + (97.4 * (1 - pctTotal / 100)).toFixed(1) + '"/></svg>'),
      h('span', { 'aria-hidden': 'true' }, pctTotal + '%'));
    const ringkas = h('div', { class: 'lanjut' }, ring,
      h('div', { class: 'lanjut-isi' }, h('strong', null, selesai + ' dari ' + seq.length + ' lesson selesai dibaca'),
        h('span', null, kuasai + ' dikuasai, ' + labSelesai + ' dari ' + D.labs.length + ' lab selesai')));

    const tersedia = D.levels.filter((l) => l.status === 'tersedia');
    const fitur = (lanjut && D.levelById(lanjut.level)) || tersedia[0];
    const ringkasLv = (lv) => { const r = repo.ringkasanLevel(lv.id); return { r, pct: r.total ? Math.round((r.selesai / r.total) * 100) : 0 }; };
    const barLv = (lv, pct) => h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(pct), 'aria-label': 'Progres Level ' + lv.id }, h('span', { style: 'width:' + pct + '%' }));
    const kartuFitur = (() => {
      const { r, pct } = ringkasLv(fitur);
      return h('a', { class: 'level-fitur', href: '#/learn/level/' + fitur.id },
        h('div', { class: 'level-kepala' }, h('span', { class: 'blok-no besar' + (repo.levelStatus(fitur.id) ? ' kuasai' : ''), 'aria-hidden': 'true' }, String(fitur.id)),
          repo.levelStatus(fitur.id) ? h('span', { class: 'tag tag-ok' }, 'Level dikuasai') : h('span', { class: 'tag tag-info' }, mulaiBaru ? 'Titik mulai' : 'Sedang kamu pelajari')),
        h('h3', null, 'Level ' + fitur.id + ': ' + fitur.title), h('p', null, fitur.desc),
        h('div', { class: 'kaki' }, barLv(fitur, pct), h('span', { class: 'kecil muted' }, r.selesai + ' dari ' + r.total + ' lesson selesai, ' + r.kuasai + ' dikuasai'),
          h('span', { class: 'btn btn-utama' }, 'Buka Level ' + fitur.id)));
    })();
    const baris = tersedia.filter((l) => l.id !== fitur.id).map((lv) => {
      const { r, pct } = ringkasLv(lv);
      return h('li', null, h('a', { class: 'level-baris', href: '#/learn/level/' + lv.id },
        h('span', { class: 'blok-no' + (repo.levelStatus(lv.id) ? ' kuasai' : ''), 'aria-hidden': 'true' }, String(lv.id)),
        h('div', null, h('strong', null, 'Level ' + lv.id + ': ' + lv.title), h('span', { class: 'kecil' }, r.selesai + ' dari ' + r.total + ' lesson selesai' + (repo.levelStatus(lv.id) ? ', dikuasai' : '')), barLv(lv, pct))));
    });
    const labs = D.labs.map((lb) => h('li', null, h('a', { href: '#/labs/' + lb.slug },
      h('div', null, h('strong', null, lb.title), h('span', { class: 'kecil' }, lb.desc)), repo.labSelesai(lb.id) ? h('span', { class: 'tag tag-ok' }, 'Selesai') : null)));
    return h('div', null, hero, ringkas,
      h('div', { class: 'bagian-judul' }, h('h2', null, 'Jalur belajar'), h('p', null, 'Urutan ini saran. Semua level bisa dibuka kapan saja.')),
      h('div', { class: 'level-peta' }, kartuFitur, h('ul', { class: 'level-daftar' }, baris)),
      D.levels.some((l) => l.status === 'rencana') ? h('p', { class: 'menyusul' }, 'Level 5 sampai 8 dan proyek akhir belum ditulis di v2.1.0. Daftarnya ada di ', link('#/learn', 'halaman Belajar'), ' dengan status rencana.') : null,
      h('section', { class: 'layar-lab' },
        h('div', null, h('h2', null, 'Coba sendiri, bukan cuma baca'),
          h('p', null, D.labs.length + ' lab simulasi yang bisa kamu ubah-ubah: ganti satu huruf lalu lihat hash berubah, kirim koin yang sama dua kali, atau cari nonce sendiri. Semuanya berjalan di perangkatmu.')),
        h('ul', null, labs)));
  }

  /* ---------- tampilan: belajar ---------- */
  function viewLearn() {
    const kartu = D.levels.map((lv) => {
      const tersedia = lv.status === 'tersedia';
      const r = repo.ringkasanLevel(lv.id);
      return h('li', { class: 'kartu level-kartu' },
        h('span', { class: 'blok-no' + (tersedia && repo.levelStatus(lv.id) ? ' kuasai' : ''), 'aria-hidden': 'true' }, String(lv.id)),
        h('div', null,
          h('div', { class: 'level-kepala' },
            h('h2', null, tersedia ? link('#/learn/level/' + lv.id, 'Level ' + lv.id + ': ' + lv.title) : 'Level ' + lv.id + ': ' + lv.title),
            tersedia ? (repo.levelStatus(lv.id) ? h('span', { class: 'tag tag-ok' }, 'Dikuasai') : h('span', { class: 'tag' }, r.selesai + '/' + r.total + ' selesai')) : h('span', { class: 'tag tag-rencana' }, 'Rencana, belum tersedia')),
          h('p', { class: 'muted', style: 'margin:.5em 0 0' }, lv.desc)));
    });
    const ulang = repo.soalUlasan();
    const ulangItems = ulang.map((u) => {
      if (u.kunci.startsWith('cp-level-')) { const n = u.kunci.slice(9); return h('li', null, link('#/checkpoint/' + n, 'Checkpoint Level ' + n), ' (' + u.wrong.length + ' soal salah)'); }
      const l = D.lessonById(u.kunci); return l ? h('li', null, link('#/learn/lesson/' + l.slug, l.title), ' (' + u.wrong.length + ' soal salah)') : null;
    });
    return h('div', { class: 'narrow' }, h('h1', null, 'Belajar'),
      para('Urutan di bawah adalah saran, bukan kunci. Semua lesson yang tersedia bisa dibuka kapan saja.'),
      h('p', null, h('a', { class: 'btn', href: '#/learn/path' }, 'Lihat sebagai jalur satu daftar')),
      h('ol', { style: 'list-style:none;padding:0;display:grid;gap:12px' }, kartu),
      ulang.length ? h('div', { class: 'banner' }, h('strong', null, 'Perlu diulang'), h('p', { style: 'margin:.3em 0' }, 'Kuis dengan soal salah pada percobaan terakhir:'), h('ul', { style: 'margin:0' }, ulangItems)) : null,
      h('p', null, h('a', { href: '#/capstone' }, 'Proyek akhir (capstone)'), ' belum tersedia di v2.1.0.'));
  }

  function viewPath() {
    const items = D.sequence().map((l, i) => {
      const st = repo.statusLesson(l.id);
      return h('li', null, h('span', { class: nodeKelas(st), 'aria-hidden': 'true' }, String(i + 1)),
        h('a', { class: 'item-lesson', href: '#/learn/lesson/' + l.slug },
          h('strong', null, l.title), h('span', { class: 'kecil muted' }, 'Level ' + l.level + ' · ' + l.minutes + ' menit · ' + STATUS_LABEL[st])));
    });
    return h('div', { class: 'narrow' }, crumb([['Belajar', '#/learn'], 'Jalur belajar']), h('h1', null, 'Jalur belajar'),
      para('Satu urutan dari lesson pertama sampai Level 4. Kotak bernomor menunjukkan status: polos belum dimulai, amber sedang dipelajari, teal muda selesai dibaca, teal penuh dikuasai. Teks di tiap baris juga menyebut statusnya.'),
      h('ol', { class: 'jalur' }, items));
  }

  function crumb(parts) {
    const el = h('nav', { class: 'crumb', 'aria-label': 'Jejak halaman' });
    parts.forEach((p, i) => {
      if (i) el.appendChild(document.createTextNode(' / '));
      if (Array.isArray(p)) el.appendChild(h('a', { href: p[1] }, p[0])); else el.appendChild(h('span', { 'aria-current': 'page' }, p));
    });
    return el;
  }

  function viewLevel(id) {
    const lv = D.levelById(id);
    if (!lv) return viewTidakAda();
    if (lv.status !== 'tersedia') {
      return h('div', { class: 'narrow' }, crumb([['Belajar', '#/learn'], 'Level ' + lv.id]), h('h1', null, 'Level ' + lv.id + ': ' + lv.title),
        h('p', { class: 'banner' }, 'Level ini masih rencana dan belum ditulis di v2.1.0. Tidak ada materi di sini.'), para(lv.desc),
        lv.id === 5 ? h('p', null, 'Pratinjau yang sudah ada: ', link('#/labs/proof-of-work', 'lab Proof of work dan fork'), '.') : null,
        h('p', null, h('a', { class: 'btn', href: '#/learn' }, 'Kembali ke daftar level')));
    }
    const r = repo.ringkasanLevel(lv.id);
    const labUtama = D.labs.find((l) => l.mainFor === lv.id);
    const cp = repo.terbaikKuis('cp-level-' + lv.id);
    const items = D.lessonsOfLevel(lv.id).map((l) => {
      const st = repo.statusLesson(l.id);
      return h('li', null, h('span', { class: nodeKelas(st), 'aria-hidden': 'true' }, String(l.order)),
        h('a', { class: 'item-lesson', href: '#/learn/lesson/' + l.slug }, h('strong', null, l.title), h('span', { class: 'kecil muted' }, l.minutes + ' menit · ' + STATUS_LABEL[st])));
    });
    return h('div', { class: 'narrow' }, crumb([['Belajar', '#/learn'], 'Level ' + lv.id]),
      h('div', { class: 'judul-level' }, h('span', { class: 'blok-no besar' + (repo.levelStatus(lv.id) ? ' kuasai' : ''), 'aria-hidden': 'true' }, String(lv.id)), h('h1', null, 'Level ' + lv.id + ': ' + lv.title)), para(lv.desc),
      h('p', { class: 'muted' }, r.selesai + ' dari ' + r.total + ' lesson selesai dibaca, ' + r.kuasai + ' dikuasai.'),
      h('ol', { class: 'jalur' }, items),
      lv.id === 0 ? h('p', { class: 'muted' }, 'Level 0 dikuasai saat lesson orientasinya selesai dibaca.') :
        h('div', { class: 'kartu' }, h('h2', { style: 'margin-top:0' }, 'Penguasaan level'),
          para('Level ini dikuasai setelah checkpoint dengan skor minimal 80%' + (labUtama ? ' dan lab utama "' + labUtama.title + '" selesai.' : '.')),
          h('ul', null, h('li', null, 'Checkpoint: ' + (cp ? 'skor terbaik ' + cp.pct + '%' : 'belum dicoba')), labUtama ? h('li', null, 'Lab utama: ', link('#/labs/' + labUtama.slug, labUtama.title), repo.labSelesai(labUtama.id) ? ' (selesai)' : ' (belum selesai)') : null),
          repo.levelStatus(lv.id) ? h('p', { class: 'tag tag-ok' }, 'Level dikuasai') : null,
          h('a', { class: 'btn btn-utama', href: '#/checkpoint/' + lv.id }, 'Kerjakan checkpoint Level ' + lv.id)));
  }

  /* ---------- tampilan: lesson ---------- */
  function viewLesson(slug) {
    const l = D.lessonBySlug(slug);
    if (!l) return viewTidakAda();
    repo.mulaiLesson(l.id);
    const seq = D.sequence();
    const idx = seq.findIndex((x) => x.id === l.id);
    const prev = seq[idx - 1]; const next = seq[idx + 1];
    const lv = D.levelById(l.level);
    const statusEl = h('span', { class: 'tag' }, STATUS_LABEL[repo.statusLesson(l.id)]);
    function segarkanStatus() { statusEl.textContent = STATUS_LABEL[repo.statusLesson(l.id)]; statusEl.className = 'tag' + (repo.statusLesson(l.id) === 'mastered' ? ' tag-ok' : ''); }
    segarkanStatus();

    const prasyaratBelum = (l.prerequisites || []).map((id) => D.lessonById(id)).filter((x) => x && !['completed', 'mastered'].includes(repo.statusLesson(x.id)));
    const saran = prasyaratBelum.length ? h('p', { class: 'banner' }, h('strong', null, 'Saran: '), 'lesson ini lebih mudah setelah ', prasyaratBelum.map((x, i) => [i ? ', ' : '', link('#/learn/lesson/' + x.slug, x.title)]), '. Kamu tetap bisa lanjut membacanya.') : null;
    const tocItems = () => l.sections.map((x, i) => h('li', null, h('a', { href: '#/learn/lesson/' + l.slug, 'data-bag': String(i), onclick: (e) => { e.preventDefault(); const t = document.getElementById('bag-' + i); if (t) { t.scrollIntoView({ block: 'start' }); t.focus({ preventScroll: true }); } } }, x.h)));
    const tocMobile = h('details', { class: 'toc-mobile' }, h('summary', null, 'Isi lesson'), h('ol', null, tocItems()));
    const rl = repo.ringkasanLevel(lv.id); const pctLv = rl.total ? Math.round((rl.selesai / rl.total) * 100) : 0;
    const samping = h('aside', { class: 'samping', 'aria-label': 'Navigasi lesson' },
      h('h2', null, 'Di halaman ini'), h('ol', null, tocItems()),
      h('div', { class: 'kartu' }, h('p', null, h('strong', null, 'Level ' + lv.id + ': ' + lv.title)),
        h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(pctLv), 'aria-label': 'Progres Level ' + lv.id }, h('span', { style: 'width:' + pctLv + '%' })),
        h('p', { class: 'muted', style: 'margin-top:8px' }, rl.selesai + ' dari ' + rl.total + ' lesson selesai')));
    const barBaca = h('div', { class: 'baca', 'aria-hidden': 'true' }, h('span'));
    pascaRender = () => {
      const geser = () => { const d = document.documentElement; const maks = d.scrollHeight - window.innerHeight; const p = maks > 0 ? Math.min(1, Math.max(0, window.scrollY / maks)) : 0; barBaca.firstChild.style.transform = 'scaleX(' + p.toFixed(3) + ')'; };
      window.addEventListener('scroll', geser, { passive: true }); geser();
      pembersih.push(() => window.removeEventListener('scroll', geser));
      if ('IntersectionObserver' in window) {
        const pengamat = new IntersectionObserver((es) => es.forEach((en) => {
          if (!en.isIntersecting) return;
          const i = en.target.id.slice(4);
          samping.querySelectorAll('a').forEach((a) => { if (a.getAttribute('data-bag') === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
        }), { rootMargin: '-15% 0px -75% 0px' });
        l.sections.forEach((_, i) => { const t = document.getElementById('bag-' + i); if (t) pengamat.observe(t); });
        pembersih.push(() => pengamat.disconnect());
      }
    };
    const bagian = l.sections.map((s, i) => h('section', { class: 'bagian' }, h('h2', { id: 'bag-' + i, tabindex: '-1' }, s.h), s.visual ? h('div', { html: '' }, diagramNode(s.visual)) : null, s.p.map(para)));
    const teknis = h('details', { class: 'teknis' }, h('summary', null, 'Versi teknis: ' + l.technical.title), h('div', { class: 'isi' }, l.technical.p.map(para)));
    const misk = h('div', { class: 'miskonsepsi' }, l.misconceptions.map((m) => h('div', { class: 'mk' }, h('span', { class: 'salah' }, 'Anggapan keliru: ', mk(m.salah)), h('span', { class: 'benar' }, 'Yang benar: ', mk(m.benar)))));
    const tombolSelesai = h('button', { class: 'btn', type: 'button', onclick: () => { repo.selesaiLesson(l.id); segarkanStatus(); toast('Lesson ditandai selesai dibaca.'); } }, 'Tandai selesai dibaca');
    const kuis = buatKuis(l.quiz, l.id, l.id, { onSelesai: segarkanStatus });
    const labLinks = (l.labs || []).map((id) => D.labById(id)).filter(Boolean);
    const istilah = (l.glossary || []).map((id) => D.termById(id)).filter(Boolean);
    const sumber = (l.sources || []).map((id) => D.sourceById(id)).filter(Boolean);

    return h('div', { class: 'lesson-layout' },
      h('article', { class: 'lesson' },
        crumb([['Belajar', '#/learn'], ['Level ' + lv.id + ': ' + lv.title, '#/learn/level/' + lv.id], l.title]),
        h('h1', null, l.title),
        h('p', { class: 'meta-baca' }, 'Perkiraan ' + l.minutes + ' menit', statusEl),
        h('p', { class: 'hook' }, mk(l.hook)),
        saran,
        h('div', { class: 'tujuan' }, h('strong', null, 'Setelah lesson ini kamu bisa:'), h('ul', null, l.objectives.map((o) => h('li', null, mk(o))))),
        tocMobile, bagian, teknis,
        h('h2', null, 'Anggapan keliru yang umum'), misk,
        labLinks.length ? h('div', { class: 'coba' }, h('strong', null, 'Coba sendiri:'), labLinks.map((lb) => link('#/labs/' + lb.slug, lb.title))) : null,
        h('div', { class: 'ringkas' }, h('strong', null, 'Ringkasan'), h('ul', null, l.summary.map((s) => h('li', null, mk(s))))),
        kuis,
        h('div', { class: 'baris' }, tombolSelesai),
        istilah.length ? [h('h2', null, 'Istilah di lesson ini'), h('ul', null, istilah.map((t) => h('li', null, link('#/glossary/' + t.id, t.term))))] : null,
        sumber.length ? [h('h2', null, 'Sumber'), h('ul', null, sumber.map((s) => h('li', null, h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.title), ' (' + s.author + (s.year ? ', ' + s.year : '') + ')')))] : null,
        h('nav', { class: 'lesson-nav', 'aria-label': 'Lesson sebelum dan sesudah' },
          prev ? h('a', { class: 'btn', href: '#/learn/lesson/' + prev.slug }, 'Sebelumnya: ' + prev.title) : h('span'),
          next ? h('a', { class: 'btn btn-utama', href: '#/learn/lesson/' + next.slug }, 'Berikutnya: ' + next.title) : h('a', { class: 'btn btn-utama', href: '#/checkpoint/' + l.level }, 'Kerjakan checkpoint Level ' + l.level))),
      samping, barBaca);
  }

  function diagramNode(id) {
    const wrap = document.createElement('div');
    wrap.innerHTML = DG.render(id); // SVG buatan sendiri dari genesis-diagram.js, tanpa data pengguna
    return wrap;
  }

  /* ---------- tampilan: checkpoint ---------- */
  function viewCheckpoint(n) {
    const lv = D.levelById(n);
    if (!lv || lv.status !== 'tersedia' || n === 0) {
      return h('div', { class: 'narrow' }, h('h1', null, 'Checkpoint tidak tersedia'), para('Level ini tidak punya checkpoint di v2.1.0.'), h('a', { class: 'btn', href: '#/learn' }, 'Kembali ke Belajar'));
    }
    const soal = D.checkpointQuestions(n);
    const labUtama = D.labs.find((l) => l.mainFor === n);
    return h('div', { class: 'narrow' }, crumb([['Belajar', '#/learn'], ['Level ' + n, '#/learn/level/' + n], 'Checkpoint']), h('h1', null, 'Checkpoint Level ' + n + ': ' + lv.title),
      para('Soal diambil dari semua lesson di level ini. Batas penguasaan 80%' + (labUtama ? ', ditambah lab utama "' + labUtama.title + '" selesai.' : '.')),
      buatKuis(soal, 'cp-level-' + n, null, { checkpoint: true, level: n, judul: 'Soal checkpoint' }));
  }

  /* ---------- glosarium dan pencarian ---------- */
  function viewGlossary() {
    const daftar = h('ul', { class: 'istilah-daftar' });
    const info = h('p', { class: 'muted', role: 'status' });
    const input = h('input', { type: 'search', id: 'filter-istilah', placeholder: 'Ketik untuk menyaring istilah', autocomplete: 'off' });
    function gambar() {
      const q = input.value.trim().toLowerCase();
      const hasil = D.glossary().filter((g) => !q || g.term.toLowerCase().includes(q) || (g.aliases || []).some((a) => a.toLowerCase().includes(q)) || g.definition.toLowerCase().includes(q));
      daftar.innerHTML = '';
      hasil.forEach((g) => daftar.appendChild(h('li', null, h('a', { href: '#/glossary/' + g.id }, h('strong', null, g.term), h('span', { class: 'kecil muted', style: 'display:block' }, g.definition.length > 110 ? g.definition.slice(0, 107) + '...' : g.definition)))));
      info.textContent = hasil.length ? hasil.length + ' istilah' : 'Tidak ada istilah yang cocok dengan "' + input.value + '". Coba kata lain atau hapus filter.';
    }
    input.addEventListener('input', gambar); gambar();
    return h('div', { class: 'narrow' }, h('h1', null, 'Glosarium'), h('label', { for: 'filter-istilah' }, 'Saring istilah'), input, info, daftar);
  }

  function viewTerm(id) {
    const t = D.termById(id);
    if (!t) return viewTidakAda();
    const dipakai = D.lessons().filter((l) => (l.glossary || []).includes(id));
    return h('div', { class: 'narrow' }, crumb([['Glosarium', '#/glossary'], t.term]), h('h1', null, t.term),
      t.aliases && t.aliases.length ? h('p', { class: 'muted' }, 'Juga disebut: ' + t.aliases.join(', ')) : null, para(t.definition),
      (t.related || []).length ? [h('h2', null, 'Istilah terkait'), h('ul', null, t.related.map((r) => D.termById(r)).filter(Boolean).map((r) => h('li', null, link('#/glossary/' + r.id, r.term))))] : null,
      dipakai.length ? [h('h2', null, 'Dibahas di'), h('ul', null, dipakai.map((l) => h('li', null, link('#/learn/lesson/' + l.slug, l.title))))] : null);
  }

  function viewCari(q) {
    const hasil = D.search(q);
    return h('div', { class: 'narrow' }, h('h1', null, 'Hasil pencarian'), h('p', { class: 'muted', role: 'status' }, q.length < 2 ? 'Ketik minimal 2 huruf.' : hasil.length + ' hasil untuk "' + q + '"'),
      hasil.length ? h('ul', { class: 'istilah-daftar' }, hasil.map((r) => h('li', null, h('a', { href: r.tipe === 'lesson' ? '#/learn/lesson/' + D.lessonById(r.id).slug : '#/glossary/' + r.id }, h('strong', null, r.label), h('span', { class: 'kecil muted', style: 'display:block' }, r.ket))))) :
        q.length >= 2 ? h('div', { class: 'empty' }, 'Tidak ada pelajaran atau istilah yang cocok. Coba kata yang lebih umum, misalnya "hash" atau "blok".') : null);
  }

  /* ---------- halaman statis ---------- */
  function viewReferences() {
    return h('div', { class: 'narrow' }, h('h1', null, 'Referensi'), para('Sumber primer dan dokumentasi yang dipakai materi Genesis. Cek ke sumber asli bila ada ragu.'),
      h('ul', null, D.sources.map((s) => h('li', { style: 'margin-bottom:10px' }, h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.title), h('div', { class: 'kecil muted' }, s.author + (s.year ? ', ' + s.year : '') + '. ' + s.note)))));
  }

  function viewAbout() {
    const v = D.validate();
    return h('div', { class: 'narrow' }, h('h1', null, 'Tentang Genesis'),
      para('Genesis adalah ruang belajar Bitcoin berbahasa Indonesia. Fokusnya memahami cara kerja: mengapa uang digital butuh buku besar bersama, bagaimana hash dan tanda tangan menjaganya, dan bagaimana transaksi Bitcoin disusun.'),
      h('h2', null, 'Yang perlu kamu tahu'),
      h('ul', null,
        h('li', null, 'Ini materi edukasi, bukan nasihat keuangan atau ajakan membeli aset apa pun.'),
        h('li', null, 'Semua lab adalah simulasi. Tidak ada transaksi ke jaringan Bitcoin dan tidak ada dompet yang tersambung.'),
        h('li', null, 'Jangan pernah memasukkan kunci privat, frasa seed, atau data dompet asli ke situs mana pun, termasuk ini. Genesis tidak memintanya.'),
        h('li', null, 'Kunci di lab tanda tangan dibuat acak, hanya ada di memori tab, dan berlabel uji saja.'),
        h('li', null, 'Progres tersimpan di peramban perangkat ini. Tidak ada akun, tidak ada pelacak, dan progresmu tidak dikirim ke mana pun. Satu-satunya permintaan ke pihak ketiga adalah memuat font dari Google Fonts.')),
      h('h2', null, 'Cakupan versi 2.1.0'),
      para('Level 0 sampai 4 (orientasi, uang digital, jaringan dan kriptografi, arsitektur Bitcoin, transaksi) dengan ' + D.store.lessons.length + ' lesson, checkpoint tiap level, dan 6 lab. Level 5 sampai 8 dan proyek akhir masih rencana.'),
      h('h2', null, 'Dokumentasi proyek'), para('Dokumen perancangan (PRD, ADR, ERD, UI/UX) ada di folder `docs/` pada repositori proyek.'),
      !v.ok ? h('div', { class: 'banner banner-err' }, h('strong', null, 'Ada masalah pada konten: '), v.errors.slice(0, 5).join('; ')) : null);
  }

  function viewCapstone() {
    return h('div', { class: 'narrow' }, h('h1', null, 'Proyek akhir'), h('p', { class: 'banner' }, 'Proyek akhir belum tersedia di v2.1.0. Tidak ada tugas yang disembunyikan di sini.'),
      para('Rencananya proyek akhir menyatukan hash, tanda tangan, UTXO, dan konsensus dalam satu simulasi mini setelah Level 5 sampai 8 tersedia.'),
      h('a', { class: 'btn btn-utama', href: '#/learn' }, 'Lanjut belajar'));
  }

  function viewTidakAda() {
    return h('div', { class: 'narrow' }, h('h1', null, 'Halaman tidak ditemukan'), para('Alamat ini tidak cocok dengan halaman mana pun di Genesis.'),
      h('div', { class: 'baris' }, h('a', { class: 'btn btn-utama', href: '#/' }, 'Ke beranda'), h('a', { class: 'btn', href: '#/learn' }, 'Ke daftar pelajaran')));
  }

  /* ---------- ekspor dan impor progres ---------- */
  function eksporProgres() {
    const data = { app: 'genesis', schemaVersion: C.SCHEMA, diekspor: new Date().toISOString(), progress: repo.progress, quizAttempts: repo.attempts };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: 'genesis-progres.json' });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Berkas progres diunduh.');
  }
  function imporProgres(berkas, tempat) {
    tempat.innerHTML = '';
    const galat = (m) => tempat.appendChild(h('p', { class: 'banner banner-err', role: 'alert' }, m));
    if (!berkas) return;
    if (berkas.size > 1024 * 1024) { galat('Berkas terlalu besar untuk berkas progres Genesis.'); return; }
    berkas.text().then((t) => {
      let d; try { d = JSON.parse(t); } catch (e) { galat('Berkas bukan JSON yang valid.'); return; }
      if (!d || d.app !== 'genesis' || d.schemaVersion !== C.SCHEMA || !d.progress) { galat('Berkas ditolak: bukan ekspor Genesis atau versi skema tidak dikenal.'); return; }
      repo.impor(d.progress, d.quizAttempts);
      tempat.appendChild(h('p', { class: 'banner banner-ok' }, 'Progres berhasil diimpor.'));
      toast('Progres diimpor.');
    }).catch(() => galat('Berkas tidak bisa dibaca.'));
  }

  /* ---------- pengaturan ---------- */
  function viewSettings() {
    const p = repo.prefs;
    function radio(nama, nilai, label, sekarang, onPilih) {
      const id = 'pref-' + nama + '-' + nilai;
      return h('label', { class: 'opsi', for: id }, h('input', { type: 'radio', name: 'pref-' + nama, id, checked: sekarang === nilai, onchange: () => onPilih(nilai) }), h('span', null, label));
    }
    const setP = (patch) => { repo.setPrefs(patch); applyPrefs(); };
    const konfirm = h('div');
    const pesanImpor = h('div', { role: 'status', 'aria-live': 'polite' });
    const seq = D.sequence();
    const ringkas = [seq.filter((l) => repo.statusLesson(l.id) !== 'not-started').length + ' lesson dimulai', seq.filter((l) => repo.statusLesson(l.id) === 'mastered').length + ' dikuasai', D.labs.filter((l) => repo.labSelesai(l.id)).length + ' lab selesai'].join(', ');
    return h('div', { class: 'narrow' }, h('h1', null, 'Pengaturan'),
      h('section', { class: 'kartu' }, h('h2', { style: 'margin-top:0' }, 'Tema'),
        radio('theme', 'auto', 'Ikuti perangkat', p.theme, (v) => setP({ theme: v })), radio('theme', 'light', 'Terang', p.theme, (v) => setP({ theme: v })), radio('theme', 'dark', 'Gelap', p.theme, (v) => setP({ theme: v }))),
      h('section', { class: 'kartu', style: 'margin-top:16px' }, h('h2', { style: 'margin-top:0' }, 'Ukuran teks'),
        radio('size', 'normal', 'Normal', p.textSize, (v) => setP({ textSize: v })), radio('size', 'large', 'Besar', p.textSize, (v) => setP({ textSize: v }))),
      h('section', { class: 'kartu', style: 'margin-top:16px' }, h('h2', { style: 'margin-top:0' }, 'Gerakan'),
        radio('motion', 'auto', 'Ikuti perangkat', p.reducedMotion, (v) => setP({ reducedMotion: v })), radio('motion', 'on', 'Kurangi gerakan', p.reducedMotion, (v) => setP({ reducedMotion: v }))),
      h('section', { class: 'kartu', style: 'margin-top:16px' }, h('h2', { style: 'margin-top:0' }, 'Data dan progres'),
        para('Progresmu: ' + ringkas + '.'),
        para(repo.peringatan.length ? repo.peringatan.join(' ') : 'Progres tersimpan di peramban ini dan tidak dikirim ke mana pun.'),
        h('div', { class: 'baris', style: 'margin-bottom:12px' },
          h('button', { class: 'btn', type: 'button', onclick: eksporProgres }, 'Ekspor progres (JSON)'),
          h('label', { class: 'btn', for: 'impor-berkas', style: 'margin:0' }, 'Impor progres...'),
          h('input', { type: 'file', id: 'impor-berkas', accept: 'application/json,.json', class: 'sr-only', onchange: (e) => imporProgres(e.target.files[0], pesanImpor) })),
        pesanImpor,
        h('button', { class: 'btn btn-bahaya', type: 'button', onclick: () => {
          konfirm.innerHTML = '';
          konfirm.appendChild(h('div', { class: 'banner banner-err', role: 'alert' }, h('p', null, 'Semua progres, riwayat kuis, dan pengaturan Genesis di perangkat ini akan dihapus. Data situs lain tidak disentuh. Tindakan ini tidak bisa dibatalkan.'),
            h('div', { class: 'baris' }, h('button', { class: 'btn btn-bahaya', type: 'button', onclick: () => { repo.reset(); applyPrefs(); toast('Progres direset.'); render(); } }, 'Ya, hapus progres'), h('button', { class: 'btn', type: 'button', onclick: () => { konfirm.innerHTML = ''; } }, 'Batal'))));
        } }, 'Reset progres...'), konfirm),
      h('section', { class: 'kartu', style: 'margin-top:16px' }, h('h2', { style: 'margin-top:0' }, 'Offline'), para(('serviceWorker' in navigator) ? 'Setelah dibuka sekali lewat HTTPS atau localhost, Genesis dapat dipakai tanpa internet.' : 'Peramban ini tidak mendukung service worker, jadi mode offline tidak tersedia.')));
  }

  /* ================= LAB ================= */
  function labHeader(lb, intro) {
    return [crumb([['Lab', '#/labs'], lb.title]), h('h1', null, lb.title), h('p', null, h('span', { class: 'simulasi' }, 'Simulasi edukasi')), para(intro)];
  }
  function selesaikanLab(id) {
    if (!repo.labSelesai(id)) { repo.catatLab(id); toast('Lab selesai tercatat.'); }
  }
  const pendek = (hex, n = 12) => hex.length > n * 2 ? hex.slice(0, n) + '...' + hex.slice(-6) : hex;

  function labDoubleSpend(lb) {
    let s = LAB.DS.awal();
    const out = h('div', { 'aria-live': 'polite' });
    const bobEl = h('p'); const carolEl = h('p'); const jelas = h('p', { class: 'banner' });
    const modeRadios = [['tanpa-buku', 'Tanpa buku besar bersama'], ['dengan-blok', 'Dengan buku besar bersama (blok)']].map(([v, t]) =>
      h('label', { class: 'opsi', for: 'ds-mode-' + v }, h('input', { type: 'radio', name: 'ds-mode', id: 'ds-mode-' + v, checked: s.mode === v, onchange: () => dispatch({ type: 'mode', mode: v }) }), h('span', null, t)));
    const urutanRadios = [['bob', 'Transaksi ke Bob'], ['carol', 'Transaksi ke Carol']].map(([v, t]) =>
      h('label', { class: 'opsi', for: 'ds-urut-' + v }, h('input', { type: 'radio', name: 'ds-urut', id: 'ds-urut-' + v, checked: s.pertama === v, onchange: () => dispatch({ type: 'urutan', pertama: v }) }), h('span', null, t)));
    const bKirimBob = h('button', { class: 'btn', type: 'button', onclick: () => dispatch({ type: 'kirim', ke: 'bob' }) }, 'Kirim koin ke Bob');
    const bKirimCarol = h('button', { class: 'btn', type: 'button', onclick: () => dispatch({ type: 'kirim', ke: 'carol' }) }, 'Kirim koin yang sama ke Carol');
    const bBlok = h('button', { class: 'btn btn-utama', type: 'button', onclick: () => dispatch({ type: 'buatBlok' }) }, 'Penambang membuat blok');
    const bReset = h('button', { class: 'btn', type: 'button', onclick: () => { s = LAB.DS.awal(); modeRadios[0].querySelector('input').checked = true; urutanRadios[0].querySelector('input').checked = true; segar(); } }, 'Ulangi dari awal');
    const kata = { 'merasa-dibayar': 'merasa sudah dibayar', menunggu: 'belum menerima apa pun', 'belum-konfirmasi': 'menunggu konfirmasi blok', dibayar: 'dibayar, transaksinya masuk blok', ditolak: 'DITOLAK: koin sudah terpakai di transaksi lain' };
    function dispatch(a) { s = LAB.DS.reduce(s, a); segar(); }
    function segar() {
      const k = LAB.DS.keyakinan(s);
      bobEl.textContent = 'Bob: ' + kata[k.bob]; carolEl.textContent = 'Carol: ' + kata[k.carol];
      bBlok.disabled = s.mode !== 'dengan-blok' || !(s.dikirim.bob || s.dikirim.carol);
      urutanRadios.forEach((r) => { r.querySelector('input').disabled = s.mode !== 'dengan-blok'; });
      const konflik = LAB.DS.konflik(s);
      if (s.mode === 'tanpa-buku') jelas.textContent = konflik ? 'Bob dan Carol sama-sama merasa dibayar dari koin yang cuma satu. Tidak ada pihak yang bisa menilai mana yang sah. Inilah masalah pemakaian ganda.' : 'Kirim koin ke kedua penerima untuk melihat masalahnya.';
      else if (!s.dibuat) jelas.textContent = konflik ? 'Dua transaksi menghabiskan koin yang sama. Atur transaksi mana yang sampai ke penambang lebih dulu, lalu buat blok.' : 'Kirim koin ke kedua penerima, lalu buat blok.';
      else if (konflik) jelas.textContent = 'Buku besar bersama memproses transaksi sesuai urutan di blok. Yang pertama sah, yang kedua ditolak karena koin sudah terpakai. Urutan ini ditetapkan oleh blok, bukan oleh pengirim. Ubah urutan lalu buat blok lagi untuk melihat hasil yang berbeda.';
      else jelas.textContent = 'Satu transaksi saja tidak bermasalah. Kirim ke penerima kedua untuk membuat konflik.';
      if (s.dibuat && konflik && s.mode === 'dengan-blok') selesaikanLab(lb.id);
    }
    segar();
    return h('div', { class: 'lab' }, labHeader(lb, 'Alice hanya punya satu koin. Lihat apa yang terjadi bila ia mengirimnya dua kali, dengan dan tanpa buku besar bersama.'),
      h('div', { class: 'panel' }, h('h3', null, '1. Pilih sistem'), modeRadios),
      h('div', { class: 'panel' }, h('h3', null, '2. Alice mengirim'), h('div', { class: 'baris' }, bKirimBob, bKirimCarol)),
      h('div', { class: 'panel' }, h('h3', null, '3. Urutan di penambang'), h('p', { class: 'muted kecil' }, 'Transaksi mana yang masuk blok lebih dulu. Hanya berlaku pada sistem dengan blok.'), urutanRadios, bBlok),
      h('div', { class: 'panel' }, h('h3', null, 'Hasil'), out, bobEl, carolEl, jelas, bReset));
  }

  function labHash(lb) {
    const a = h('textarea', { id: 'hash-a', rows: '3' }); a.value = 'Halo Bitcoin';
    const b = h('textarea', { id: 'hash-b', rows: '3' }); b.value = 'Halo bitcoin';
    const ha = h('p', { class: 'hex' }); const hb = h('p', { class: 'hex' }); const ringkas = h('p', { class: 'banner', role: 'status' });
    let berubah = false;
    function segar() {
      const r = LAB.HP.bandingkan(a.value, b.value);
      const tandai = (hex) => { const f = document.createDocumentFragment(); [...hex].forEach((c, i) => f.appendChild(r.posisi.includes(i) ? h('mark', null, c) : document.createTextNode(c))); return f; };
      ha.innerHTML = ''; hb.innerHTML = ''; ha.appendChild(tandai(r.a)); hb.appendChild(tandai(r.b));
      ringkas.textContent = r.sama ? 'Kedua teks menghasilkan hash yang sama. Input yang sama selalu memberi hash yang sama.' : r.bit + ' dari 256 bit berbeda (' + String(r.persen).replace('.', ',') + '%). Karakter hex yang berbeda disorot. Perubahan kecil pada input mengubah sekitar separuh bit hash.';
      if (berubah && !r.sama && a.value && b.value) selesaikanLab(lb.id);
    }
    [a, b].forEach((x) => x.addEventListener('input', () => { berubah = true; segar(); }));
    segar();
    return h('div', { class: 'lab' }, labHeader(lb, 'SHA-256 mengubah teks apa pun menjadi 256 bit. Ubah satu huruf di salah satu kolom dan lihat hash-nya.'),
      h('div', { class: 'grid grid-2' },
        h('div', { class: 'panel' }, h('label', { for: 'hash-a' }, 'Teks A'), a, h('p', { class: 'muted kecil', style: 'margin:.8em 0 .2em' }, 'Hash SHA-256 A'), ha),
        h('div', { class: 'panel' }, h('label', { for: 'hash-b' }, 'Teks B'), b, h('p', { class: 'muted kecil', style: 'margin:.8em 0 .2em' }, 'Hash SHA-256 B'), hb)),
      ringkas,
      h('div', { class: 'panel' }, h('h3', null, 'Hal yang bisa dicoba'), h('ul', null, h('li', null, 'Hapus satu spasi di akhir teks B.'), h('li', null, 'Kosongkan kedua kolom: hash teks kosong tetap ada.'), h('li', null, 'Tempel teks sangat panjang: panjang hash tetap sama.'))));
  }

  function labSignature(lb) {
    let kunci = null; let pesanAsli = ''; let sig = '';
    const info = h('div'); const hasil = h('div', { 'aria-live': 'polite' });
    const pesan = h('textarea', { id: 'sg-pesan', rows: '2' }); pesan.value = 'Bayar Bob 0.01 BTC (uji)';
    const verPesan = h('textarea', { id: 'sg-ver', rows: '2' }); verPesan.value = pesan.value;
    const bTtd = h('button', { class: 'btn', type: 'button', disabled: true }); bTtd.textContent = 'Tandatangani pesan';
    const bVer = h('button', { class: 'btn btn-utama', type: 'button', disabled: true }); bVer.textContent = 'Verifikasi';
    const sigEl = h('p', { class: 'hex' });
    h2c();
    function h2c() { sigEl.textContent = 'Belum ada tanda tangan.'; }
    const bKunci = h('button', { class: 'btn btn-utama', type: 'button', onclick: () => {
      bKunci.disabled = true; bKunci.textContent = 'Membuat kunci...';
      setTimeout(() => {
        kunci = LAB.SG.buatKunciUji();
        info.innerHTML = '';
        info.appendChild(h('p', null, h('span', { class: 'ujionly' }, 'KUNCI UJI, HANYA UNTUK BELAJAR')));
        info.appendChild(h('p', { class: 'muted kecil' }, 'Kunci publik (boleh dibagikan):')); info.appendChild(h('p', { class: 'hex' }, kunci.pubHex));
        info.appendChild(h('p', { class: 'muted kecil' }, 'Alamat turunan:')); info.appendChild(h('p', { class: 'hex' }, kunci.alamat));
        info.appendChild(h('p', { class: 'muted kecil' }, 'Kunci privat sengaja tidak ditampilkan. Ia hanya ada di memori tab ini dan hilang saat halaman ditutup.'));
        bTtd.disabled = false; bKunci.disabled = false; bKunci.textContent = 'Buat ulang kunci uji'; sig = ''; h2c(); hasil.innerHTML = ''; bVer.disabled = true;
      }, 20);
    } }, 'Buat kunci uji sementara');
    bTtd.addEventListener('click', () => { pesanAsli = pesan.value; sig = LAB.SG.tandatangani(kunci, pesanAsli); sigEl.textContent = sig; verPesan.value = pesanAsli; bVer.disabled = false; hasil.innerHTML = ''; });
    bVer.addEventListener('click', () => {
      const r = LAB.SG.periksa(kunci, pesanAsli, verPesan.value, sig);
      hasil.innerHTML = '';
      hasil.appendChild(h('p', { class: 'banner ' + (r.ok ? 'banner-ok' : 'banner-err') }, h('strong', null, r.ok ? 'Tanda tangan VALID. ' : 'Tanda tangan TIDAK VALID. '),
        r.ok ? 'Pesan sama persis dengan yang ditandatangani, dan kunci publik cocok.' : (r.pesanBerubah ? 'Pesan yang diverifikasi berbeda dari yang ditandatangani. Satu karakter berbeda sudah cukup membuat verifikasi gagal.' : 'Tanda tangan tidak cocok dengan kunci publik.')));
      if (!r.ok && r.pesanBerubah) selesaikanLab(lb.id);
    });
    return h('div', { class: 'lab' }, labHeader(lb, 'Kunci privat membuat tanda tangan. Kunci publik memverifikasinya. Coba tanda tangani pesan lalu ubah pesannya sebelum verifikasi.'),
      h('div', { class: 'panel' }, h('h3', null, '1. Buat kunci uji'), h('p', { class: 'banner banner-err' }, 'Jangan tempel kunci privat atau seed asli di mana pun. Lab ini membuat kunci acak sendiri.'), bKunci, info),
      h('div', { class: 'panel' }, h('h3', null, '2. Tandatangani'), h('label', { for: 'sg-pesan' }, 'Pesan'), pesan, h('div', { class: 'baris', style: 'margin-top:10px' }, bTtd), h('p', { class: 'muted kecil', style: 'margin:.8em 0 .2em' }, 'Tanda tangan (r dan s, hex)'), sigEl),
      h('div', { class: 'panel' }, h('h3', null, '3. Verifikasi'), h('p', { class: 'muted kecil' }, 'Ubah isi kolom ini, misalnya tambah satu huruf, lalu verifikasi.'), h('label', { for: 'sg-ver' }, 'Pesan yang diverifikasi'), verPesan, h('div', { class: 'baris', style: 'margin-top:10px' }, bVer), hasil));
  }

  function labTamper(lb) {
    let s = LAB.BC.awal(10);
    let diubah = false;
    const daftar = h('div', { class: 'rantai' });
    const ringkas = h('p', { class: 'banner', role: 'status' });
    const blokEls = s.rantai.map((_, i) => {
      const data = h('input', { type: 'text', id: 'tp-data-' + i, 'aria-describedby': 'tp-stat-' + i });
      data.value = s.rantai[i].data;
      data.addEventListener('input', () => { diubah = true; s = LAB.BC.reduce(s, { type: 'ubahData', i, data: data.value }); segar(); });
      const stat = h('p', { class: 'status-teks', id: 'tp-stat-' + i }); const prev = h('p', { class: 'hex' }); const hash = h('p', { class: 'hex' }); const sebab = h('p', { class: 'kecil muted' });
      const bUlang = h('button', { class: 'btn btn-kecil', type: 'button', onclick: () => { s = LAB.BC.reduce(s, { type: 'tambangUlang', i }); segar(); } }, 'Tambang ulang blok ini');
      const bSemua = h('button', { class: 'btn btn-kecil', type: 'button', onclick: () => { s = LAB.BC.reduce(s, { type: 'tambangSemuaSetelah', i }); segar(); } }, 'Perbaiki dari sini sampai akhir');
      const el = h('div', { class: 'blok-lab' }, h('h3', { style: 'margin-top:0' }, 'Blok ' + (i + 1)), h('label', { for: 'tp-data-' + i }, 'Data'), data,
        h('p', { class: 'muted kecil', style: 'margin:.6em 0 0' }, 'Hash blok sebelumnya'), prev, h('p', { class: 'muted kecil', style: 'margin:.6em 0 0' }, 'Hash blok ini'), hash, stat, sebab,
        h('div', { class: 'baris' }, bUlang, i < s.rantai.length - 1 ? bSemua : null));
      return { el, data, stat, prev, hash, sebab };
    });
    blokEls.forEach((b) => daftar.appendChild(b.el));
    function segar() {
      const p = LAB.BC.periksa(s.rantai, s.bitNol);
      p.forEach((r, i) => {
        const b = blokEls[i]; const blok = s.rantai[i];
        b.prev.textContent = pendek(blok.prev, 8); b.hash.textContent = pendek(blok.hash, 8);
        b.el.className = 'blok-lab ' + (r.valid ? 'valid' : 'rusak');
        b.stat.className = 'status-teks ' + (r.valid ? 'ok' : 'err');
        b.stat.textContent = r.valid ? 'Valid' : 'TIDAK VALID';
        const alasan = [];
        if (!r.hashCocok) alasan.push('isi blok tidak cocok dengan hash tersimpan');
        if (!r.tersambung) alasan.push('hash blok sebelumnya yang tercatat sudah berubah');
        if (r.hashCocok && !r.target) alasan.push('hash tidak memenuhi target latihan');
        b.sebab.textContent = alasan.length ? 'Sebab: ' + alasan.join('; ') + '.' : '';
      });
      const semua = p.every((r) => r.valid);
      ringkas.textContent = semua ? (diubah ? 'Seluruh rantai valid lagi, tetapi semua blok sesudah titik ubah harus ditambang ulang. Pada jaringan sungguhan itu berarti mengulang seluruh kerja penambang sesudahnya, lebih cepat dari seluruh jaringan.' : 'Rantai valid. Ubah teks di salah satu blok.') : 'Rantai tidak valid. Perhatikan bagaimana kerusakan menjalar ke blok-blok sesudahnya.';
      if (diubah && semua) selesaikanLab(lb.id);
    }
    segar();
    return h('div', { class: 'lab' }, labHeader(lb, 'Empat blok saling menunjuk lewat hash. Ubah data di satu blok dan lihat apa yang rusak. Versi sederhana: hash dari indeks, hash sebelumnya, data, dan nonce. Target latihan: hash di bawah ambang kecil agar cepat ditambang.'),
      ringkas, daftar,
      h('div', { class: 'baris' }, h('button', { class: 'btn', type: 'button', onclick: () => { s = LAB.BC.awal(10); diubah = false; s.rantai.forEach((b, i) => { blokEls[i].data.value = b.data; }); segar(); } }, 'Ulangi dari awal')));
  }

  function labUtxo(lb) {
    let s = LAB.UT.awal();
    const daftarDompet = h('div'); const daftarOut = h('div'); const ringkas = h('dl', { class: 'ringkas-tx' }); const catatan = h('div', { role: 'status' }); const hasilSiar = h('div', { 'aria-live': 'polite' });
    const bSiar = h('button', { class: 'btn btn-utama', type: 'button', onclick: () => { s = LAB.UT.reduce(s, { type: 'siarkan' }); gambar(); selesaikanLab(lb.id); } }, 'Siarkan (simulasi)');
    const rumus = (a) => { s = LAB.UT.reduce(s, a); gambar(); };
    function gambar() {
      daftarDompet.innerHTML = '';
      if (!s.dompet.length) daftarDompet.appendChild(h('div', { class: 'empty' }, 'Dompet kosong. Tekan "Ulangi dari awal" untuk mengisi lagi.'));
      s.dompet.forEach((u, i) => {
        const k = LAB.UT.key(u); const id = 'ut-in-' + i;
        daftarDompet.appendChild(h('label', { class: 'utxo-pilih' + (s.terpilih.includes(k) ? ' on' : ''), for: id },
          h('input', { type: 'checkbox', id, checked: s.terpilih.includes(k), onchange: () => rumus({ type: 'togglePilih', key: k }) }),
          h('span', null, h('strong', null, LAB.UT.formatBtc(u.sat) + ' BTC'), h('span', { class: 'kecil muted', style: 'display:block' }, u.label + ' · ' + u.txid.slice(0, 8) + ':' + u.vout))));
      });
      daftarOut.innerHTML = '';
      s.output.forEach((o, i) => {
        const id = 'ut-out-' + i;
        const inp = h('input', { type: 'text', id, inputmode: 'decimal', 'aria-describedby': 'ut-out-err-' + i });
        inp.value = o.sat ? LAB.UT.formatBtc(o.sat).replace(/\.0$/, '') : '';
        const err = h('span', { class: 'kecil', id: 'ut-out-err-' + i, style: 'color:var(--err)' });
        inp.addEventListener('change', () => {
          const sat = inp.value.trim() === '' ? 0 : LAB.UT.parseBtc(inp.value);
          if (sat === null) { err.textContent = 'Masukkan angka BTC, maksimal 8 desimal.'; inp.setAttribute('aria-invalid', 'true'); s = LAB.UT.reduce(s, { type: 'setOutput', i, sat: NaN }); segarRingkas(); return; }
          rumus({ type: 'setOutput', i, sat });
        });
        daftarOut.appendChild(h('div', { style: 'margin-bottom:12px' }, h('label', { for: id }, (i === s.output.length - 1 && s.output.length > 1 ? 'Output ' + i + ' (kembalian ke dirimu)' : 'Output ' + i + ' (penerima)') + ', BTC'),
          h('div', { class: 'baris' }, h('div', { style: 'flex:1;min-width:140px' }, inp), s.output.length > 1 ? h('button', { class: 'btn btn-kecil', type: 'button', 'aria-label': 'Hapus output ' + i, onclick: () => rumus({ type: 'hapusOutput', i }) }, 'Hapus') : null), err));
      });
      segarRingkas();
    }
    function segarRingkas() {
      const v = LAB.UT.validasi(s);
      ringkas.innerHTML = '';
      [['Total input', LAB.UT.formatBtc(v.totalIn)], ['Total output', LAB.UT.formatBtc(v.totalOut)], ['Fee (input dikurangi output)', v.inputs.length ? LAB.UT.formatBtc(v.fee) : '-'], ['Satoshi fee', v.inputs.length ? String(v.fee) : '-']].forEach(([a, b]) => { ringkas.appendChild(h('dt', null, a)); ringkas.appendChild(h('dd', null, b + (a.startsWith('Satoshi') ? '' : ' BTC').replace(' BTC', b === '-' ? '' : ' BTC'))); });
      catatan.innerHTML = '';
      catatan.appendChild(h('p', { class: 'banner ' + (v.valid ? 'banner-ok' : 'banner-err') }, h('strong', null, v.valid ? 'Transaksi valid (simulasi). ' : 'Transaksi belum valid. '), v.valid ? 'TXID simulasi: ' + v.txid.slice(0, 16) + '...' : v.galat[0] || 'Lengkapi input dan output.'));
      v.galat.slice(1).forEach((g) => catatan.appendChild(h('p', { class: 'kecil', style: 'color:var(--err)' }, g)));
      v.catatan.forEach((c) => catatan.appendChild(h('p', { class: 'banner kecil' }, c)));
      bSiar.disabled = !v.valid;
      hasilSiar.innerHTML = '';
      if (s.siaran) hasilSiar.appendChild(h('div', { class: 'banner banner-ok' }, h('strong', null, 'Tersiar (simulasi). '), 'Transaksi memakai ' + s.siaran.jumlahInput + ' input. TXID simulasi ' + s.siaran.txid.slice(0, 16) + '..., fee ' + LAB.UT.formatBtc(s.siaran.fee) + ' BTC. Input yang dipakai habis, kembalian muncul sebagai UTXO baru di dompet dengan rujukan TXID dan nomor output.'));
    }
    gambar();
    return h('div', { class: 'lab' }, labHeader(lb, 'Dompetmu berisi UTXO, bukan satu saldo. Pilih UTXO sebagai input, atur output, dan lihat fee muncul sebagai selisih. Jumlah dihitung dalam satoshi (1 BTC = 100.000.000 sat).'),
      h('p', { class: 'banner' }, 'Contoh: pilih UTXO 0.5, kirim 0.3, kembalian 0.199, maka fee 0.001 BTC. Atur sendiri angkanya dan amati.'),
      h('div', { class: 'grid grid-2' },
        h('div', { class: 'panel' }, h('h3', null, '1. Pilih input'), daftarDompet),
        h('div', { class: 'panel' }, h('h3', null, '2. Atur output'), daftarOut,
          h('div', { class: 'baris' }, h('button', { class: 'btn btn-kecil', type: 'button', onclick: () => rumus({ type: 'tambahOutput' }) }, 'Tambah output'), h('button', { class: 'btn btn-kecil', type: 'button', onclick: () => rumus({ type: 'aturFee', fee: 100000 }) }, 'Atur fee 0.001 lewat kembalian')))),
      h('div', { class: 'panel' }, h('h3', null, '3. Ringkasan transaksi'), ringkas, catatan, h('div', { class: 'baris' }, bSiar, h('button', { class: 'btn', type: 'button', onclick: () => { s = LAB.UT.reduce(s, { type: 'reset' }); gambar(); } }, 'Ulangi dari awal')), hasilSiar));
  }

  function labPow(lb) {
    const bitSel = h('select', { id: 'pw-bit' }, [8, 10, 12, 14, 16, 18, 20].map((b) => h('option', { value: String(b), selected: b === 14 }, b + ' bit nol di depan')));
    const status = h('p', { role: 'status' }); const hasil = h('div');
    let jalan = false; let batal = false;
    const bCari = h('button', { class: 'btn btn-utama', type: 'button' }, 'Cari nonce');
    const bStop = h('button', { class: 'btn', type: 'button', disabled: true, onclick: () => { batal = true; } }, 'Berhenti');
    bCari.addEventListener('click', () => {
      if (jalan) return;
      const bit = Number(bitSel.value); jalan = true; batal = false; bCari.disabled = true; bStop.disabled = false; hasil.innerHTML = ''; let mulai = 0; const t0 = performance.now();
      function langkah() {
        if (batal) { jalan = false; bCari.disabled = false; bStop.disabled = true; status.textContent = 'Dihentikan setelah ' + mulai.toLocaleString('id-ID') + ' percobaan.'; return; }
        const r = LAB.PW.cobaRentang(bit, mulai, 20000);
        if (r.ditemukan) {
          jalan = false; bCari.disabled = false; bStop.disabled = true;
          status.textContent = 'Ditemukan setelah ' + (r.nonce + 1).toLocaleString('id-ID') + ' percobaan (' + Math.round(performance.now() - t0) + ' ms). Rata-rata yang diharapkan sekitar ' + LAB.PW.rataRataPercobaan(bit).toLocaleString('id-ID') + '.';
          hasil.appendChild(h('div', { class: 'panel' }, h('p', null, 'Nonce: ', h('strong', { class: 'mono' }, String(r.nonce))), h('p', { class: 'hex' }, r.hash), h('p', { class: 'muted kecil' }, 'Hash header 80 byte yang dibaca sebagai bilangan lebih kecil dari target. Nonce yang sama dengan header lain akan memberi hash yang sama sekali berbeda.')));
          selesaikanLab(lb.id);
          return;
        }
        mulai += 20000; status.textContent = 'Mencoba... ' + mulai.toLocaleString('id-ID') + ' nonce sejauh ini.';
        if (mulai > 6000000) { jalan = false; bCari.disabled = false; bStop.disabled = true; status.textContent = 'Berhenti di batas 6 juta percobaan. Pilih target lebih mudah.'; return; }
        setTimeout(langkah, 0);
      }
      langkah();
    });
    /* fork */
    let f = LAB.PW.awalFork();
    const forkOut = h('div', { 'aria-live': 'polite' });
    function kontrolSisi(sisi) {
      const jml = h('select', { id: 'pw-jml-' + sisi }, [1, 2, 3, 4, 5, 6, 7, 8].map((n) => h('option', { value: String(n), selected: n === f[sisi].length }, n + ' blok')));
      const bit = h('select', { id: 'pw-fbit-' + sisi }, [8, 10, 12, 14, 16, 18, 20, 22, 24].map((n) => h('option', { value: String(n), selected: n === f[sisi][0].bitNol }, n + ' bit')));
      jml.addEventListener('change', () => { f = LAB.PW.reduceFork(f, { type: 'jumlah', sisi, jumlah: Number(jml.value) }); segarFork(); });
      bit.addEventListener('change', () => { for (let i = 0; i < f[sisi].length; i++) f = LAB.PW.reduceFork(f, { type: 'bit', sisi, i, bitNol: Number(bit.value) }); segarFork(); });
      return h('div', { class: 'panel' }, h('h3', null, 'Rantai ' + sisi), h('label', { for: 'pw-jml-' + sisi }, 'Jumlah blok'), jml, h('label', { for: 'pw-fbit-' + sisi, style: 'margin-top:10px' }, 'Kesulitan tiap blok'), bit);
    }
    function segarFork() {
      const p = LAB.PW.pilihRantai(f.A, f.B);
      const fmt = (n) => (n > 1000000000000n ? n.toString().length + ' digit' : n.toLocaleString('id-ID'));
      forkOut.innerHTML = '';
      forkOut.appendChild(h('div', { class: 'tabel-geser' }, h('table', null, h('caption', { class: 'sr-only' }, 'Perbandingan dua rantai'), h('thead', null, h('tr', null, h('th', null, 'Rantai'), h('th', null, 'Blok'), h('th', null, 'Total kerja (satuan hash)'))),
        h('tbody', null, h('tr', null, h('td', null, 'A'), h('td', null, String(f.A.length)), h('td', { class: 'mono' }, fmt(p.wa))), h('tr', null, h('td', null, 'B'), h('td', null, String(f.B.length)), h('td', { class: 'mono' }, fmt(p.wb)))))));
      const lebihPanjang = f.A.length === f.B.length ? 'sama panjang' : (f.A.length > f.B.length ? 'A lebih panjang' : 'B lebih panjang');
      forkOut.appendChild(h('p', { class: 'banner ' + (p.pemenang === 'seri' ? '' : 'banner-ok') }, h('strong', null, p.pemenang === 'seri' ? 'Seri: total kerja sama. ' : 'Node memilih rantai ' + p.pemenang + '. '), 'Rantai dipilih berdasarkan total kerja terkumpul, bukan jumlah blok. Di sini: ' + lebihPanjang + '.'));
    }
    const fork = h('div', { class: 'grid grid-2' }, kontrolSisi('A'), kontrolSisi('B'));
    segarFork();
    return h('div', { class: 'lab' }, labHeader(lb, 'Pratinjau Level 5. Mining adalah mencari nonce sampai hash header lebih kecil dari target. Lab ini memakai target jauh lebih mudah dari jaringan asli supaya selesai dalam hitungan detik.'),
      h('div', { class: 'panel' }, h('h3', null, '1. Cari nonce'), h('label', { for: 'pw-bit' }, 'Target latihan'), bitSel, h('div', { class: 'baris', style: 'margin-top:10px' }, bCari, bStop), status, hasil,
        h('p', { class: 'muted kecil' }, 'Aturan sebenarnya: hash blok, dibaca sebagai bilangan 256 bit, harus lebih kecil dari target. Jumlah angka nol di depan hanyalah akibatnya, bukan aturannya. Kesulitan jaringan disesuaikan setiap 2016 blok.')),
      h('div', { class: 'panel' }, h('h3', null, '2. Dua rantai bersaing (fork)'), para('Saat dua rantai valid bersaing, node memilih yang total kerjanya terbesar. Coba buat rantai yang lebih pendek tetapi lebih sulit.'), fork, forkOut,
        h('button', { class: 'btn', type: 'button', onclick: () => { f = LAB.PW.awalFork(); render(); } }, 'Ulangi dari awal')));
  }

  const LAB_VIEW = { 'lab-double-spend': labDoubleSpend, 'lab-hash': labHash, 'lab-signature': labSignature, 'lab-tamper': labTamper, 'lab-utxo': labUtxo, 'lab-pow': labPow };

  function viewLabs() {
    return h('div', { class: 'narrow' }, h('h1', null, 'Lab simulasi'), para('Enam lab yang bisa diubah-ubah. Semuanya simulasi di perangkatmu, tanpa jaringan Bitcoin dan tanpa dana atau kunci asli.'),
      h('ul', { class: 'istilah-daftar' }, D.labs.map((lb) => h('li', null, h('a', { href: '#/labs/' + lb.slug }, h('strong', null, lb.title), repo.labSelesai(lb.id) ? h('span', { class: 'tag tag-ok', style: 'margin-left:8px' }, 'Selesai') : null, h('span', { class: 'kecil muted', style: 'display:block' }, 'Level ' + lb.level + (lb.level === 5 ? ' (pratinjau)' : '') + ' · ' + lb.desc))))));
  }
  function viewLab(slug) {
    const lb = D.labBySlug(slug);
    if (!lb) return viewTidakAda();
    return LAB_VIEW[lb.id](lb);
  }

  /* ================= router ================= */
  const NAV = [['#/', 'Beranda', 'home', (r) => r === ''], ['#/learn', 'Belajar', 'buku', (r) => r.startsWith('learn') || r.startsWith('checkpoint') || r === 'capstone'], ['#/labs', 'Lab', 'lab', (r) => r.startsWith('labs')], ['#/glossary', 'Glosarium', 'istilah', (r) => r.startsWith('glossary')], ['#/settings', 'Pengaturan', 'atur', (r) => r === 'settings']];

  function rute() {
    const raw = (location.hash || '#/').replace(/^#\/?/, '');
    return raw.replace(/\/+$/, '');
  }

  function render() {
    const r = rute();
    const p = r.split('/');
    let node; let judul = 'Genesis';
    try {
      if (r === '') node = viewHome();
      else if (r === 'learn') { node = viewLearn(); judul = 'Belajar'; }
      else if (r === 'learn/path') { node = viewPath(); judul = 'Jalur belajar'; }
      else if (p[0] === 'learn' && p[1] === 'level') { node = viewLevel(Number(p[2])); judul = 'Level ' + p[2]; }
      else if (p[0] === 'learn' && p[1] === 'lesson') { node = viewLesson(p[2]); const l = D.lessonBySlug(p[2]); judul = l ? l.title : 'Lesson'; }
      else if (r === 'labs') { node = viewLabs(); judul = 'Lab'; }
      else if (p[0] === 'labs' && p[1]) { node = viewLab(p[1]); const lb = D.labBySlug(p[1]); judul = lb ? lb.title : 'Lab'; }
      else if (r === 'glossary') { node = viewGlossary(); judul = 'Glosarium'; }
      else if (p[0] === 'glossary' && p[1]) { node = viewTerm(decodeURIComponent(p[1])); const t = D.termById(p[1]); judul = t ? t.term : 'Istilah'; }
      else if (p[0] === 'checkpoint' && p[1]) { node = viewCheckpoint(Number(p[1])); judul = 'Checkpoint Level ' + p[1]; }
      else if (p[0] === 'cari') { node = viewCari(decodeURIComponent(p.slice(1).join('/'))); judul = 'Pencarian'; }
      else if (r === 'capstone') { node = viewCapstone(); judul = 'Proyek akhir'; }
      else if (r === 'references') { node = viewReferences(); judul = 'Referensi'; }
      else if (r === 'about') { node = viewAbout(); judul = 'Tentang'; }
      else if (r === 'settings') { node = viewSettings(); judul = 'Pengaturan'; }
      else { node = viewTidakAda(); judul = 'Tidak ditemukan'; }
    } catch (err) {
      console.error(err);
      node = h('div', { class: 'narrow' }, h('h1', null, 'Terjadi kesalahan'), h('p', { class: 'banner banner-err', role: 'alert' }, 'Halaman ini gagal ditampilkan. Muat ulang atau kembali ke beranda.'), h('a', { class: 'btn', href: '#/' }, 'Ke beranda'));
    }
    if (toastEl) toastEl.style.display = 'none';
    pembersih.forEach((f) => f()); pembersih = []; const tugas = pascaRender; pascaRender = null;
    app.innerHTML = '';
    if (repo.peringatan.length && r === '') app.appendChild(h('p', { class: 'banner', role: 'status' }, repo.peringatan[0]));
    app.appendChild(node);
    if (tugas) tugas();
    document.title = (r === '' ? 'Genesis, belajar Bitcoin dari dasar' : judul + ' | Genesis');
    navEl.innerHTML = '';
    NAV.forEach(([href, label, ic, aktif]) => { const a = h('a', { href }, icon(ic), h('span', null, label)); if (aktif(r)) a.setAttribute('aria-current', 'page'); navEl.appendChild(a); });
    window.scrollTo(0, 0);
    const fokus = app.querySelector('h1');
    if (fokus) { fokus.setAttribute('tabindex', '-1'); fokus.focus({ preventScroll: true }); }
  }

  const dlgCari = document.getElementById('dlg-cari');
  document.getElementById('btn-cari').addEventListener('click', () => {
    if (typeof dlgCari.showModal === 'function') dlgCari.showModal(); else dlgCari.setAttribute('open', '');
    document.getElementById('q-cari').focus();
  });
  document.getElementById('tutup-cari').addEventListener('click', () => dlgCari.close());
  dlgCari.addEventListener('click', (e) => { if (e.target === dlgCari) dlgCari.close(); });
  dlgCari.querySelectorAll('.saran-cari a').forEach((a) => a.addEventListener('click', () => dlgCari.close()));
  document.getElementById('form-cari').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('q-cari').value.trim();
    if (q) { location.hash = '#/cari/' + encodeURIComponent(q); dlgCari.close(); }
  });
  document.getElementById('btn-tema').addEventListener('click', () => {
    repo.setPrefs({ theme: temaGelap() ? 'light' : 'dark' }); applyPrefs();
    if (rute() === 'settings') render();
  });
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', segarTombolTema);
  }
  window.addEventListener('hashchange', render);

  const galatKonten = D.validate();
  if (!galatKonten.ok) console.warn('Konten Genesis punya masalah:', galatKonten.errors);
  applyPrefs();
  render();

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline opsional, abaikan galat */ });
  }
})();

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const R = (f) => require(path.join(__dirname, '..', f));

const D = R('genesis-data.js');
R('genesis-konten-level0-1.js');
R('genesis-konten-level2-3.js');
R('genesis-konten-level4.js');
const C = R('genesis-core.js');
const L = R('genesis-lab-logika.js');
const H = R('genesis-hash.js');
const K = R('genesis-kunci.js');

/* ---------- konten ---------- */
test('konten lolos validator (ID unik, relasi, prasyarat tanpa siklus, kuis >= 3 soal)', () => {
  const v = D.validate();
  assert.deepEqual(v.errors, []);
  assert.equal(v.ok, true);
});

test('jumlah lesson per level sesuai rencana', () => {
  const hitung = (n) => D.lessonsOfLevel(n).length;
  assert.deepEqual([0, 1, 2, 3, 4].map(hitung), [1, 6, 7, 6, 9]);
});

test('checkpoint tiap level berisi soal dan berasal dari level itu', () => {
  for (const n of [1, 2, 3, 4]) {
    const q = D.checkpointQuestions(n);
    assert.ok(q.length >= 5, 'level ' + n);
    const ids = new Set(D.lessonsOfLevel(n).map((l) => l.id));
    assert.ok(q.every((x) => ids.has(x.lessonId)));
  }
});

test('pencarian menemukan lesson dan istilah', () => {
  assert.ok(D.search('utxo').length > 0);
  assert.deepEqual(D.search('x'), []);
});

/* ---------- kuis dan penguasaan ---------- */
const soal = [
  { id: 'a', answer: 1, options: ['x', 'y', 'z'] },
  { id: 'b', answer: 0, options: ['x', 'y', 'z'] },
  { id: 'c', answer: 2, options: ['x', 'y', 'z'], application: true },
  { id: 'd', answer: 1, options: ['x', 'y', 'z'] },
  { id: 'e', answer: 0, options: ['x', 'y', 'z'] },
];

test('penilaian kuis: soal kosong dihitung salah', () => {
  const h = C.gradeQuiz(soal, { a: 1, b: 0 });
  assert.equal(h.score, 2);
  assert.equal(h.pct, 40);
  assert.deepEqual(h.wrong, ['c', 'd', 'e']);
});

test('penguasaan lesson: 80% saja tidak cukup bila soal aplikasi salah', () => {
  const h = C.gradeQuiz(soal, { a: 1, b: 0, c: 0, d: 1, e: 0 });
  assert.equal(h.pct, 80);
  assert.equal(C.lessonMasteredBy(h), false);
  const ok = C.gradeQuiz(soal, { a: 1, b: 0, c: 2, d: 1, e: 2 });
  assert.equal(ok.pct, 80);
  assert.equal(C.lessonMasteredBy(ok), true);
});

function repoBaru() {
  const storage = C.createStorage(null); // memori
  return C.createRepo(storage, D, () => '2026-11-14T00:00:00.000Z').load();
}

test('status lesson naik: in-progress, completed, mastered, tidak pernah turun', () => {
  const r = repoBaru();
  const l = D.lessonsOfLevel(1)[0];
  assert.equal(r.statusLesson(l.id), 'not-started');
  r.mulaiLesson(l.id);
  assert.equal(r.statusLesson(l.id), 'in-progress');
  const benar = {};
  l.quiz.forEach((q) => { benar[q.id] = q.answer; });
  r.catatKuis(l.id, l.quiz, benar, l.id);
  assert.equal(r.statusLesson(l.id), 'mastered');
  r.mulaiLesson(l.id);
  assert.equal(r.statusLesson(l.id), 'mastered');
});

test('penguasaan level butuh checkpoint >= 80% dan lab utama selesai', () => {
  const r = repoBaru();
  const q = D.checkpointQuestions(1);
  const benar = {};
  q.forEach((x) => { benar[x.id] = x.answer; });
  r.catatKuis('cp-level-1', q, benar, null);
  assert.equal(r.levelStatus(1), false);
  r.catatLab('lab-double-spend');
  assert.equal(r.levelStatus(1), true);
});

test('level 0 dikuasai bila semua lesson selesai', () => {
  const r = repoBaru();
  assert.equal(r.levelDikuasai(0), false);
  r.selesaiLesson('l0-01');
  assert.equal(r.levelDikuasai(0), true);
});

/* ---------- penyimpanan ---------- */
function fakeLS(awal = {}) {
  const m = new Map(Object.entries(awal));
  return {
    get length() { return m.size; },
    key: (i) => Array.from(m.keys())[i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    _m: m,
  };
}

test('progres bertahan antar sesi (muat ulang)', () => {
  const ls = fakeLS();
  const r1 = C.createRepo(C.createStorage(ls), D).load();
  r1.selesaiLesson('l0-01');
  const r2 = C.createRepo(C.createStorage(ls), D).load();
  assert.equal(r2.statusLesson('l0-01'), 'completed');
});

test('data tersimpan rusak (JSON tidak valid) tidak membuat aplikasi gagal', () => {
  const ls = fakeLS({ 'btc-learn:v1:progress': '{bukan json', 'btc-learn:v1:preferences': '[1,2]' });
  const r = C.createRepo(C.createStorage(ls), D).load();
  assert.equal(r.statusLesson('l0-01'), 'not-started');
  assert.equal(r.prefs.theme, 'auto');
  assert.ok(r.peringatan.length > 0);
});

test('bentuk data salah disanitasi, status asing dibuang', () => {
  const p = C.sanitizeProgress({ lessons: { x: { status: 'hack' }, y: { status: 'completed' } }, labs: 5 });
  assert.equal(p.lessons.x, undefined);
  assert.equal(p.lessons.y.status, 'completed');
  assert.deepEqual(p.labs, {});
});

test('sanitasi idempoten (migrasi dua kali sama dengan sekali)', () => {
  const raw = { lessons: { y: { status: 'mastered', masteredAt: 't' } }, labs: { a: { completed: true } } };
  const once = C.sanitizeProgress(raw);
  assert.deepEqual(C.sanitizeProgress(once), once);
});

test('storage gagal (localStorage melempar galat) jatuh ke memori dan memberi peringatan', () => {
  const buruk = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); }, removeItem() {}, length: 0, key: () => null };
  const st = C.createStorage(buruk);
  assert.equal(st.persisten, false);
  const r = C.createRepo(st, D).load();
  r.selesaiLesson('l0-01');
  assert.equal(r.statusLesson('l0-01'), 'completed');
  assert.ok(r.peringatan.some((p) => p.includes('tidak tersedia')));
});

test('reset hanya menghapus namespace btc-learn', () => {
  const ls = fakeLS({ 'lain:kunci': 'aman' });
  const r = C.createRepo(C.createStorage(ls), D).load();
  r.selesaiLesson('l0-01');
  assert.ok(ls._m.has('btc-learn:v1:progress'));
  r.reset();
  assert.equal(ls._m.has('btc-learn:v1:progress'), false);
  assert.equal(ls._m.get('lain:kunci'), 'aman');
  assert.equal(r.statusLesson('l0-01'), 'not-started');
});

/* ---------- hash dan kunci ---------- */
test('SHA-256 cocok dengan vektor standar', () => {
  assert.equal(H.sha256Hex(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(H.sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('hash genesis block Bitcoin dihitung benar dari header 80 byte', () => {
  const h = H.hashHeader({
    versi: 1, prev: '00'.repeat(32),
    merkle: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
    waktu: 1231006505, bits: 0x1d00ffff, nonce: 2083236893,
  });
  assert.equal(h, '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f');
});

test('alamat dari kunci privat 1 dan tanda tangan ECDSA terverifikasi', () => {
  assert.equal(K.alamat(K.kunciPublik(1n)), '1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH');
  const k = L.SG.buatKunciUji('0000000000000000000000000000000000000000000000000000000000012345');
  const sig = L.SG.tandatangani(k, 'halo');
  assert.equal(L.SG.verifikasi(k.pubHex, 'halo', sig), true);
  assert.equal(L.SG.verifikasi(k.pubHex, 'halO', sig), false);
});

/* ---------- lab ---------- */
test('hash playground: satu karakter berbeda mengubah sekitar separuh bit', () => {
  const h = L.HP.bandingkan('Halo dunia', 'Halo dunib');
  assert.equal(h.sama, false);
  assert.ok(h.bit > 80 && h.bit < 176, 'bit beda ' + h.bit);
  assert.equal(L.HP.bandingkan('sama', 'sama').sama, true);
});

test('double spending: transaksi kedua ditolak, urutan menentukan pemenang', () => {
  let s = L.DS.awal();
  s = L.DS.reduce(s, { type: 'mode', mode: 'dengan-blok' });
  s = L.DS.reduce(s, { type: 'kirim', ke: 'bob' });
  s = L.DS.reduce(s, { type: 'kirim', ke: 'carol' });
  s = L.DS.reduce(s, { type: 'buatBlok' });
  assert.deepEqual(s.blok, { bob: 'dikonfirmasi', carol: 'ditolak' });
  s = L.DS.reduce(s, { type: 'urutan', pertama: 'carol' });
  s = L.DS.reduce(s, { type: 'buatBlok' });
  assert.deepEqual(s.blok, { bob: 'ditolak', carol: 'dikonfirmasi' });
  assert.equal(L.DS.konflik(s), true);
});

test('double spending tanpa buku besar: keduanya merasa dibayar', () => {
  let s = L.DS.awal();
  s = L.DS.reduce(s, { type: 'kirim', ke: 'bob' });
  s = L.DS.reduce(s, { type: 'kirim', ke: 'carol' });
  assert.deepEqual(L.DS.keyakinan(s), { bob: 'merasa-dibayar', carol: 'merasa-dibayar' });
});

test('mengubah blockchain: blok diubah dan blok sesudahnya tidak valid', () => {
  let s = L.BC.awal(8);
  assert.equal(L.BC.valid(s.rantai, s.bitNol), true);
  s = L.BC.reduce(s, { type: 'ubahData', i: 1, data: 'Bob bayar Carol 2000' });
  const p = L.BC.periksa(s.rantai, s.bitNol);
  assert.equal(p[0].valid, true);
  assert.equal(p[1].hashCocok, false);
  assert.equal(p[2].tersambung, false); // kerusakan menjalar: blok 3 menunjuk hash lama blok 2
  s = L.BC.reduce(s, { type: 'tambangUlang', i: 1 });
  const p2 = L.BC.periksa(s.rantai, s.bitNol);
  assert.equal(p2[1].valid, true);
  assert.equal(p2[2].tersambung, false);
  s = L.BC.reduce(s, { type: 'tambangSemuaSetelah', i: 1 });
  assert.equal(L.BC.valid(s.rantai, s.bitNol), true);
});

test('UTXO: parse BTC tanpa float dan contoh bawaan 0.5 = 0.3 + 0.199 + 0.001', () => {
  assert.equal(L.UT.parseBtc('0.199'), 19900000);
  assert.equal(L.UT.parseBtc('0,3'), 30000000);
  assert.equal(L.UT.parseBtc('0.123456789'), null);
  assert.equal(L.UT.parseBtc('abc'), null);
  assert.equal(L.UT.formatBtc(19900000), '0.199');
  let s = L.UT.awal();
  assert.equal(L.UT.validasi(s).valid, false);
  s = L.UT.reduce(s, { type: 'togglePilih', key: L.UT.key(s.dompet[0]) });
  const v = L.UT.validasi(s);
  assert.equal(v.valid, true);
  assert.equal(v.fee, 100000);
  assert.equal(L.UT.formatBtc(v.fee), '0.001');
  assert.match(v.txid, /^[0-9a-f]{64}$/);
});

test('UTXO: output melebihi input ditolak, kembalian lupa memicu catatan fee besar', () => {
  let s = L.UT.awal();
  s = L.UT.reduce(s, { type: 'togglePilih', key: L.UT.key(s.dompet[0]) });
  s = L.UT.reduce(s, { type: 'setOutput', i: 0, sat: 60000000 });
  assert.equal(L.UT.validasi(s).valid, false);
  s = L.UT.reduce(s, { type: 'setOutput', i: 0, sat: 30000000 });
  s = L.UT.reduce(s, { type: 'hapusOutput', i: 1 });
  const v = L.UT.validasi(s);
  assert.equal(v.valid, true);
  assert.ok(v.catatan.length > 0);
});

test('UTXO: siaran menghabiskan input dan membuat output kembalian baru', () => {
  let s = L.UT.awal();
  s = L.UT.reduce(s, { type: 'togglePilih', key: L.UT.key(s.dompet[0]) });
  s = L.UT.reduce(s, { type: 'siarkan' });
  assert.equal(s.dompet.length, 3);
  assert.ok(s.dompet.every((u) => u.sat !== 50000000));
  assert.ok(s.siaran && s.siaran.fee === 100000);
});

test('PoW: nonce ditemukan memenuhi target; kerja total rantai menentukan pemenang, bukan panjang', () => {
  const r = L.PW.cobaRentang(8, 0, 200000);
  assert.equal(r.ditemukan, true);
  assert.ok(BigInt('0x' + r.hash) < (1n << 248n));
  const s = L.PW.awalFork();
  assert.ok(s.B.length > s.A.length);
  const p = L.PW.pilihRantai(s.A, s.B);
  assert.equal(p.pemenang, 'A');
  const seri = L.PW.pilihRantai([{ bitNol: 10 }], [{ bitNol: 10 }]);
  assert.equal(seri.pemenang, 'seri');
});

test('impor progres menyanitasi data dan menolak bentuk aneh', () => {
  const r = repoBaru();
  r.impor({ lessons: { 'l0-01': { status: 'completed' }, x: { status: 'hack' } }, labs: 'rusak' }, { bukan: 'array' });
  assert.equal(r.statusLesson('l0-01'), 'completed');
  assert.equal(r.statusLesson('x'), 'not-started');
  assert.deepEqual(r.attempts, {});
});

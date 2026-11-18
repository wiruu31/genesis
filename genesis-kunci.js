/* Genesis v2.0.0, genesis-kunci.js
 * Kurva secp256k1, kunci publik, tanda tangan ECDSA, dan alamat Bitcoin.
 * Aritmetika BigInt murni. HANYA UNTUK BELAJAR (TEST ONLY): tidak tahan serangan waktu (timing).
 * Kunci yang dibuat di sini bersifat sementara di memori. Jangan pernah memasukkan kunci privat asli.
 */
(function (root) {
  'use strict';
  const H = root.Hash || (typeof require !== 'undefined' ? require('./genesis-hash.js') : null);

  const P = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn;
  const N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;
  const G = {
    x: 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n,
    y: 0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n,
  };

  const mod = (a, m = P) => { const r = a % m; return r >= 0n ? r : r + m; };

  function inv(a, m = P) {
    let [lo, hi] = [mod(a, m), m];
    let [x0, x1] = [1n, 0n];
    while (hi) {
      const q = lo / hi;
      [lo, hi] = [hi, lo - q * hi];
      [x0, x1] = [x1, x0 - q * x1];
    }
    return mod(x0, m);
  }

  /* Titik tak hingga ditulis null. */
  function tambah(a, b) {
    if (!a) return b;
    if (!b) return a;
    if (a.x === b.x) {
      if (mod(a.y + b.y) === 0n) return null;
      const s = mod(3n * a.x * a.x * inv(2n * a.y));
      const x = mod(s * s - 2n * a.x);
      return { x, y: mod(s * (a.x - x) - a.y) };
    }
    const s = mod((b.y - a.y) * inv(b.x - a.x));
    const x = mod(s * s - a.x - b.x);
    return { x, y: mod(s * (a.x - x) - a.y) };
  }

  function kali(k, titik = G) {
    let n = mod(k, N);
    let hasil = null;
    let tambahan = titik;
    while (n > 0n) {
      if (n & 1n) hasil = tambah(hasil, tambahan);
      tambahan = tambah(tambahan, tambahan);
      n >>= 1n;
    }
    return hasil;
  }

  const diKurva = (t) => !!t && mod(t.y * t.y - t.x * t.x * t.x - 7n) === 0n;

  /* ---------- konversi ---------- */
  const keHex = (n, panjang = 64) => n.toString(16).padStart(panjang, '0');
  const dariHex = (h) => BigInt('0x' + (h || '0'));
  const bytesKeBig = (b) => dariHex(H.toHex(b));

  function acak32() {
    for (;;) {
      const b = new Uint8Array(32);
      crypto.getRandomValues(b);
      const k = bytesKeBig(b);
      if (k > 0n && k < N) return k;
    }
  }

  /* ---------- kunci ---------- */
  function kunciPublik(priv) { return kali(priv); }

  function serialisasiPublik(pub, terkompresi = true) {
    if (terkompresi) return '0' + (pub.y & 1n ? '3' : '2') + keHex(pub.x);
    return '04' + keHex(pub.x) + keHex(pub.y);
  }

  function pangkat(b, e, m = P) {
    let r = 1n; b = mod(b, m);
    while (e > 0n) { if (e & 1n) r = mod(r * b, m); b = mod(b * b, m); e >>= 1n; }
    return r;
  }

  function parsePublik(hex) {
    const h = hex.trim().toLowerCase();
    if (h.length === 130 && h.startsWith('04')) return { x: dariHex(h.slice(2, 66)), y: dariHex(h.slice(66)) };
    if (h.length === 66 && (h.startsWith('02') || h.startsWith('03'))) {
      const x = dariHex(h.slice(2));
      const y2 = mod(x * x * x + 7n);
      let y = pangkat(y2, (P + 1n) / 4n);
      if ((y & 1n) !== BigInt(h[1] === '3' ? 1 : 0)) y = P - y;
      return { x, y };
    }
    throw new Error('Format kunci publik tidak dikenali');
  }

  /* Alamat P2PKH versi 0x00 (awalan angka 1). */
  function alamat(pub, terkompresi = true) {
    const h = H.hash160(H.fromHex(serialisasiPublik(pub, terkompresi)));
    return H.base58check(H.concat(Uint8Array.of(0x00), h));
  }

  /* Format WIF: kunci privat dengan checksum, mudah disalin. */
  function keWIF(priv, terkompresi = true) {
    const isi = [Uint8Array.of(0x80), H.fromHex(keHex(priv))];
    if (terkompresi) isi.push(Uint8Array.of(0x01));
    return H.base58check(H.concat(...isi));
  }

  /* ---------- ECDSA ---------- */
  /* Nonce k deterministik (RFC 6979, HMAC-SHA256) supaya k tidak pernah diulang atau bisa ditebak.
     Ini nonce tanda tangan, tidak ada hubungannya dengan nonce mining di header blok. */
  function nonceDeterministik(priv, z) {
    const x = H.fromHex(keHex(priv));
    const h1 = H.fromHex(keHex(z));
    let v = new Uint8Array(32).fill(1);
    let k = new Uint8Array(32);
    const hm = (key, ...p) => H.hmacSha256(key, H.concat(...p));
    k = hm(k, v, Uint8Array.of(0), x, h1); v = hm(k, v);
    k = hm(k, v, Uint8Array.of(1), x, h1); v = hm(k, v);
    for (;;) {
      v = hm(k, v);
      const cand = bytesKeBig(v);
      if (cand > 0n && cand < N) return cand;
      k = hm(k, v, Uint8Array.of(0)); v = hm(k, v);
    }
  }

  /* Pesan di-hash dua kali dengan SHA-256, lalu diperlakukan sebagai angka. */
  const hashPesan = (pesan) => bytesKeBig(H.sha256d(H.toBytes(pesan)));

  function tandatangani(priv, pesan) {
    const z = mod(hashPesan(pesan), N);
    const k = nonceDeterministik(priv, z);
    const R = kali(k);
    const r = mod(R.x, N);
    let s = mod(inv(k, N) * (z + r * priv), N);
    if (s > N / 2n) s = N - s; // bentuk "low-s"
    return { r, s };
  }

  function verifikasi(pub, pesan, sig) {
    const { r, s } = sig;
    if (!diKurva(pub)) return false;
    if (r <= 0n || r >= N || s <= 0n || s >= N) return false;
    const z = mod(hashPesan(pesan), N);
    const w = inv(s, N);
    const u1 = mod(z * w, N);
    const u2 = mod(r * w, N);
    const X = tambah(kali(u1), kali(u2, pub));
    return !!X && mod(X.x, N) === r;
  }

  const sigKeHex = (sig) => keHex(sig.r) + keHex(sig.s);
  const sigDariHex = (h) => ({ r: dariHex(h.slice(0, 64)), s: dariHex(h.slice(64, 128)) });

  root.Kunci = {
    P, N, G, mod, inv, tambah, kali, diKurva,
    keHex, dariHex, acak32, kunciPublik, serialisasiPublik, parsePublik,
    alamat, keWIF, tandatangani, verifikasi, sigKeHex, sigDariHex, hashPesan,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.Kunci;
})(typeof self !== 'undefined' ? self : globalThis);

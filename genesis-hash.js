/* Genesis v2.0.0, genesis-hash.js
 * Fungsi hash dan utilitas blok, ditulis sendiri tanpa library.
 * Sinkron (bukan Web Crypto) supaya lab mining bisa mencoba ribuan nonce per detik.
 * Dipakai oleh genesis-kunci.js, lab, dan konten.
 * Hanya untuk belajar. Jangan dipakai menjaga uang asli.
 */
(function (root) {
  'use strict';

  /* ---------- byte dan hex ---------- */
  const enc = new TextEncoder();

  function utf8(str) { return enc.encode(String(str)); }
  function toBytes(x) { return typeof x === 'string' ? utf8(x) : x; }

  function toHex(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, '0');
    return s;
  }
  function fromHex(hex) {
    const clean = String(hex).trim();
    if (clean.length % 2 || /[^0-9a-f]/i.test(clean)) throw new Error('Hex tidak valid');
    const out = new Uint8Array(clean.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16);
    return out;
  }
  function concat(...parts) {
    const len = parts.reduce((n, p) => n + p.length, 0);
    const out = new Uint8Array(len);
    let o = 0;
    for (const p of parts) { out.set(p, o); o += p.length; }
    return out;
  }
  function reverse(bytes) { return Uint8Array.from(bytes).reverse(); }

  const ror = (x, n) => (x >>> n) | (x << (32 - n));
  const rol = (x, n) => (x << n) | (x >>> (32 - n));

  /* ---------- SHA-256 ---------- */
  /* Konstanta diturunkan dari akar bilangan prima: 8 prima pertama (awal) dan 64 prima pertama (putaran). */
  const PRIMA = [];
  for (let n = 2; PRIMA.length < 64; n++) {
    let prima = true;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) { prima = false; break; }
    if (prima) PRIMA.push(n);
  }
  const frac32 = (x) => Math.floor((x - Math.floor(x)) * 4294967296) >>> 0;
  const SHA_K = Uint32Array.from(PRIMA.map((p) => frac32(Math.cbrt(p))));
  const SHA_H0 = Uint32Array.from(PRIMA.slice(0, 8).map((p) => frac32(Math.sqrt(p))));

  const W = new Uint32Array(64);

  function sha256(input) {
    const msg = toBytes(input);
    const len = msg.length;
    const total = ((len + 9 + 63) >> 6) << 6;
    const buf = new Uint8Array(total);
    buf.set(msg);
    buf[len] = 0x80;
    const dv = new DataView(buf.buffer);
    dv.setUint32(total - 8, Math.floor(len / 0x20000000));
    dv.setUint32(total - 4, (len << 3) >>> 0);

    let h0 = SHA_H0[0], h1 = SHA_H0[1], h2 = SHA_H0[2], h3 = SHA_H0[3];
    let h4 = SHA_H0[4], h5 = SHA_H0[5], h6 = SHA_H0[6], h7 = SHA_H0[7];

    for (let off = 0; off < total; off += 64) {
      for (let i = 0; i < 16; i++) W[i] = dv.getUint32(off + i * 4);
      for (let i = 16; i < 64; i++) {
        const a = W[i - 15], b = W[i - 2];
        const s0 = ror(a, 7) ^ ror(a, 18) ^ (a >>> 3);
        const s1 = ror(b, 17) ^ ror(b, 19) ^ (b >>> 10);
        W[i] = W[i - 16] + s0 + W[i - 7] + s1;
      }
      let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      for (let i = 0; i < 64; i++) {
        const S1 = ror(e, 6) ^ ror(e, 11) ^ ror(e, 25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + SHA_K[i] + W[i]) >>> 0;
        const S0 = ror(a, 2) ^ ror(a, 13) ^ ror(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0;
        d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
    }
    const out = new Uint8Array(32);
    const o = new DataView(out.buffer);
    [h0, h1, h2, h3, h4, h5, h6, h7].forEach((v, i) => o.setUint32(i * 4, v));
    return out;
  }

  const sha256d = (input) => sha256(sha256(input));
  const sha256Hex = (input) => toHex(sha256(input));

  /* ---------- HMAC-SHA256 (untuk nonce deterministik ECDSA, RFC 6979) ---------- */
  function hmacSha256(key, data) {
    let k = toBytes(key);
    if (k.length > 64) k = sha256(k);
    const pad = new Uint8Array(64);
    pad.set(k);
    const ipad = pad.map((b) => b ^ 0x36);
    const opad = pad.map((b) => b ^ 0x5c);
    return sha256(concat(opad, sha256(concat(ipad, toBytes(data)))));
  }

  /* ---------- RIPEMD-160 (untuk alamat Bitcoin) ---------- */
  const RL = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
    3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
    1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
    4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13];
  const RR = [
    5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
    6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
    15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
    8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
    12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11];
  const SL = [
    11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
    7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
    11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
    11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
    9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6];
  const SR = [
    8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
    9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
    9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
    15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
    8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11];
  const KL = [0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e];
  const KR = [0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000];

  function rmdF(j, x, y, z) {
    if (j < 16) return x ^ y ^ z;
    if (j < 32) return (x & y) | (~x & z);
    if (j < 48) return (x | ~y) ^ z;
    if (j < 64) return (x & z) | (y & ~z);
    return x ^ (y | ~z);
  }

  function ripemd160(input) {
    const msg = toBytes(input);
    const len = msg.length;
    const total = ((len + 9 + 63) >> 6) << 6;
    const buf = new Uint8Array(total);
    buf.set(msg);
    buf[len] = 0x80;
    const dv = new DataView(buf.buffer);
    dv.setUint32(total - 8, (len << 3) >>> 0, true);
    dv.setUint32(total - 4, Math.floor(len / 0x20000000), true);

    let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
    const X = new Uint32Array(16);

    for (let off = 0; off < total; off += 64) {
      for (let i = 0; i < 16; i++) X[i] = dv.getUint32(off + i * 4, true);
      let a = h0, b = h1, c = h2, d = h3, e = h4;
      let a2 = h0, b2 = h1, c2 = h2, d2 = h3, e2 = h4;
      for (let j = 0; j < 80; j++) {
        let t = (rol((a + rmdF(j, b, c, d) + X[RL[j]] + KL[j >> 4]) | 0, SL[j]) + e) | 0;
        a = e; e = d; d = rol(c, 10); c = b; b = t;
        t = (rol((a2 + rmdF(79 - j, b2, c2, d2) + X[RR[j]] + KR[j >> 4]) | 0, SR[j]) + e2) | 0;
        a2 = e2; e2 = d2; d2 = rol(c2, 10); c2 = b2; b2 = t;
      }
      const t = (h1 + c + d2) | 0;
      h1 = (h2 + d + e2) | 0;
      h2 = (h3 + e + a2) | 0;
      h3 = (h4 + a + b2) | 0;
      h4 = (h0 + b + c2) | 0;
      h0 = t;
    }
    const out = new Uint8Array(20);
    const o = new DataView(out.buffer);
    [h0, h1, h2, h3, h4].forEach((v, i) => o.setUint32(i * 4, v >>> 0, true));
    return out;
  }

  const hash160 = (input) => ripemd160(sha256(input));

  /* ---------- Base58Check ---------- */
  const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  function base58(bytes) {
    let n = 0n;
    for (const b of bytes) n = (n << 8n) | BigInt(b);
    let s = '';
    while (n > 0n) { s = B58[Number(n % 58n)] + s; n /= 58n; }
    for (const b of bytes) { if (b === 0) s = '1' + s; else break; }
    return s;
  }

  function base58check(payload) {
    const sum = sha256d(payload).slice(0, 4);
    return base58(concat(payload, sum));
  }

  /* ---------- utilitas blok Bitcoin ---------- */
  /* Pohon Merkle: daun = hash ganda tiap transaksi; bila jumlah ganjil, elemen terakhir digandakan. */
  function merkleLevels(leaves) {
    if (!leaves.length) return [];
    const levels = [leaves.slice()];
    let cur = leaves.slice();
    while (cur.length > 1) {
      const next = [];
      for (let i = 0; i < cur.length; i += 2) {
        const right = i + 1 < cur.length ? cur[i + 1] : cur[i];
        next.push(sha256d(concat(cur[i], right)));
      }
      levels.push(next);
      cur = next;
    }
    return levels;
  }
  const merkleRoot = (leaves) => { const l = merkleLevels(leaves); return l.length ? l[l.length - 1][0] : null; };

  /* Jalur bukti Merkle untuk daun ke-index: pasangan (hash saudara, posisi saudara). */
  function merkleProof(leaves, index) {
    const levels = merkleLevels(leaves);
    const proof = [];
    let i = index;
    for (let lv = 0; lv < levels.length - 1; lv++) {
      const row = levels[lv];
      const sib = i % 2 === 0 ? (i + 1 < row.length ? i + 1 : i) : i - 1;
      proof.push({ hash: row[sib], kiri: sib < i });
      i = Math.floor(i / 2);
    }
    return proof;
  }
  function merkleVerify(leaf, proof, root) {
    let cur = leaf;
    for (const p of proof) cur = sha256d(p.kiri ? concat(p.hash, cur) : concat(cur, p.hash));
    return toHex(cur) === toHex(root);
  }

  /* Header 80 byte: versi, hash blok sebelumnya, akar Merkle, waktu, bits, nonce.
     Hash dan akar dalam tampilan hex ditulis terbalik (urutan byte internal dibalik). */
  function headerBytes(h) {
    const b = new Uint8Array(80);
    const dv = new DataView(b.buffer);
    dv.setInt32(0, h.versi, true);
    b.set(reverse(fromHex(h.prev)), 4);
    b.set(reverse(fromHex(h.merkle)), 36);
    dv.setUint32(68, h.waktu, true);
    dv.setUint32(72, h.bits, true);
    dv.setUint32(76, h.nonce >>> 0, true);
    return b;
  }
  const hashHeader = (h) => toHex(reverse(sha256d(headerBytes(h))));

  /* Target dari bits terkompresi (mis. 0x1d00ffff). Hash blok harus lebih kecil dari target. */
  function bitsKeTarget(bits) {
    const eksp = bits >>> 24;
    const mant = BigInt(bits & 0x7fffff);
    return eksp <= 3 ? mant >> BigInt(8 * (3 - eksp)) : mant << BigInt(8 * (eksp - 3));
  }
  const hashKeAngka = (hexTampilan) => BigInt('0x' + hexTampilan);

  /* Berapa hash yang diharapkan sampai satu berhasil, untuk target tertentu. */
  function rataRataPercobaan(target) { return Number((1n << 256n) / (target + 1n)); }

  root.Hash = {
    utf8, toBytes, toHex, fromHex, concat, reverse,
    sha256, sha256d, sha256Hex, hmacSha256, ripemd160, hash160,
    base58, base58check,
    merkleLevels, merkleRoot, merkleProof, merkleVerify,
    headerBytes, hashHeader, bitsKeTarget, hashKeAngka, rataRataPercobaan,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.Hash;
})(typeof self !== 'undefined' ? self : globalThis);

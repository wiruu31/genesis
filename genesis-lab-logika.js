/* Genesis v2.0.0, genesis-lab-logika.js
 * Logika deterministik semua lab (tanpa DOM). Tiap lab: keadaan awal, reducer, selector turunan.
 * Semua keluaran adalah SIMULASI EDUKASI. Tidak ada transaksi nyata dan tidak ada kunci asli.
 */
(function (root) {
  'use strict';
  const H = root.Hash || (typeof require !== 'undefined' ? require('./genesis-hash.js') : null);
  const K = root.Kunci || (typeof require !== 'undefined' ? require('./genesis-kunci.js') : null);

  /* ================= 1. Double spending ================= */
  /* Alice punya satu koin. Dua transaksi menghabiskan koin yang sama. Buku besar memproses sesuai urutan blok. */
  const DS = {
    awal() {
      return { mode: 'tanpa-buku', pertama: 'bob', dikirim: { bob: false, carol: false }, dibuat: false, blok: null };
    },
    reduce(s, a) {
      const n = Object.assign({}, s, { dikirim: Object.assign({}, s.dikirim) });
      switch (a.type) {
        case 'mode': n.mode = a.mode; n.dibuat = false; n.blok = null; break;
        case 'urutan': n.pertama = a.pertama; n.dibuat = false; n.blok = null; break;
        case 'kirim': n.dikirim[a.ke] = true; n.dibuat = false; n.blok = null; break;
        case 'buatBlok': n.dibuat = true; n.blok = DS.prosesBlok(s); break;
        case 'reset': return DS.awal();
        default: return s;
      }
      return n;
    },
    /* Memproses transaksi yang dikirim sesuai urutan di blok. Koin yang sudah terpakai menolak transaksi berikutnya. */
    prosesBlok(s) {
      const urutan = s.pertama === 'bob' ? ['bob', 'carol'] : ['carol', 'bob'];
      const dipakai = new Set();
      const hasil = {};
      for (const ke of urutan) {
        if (!s.dikirim[ke]) { hasil[ke] = 'tidak-dikirim'; continue; }
        if (dipakai.has('koin-alice')) hasil[ke] = 'ditolak';
        else { dipakai.add('koin-alice'); hasil[ke] = 'dikonfirmasi'; }
      }
      return hasil;
    },
    /* Tanpa buku besar bersama, tiap penerima hanya percaya pada pesan yang ia terima. */
    keyakinan(s) {
      if (s.mode === 'tanpa-buku') {
        return { bob: s.dikirim.bob ? 'merasa-dibayar' : 'menunggu', carol: s.dikirim.carol ? 'merasa-dibayar' : 'menunggu' };
      }
      if (!s.dibuat) return { bob: s.dikirim.bob ? 'belum-konfirmasi' : 'menunggu', carol: s.dikirim.carol ? 'belum-konfirmasi' : 'menunggu' };
      const m = { 'dikonfirmasi': 'dibayar', 'ditolak': 'ditolak', 'tidak-dikirim': 'menunggu' };
      return { bob: m[s.blok.bob], carol: m[s.blok.carol] };
    },
    konflik(s) { return s.dikirim.bob && s.dikirim.carol; },
  };

  /* ================= 2. Hash playground ================= */
  const HP = {
    hash(teks) { return H.sha256Hex(String(teks)); },
    /* Jumlah bit berbeda antara dua hash hex 64 karakter. */
    bitBeda(a, b) {
      let n = 0;
      const len = Math.min(a.length, b.length);
      for (let i = 0; i < len; i++) {
        let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
        while (x) { n += x & 1; x >>= 1; }
      }
      return n;
    },
    /* Posisi karakter hex yang berbeda, untuk disorot di UI. */
    posisiBeda(a, b) {
      const out = [];
      for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) out.push(i);
      return out;
    },
    bandingkan(teksA, teksB) {
      const a = HP.hash(teksA);
      const b = HP.hash(teksB);
      const bit = HP.bitBeda(a, b);
      return { a, b, sama: a === b, bit, persen: Math.round((bit / 256) * 1000) / 10, posisi: HP.posisiBeda(a, b) };
    },
  };

  /* ================= 3. Kunci dan tanda tangan (TEST ONLY) ================= */
  const SG = {
    /* privHex opsional dipakai tes agar deterministik. Di UI selalu acak dan hanya hidup di memori. */
    buatKunciUji(privHex) {
      const priv = privHex ? BigInt('0x' + privHex) : K.acak32();
      const pub = K.kunciPublik(priv);
      return { priv, pubHex: K.serialisasiPublik(pub), alamat: K.alamat(pub), pub };
    },
    tandatangani(kunci, pesan) { return K.sigKeHex(K.tandatangani(kunci.priv, pesan)); },
    verifikasi(pubHex, pesan, sigHex) {
      try { return K.verifikasi(K.parsePublik(pubHex), pesan, K.sigDariHex(sigHex)); } catch (e) { return false; }
    },
    /* Penjelasan hasil verifikasi untuk UI. */
    periksa(kunci, pesanAsli, pesanDiuji, sigHex) {
      const ok = SG.verifikasi(kunci.pubHex, pesanDiuji, sigHex);
      return { ok, pesanBerubah: pesanAsli !== pesanDiuji };
    },
  };

  /* ================= 4. Blockchain diubah ================= */
  /* Rantai sederhana untuk latihan. Hash blok = SHA-256 dari "indeks|prev|data|nonce".
     Ini versi yang disederhanakan: blok Bitcoin asli memakai header 80 byte (lihat lab PoW). */
  const BC = {
    ZERO: '0'.repeat(64),
    hashBlok(b) { return H.sha256Hex(b.index + '|' + b.prev + '|' + b.data + '|' + b.nonce); },
    /* Hash dianggap memenuhi target jika, dibaca sebagai bilangan, lebih kecil dari 2^(256 - bitNol). */
    memenuhi(hashHex, bitNol) { return BigInt('0x' + hashHex) < (1n << BigInt(256 - bitNol)); },
    tambang(b, bitNol, batas = 5000000) {
      const c = Object.assign({}, b);
      for (c.nonce = 0; c.nonce < batas; c.nonce++) {
        const h = BC.hashBlok(c);
        if (BC.memenuhi(h, bitNol)) { c.hash = h; return c; }
      }
      return null;
    },
    buatRantai(datas, bitNol) {
      const rantai = [];
      let prev = BC.ZERO;
      datas.forEach((data, i) => {
        const blok = BC.tambang({ index: i + 1, prev, data, nonce: 0 }, bitNol);
        rantai.push(blok);
        prev = blok.hash;
      });
      return rantai;
    },
    awal(bitNol = 10) {
      return { bitNol, rantai: BC.buatRantai(['Alice bayar Bob 5', 'Bob bayar Carol 2', 'Carol bayar Dina 1', 'Dina bayar Eko 1'], bitNol) };
    },
    /* Tiap blok: hash tersimpan cocok dengan isinya? terhubung ke hash blok sebelumnya? memenuhi target? */
    periksa(rantai, bitNol) {
      let prevHash = BC.ZERO;
      return rantai.map((b) => {
        const hitung = BC.hashBlok(b);
        const r = { hashCocok: hitung === b.hash, tersambung: b.prev === prevHash, target: BC.memenuhi(hitung, bitNol), hitung };
        r.valid = r.hashCocok && r.tersambung && r.target;
        prevHash = hitung; // node jujur selalu menghitung ulang hash dari isi blok, bukan percaya hash tersimpan
        return r;
      });
    },
    valid(rantai, bitNol) { return BC.periksa(rantai, bitNol).every((r) => r.valid); },
    reduce(s, a) {
      const rantai = s.rantai.map((b) => Object.assign({}, b));
      switch (a.type) {
        case 'ubahData': rantai[a.i].data = a.data; return Object.assign({}, s, { rantai });
        /* Tambang ulang satu blok: hash tersimpan diperbarui, tetapi blok berikutnya masih menunjuk hash lama. */
        case 'tambangUlang': {
          const baru = BC.tambang({ index: rantai[a.i].index, prev: rantai[a.i].prev, data: rantai[a.i].data, nonce: 0 }, s.bitNol);
          if (baru) rantai[a.i] = baru;
          return Object.assign({}, s, { rantai });
        }
        /* Perbaiki tautan blok sesudahnya (prev) lalu tambang ulang, satu per satu. */
        case 'tambangSemuaSetelah': {
          for (let i = a.i; i < rantai.length; i++) {
            if (i > a.i) rantai[i].prev = rantai[i - 1].hash;
            const baru = BC.tambang({ index: rantai[i].index, prev: rantai[i].prev, data: rantai[i].data, nonce: 0 }, s.bitNol);
            if (baru) rantai[i] = baru;
          }
          return Object.assign({}, s, { rantai });
        }
        case 'reset': return BC.awal(s.bitNol);
        default: return s;
      }
    },
  };

  /* ================= 5. Penyusun UTXO ================= */
  const SAT = 100000000;
  const UT = {
    SAT,
    /* "0.199" -> 19900000. Tanpa float. Mengembalikan null bila tidak valid. */
    parseBtc(str) {
      const t = String(str).trim().replace(',', '.');
      if (!/^\d+(\.\d{1,8})?$/.test(t)) return null;
      const [w, f = ''] = t.split('.');
      return Number(w) * SAT + Number(f.padEnd(8, '0'));
    },
    formatBtc(sat) {
      const neg = sat < 0;
      const a = Math.abs(sat);
      const w = Math.floor(a / SAT);
      const f = String(a % SAT).padStart(8, '0').replace(/0+$/, '');
      return (neg ? '-' : '') + w + (f ? '.' + f : '.0');
    },
    txid(inputs, outputs) {
      const s = inputs.map((i) => i.txid + ':' + i.vout).join(',') + '>' + outputs.map((o) => o.alamat + ':' + o.sat).join(',');
      return H.toHex(H.reverse(H.sha256d(s)));
    },
    awal() {
      return {
        dompet: [
          { txid: 'a1f0'.padEnd(64, '0'), vout: 0, sat: 50000000, label: 'Gaji bulan lalu' },
          { txid: 'b2e1'.padEnd(64, '0'), vout: 1, sat: 20000000, label: 'Pembayaran proyek' },
          { txid: 'c3d2'.padEnd(64, '0'), vout: 0, sat: 5000000, label: 'Hadiah kecil' },
        ],
        terpilih: [],
        output: [{ alamat: 'bc1-penerima-uji', sat: 30000000 }, { alamat: 'bc1-kembalian-uji', sat: 19900000 }],
        siaran: null,
        nomor: 1,
      };
    },
    key: (u) => u.txid + ':' + u.vout,
    satAman: (o) => (Number.isInteger(o.sat) && o.sat >= 0 ? o.sat : 0),
    reduce(s, a) {
      const n = Object.assign({}, s, { terpilih: s.terpilih.slice(), output: s.output.map((o) => Object.assign({}, o)) });
      switch (a.type) {
        case 'togglePilih': {
          const i = n.terpilih.indexOf(a.key);
          if (i >= 0) n.terpilih.splice(i, 1); else n.terpilih.push(a.key);
          n.siaran = null; break;
        }
        case 'setOutput': n.output[a.i].sat = a.sat; n.siaran = null; break;
        case 'tambahOutput': n.output.push({ alamat: 'bc1-output-uji-' + (n.output.length + 1), sat: 0 }); n.siaran = null; break;
        case 'hapusOutput': n.output.splice(a.i, 1); n.siaran = null; break;
        /* Atur fee ke nilai tertentu dengan menyesuaikan output terakhir (kembalian). */
        case 'aturFee': {
          const v = UT.validasi(s);
          const idx = n.output.length - 1;
          if (idx >= 1 && v.inputs.length) n.output[idx].sat = Math.max(0, UT.satAman(s.output[idx]) + v.fee - a.fee);
          n.siaran = null; break;
        }
        case 'siarkan': {
          const v = UT.validasi(s);
          if (!v.valid) return s;
          const inputs = s.dompet.filter((u) => s.terpilih.includes(UT.key(u)));
          const outs = s.output.map((o, i) => ({ txid: v.txid, vout: i, sat: o.sat, alamat: o.alamat }));
          const sisa = s.dompet.filter((u) => !s.terpilih.includes(UT.key(u)));
          /* Hanya output terakhir (kembalian) kembali ke dompet pada simulasi ini. */
          const masuk = outs.length > 1 ? [Object.assign({}, outs[outs.length - 1], { label: 'Kembalian dari ' + v.txid.slice(0, 8) })] : [];
          n.dompet = sisa.concat(masuk);
          n.terpilih = [];
          n.siaran = { txid: v.txid, fee: v.fee, jumlahInput: inputs.length, nomor: s.nomor };
          n.nomor = s.nomor + 1;
          n.output = [{ alamat: 'bc1-penerima-uji', sat: 0 }, { alamat: 'bc1-kembalian-uji', sat: 0 }];
          break;
        }
        case 'reset': return UT.awal();
        default: return s;
      }
      return n;
    },
    validasi(s) {
      const inputs = s.dompet.filter((u) => s.terpilih.includes(UT.key(u)));
      const totalIn = inputs.reduce((t, u) => t + u.sat, 0);
      const totalOut = s.output.reduce((t, o) => t + UT.satAman(o), 0);
      const fee = totalIn - totalOut;
      const galat = [];
      const catatan = [];
      if (!inputs.length) galat.push('Pilih minimal satu UTXO sebagai input.');
      if (!s.output.length) galat.push('Tambahkan minimal satu output.');
      if (s.output.some((o) => !Number.isInteger(o.sat) || o.sat < 0)) galat.push('Jumlah output harus angka BTC valid, maksimal 8 desimal.');
      if (s.output.some((o) => o.sat === 0)) galat.push('Output dengan jumlah 0 tidak berguna. Hapus atau isi.');
      if (inputs.length && fee < 0) galat.push('Total output melebihi total input. Selisihnya ' + UT.formatBtc(-fee) + ' BTC tidak ada.');
      if (inputs.length && fee > 0 && totalIn > 0 && fee / totalIn > 0.1) catatan.push('Fee ' + UT.formatBtc(fee) + ' BTC lebih dari 10% input. Biasanya ini tanda kembalian lupa dibuat.');
      if (inputs.length && fee === 0 && !galat.length) catatan.push('Fee 0. Pada jaringan sungguhan, transaksi tanpa fee biasanya tidak diteruskan node.');
      const valid = galat.length === 0 && inputs.length > 0;
      const txid = valid ? UT.txid(inputs, s.output) : null;
      return { totalIn, totalOut, fee, galat, catatan, valid, txid, inputs };
    },
  };

  /* ================= 6. Proof of work dan fork ================= */
  const PW = {
    work(bitNol) { return 1n << BigInt(bitNol); },
    /* Cari nonce pada rentang [mulai, mulai+jumlah). Header 80 byte asli, nilai lain tetap. */
    header(nonce) {
      return { versi: 0x20000000, prev: '00'.repeat(32), merkle: H.sha256Hex('lab-pow').slice(0, 64), waktu: 1700000000, bits: 0x1d00ffff, nonce };
    },
    cobaRentang(bitNol, mulai, jumlah) {
      const batas = 1n << BigInt(256 - bitNol);
      const h = PW.header(0);
      for (let n = mulai; n < mulai + jumlah; n++) {
        h.nonce = n;
        const hash = H.hashHeader(h);
        if (BigInt('0x' + hash) < batas) return { ditemukan: true, nonce: n, hash, percobaan: n - mulai + 1 };
      }
      return { ditemukan: false, percobaan: jumlah };
    },
    /* Total kerja rantai: jumlah kerja tiap blok. Rantai terpilih = total kerja terbesar, bukan yang terpanjang. */
    totalKerja(rantai) { return rantai.reduce((t, b) => t + PW.work(b.bitNol), 0n); },
    pilihRantai(a, b) {
      const wa = PW.totalKerja(a);
      const wb = PW.totalKerja(b);
      if (wa === wb) return { pemenang: 'seri', wa, wb };
      return { pemenang: wa > wb ? 'A' : 'B', wa, wb };
    },
    awalFork() {
      return {
        A: [{ bitNol: 16 }, { bitNol: 16 }, { bitNol: 16 }],
        B: [{ bitNol: 12 }, { bitNol: 12 }, { bitNol: 12 }, { bitNol: 12 }],
      };
    },
    reduceFork(s, a) {
      const n = { A: s.A.map((b) => Object.assign({}, b)), B: s.B.map((b) => Object.assign({}, b)) };
      switch (a.type) {
        case 'jumlah': {
          const baru = Math.max(1, Math.min(8, a.jumlah));
          const lama = n[a.sisi];
          const bit = lama.length ? lama[lama.length - 1].bitNol : 12;
          n[a.sisi] = Array.from({ length: baru }, (_, i) => lama[i] || { bitNol: bit });
          break;
        }
        case 'bit': n[a.sisi][a.i].bitNol = Math.max(8, Math.min(24, a.bitNol)); break;
        case 'reset': return PW.awalFork();
        default: return s;
      }
      return n;
    },
    rataRataPercobaan(bitNol) { return Math.pow(2, bitNol); },
  };

  root.GenesisLab = { DS, HP, SG, BC, UT, PW };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.GenesisLab;
})(typeof self !== 'undefined' ? self : globalThis);

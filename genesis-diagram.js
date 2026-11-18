/* Genesis v2.1.0, genesis-diagram.js
 * Diagram SVG sebaris untuk lesson. Warna lewat variabel CSS agar ikut mode terang/gelap.
 * Tiap diagram punya judul, deskripsi teks, dan makna yang tidak bergantung pada warna.
 */
(function (root) {
  'use strict';

  const W = 640;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  function kotak(x, y, w, h, teks, opsi = {}) {
    const cls = opsi.kelas || 'dg-kotak';
    const baris = Array.isArray(teks) ? teks : [teks];
    const mid = y + h / 2 - ((baris.length - 1) * 8);
    return '<rect class="' + cls + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8"/>' +
      baris.map((t, i) => '<text class="' + (i === 0 ? 'dg-t' : 'dg-t2') + '" x="' + (x + w / 2) + '" y="' + (mid + i * 16 + 4) + '" text-anchor="middle">' + esc(t) + '</text>').join('');
  }
  function panah(x1, y1, x2, y2, label) {
    const t = label ? '<text class="dg-t2" x="' + ((x1 + x2) / 2) + '" y="' + ((y1 + y2) / 2 - 6) + '" text-anchor="middle">' + esc(label) + '</text>' : '';
    return '<line class="dg-garis" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" marker-end="url(#dg-kepala)"/>' + t;
  }
  function bungkus(id, judul, desk, tinggi, isi) {
    return '<figure class="diagram"><svg viewBox="0 0 ' + W + ' ' + tinggi + '" role="img" aria-labelledby="dg-j-' + id + ' dg-d-' + id + '" focusable="false">' +
      '<title id="dg-j-' + id + '">' + esc(judul) + '</title><desc id="dg-d-' + id + '">' + esc(desk) + '</desc>' +
      '<defs><marker id="dg-kepala" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="dg-kepala"/></marker></defs>' +
      isi + '</svg><figcaption>' + esc(desk) + '</figcaption></figure>';
  }

  const DIAGRAM = {
    ledger() {
      const isi = kotak(20, 20, 130, 54, ['Alice', 'ingin membayar']) + kotak(255, 20, 130, 54, ['Buku besar', 'dipegang satu pihak'], { kelas: 'dg-kotak dg-aksen' }) + kotak(490, 20, 130, 54, ['Bob', 'menerima']) +
        panah(150, 47, 255, 47, '1. minta bayar') + panah(385, 47, 490, 47, '3. konfirmasi') +
        '<text class="dg-t2" x="320" y="104" text-anchor="middle">2. pihak tengah mengurangi saldo Alice dan menambah saldo Bob</text>';
      return bungkus('ledger', 'Pencatatan terpusat', 'Alice meminta pembayaran, satu pihak tengah memegang buku besar dan memperbarui saldo, lalu Bob menerima konfirmasi.', 124, isi);
    },
    p2p() {
      const n = [[320, 24], [140, 70], [500, 70], [220, 150], [420, 150]];
      let isi = '';
      const pas = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4], [1, 2], [0, 3], [0, 4]];
      pas.forEach(([a, b]) => { isi += '<line class="dg-garis-tipis" x1="' + n[a][0] + '" y1="' + n[a][1] + '" x2="' + n[b][0] + '" y2="' + n[b][1] + '"/>'; });
      n.forEach((p, i) => { isi += '<circle class="dg-node" cx="' + p[0] + '" cy="' + p[1] + '" r="20"/><text class="dg-t" x="' + p[0] + '" y="' + (p[1] + 4) + '" text-anchor="middle">N' + (i + 1) + '</text>'; });
      return bungkus('p2p', 'Jaringan peer-to-peer', 'Lima node saling terhubung langsung tanpa server pusat. Tiap node meneruskan pesan ke tetangganya.', 190, isi);
    },
    hashflow() {
      const isi = kotak(20, 30, 150, 54, ['Data apa saja', '"halo"']) + panah(170, 57, 250, 57) + kotak(250, 30, 140, 54, ['SHA-256'], { kelas: 'dg-kotak dg-aksen' }) + panah(390, 57, 470, 57) + kotak(470, 30, 150, 54, ['256 bit', 'selalu panjang sama']) +
        '<text class="dg-t2" x="320" y="118" text-anchor="middle">Searah: dari hash tidak ada jalan kembali ke data. Mengubah satu karakter mengubah hash total.</text>';
      return bungkus('hashflow', 'Alur fungsi hash', 'Data dengan panjang bebas masuk ke SHA-256 dan menghasilkan 256 bit. Prosesnya searah.', 136, isi);
    },
    chain() {
      let isi = '';
      for (let i = 0; i < 3; i++) {
        const x = 20 + i * 210;
        isi += kotak(x, 20, 170, 84, ['Blok ' + (i + 1), i === 0 ? 'prev: 0000...' : 'prev: hash blok ' + i, 'data blok']);
        if (i < 2) isi += panah(x + 170, 62, x + 210, 62, 'hash');
      }
      return bungkus('chain', 'Rantai blok', 'Tiga blok berurutan. Tiap blok menyimpan hash blok sebelumnya, sehingga mengubah blok lama memutus tautan sesudahnya.', 124, isi);
    },
    header() {
      const f = [['versi', 4], ['hash blok sebelumnya', 32], ['akar Merkle', 32], ['waktu', 4], ['bits', 4], ['nonce', 4]];
      let y = 14;
      let isi = '';
      f.forEach(([n, b]) => {
        const h = b >= 32 ? 34 : 28;
        isi += '<rect class="dg-kotak" x="170" y="' + y + '" width="300" height="' + h + '" rx="4"/><text class="dg-t" x="190" y="' + (y + h / 2 + 4) + '">' + esc(n) + '</text><text class="dg-t2" x="450" y="' + (y + h / 2 + 4) + '" text-anchor="end">' + b + ' byte</text>';
        y += h + 4;
      });
      isi += '<text class="dg-t2" x="320" y="' + (y + 16) + '" text-anchor="middle">Total 80 byte. Hash blok adalah SHA-256 dua kali atas header ini.</text>';
      return bungkus('header', 'Header blok Bitcoin', 'Header 80 byte: versi, hash blok sebelumnya, akar Merkle, waktu, bits, dan nonce.', y + 34, isi);
    },
    merkle() {
      const dau = [100, 230, 360, 490];
      let isi = '';
      dau.forEach((x, i) => { isi += kotak(x - 50, 150, 100, 40, ['Tx ' + (i + 1)]); });
      isi += kotak(115, 84, 110, 36, ['Hash A']) + kotak(375, 84, 110, 36, ['Hash B']);
      isi += kotak(245, 18, 150, 40, ['Akar Merkle'], { kelas: 'dg-kotak dg-aksen' });
      isi += panah(100, 150, 150, 120) + panah(230, 150, 190, 120) + panah(360, 150, 410, 120) + panah(490, 150, 450, 120) + panah(170, 84, 290, 58) + panah(430, 84, 350, 58);
      return bungkus('merkle', 'Pohon Merkle', 'Empat transaksi di-hash berpasangan menjadi dua hash, lalu digabung menjadi satu akar Merkle yang masuk ke header blok.', 206, isi);
    },
    utxo() {
      const isi = kotak(20, 18, 150, 44, ['UTXO 0.5']) + kotak(20, 76, 150, 44, ['UTXO 0.2']) +
        kotak(235, 36, 170, 64, ['Transaksi baru', 'input: 0.5'], { kelas: 'dg-kotak dg-aksen' }) +
        kotak(470, 8, 150, 38, ['0.3 ke penerima']) + kotak(470, 52, 150, 38, ['0.199 kembalian']) + kotak(470, 96, 150, 38, ['0.001 fee (selisih)'], { kelas: 'dg-kotak dg-redup' }) +
        panah(170, 40, 235, 60) + panah(405, 56, 470, 27) + panah(405, 68, 470, 71) + panah(405, 80, 470, 115);
      return bungkus('utxo', 'Input, output, kembalian, dan fee', 'Satu UTXO 0.5 BTC dihabiskan seluruhnya. Outputnya 0.3 ke penerima dan 0.199 kembalian. Selisih 0.001 menjadi fee. UTXO 0.2 tidak dipakai.', 148, isi);
    },
    sigflow() {
      const isi = kotak(20, 20, 150, 54, ['Kunci privat', 'tetap rahasia']) + kotak(20, 90, 150, 54, ['Data transaksi', '(sighash)']) +
        kotak(235, 52, 140, 54, ['Tanda tangan'], { kelas: 'dg-kotak dg-aksen' }) +
        kotak(450, 20, 170, 54, ['Kunci publik', 'boleh dibagikan']) + kotak(450, 90, 170, 54, ['Verifikasi', 'valid atau tidak']) +
        panah(170, 47, 235, 70) + panah(170, 117, 235, 90, 'menandatangani') + panah(375, 79, 450, 110) + panah(535, 74, 535, 90);
      return bungkus('sigflow', 'Menandatangani dan memverifikasi', 'Kunci privat dan data transaksi menghasilkan tanda tangan. Siapa pun dengan kunci publik dan data yang sama dapat memverifikasinya tanpa melihat kunci privat.', 160, isi);
    },
  };

  /* Mengembalikan string HTML figure, atau string kosong bila id tidak dikenal. */
  function render(id) { return DIAGRAM[id] ? DIAGRAM[id]() : ''; }

  root.GenesisDiagram = { render, ids: Object.keys(DIAGRAM) };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.GenesisDiagram;
})(typeof self !== 'undefined' ? self : globalThis);

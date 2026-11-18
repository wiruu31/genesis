/* Genesis v2.0.0, genesis-konten-level4.js
 * Level 4: Transaksi Bitcoin (9 lesson) dan istilah glosarium terkait.
 * Contoh angka standar: 0,5 BTC = 0,3 + 0,199 + 0,001 (fee). Semua hitungan dalam satoshi.
 */
(function (root) {
  'use strict';
  const D = root.GenesisData || (typeof require !== 'undefined' ? require('./genesis-data.js') : null);

  const lessons = [
    /* ------------------------------------------------------------------ */
    {
      id: 'l4-01', slug: 'bitcoin-bukan-file', level: 4, order: 1, minutes: 7,
      title: 'Bitcoin bukan file yang dikirim',
      objectives: [
        'Menjelaskan kenapa tidak ada berkas koin yang berpindah dari satu orang ke orang lain.',
        'Menyebut apa yang sebenarnya disiarkan ke jaringan saat seseorang membayar.',
        'Menjelaskan arti saldo wallet sebagai hasil penjumlahan, bukan angka yang tersimpan di satu tempat.',
      ],
      prerequisites: ['l3-06', 'l2-07'],
      hook: 'Kamu menekan tombol kirim, dan penerima melihat saldonya naik. Tidak ada berkas yang terkirim, tidak ada koin yang keluar dari ponselmu. Yang pindah hanyalah sebuah catatan.',
      sections: [
        {
          h: 'Yang dikirim adalah pesan, bukan koin',
          p: [
            'Saat kamu membayar dengan Bitcoin, wallet menyusun sebuah **transaksi**: pesan berisi rujukan ke pembayaran lama yang kamu terima, daftar penerima baru beserta jumlahnya, dan bukti bahwa kamu berhak membelanjakan pembayaran lama itu.',
            'Pesan ini disiarkan ke node-node. Node memeriksanya, meneruskannya, dan akhirnya sebuah penambang memasukkannya ke dalam blok. Setelah itu seluruh jaringan sepakat bahwa catatan kepemilikan sudah berubah.',
          ],
        },
        {
          h: 'Tidak ada akun saldo di jaringan',
          p: [
            'Jaringan Bitcoin tidak menyimpan tabel berisi nama dan saldo. Yang ada adalah kumpulan pembayaran yang belum pernah dibelanjakan. Saldo yang tampil di wallet adalah hasil wallet menjumlahkan semua pembayaran tersebut yang bisa kamu belanjakan dengan kuncimu.',
            'Karena itu dua wallet yang memakai kunci yang sama akan menampilkan saldo yang sama. Angkanya dihitung ulang dari data blockchain, bukan dibaca dari satu tempat penyimpanan.',
          ],
        },
        {
          h: 'Kenapa rancangan ini dipilih',
          p: [
            'Dengan model catatan, setiap node bisa memeriksa sendiri apakah sebuah pembayaran sah tanpa bertanya ke pihak mana pun. Satu pembayaran hanya boleh dibelanjakan sekali, dan node menolak pesan yang mencoba memakainya lagi.',
            'Ini jawaban atas masalah pemakaian ganda yang kamu lihat di Level 1: yang dijaga bukan berkas, melainkan urutan catatan yang disepakati bersama.',
          ],
          visual: 'ledger',
        },
      ],
      technical: {
        title: 'Struktur data di balik saldo',
        p: [
          'Node penuh memelihara himpunan UTXO (unspent transaction output), yaitu seluruh output yang belum dibelanjakan. Himpunan ini berubah setiap blok baru diterima: output yang dipakai sebagai input dibuang, output baru ditambahkan.',
          'Wallet tidak perlu menyimpan koin. Wallet menyimpan kunci, lalu memindai himpunan UTXO untuk mencari output yang terkunci ke alamat atau script milik kunci tersebut. Hasil penjumlahannya disebut saldo.',
        ],
      },
      misconceptions: [
        { salah: 'Koin Bitcoin tersimpan di dalam wallet seperti uang di dompet.', benar: 'Wallet menyimpan kunci. Catatan kepemilikan ada di blockchain, dan wallet hanya menghitung catatan mana yang bisa dibelanjakan kuncimu.' },
        { salah: 'Mengirim Bitcoin berarti memindahkan berkas dari perangkat satu ke perangkat lain.', benar: 'Yang disiarkan adalah transaksi, yaitu pesan yang meminta jaringan mencatat perpindahan hak belanja.' },
      ],
      summary: [
        'Membayar dengan Bitcoin berarti menyiarkan transaksi, bukan mengirim berkas koin.',
        'Jaringan mencatat pembayaran yang belum dibelanjakan, tidak menyimpan akun bersaldo.',
        'Saldo wallet adalah hasil penjumlahan pembayaran yang bisa kamu belanjakan dengan kuncimu.',
      ],
      quiz: [
        { id: 'l4-01-q1', q: 'Apa yang disiarkan ke jaringan saat kamu membayar dengan Bitcoin?', options: ['Berkas koin yang dipindahkan', 'Sebuah transaksi yang berisi rujukan, penerima, dan bukti hak belanja', 'Kunci privatmu', 'Saldo terbaru akunmu'], answer: 1, explain: 'Wallet menyiarkan transaksi. Kunci privat tidak pernah ikut dikirim, dan jaringan tidak menyimpan saldo akun.' },
        { id: 'l4-01-q2', q: 'Dari mana angka saldo di wallet berasal?', options: ['Dari tabel akun di server Bitcoin', 'Dari penjumlahan pembayaran belum terbelanja yang bisa dikunci-buka oleh kuncimu', 'Dari angka yang disimpan di aplikasi wallet', 'Dari jumlah blok yang sudah kamu tambang'], answer: 1, explain: 'Tidak ada tabel akun. Wallet menjumlahkan output yang belum dibelanjakan dan terkunci ke kuncimu.' },
        { id: 'l4-01-q3', q: 'Ponselmu hilang, tetapi kamu masih punya cadangan kunci. Apa yang terjadi pada pembayaran yang pernah kamu terima?', options: ['Hilang bersama ponsel', 'Tetap tercatat di blockchain, dan wallet baru dengan kunci yang sama bisa menghitungnya kembali', 'Otomatis dikembalikan ke pengirim', 'Dibekukan sampai node memberi izin'], answer: 1, application: true, explain: 'Catatan ada di blockchain. Wallet baru yang memakai kunci yang sama memindai catatan itu dan menampilkan saldo yang sama.' },
      ],
      labs: [],
      glossary: ['g-transaksi', 'g-utxo'],
      sources: ['src-whitepaper', 'src-devdocs'],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'l4-02', slug: 'satoshi-dan-utxo', level: 4, order: 2, minutes: 8,
      title: 'Satoshi dan UTXO',
      objectives: [
        'Mengonversi BTC ke satoshi dan sebaliknya.',
        'Menjelaskan UTXO sebagai pembayaran yang belum dibelanjakan.',
        'Menghitung saldo dari beberapa UTXO.',
      ],
      prerequisites: ['l4-01'],
      hook: 'Bayangkan dompet berisi tiga lembar uang dengan nominal berbeda. Kamu tidak bisa merobek selembar untuk membayar sebagian, kamu menyerahkan lembar utuh dan menerima kembalian. UTXO bekerja mirip itu.',
      sections: [
        {
          h: 'Satoshi, satuan terkecil',
          p: [
            'Bitcoin dihitung dalam bilangan bulat satoshi. Satu BTC sama dengan 100.000.000 satoshi, jadi 0,5 BTC adalah 50.000.000 sat. Jaringan hanya mengenal satoshi, sedangkan angka desimal BTC adalah tampilan agar mudah dibaca.',
            'Menghitung dalam bilangan bulat menghindari kesalahan pembulatan. Di lab nanti, semua perhitungan memakai satoshi di balik layar.',
          ],
        },
        {
          h: 'UTXO: potongan yang belum terpakai',
          p: [
            '**UTXO** singkatan dari unspent transaction output, yaitu output transaksi yang belum dibelanjakan. Setiap kali seseorang membayarmu, transaksi itu membuat satu output yang terkunci ke kuncimu. Output itu adalah UTXO milikmu sampai kamu memakainya.',
            'UTXO punya jumlah tetap. Satu UTXO 0,3 BTC tidak bisa dipecah di tempat. Kalau mau membayar 0,1 BTC dari situ, kamu memakai seluruh 0,3 BTC sebagai input lalu membuat output baru untuk penerima dan satu lagi untuk dirimu sendiri.',
          ],
          visual: 'utxo',
        },
        {
          h: 'Menghitung saldo',
          p: [
            'Misalkan kamu punya tiga UTXO: 30.000.000 sat, 19.900.000 sat, dan 100.000 sat. Saldomu adalah 50.000.000 sat, yaitu 0,5 BTC. Angka ini sama persis dengan contoh yang dipakai di lesson berikutnya.',
            'Saldo bisa terdiri dari satu UTXO besar atau banyak UTXO kecil. Banyaknya UTXO memengaruhi ukuran transaksi dan biaya, sebuah topik yang muncul lagi di lesson fee.',
          ],
        },
      ],
      technical: {
        title: 'Representasi di data node',
        p: [
          'Setiap UTXO dikenali oleh pasangan TXID dan indeks output. Node menyimpannya dalam basis data khusus (chainstate) bersama jumlah, script penguncinya, tinggi blok pembuatan, dan penanda coinbase.',
          'Jumlah output disimpan sebagai bilangan bulat 64 bit bertanda dalam satuan satoshi. Jumlah total pasokan Bitcoin dibatasi 21 juta BTC, sehingga angkanya selalu muat dalam rentang itu.',
        ],
      },
      misconceptions: [
        { salah: 'Satu UTXO bisa dipakai sebagian dan sisanya tetap tersimpan di tempat yang sama.', benar: 'Satu UTXO selalu dipakai utuh. Sisa yang tidak kamu bayarkan harus dibuat menjadi output baru, biasanya kembalian ke wallet sendiri.' },
        { salah: 'UTXO sama dengan satu transaksi.', benar: 'Satu transaksi bisa membuat beberapa output, dan tiap output adalah UTXO tersendiri sampai dibelanjakan.' },
      ],
      summary: [
        '1 BTC sama dengan 100.000.000 satoshi, dan jaringan hanya menghitung bilangan bulat satoshi.',
        'UTXO adalah output yang belum dibelanjakan, dan selalu dipakai utuh.',
        'Saldo adalah jumlah semua UTXO yang bisa kamu belanjakan.',
      ],
      quiz: [
        { id: 'l4-02-q1', q: 'Berapa satoshi dalam 0,5 BTC?', options: ['5.000.000', '500.000.000', '50.000.000', '5.000'], answer: 2, explain: '1 BTC = 100.000.000 sat, jadi 0,5 BTC = 50.000.000 sat.' },
        { id: 'l4-02-q2', q: 'Apa arti UTXO?', options: ['Output transaksi yang belum dibelanjakan', 'Unit transfer koin otomatis', 'Token biaya untuk penambang', 'Salinan blok yang belum dikonfirmasi'], answer: 0, explain: 'UTXO adalah unspent transaction output, yaitu output yang belum dipakai sebagai input transaksi lain.' },
        { id: 'l4-02-q3', q: 'Kamu punya UTXO 20.000.000 sat, 15.000.000 sat, dan 5.000.000 sat. Berapa BTC saldomu?', options: ['0,04 BTC', '0,4 BTC', '0,35 BTC', '4 BTC'], answer: 1, application: true, explain: '20.000.000 + 15.000.000 + 5.000.000 = 40.000.000 sat, yaitu 0,4 BTC.' },
        { id: 'l4-02-q4', q: 'Kamu punya satu UTXO 0,3 BTC dan ingin membayar 0,1 BTC. Apa yang terjadi pada UTXO itu?', options: ['Terpecah otomatis menjadi 0,1 dan 0,2', 'Dipakai utuh sebagai input, lalu dibuat output baru untuk penerima dan kembalian', 'Tetap utuh, dan 0,1 diambil dari saldo akun', 'Dikunci sampai jaringan membuat salinan'], answer: 1, application: true, explain: 'UTXO tidak bisa dipecah. Seluruhnya dipakai sebagai input, dan sisanya kembali lewat output kembalian.' },
      ],
      labs: ['lab-utxo'],
      glossary: ['g-satoshi', 'g-utxo', 'g-output'],
      sources: ['src-whitepaper', 'src-devdocs', 'src-masteringbitcoin'],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'l4-03', slug: 'input-transaksi', level: 4, order: 3, minutes: 7,
      title: 'Input: menunjuk UTXO yang dibelanjakan',
      objectives: [
        'Menjelaskan fungsi input dalam transaksi.',
        'Menyebut dua hal yang dicantumkan input untuk menunjuk sebuah UTXO.',
        'Menjelaskan kenapa input yang sama tidak boleh dipakai dua kali.',
      ],
      prerequisites: ['l4-02'],
      hook: 'Input bukan uang yang kamu tuangkan ke transaksi. Input adalah penunjuk: "pembayaran nomor sekian dari transaksi anu, tolong pakai itu".',
      sections: [
        {
          h: 'Input sebagai rujukan',
          p: [
            'Setiap **input** menunjuk satu UTXO yang akan dibelanjakan. Isinya bukan jumlah uang, melainkan alamat dari output lama: TXID transaksi pembuatnya dan indeks output di dalam transaksi itu.',
            'Jumlah yang masuk ke transaksi baru diambil dari output yang ditunjuk. Karena itu node harus bisa menemukan output lama di himpunan UTXO untuk tahu berapa nilainya.',
          ],
        },
        {
          h: 'Input membawa bukti hak belanja',
          p: [
            'Selain menunjuk, input membawa data pembuka kunci: tanda tangan dan, tergantung jenis output, kunci publik atau data lain yang diminta script penguncinya. Lesson tanda tangan akan membahas ini.',
            'Satu transaksi boleh punya banyak input, masing-masing menunjuk UTXO berbeda. Wallet biasanya menggabungkan beberapa UTXO kecil saat satu UTXO tidak cukup untuk membayar.',
          ],
        },
        {
          h: 'Satu UTXO, satu kali pakai',
          p: [
            'Begitu sebuah UTXO dipakai dalam transaksi yang masuk blok, UTXO itu hilang dari himpunan. Transaksi lain yang menunjuknya lagi akan ditolak karena yang ditunjuk sudah tidak ada.',
            'Inilah penjaga utama terhadap pemakaian ganda. Kamu bisa menyiarkan dua transaksi yang memakai UTXO sama, tetapi hanya satu yang akan masuk rantai.',
          ],
        },
      ],
      technical: {
        title: 'Isi sebuah input',
        p: [
          'Input berisi outpoint (TXID 32 byte dan indeks output 4 byte), bidang data pembuka kunci (scriptSig dan/atau witness), dan nomor urut (sequence). Nomor urut dipakai antara lain untuk mengisyaratkan penggantian transaksi dan kunci waktu relatif.',
          'Pada output jenis SegWit, data tanda tangan berada di bidang witness, bukan di scriptSig. Efeknya terhadap TXID dibahas di lesson TXID dan indeks output.',
        ],
      },
      misconceptions: [
        { salah: 'Input berisi sejumlah uang yang kamu pilih sendiri.', benar: 'Input hanya menunjuk UTXO yang ada. Jumlahnya ditentukan oleh output yang ditunjuk, bukan oleh pengirim.' },
        { salah: 'Dua transaksi yang menunjuk UTXO yang sama bisa sama-sama masuk blockchain.', benar: 'Hanya satu yang bisa dikonfirmasi. Setelah salah satu masuk, UTXO itu terpakai dan yang lain tidak valid.' },
      ],
      summary: [
        'Input menunjuk satu UTXO lewat TXID dan indeks output.',
        'Nilai input berasal dari output yang ditunjuk, dan input membawa bukti hak belanja.',
        'UTXO yang sudah dipakai tidak bisa ditunjuk lagi.',
      ],
      quiz: [
        { id: 'l4-03-q1', q: 'Apa yang dicantumkan sebuah input untuk menunjuk UTXO?', options: ['Nama pemilik dan saldo', 'TXID dan indeks output', 'Alamat penerima dan fee', 'Hash blok dan nonce'], answer: 1, explain: 'Input menunjuk output lama lewat pasangan TXID dan indeks output.' },
        { id: 'l4-03-q2', q: 'Dari mana nilai sebuah input diketahui?', options: ['Ditulis pengirim di input itu', 'Diambil dari output lama yang ditunjuk', 'Ditentukan penambang', 'Dihitung dari fee'], answer: 1, explain: 'Input tidak membawa jumlah sendiri. Nilainya dibaca dari output yang ditunjuk di himpunan UTXO.' },
        { id: 'l4-03-q3', q: 'Kamu menyiarkan dua transaksi berbeda, keduanya menunjuk UTXO yang sama. Transaksi A masuk blok lebih dulu. Apa nasib transaksi B?', options: ['Tetap masuk blok berikutnya', 'Tidak valid, karena UTXO yang ditunjuk sudah terpakai', 'Dibagi dua dengan A', 'Menunggu A dibatalkan'], answer: 1, application: true, explain: 'Setelah A dikonfirmasi, UTXO itu sudah tidak ada. B menunjuk sesuatu yang tidak ada, jadi ditolak.' },
      ],
      labs: [],
      glossary: ['g-input', 'g-indeks-output'],
      sources: ['src-devdocs', 'src-masteringbitcoin'],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'l4-04', slug: 'output-transaksi', level: 4, order: 4, minutes: 7,
      title: 'Output: jumlah dan kunci',
      objectives: [
        'Menyebut dua isi utama sebuah output.',
        'Menjelaskan arti output yang terkunci.',
        'Menjelaskan bahwa satu transaksi dapat punya beberapa output.',
      ],
      prerequisites: ['l4-03'],
      hook: 'Output adalah laci terkunci. Di dalamnya ada sejumlah satoshi, dan di pintunya ada syarat: siapa yang bisa membukanya.',
      sections: [
        {
          h: 'Jumlah dan syarat pembuka',
          p: [
            'Sebuah **output** punya dua bagian: jumlah dalam satoshi dan script penguncian yang menyatakan syarat untuk membelanjakannya. Syarat paling umum adalah "tunjukkan tanda tangan dari pemilik kunci yang cocok dengan alamat ini".',
            'Alamat yang kamu bagikan hanyalah cara menulis syarat itu dengan ringkas. Wallet menerjemahkan alamat menjadi script penguncian saat membuat output.',
          ],
        },
        {
          h: 'Beberapa output dalam satu transaksi',
          p: [
            'Satu transaksi bisa membayar beberapa penerima sekaligus, masing-masing satu output. Ia juga hampir selalu membuat satu output untuk dirimu sendiri, yaitu kembalian, yang dibahas dua lesson lagi.',
            'Urutan output dihitung dari nol. Output pertama berindeks 0, kedua berindeks 1, dan seterusnya. Indeks ini penting karena input berikutnya menunjuk output lewat nomor itu.',
          ],
        },
        {
          h: 'Output belum tentu terpakai',
          p: [
            'Output yang belum dibelanjakan menjadi UTXO. Pemiliknya boleh menyimpannya bertahun-tahun, dan tidak ada tenggat untuk memakainya.',
            'Jumlah total output tidak boleh melebihi jumlah total input. Selisih yang tersisa menjadi fee untuk penambang, dibahas di lesson kembalian dan fee.',
          ],
        },
      ],
      technical: {
        title: 'Jenis output umum',
        p: [
          'Beberapa bentuk script penguncian yang umum: P2PKH (alamat berawalan 1), P2SH (berawalan 3), P2WPKH (bech32, berawalan bc1q), dan P2TR (bech32m, berawalan bc1p). Masing-masing menentukan data apa yang harus ada di input pembukanya.',
          'Output dengan jumlah sangat kecil bisa dianggap dust oleh node, karena biaya membelanjakannya bisa lebih besar daripada nilainya. Node biasanya menolak menyiarkan transaksi dengan output dust, sebagai aturan kebijakan lokal.',
        ],
      },
      misconceptions: [
        { salah: 'Output berisi nama atau identitas penerima.', benar: 'Output berisi jumlah dan syarat pembuka. Tidak ada nama, hanya script yang dipenuhi oleh pemegang kunci yang tepat.' },
        { salah: 'Satu transaksi hanya boleh punya satu penerima.', benar: 'Satu transaksi dapat memiliki banyak output, ke penerima berbeda atau ke dirimu sendiri.' },
      ],
      summary: [
        'Output berisi jumlah satoshi dan script yang mengunci jumlah itu.',
        'Satu transaksi dapat memiliki banyak output, diberi indeks mulai dari 0.',
        'Output yang belum dibelanjakan menjadi UTXO.',
      ],
      quiz: [
        { id: 'l4-04-q1', q: 'Apa dua isi utama sebuah output?', options: ['Nama penerima dan tanggal', 'Jumlah satoshi dan script penguncian', 'TXID dan nonce', 'Kunci privat dan alamat'], answer: 1, explain: 'Output = jumlah + syarat pembuka (script penguncian).' },
        { id: 'l4-04-q2', q: 'Transaksi punya tiga output. Berapa indeks output yang terakhir?', options: ['3', '1', '0', '2'], answer: 3, explain: 'Indeks dimulai dari 0, jadi tiga output berindeks 0, 1, dan 2.' },
        { id: 'l4-04-q3', q: 'Sebuah transaksi punya input total 50.000.000 sat. Mana susunan output yang mungkin valid?', options: ['30.000.000 + 25.000.000', '30.000.000 + 19.900.000', '40.000.000 + 20.000.000', '50.000.001 saja'], answer: 1, application: true, explain: 'Total output tidak boleh melebihi total input. 49.900.000 masih di bawah 50.000.000, dengan selisih 100.000 sat menjadi fee.' },
      ],
      labs: [],
      glossary: ['g-output', 'g-indeks-output', 'g-dust'],
      sources: ['src-devdocs', 'src-bips', 'src-masteringbitcoin'],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'l4-05', slug: 'txid-dan-indeks-output', level: 4, order: 5, minutes: 8,
      title: 'TXID dan indeks output',
      objectives: [
        'Menjelaskan bagaimana TXID dibentuk dan apa gunanya.',
        'Membedakan TXID dari WTXID.',
        'Menyebut cara input menunjuk sebuah output secara unik.',
      ],
      prerequisites: ['l4-04', 'l2-05'],
      hook: 'Setiap transaksi punya sidik jari. Untuk menunjuk output tertentu, kamu cukup menyebut sidik jari itu dan nomor lacinya.',
      sections: [
        {
          h: 'TXID sebagai sidik jari transaksi',
          p: [
            '**TXID** adalah hash dari data transaksi. Kalau satu bit data berubah, TXID berubah total, mengikuti sifat fungsi hash yang kamu lihat di Level 2. Karena itu TXID dipakai sebagai pengenal yang tidak bisa dipalsukan diam-diam.',
            'TXID dihitung dari data transaksi dengan SHA-256 dua kali. Saat ditampilkan, urutan byte-nya dibalik, sama seperti hash blok.',
          ],
          visual: 'hashflow',
        },
        {
          h: 'TXID dan indeks output menunjuk UTXO',
          p: [
            'Satu transaksi bisa punya banyak output, sehingga TXID saja belum cukup. Input menunjuk lewat pasangan: TXID transaksi pembuat, ditambah **indeks output** di dalamnya. Contoh: "output nomor 1 dari transaksi dengan TXID ini".',
            'Pasangan ini unik di seluruh blockchain, sehingga node bisa mencarinya di himpunan UTXO dengan cepat.',
          ],
        },
        {
          h: 'TXID dan WTXID',
          p: [
            'Sejak SegWit, data tanda tangan (witness) disimpan terpisah dari bagian lain transaksi. **TXID** dihitung tanpa witness, sedangkan **WTXID** dihitung dengan witness.',
            'Akibatnya, pihak lain tidak bisa mengubah bentuk tanda tangan lalu mengubah TXID transaksi yang belum terkonfirmasi. Masalah itu pernah membuat transaksi berantai sulit diandalkan sebelum SegWit.',
          ],
        },
      ],
      technical: {
        title: 'Perhitungan dan tampilan',
        p: [
          'TXID = SHA-256(SHA-256(serialisasi transaksi tanpa witness)). Hasil 32 byte itu ditampilkan dalam hex dengan urutan byte dibalik. Koordinat output ditulis sebagai TXID:n, misalnya abc...:1.',
          'Transaksi coinbase punya TXID juga, tetapi inputnya tidak menunjuk UTXO. Ia menunjuk "tidak ada" dengan TXID semua nol, dan membuat koin baru yang menjadi hadiah blok.',
          'Pohon Merkle dalam header blok disusun dari TXID, sedangkan komitmen witness diletakkan terpisah di transaksi coinbase.',
        ],
      },
      misconceptions: [
        { salah: 'TXID adalah nomor urut transaksi yang dibagikan server.', benar: 'TXID dihitung dari isi transaksi memakai hash. Tidak ada server pemberi nomor.' },
        { salah: 'TXID cukup untuk menunjuk satu UTXO.', benar: 'Satu transaksi bisa punya banyak output, jadi input menunjuk dengan pasangan TXID dan indeks output.' },
      ],
      summary: [
        'TXID adalah hash dari data transaksi dan berfungsi sebagai pengenalnya.',
        'Input menunjuk UTXO lewat TXID ditambah indeks output.',
        'TXID dihitung tanpa witness, WTXID dengan witness.',
      ],
      quiz: [
        { id: 'l4-05-q1', q: 'TXID dihasilkan dari apa?', options: ['Nomor yang diberikan penambang', 'Hash dari data transaksi', 'Kunci publik pengirim', 'Waktu transaksi disiarkan'], answer: 1, explain: 'TXID adalah hash SHA-256 ganda dari serialisasi transaksi.' },
        { id: 'l4-05-q2', q: 'Apa beda TXID dan WTXID?', options: ['WTXID hanya dipakai di testnet', 'TXID dihitung tanpa data witness, WTXID dengan data witness', 'WTXID adalah TXID yang dibalik', 'Tidak ada beda'], answer: 1, explain: 'Pada SegWit, witness dikeluarkan dari perhitungan TXID tetapi ikut dalam WTXID.' },
        { id: 'l4-05-q3', q: 'Transaksi dengan TXID X punya tiga output. Kamu ingin membelanjakan output kedua. Bagaimana input menunjuknya?', options: ['X:2', 'X:1', 'X saja', 'X:3'], answer: 1, application: true, explain: 'Indeks dimulai dari 0, jadi output kedua berindeks 1. Penunjuknya adalah TXID:1.' },
      ],
      labs: [],
      glossary: ['g-txid', 'g-wtxid', 'g-indeks-output', 'g-coinbase'],
      sources: ['src-devdocs', 'src-bips', 'src-masteringbitcoin'],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'l4-06', slug: 'kembalian-dan-fee', level: 4, order: 6, minutes: 9,
      title: 'Kembalian dan fee',
      objectives: [
        'Menghitung kembalian dari input dan output.',
        'Menghitung fee sebagai selisih input dan output.',
        'Menjelaskan akibat lupa membuat output kembalian.',
      ],
      prerequisites: ['l4-05'],
      hook: 'Kamu membayar kopi dengan lembaran 100 ribu, dan kasir mengembalikan sisanya. Di Bitcoin, kamu sendiri yang harus menulis kembalian. Kalau lupa, sisanya menjadi tip untuk penambang.',
      sections: [
        {
          h: 'Kembalian adalah output ke dirimu sendiri',
          p: [
            'Karena UTXO dipakai utuh, selisih antara input dan pembayaran harus dikembalikan lewat output baru yang terkunci ke kuncimu. Itulah **kembalian**. Wallet membuatnya otomatis, biasanya ke alamat baru milik wallet itu.',
            'Output kembalian adalah UTXO baru untukmu. Setelah transaksi terkonfirmasi, kamu bisa membelanjakannya seperti UTXO lain.',
          ],
        },
        {
          h: 'Fee adalah selisih, bukan bidang yang ditulis',
          p: [
            'Transaksi tidak punya kolom "fee". **Fee** = total input dikurangi total output. Apa pun yang tidak dialokasikan ke output otomatis menjadi hak penambang yang memasukkan transaksi itu ke blok.',
            'Contoh: input 50.000.000 sat. Output pembayaran 30.000.000 sat dan output kembalian 19.900.000 sat. Total output 49.900.000 sat. Fee = 50.000.000 dikurangi 49.900.000 = 100.000 sat, atau 0,001 BTC.',
          ],
          visual: 'utxo',
        },
        {
          h: 'Bahaya lupa kembalian',
          p: [
            'Kalau kamu memakai UTXO 50.000.000 sat dan hanya membuat satu output 30.000.000 sat, selisih 20.000.000 sat menjadi fee. Jaringan tidak tahu itu salah, karena aturannya hanya mensyaratkan output tidak melebihi input.',
            'Wallet yang baik menghitung kembalian otomatis dan memperingatkan fee yang tidak wajar. Di lab Penyusun UTXO kamu akan mencoba kesalahan ini dengan aman.',
          ],
        },
        {
          h: 'Fee diukur per ukuran, bukan per nilai',
          p: [
            'Penambang memilih transaksi berdasarkan fee per unit ukuran (vbyte), bukan berdasarkan jumlah uang yang dikirim. Mengirim 1 juta dolar dengan transaksi kecil bisa lebih murah daripada mengirim sedikit dengan banyak input.',
          ],
        },
      ],
      technical: {
        title: 'Fee rate dan ukuran virtual',
        p: [
          'Fee rate dinyatakan dalam sat/vB. Ukuran virtual (vsize) dihitung dari weight transaksi dibagi empat, dan data witness mendapat bobot lebih ringan daripada data lain sejak SegWit.',
          'Wallet memperkirakan fee rate dari kondisi mempool, yaitu antrean transaksi yang menunggu. Estimasi hanya perkiraan, dan fee rate yang terlalu rendah bisa membuat transaksi tertahan lama.',
          'Satu transaksi dengan banyak input biasanya lebih besar dan lebih mahal daripada transaksi dengan satu input, karena setiap input membawa tanda tangan sendiri.',
        ],
      },
      misconceptions: [
        { salah: 'Fee dihitung dari persentase nilai yang dikirim.', benar: 'Fee bergantung pada ukuran data transaksi dan antrean mempool, bukan pada jumlah yang dikirim.' },
        { salah: 'Kalau lupa menulis kembalian, wallet atau jaringan akan mengembalikannya.', benar: 'Selisih input dikurangi output otomatis menjadi fee untuk penambang. Tidak ada yang mengembalikannya.' },
      ],
      summary: [
        'Kembalian harus ditulis sebagai output ke kuncimu sendiri.',
        'Fee adalah total input dikurangi total output, tidak ditulis sebagai kolom.',
        'Fee ditentukan ukuran transaksi dan antrean, bukan nilai yang dikirim.',
      ],
      quiz: [
        { id: 'l4-06-q1', q: 'Bagaimana fee ditentukan dalam sebuah transaksi?', options: ['Ditulis di kolom fee', 'Selisih total input dan total output', 'Persentase tetap dari jumlah dikirim', 'Dipilih acak oleh node'], answer: 1, explain: 'Tidak ada kolom fee. Selisih input dikurangi output menjadi hak penambang.' },
        { id: 'l4-06-q2', q: 'Input 50.000.000 sat. Output: 30.000.000 sat ke penerima dan 19.900.000 sat kembalian. Berapa fee?', options: ['1.000 sat', '100.000 sat', '10.000 sat', '1.000.000 sat'], answer: 1, application: true, explain: '50.000.000 dikurangi 49.900.000 = 100.000 sat, yaitu 0,001 BTC.' },
        { id: 'l4-06-q3', q: 'Wallet memakai UTXO 0,5 BTC untuk membayar 0,3 BTC tetapi lupa membuat kembalian. Berapa BTC menjadi fee?', options: ['0', '0,2', '0,001', '0,5'], answer: 1, application: true, explain: 'Input 0,5, output 0,3, selisih 0,2 BTC menjadi fee. Itulah bahaya lupa kembalian.' },
        { id: 'l4-06-q4', q: 'Mana yang paling memengaruhi besar fee yang harus dibayar?', options: ['Jumlah BTC yang dikirim', 'Ukuran data transaksi dan kondisi antrean', 'Nama penerima', 'Waktu hari saja'], answer: 1, explain: 'Penambang memilih berdasarkan fee per ukuran transaksi, jadi ukuran dan antrean paling menentukan.' },
      ],
      labs: ['lab-utxo'],
      glossary: ['g-kembalian', 'g-fee', 'g-mempool'],
      sources: ['src-devdocs', 'src-bips', 'src-masteringbitcoin'],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'l4-07', slug: 'menandatangani-transaksi', level: 4, order: 7,
      minutes: 9,
      title: 'Menandatangani transaksi',
      objectives: [
        'Menjelaskan apa yang ditandatangani dalam transaksi Bitcoin.',
        'Menjelaskan peran sighash.',
        'Menjelaskan kenapa mengubah transaksi setelah ditandatangani membatalkan tanda tangannya.',
      ],
      prerequisites: ['l4-06', 'l2-07'],
      hook: 'Tanda tangan di surat bisa disalin ke dokumen lain. Tanda tangan Bitcoin tidak bisa: ia terikat pada isi transaksi, sehingga berubah satu byte saja, tanda tangan itu tidak berlaku lagi.',
      sections: [
        {
          h: 'Tanda tangan membuktikan hak belanja',
          p: [
            'Setiap input harus membuktikan bahwa penandatangannya berhak membelanjakan UTXO yang ditunjuk. Pembuktiannya dengan tanda tangan digital yang dibuat dari kunci privat dan diperiksa dengan kunci publik, seperti di lesson tanda tangan digital Level 2.',
            'Kunci privat tidak pernah dikirim ke mana-mana. Yang dikirim hanya tanda tangan dan, bila diminta, kunci publik.',
          ],
          visual: 'sigflow',
        },
        {
          h: 'Yang ditandatangani: ringkasan data transaksi',
          p: [
            'Wallet tidak menandatangani seluruh transaksi mentah begitu saja. Ia menyusun data tertentu dari transaksi (rujukan input, output, jumlah, script penguncian, dan lainnya), lalu menghitung hash-nya yang disebut **sighash**. Hash itulah yang ditandatangani.',
            'Karena sighash memuat output dan jumlahnya, penyerang tidak bisa mengganti penerima atau jumlah setelah tanda tangan dibuat. Tanda tangan lama tidak akan cocok dengan sighash baru.',
          ],
        },
        {
          h: 'Satu tanda tangan per input',
          p: [
            'Transaksi dengan tiga input membawa tiga tanda tangan, masing-masing untuk UTXO yang ditunjuk. Kunci pembukanya bisa berbeda-beda sesuai pemilik setiap UTXO.',
            'Kalau satu saja tanda tangan salah, seluruh transaksi ditolak, karena node memeriksa setiap input.',
          ],
        },
        {
          h: 'Tentang kunci di situs ini',
          p: [
            'Lab Kunci dan tanda tangan memakai kunci uji yang dibuat sementara di memori browser dan hilang saat halaman ditutup. Jangan pernah memasukkan kunci privat atau frasa seed milikmu ke situs mana pun untuk "mencoba". Genesis tidak meminta dan tidak menyimpannya.',
          ],
        },
      ],
      technical: {
        title: 'ECDSA, Schnorr, dan jenis sighash',
        p: [
          'Transaksi non-Taproot memakai ECDSA di kurva secp256k1. Taproot memakai tanda tangan Schnorr (BIP 340). Keduanya mengikat tanda tangan pada sighash yang dihitung sesuai aturan tiap jenis output.',
          'Penanda sighash type (misalnya SIGHASH_ALL) menentukan bagian transaksi mana yang ikut ditandatangani. Yang paling umum, SIGHASH_ALL, mengikat semua input dan semua output. Tipe lain dipakai untuk kasus khusus dan membawa risiko bila dipakai sembarangan.',
          'Nonce dalam ECDSA adalah bilangan acak per tanda tangan dan tidak ada hubungannya dengan nonce mining di header blok. Nonce ECDSA yang bocor atau dipakai ulang bisa membocorkan kunci privat, sehingga pembuatan nonce deterministik (RFC 6979) dipakai di banyak implementasi.',
        ],
      },
      misconceptions: [
        { salah: 'Yang ditandatangani hanya hash transaksi sebelumnya ditambah kunci publik penerima.', benar: 'Yang ditandatangani adalah sighash, yaitu hash dari data yang disusun dari transaksi saat ini, termasuk output dan jumlahnya.' },
        { salah: 'Kunci privat ikut disiarkan supaya node bisa memverifikasi.', benar: 'Verifikasi memakai kunci publik dan tanda tangan. Kunci privat tidak pernah meninggalkan wallet.' },
      ],
      summary: [
        'Setiap input membawa tanda tangan yang membuktikan hak belanja.',
        'Yang ditandatangani adalah sighash yang mengikat isi transaksi.',
        'Mengubah transaksi setelah ditandatangani membuat tanda tangan tidak valid.',
      ],
      quiz: [
        { id: 'l4-07-q1', q: 'Apa yang sebenarnya ditandatangani wallet?', options: ['Alamat penerima saja', 'Sighash, hash dari data yang disusun dari transaksi', 'Seluruh blockchain', 'Kunci publik'], answer: 1, explain: 'Wallet menyusun data transaksi sesuai aturan, menghitung sighash, lalu menandatanganinya.' },
        { id: 'l4-07-q2', q: 'Transaksi sudah ditandatangani, lalu seseorang mengganti jumlah output sebelum disiarkan. Apa hasilnya?', options: ['Tanda tangan tetap valid', 'Tanda tangan tidak cocok dengan sighash baru, sehingga ditolak', 'Jumlah dikembalikan otomatis', 'Node menandatangani ulang'], answer: 1, application: true, explain: 'Sighash memuat output dan jumlah. Perubahan membuat sighash berbeda, sehingga verifikasi gagal.' },
        { id: 'l4-07-q3', q: 'Transaksi punya empat input. Berapa tanda tangan yang diperlukan?', options: ['Satu untuk seluruh transaksi', 'Satu per input', 'Dua', 'Empat belas'], answer: 1, explain: 'Setiap input harus membuktikan hak belanja atas UTXO yang ditunjuknya.' },
        { id: 'l4-07-q4', q: 'Mana yang boleh kamu lakukan di situs belajar manapun?', options: ['Memasukkan kunci privat asli untuk mencoba', 'Memakai kunci uji sementara, tanpa data asli', 'Mengirim frasa seed ke kolom bantuan', 'Menyimpan WIF di kolom catatan'], answer: 1, explain: 'Gunakan hanya kunci uji. Kunci privat dan seed asli tidak pernah dimasukkan ke situs lain.' },
      ],
      labs: [],
      glossary: ['g-sighash', 'g-input', 'g-txid'],
      sources: ['src-devdocs', 'src-bips', 'src-sec2', 'src-rfc6979'],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'l4-08', slug: 'validasi-transaksi', level: 4, order: 8, minutes: 9,
      title: 'Validasi transaksi',
      objectives: [
        'Menyebut pemeriksaan utama node terhadap sebuah transaksi.',
        'Menerapkan pemeriksaan itu pada contoh angka.',
        'Membedakan transaksi invalid dari transaksi yang hanya ditolak kebijakan lokal.',
      ],
      prerequisites: ['l4-07'],
      hook: 'Setiap node bertindak sebagai pemeriksa. Tidak ada yang percaya begitu saja pada transaksi yang masuk, semuanya diperiksa dari nol.',
      sections: [
        {
          h: 'Pemeriksaan inti',
          p: [
            'Saat sebuah transaksi diterima, node menjalankan **validasi**. Pemeriksaan utamanya: format benar, setiap input menunjuk UTXO yang ada dan belum terpakai, tanda tangan tiap input cocok dengan script penguncinya, jumlah tiap output tidak negatif, dan total output tidak melebihi total input.',
            'Kalau satu pemeriksaan gagal, transaksi ditolak dan tidak diteruskan ke node lain.',
          ],
        },
        {
          h: 'Contoh perhitungan',
          p: [
            'Transaksi memakai tiga input: 30.000.000 sat, 19.900.000 sat, dan 100.000 sat, total 50.000.000 sat. Output yang diajukan: 49.900.000 sat ke penerima. Selisih 100.000 sat menjadi fee. Valid, asalkan semua input menunjuk UTXO yang ada dan semua tanda tangan cocok.',
            'Kalau output diajukan 50.100.000 sat, total output melebihi total input. Node menolak, karena transaksi mencoba membuat uang dari ketiadaan.',
          ],
        },
        {
          h: 'Valid menurut aturan konsensus, diterima menurut kebijakan',
          p: [
            'Ada dua lapis aturan. Aturan konsensus menentukan apa yang sah di blockchain. Kebijakan lokal (policy) adalah preferensi tiap node soal apa yang mau disiarkan, misalnya batas fee minimum atau penolakan output dust.',
            'Transaksi bisa valid menurut konsensus tetapi ditolak kebijakan node tertentu. Dalam kasus itu penambang yang menerimanya masih bisa memasukkannya ke blok.',
          ],
        },
        {
          h: 'Coba sendiri',
          p: [
            'Di lab Penyusun UTXO, atur output sampai melebihi input dan lihat pesan penolakannya. Lalu kurangi sampai tersisa fee kecil dan lihat transaksi menjadi valid.',
          ],
        },
      ],
      technical: {
        title: 'Urutan pemeriksaan di node',
        p: [
          'Node penuh memeriksa struktur (ukuran, jumlah input dan output, tidak ada duplikasi input), mencari tiap outpoint di himpunan UTXO, memastikan UTXO coinbase sudah matang (100 blok), menjalankan script penguncian dan pembuka, lalu membandingkan jumlah input dan output.',
          'Pemeriksaan script bisa mahal. Karena itu ada batas jumlah operasi tanda tangan per blok, dan hasil verifikasi tanda tangan di-cache supaya transaksi yang sama tidak diperiksa dua kali saat masuk blok.',
        ],
      },
      misconceptions: [
        { salah: 'Node hanya memeriksa tanda tangan.', benar: 'Node juga memeriksa keberadaan UTXO, jumlah, format, dan aturan lain. Tanda tangan hanya salah satu pemeriksaan.' },
        { salah: 'Transaksi yang ditolak sebuah node pasti tidak sah di blockchain.', benar: 'Bisa jadi hanya melanggar kebijakan lokal node itu. Aturan konsensus yang menentukan sah atau tidaknya.' },
      ],
      summary: [
        'Node memeriksa format, keberadaan UTXO, tanda tangan, dan jumlah.',
        'Total output tidak boleh melebihi total input, dan selisihnya menjadi fee.',
        'Aturan konsensus berbeda dari kebijakan lokal node.',
      ],
      quiz: [
        { id: 'l4-08-q1', q: 'Mana yang termasuk pemeriksaan validasi?', options: ['Warna alamat', 'Total output tidak melebihi total input', 'Jumlah pengikut penerima', 'Waktu server'], answer: 1, explain: 'Node memeriksa bahwa transaksi tidak membuat uang dari ketiadaan.' },
        { id: 'l4-08-q2', q: 'Input total 50.000.000 sat. Output 50.100.000 sat. Apa hasilnya?', options: ['Valid dengan fee negatif', 'Ditolak karena output melebihi input', 'Valid dengan bonus', 'Diterima setelah satu konfirmasi'], answer: 1, application: true, explain: 'Output harus kurang dari atau sama dengan input. Di sini 100.000 sat lebih banyak, sehingga tidak valid.' },
        { id: 'l4-08-q3', q: 'Input total 50.000.000 sat. Output 49.900.000 sat. Semua tanda tangan cocok. Apa hasilnya?', options: ['Ditolak', 'Valid, dengan fee 100.000 sat', 'Valid, fee 0', 'Valid, fee 1.000 sat'], answer: 1, application: true, explain: 'Selisih 100.000 sat menjadi fee, dan semua syarat lain terpenuhi.' },
        { id: 'l4-08-q4', q: 'Apa beda aturan konsensus dan kebijakan lokal?', options: ['Konsensus menentukan sah tidaknya di blockchain, kebijakan hanya preferensi penyiaran sebuah node', 'Sama saja', 'Kebijakan menentukan blockchain', 'Konsensus bisa diganti pengguna biasa'], answer: 0, explain: 'Konsensus bersama menentukan validitas. Kebijakan lokal seperti batas fee berbeda antar node.' },
      ],
      labs: ['lab-utxo'],
      glossary: ['g-validasi', 'g-fee', 'g-dust'],
      sources: ['src-devdocs', 'src-bitcoincore', 'src-masteringbitcoin'],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'l4-09', slug: 'mempool-dan-konfirmasi', level: 4, order: 9, minutes: 8,
      title: 'Mempool dan konfirmasi',
      objectives: [
        'Menjelaskan apa itu mempool dan kenapa tiap node punya sendiri.',
        'Menjelaskan arti konfirmasi.',
        'Menjelaskan kenapa konfirmasi bukan jaminan absolut.',
      ],
      prerequisites: ['l4-08', 'l3-05'],
      hook: 'Transaksimu sudah disiarkan, tetapi belum ada di blok. Ia menunggu di antrean yang tidak dimiliki siapa pun secara tunggal.',
      sections: [
        {
          h: 'Mempool: antrean di tiap node',
          p: [
            'Transaksi yang lolos validasi disimpan sementara di memori node dalam **mempool**. Tiap node punya mempool sendiri. Isinya bisa sedikit berbeda antar node, tergantung kapan transaksi sampai dan apa kebijakan tiap node.',
            'Karena itu tidak ada satu antrean tunggal. Transaksimu mungkin terlihat di satu penjelajah blok tetapi belum di penjelajah lain.',
          ],
          visual: 'p2p',
        },
        {
          h: 'Penambang memilih dari mempool',
          p: [
            'Penambang mengumpulkan transaksi dari mempoolnya untuk dimasukkan ke blok kandidat, biasanya mengutamakan fee per ukuran tertinggi karena ruang blok terbatas. Transaksi berfee rendah bisa menunggu lama, atau akhirnya dibuang dari mempool.',
            'Menunggu bukan berarti uang hilang. Selama transaksi belum masuk blok, UTXO yang kamu tunjuk masih tercatat di blockchain.',
          ],
        },
        {
          h: 'Konfirmasi dan kedalaman',
          p: [
            'Ketika transaksi masuk blok, ia punya satu **konfirmasi**. Setiap blok baru yang menumpuk di atasnya menambah satu konfirmasi. Jadi konfirmasi menyatakan seberapa dalam transaksi terkubur di rantai.',
            'Makin dalam, makin mahal bagi siapa pun yang ingin menulis ulang riwayat itu, karena ia harus mengerjakan ulang semua blok di atasnya.',
          ],
          visual: 'chain',
        },
        {
          h: 'Bukan jaminan absolut',
          p: [
            'Satu konfirmasi cukup untuk pembayaran kecil di banyak situasi, tetapi rantai bisa berganti jika dua blok ditemukan hampir bersamaan dan satu cabang kalah. Transaksi di cabang yang kalah kembali ke mempool, dan ada kemungkinan tidak masuk lagi.',
            'Karena risiko ini turun terus seiring bertambahnya konfirmasi, penerima menentukan sendiri berapa konfirmasi yang ia anggap cukup, sesuai nilai pembayaran.',
          ],
        },
      ],
      technical: {
        title: 'Penggantian dan pengusiran',
        p: [
          'Transaksi yang menunggu bisa diganti jika pengirim membuat transaksi baru yang menunjuk input yang sama dengan fee lebih tinggi (replace-by-fee). Aturan penggantian diatur kebijakan node, bukan konsensus.',
          'Mempool dibatasi ukurannya dan node membuang transaksi dengan fee rate terendah saat penuh. Transaksi juga kedaluwarsa dari mempool setelah beberapa hari.',
          'Ketika terjadi reorganisasi rantai, transaksi dari blok yang dilepas dikembalikan ke mempool jika masih valid terhadap rantai baru.',
        ],
      },
      misconceptions: [
        { salah: 'Mempool adalah antrean tunggal yang dimiliki jaringan.', benar: 'Tiap node memiliki mempool sendiri, isinya bisa berbeda.' },
        { salah: 'Satu konfirmasi berarti transaksi pasti tidak akan pernah berubah.', benar: 'Satu konfirmasi berarti masuk blok. Risiko pembalikan menurun seiring bertambahnya blok di atasnya, tetapi tidak nol secara mutlak.' },
      ],
      summary: [
        'Mempool adalah antrean sementara di tiap node, dan isinya bisa berbeda antar node.',
        'Penambang memilih transaksi dari mempool, biasanya berdasarkan fee per ukuran.',
        'Konfirmasi adalah kedalaman blok, dan makin banyak makin aman, tetapi tidak pernah absolut.',
      ],
      quiz: [
        { id: 'l4-09-q1', q: 'Apa itu mempool?', options: ['Antrean transaksi valid yang menunggu di memori sebuah node', 'Basis data global milik penambang terbesar', 'Daftar alamat yang diblokir', 'Cadangan blockchain'], answer: 0, explain: 'Mempool adalah penyimpanan sementara transaksi valid yang belum masuk blok, dan dimiliki masing-masing node.' },
        { id: 'l4-09-q2', q: 'Transaksimu masuk ke blok nomor 100. Sekarang tinggi rantai 104. Berapa konfirmasinya?', options: ['4', '5', '104', '100'], answer: 1, application: true, explain: 'Blok 100 memberi satu konfirmasi, dan tiap blok sesudahnya menambah satu: blok 100 sampai 104 adalah lima blok.' },
        { id: 'l4-09-q3', q: 'Kenapa konfirmasi tidak disebut jaminan absolut?', options: ['Karena fee bisa berubah', 'Karena rantai bisa berganti bila ada cabang yang kalah, walau makin kecil kemungkinannya seiring bertambahnya blok', 'Karena penambang bisa menarik kembali pembayaran', 'Karena wallet bisa membatalkannya'], answer: 1, explain: 'Reorganisasi rantai dapat melepas blok. Makin dalam konfirmasi, makin kecil peluangnya.' },
        { id: 'l4-09-q4', q: 'Transaksimu berfee sangat rendah dan sudah lama belum masuk blok. Apa penjelasan paling masuk akal?', options: ['Uangmu hilang', 'Penambang mengutamakan fee per ukuran lebih tinggi, jadi transaksimu menunggu', 'Blockchain rusak', 'Penerima menolaknya'], answer: 1, application: true, explain: 'Ruang blok terbatas. Transaksi berfee rendah menunggu sampai antrean mereda, atau diganti dengan fee lebih tinggi.' },
      ],
      labs: [],
      glossary: ['g-mempool', 'g-konfirmasi', 'g-fee'],
      sources: ['src-whitepaper', 'src-devdocs', 'src-bitcoincore'],
    },
  ];

  const glossary = [
    { id: 'g-transaksi', term: 'Transaksi', aliases: ['tx'], definition: 'Pesan yang menyatakan perpindahan hak belanja: menunjuk UTXO lama sebagai input, menetapkan output baru, dan membawa bukti hak belanja.', related: ['g-input', 'g-output', 'g-txid'] },
    { id: 'g-utxo', term: 'UTXO', aliases: ['unspent transaction output'], definition: 'Output transaksi yang belum dibelanjakan. Saldo wallet adalah jumlah UTXO yang bisa dibelanjakan dengan kuncinya.', related: ['g-output', 'g-input', 'g-satoshi'] },
    { id: 'g-satoshi', term: 'Satoshi', aliases: ['sat'], definition: 'Satuan terkecil Bitcoin. 1 BTC sama dengan 100.000.000 satoshi.', related: ['g-utxo'] },
    { id: 'g-input', term: 'Input', definition: 'Bagian transaksi yang menunjuk satu UTXO lewat TXID dan indeks output, beserta data pembuka kuncinya.', related: ['g-utxo', 'g-indeks-output', 'g-sighash'] },
    { id: 'g-output', term: 'Output', definition: 'Bagian transaksi berisi jumlah satoshi dan script yang mengunci jumlah itu. Output yang belum dibelanjakan adalah UTXO.', related: ['g-utxo', 'g-indeks-output'] },
    { id: 'g-txid', term: 'TXID', aliases: ['transaction id', 'id transaksi'], definition: 'Hash SHA-256 ganda dari data transaksi tanpa witness, dipakai sebagai pengenal transaksi.', related: ['g-wtxid', 'g-indeks-output'] },
    { id: 'g-wtxid', term: 'WTXID', aliases: ['witness transaction id'], definition: 'Hash transaksi yang dihitung termasuk data witness. Berbeda dari TXID yang dihitung tanpa witness.', related: ['g-txid'] },
    { id: 'g-indeks-output', term: 'Indeks output', aliases: ['output index', 'vout'], definition: 'Nomor urut sebuah output di dalam transaksi, dimulai dari 0. Bersama TXID, nomor ini menunjuk sebuah UTXO secara unik.', related: ['g-txid', 'g-output'] },
    { id: 'g-kembalian', term: 'Kembalian', aliases: ['change'], definition: 'Output ke kunci milik pengirim sendiri yang menampung sisa input setelah pembayaran dan fee.', related: ['g-fee', 'g-output'] },
    { id: 'g-fee', term: 'Fee', aliases: ['biaya transaksi', 'transaction fee'], definition: 'Selisih total input dikurangi total output. Tidak ditulis sebagai kolom, dan menjadi hak penambang yang memasukkan transaksi ke blok.', related: ['g-kembalian', 'g-mempool'] },
    { id: 'g-sighash', term: 'Sighash', aliases: ['signature hash'], definition: 'Hash dari data yang disusun dari transaksi, yang ditandatangani untuk membuktikan hak belanja. Mengikat tanda tangan pada isi transaksi.', related: ['g-input', 'g-transaksi'] },
    { id: 'g-validasi', term: 'Validasi transaksi', definition: 'Pemeriksaan node atas format, keberadaan UTXO, tanda tangan, dan jumlah sebuah transaksi sebelum diteruskan atau dimasukkan ke blok.', related: ['g-transaksi', 'g-fee'] },
    { id: 'g-mempool', term: 'Mempool', aliases: ['memory pool'], definition: 'Antrean sementara transaksi valid yang belum masuk blok, dimiliki masing-masing node dan bisa berbeda antar node.', related: ['g-fee', 'g-konfirmasi'] },
    { id: 'g-konfirmasi', term: 'Konfirmasi', aliases: ['confirmation'], definition: 'Jumlah blok yang menumpuk di atas dan termasuk blok yang memuat sebuah transaksi. Makin banyak, makin kecil peluang pembalikan.', related: ['g-mempool'] },
    { id: 'g-coinbase', term: 'Transaksi coinbase', aliases: ['coinbase'], definition: 'Transaksi pertama di setiap blok yang membuat koin baru dan mengumpulkan fee, sebagai hadiah penambang. Inputnya tidak menunjuk UTXO.', related: ['g-txid', 'g-fee'] },
    { id: 'g-dust', term: 'Dust', definition: 'Output yang jumlahnya sangat kecil sehingga biaya membelanjakannya bisa melebihi nilainya. Node biasanya menolak menyiarkan transaksi dengan output dust.', related: ['g-output', 'g-fee'] },
  ];

  D.addLessons(lessons);
  D.addGlossary(glossary);
})(typeof self !== 'undefined' ? self : globalThis);

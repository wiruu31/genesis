/* Genesis v2.0.0, genesis-konten-level0-1.js
 * Konten Level 0 (orientasi) dan Level 1 (uang dan masalah digital), plus glosarium level ini.
 */
(function (root) {
  'use strict';
  const D = root.GenesisData || (typeof require !== 'undefined' ? require('./genesis-data.js') : null);

  const lessons = [
    /* ---------------------------------------------------------------- L0 */
    {
      id: 'l0-01', slug: 'cara-belajar-di-genesis', level: 0, order: 1,
      title: 'Cara belajar di Genesis', minutes: 6,
      objectives: [
        'Menjelaskan urutan belajar dari Level 1 sampai Level 4.',
        'Mengenali pembagian tiap lesson: penjelasan, versi teknis, kuis, dan lab.',
        'Memahami batas situs ini: simulasi untuk belajar, bukan dompet dan bukan saran investasi.',
      ],
      prerequisites: [],
      hook: 'Kamu tidak perlu paham kode atau matematika untuk mulai. Cukup tahu cara kamu mengirim uang lewat aplikasi bank, lalu kita bongkar apa yang sebenarnya terjadi di belakangnya.',
      sections: [
        {
          h: 'Jalur yang kita ikuti',
          p: [
            'Genesis berjalan dari pertanyaan paling dasar ke bagian teknis. Level 1 membahas uang dan masalah yang muncul saat uang menjadi data. Level 2 memperkenalkan jaringan dan kriptografi. Level 3 membongkar blok dan rantai. Level 4 membahas transaksi Bitcoin.',
            'Semua lesson boleh dibuka kapan saja. Urutan hanya rekomendasi, jadi kamu bisa melompat bila sebagian materi sudah kamu kuasai.',
          ],
        },
        {
          h: 'Isi satu lesson',
          p: [
            'Tiap lesson dibuka dengan satu situasi konkret, lalu penjelasan dalam bahasa sehari-hari. Bagian **versi teknis** tertutup secara bawaan. Buka bila kamu ingin rincian yang lebih dekat ke cara kerja sebenarnya.',
            'Di akhir ada miskonsepsi yang umum, ringkasan, dan kuis pendek. Beberapa soal berupa skenario, bukan hafalan.',
          ],
        },
        {
          h: 'Lab dan kuis',
          p: [
            'Lab adalah simulasi kecil yang berjalan di browsermu. Hasilnya selalu berlabel simulasi, karena yang kamu ubah hanya data latihan, bukan jaringan Bitcoin sungguhan.',
            'Sebuah lesson dianggap **dikuasai** bila skor kuisnya minimal 80 persen dan satu soal aplikasi terjawab benar. Kemajuanmu hanya disimpan di browser ini, dan bisa dihapus dari halaman Pengaturan.',
          ],
        },
        {
          h: 'Yang tidak dilakukan situs ini',
          p: [
            'Genesis tidak pernah meminta kunci privat, seed phrase, atau data dompet asli. Kunci yang muncul di lab adalah kunci uji sementara. Situs ini juga tidak memberi saran membeli, menjual, atau menyimpan aset apa pun.',
          ],
        },
      ],
      technical: {
        title: 'Di mana data belajarmu disimpan',
        p: [
          'Kemajuan disimpan di `localStorage` browser dengan awalan nama `btc-learn:v1:`. Tidak ada akun, tidak ada server, dan tidak ada pelacak pihak ketiga. Bila kamu membersihkan data situs di browser, kemajuan ikut hilang.',
          'Aplikasi memakai service worker supaya halaman yang sudah pernah dibuka tetap bisa dibaca tanpa internet.',
        ],
      },
      misconceptions: [
        { salah: 'Menyelesaikan semua lab berarti siap mengelola dompet Bitcoin sungguhan.', benar: 'Lab mengajarkan konsep. Pengelolaan dompet asli punya risiko praktis yang tidak tercakup di level ini.' },
      ],
      summary: [
        'Urutan belajar: Level 1 sampai 4, tapi semua lesson bebas dibuka.',
        'Tiap lesson punya penjelasan, versi teknis, kuis, dan kadang lab.',
        'Situs ini hanya simulasi edukasi. Tidak ada kunci asli, tidak ada saran investasi.',
      ],
      quiz: [
        { id: 'l0-01-q1', q: 'Apa arti status "dikuasai" pada sebuah lesson?', options: ['Kamu sudah membuka semua bagian lesson itu', 'Skor kuis minimal 80 persen dan satu soal aplikasi benar', 'Kamu sudah mengerjakan semua lab', 'Kamu sudah membaca versi teknisnya'], answer: 1, explain: 'Penguasaan diukur dari kuis: skor minimal 80 persen dan satu soal aplikasi yang benar. Membuka halaman saja tidak cukup.' },
        { id: 'l0-01-q2', q: 'Sebuah lab meminta kamu memasukkan kunci privat dompet Bitcoin aslimu. Apa yang benar?', options: ['Aman, selama kamu memasukkannya di situs belajar', 'Boleh, asal dompetmu hanya berisi sedikit', 'Itu bukan cara kerja Genesis, jangan masukkan kunci asli ke mana pun', 'Boleh bila situsnya memakai HTTPS'], answer: 2, explain: 'Genesis hanya memakai kunci uji sementara. Kunci privat asli tidak boleh dimasukkan ke situs mana pun yang tidak kamu kendalikan.', application: true },
        { id: 'l0-01-q3', q: 'Di mana kemajuan belajarmu disimpan?', options: ['Di server milik Genesis', 'Di akun email kamu', 'Di jaringan Bitcoin', 'Di browser perangkat ini'], answer: 3, explain: 'Data hanya disimpan lokal di browser. Membersihkan data situs akan menghapusnya.' },
      ],
      labs: [], glossary: [], sources: ['src-whitepaper'],
    },

    /* ---------------------------------------------------------------- L1-01 */
    {
      id: 'l1-01', slug: 'apa-itu-uang', level: 1, order: 1,
      title: 'Apa itu uang', minutes: 8,
      objectives: [
        'Menyebut tiga fungsi uang.',
        'Menjelaskan kenapa barter sulit dan bagaimana uang mengatasinya.',
        'Memahami bahwa nilai uang bertumpu pada kepercayaan dan kesepakatan bersama.',
      ],
      prerequisites: ['l0-01'],
      hook: 'Kamu menukar selembar kertas bercetak dengan semangkuk bakso, dan penjualnya senang menerimanya. Kertas itu tidak bisa dimakan. Kenapa tetap berharga?',
      sections: [
        {
          h: 'Masalah barter',
          p: [
            'Tanpa uang, orang bertukar barang langsung. Petani beras yang butuh sepatu harus menemukan pembuat sepatu yang kebetulan butuh beras, pada saat yang sama, dengan takaran yang sama-sama dianggap adil.',
            'Syarat kebetulan seperti itu membuat pertukaran lambat dan sering gagal.',
          ],
        },
        {
          h: 'Tiga fungsi uang',
          p: [
            'Uang punya tiga fungsi yang biasa disebut dalam ekonomi. Pertama, **alat tukar**: semua orang mau menerimanya untuk barang apa pun. Kedua, **satuan hitung**: harga bakso, sepatu, dan sewa kamar bisa dibandingkan dalam satu ukuran. Ketiga, **penyimpan nilai**: sebagian daya beli hari ini bisa dibawa ke minggu depan.',
            'Uang yang baik menjalankan ketiganya. Banyak benda pernah dipakai, dari kulit kerang sampai logam, dan tiap benda punya kelebihan serta kelemahan.',
          ],
        },
        {
          h: 'Nilai datang dari mana',
          p: [
            'Uang kertas modern tidak bisa ditukar dengan emas atau barang tertentu. Nilainya bertahan karena banyak orang sepakat menerimanya, negara menetapkannya sebagai alat bayar sah, dan pajak dibayar dengan uang itu.',
            'Jadi uang adalah kesepakatan sosial yang didukung aturan dan kebiasaan. Pertanyaan yang akan kita ikuti di level ini: bila uang berupa data, siapa yang menjaga kesepakatannya?',
          ],
        },
      ],
      technical: {
        title: 'Ciri benda yang cocok jadi uang',
        p: [
          'Para ekonom sering menyebut ciri berikut: tahan lama, mudah dibagi menjadi satuan kecil, mudah dibawa, seragam antar satuan, dan sulit dipalsukan. Kulit kerang mudah dibagi tapi bisa dicari dalam jumlah besar. Emas tahan lama tapi berat untuk transaksi kecil.',
          'Karena itu sistem uang modern memisahkan satuan hitung (angka) dari bentuk fisiknya. Saldo bank hanyalah angka yang diakui bersama.',
        ],
      },
      misconceptions: [
        { salah: 'Uang hanya bernilai bila ada emas atau barang lain yang mendukungnya.', benar: 'Uang kertas modern bernilai karena diterima luas dan ditetapkan hukum sebagai alat bayar, bukan karena dijamin emas.' },
        { salah: 'Uang dan kekayaan adalah hal yang sama.', benar: 'Uang hanyalah satu bentuk kekayaan. Rumah, tanah, dan keahlian juga kekayaan tetapi tidak selalu bisa dipakai membayar langsung.' },
      ],
      summary: [
        'Uang mengatasi kerumitan barter.',
        'Tiga fungsinya: alat tukar, satuan hitung, penyimpan nilai.',
        'Nilai uang modern bertumpu pada kesepakatan dan kepercayaan bersama.',
      ],
      quiz: [
        { id: 'l1-01-q1', q: 'Mana yang termasuk tiga fungsi uang?', options: ['Alat tukar, satuan hitung, penyimpan nilai', 'Alat tukar, alat pamer, alat pajak', 'Satuan hitung, satuan berat, penyimpan data', 'Penyimpan nilai, penjamin harga, pencetak kekayaan'], answer: 0, explain: 'Fungsi klasik uang adalah alat tukar, satuan hitung, dan penyimpan nilai.' },
        { id: 'l1-01-q2', q: 'Kenapa barter sulit dipakai pada skala besar?', options: ['Barang selalu cepat rusak', 'Dua pihak harus saling membutuhkan barang satu sama lain pada saat yang sama', 'Barter dilarang di semua negara', 'Barang tidak punya harga'], answer: 1, explain: 'Barter membutuhkan kebetulan keinginan yang saling cocok. Uang menghilangkan syarat itu.' },
        { id: 'l1-01-q3', q: 'Seorang penjual menolak menerima kerang sebagai pembayaran, padahal tetangganya mau. Fungsi uang mana yang paling terganggu?', options: ['Penyimpan nilai', 'Satuan hitung', 'Alat tukar', 'Pencatat utang'], answer: 2, explain: 'Alat tukar hanya berjalan bila semua pihak mau menerimanya. Kalau penjual menolak, kerang gagal berfungsi sebagai alat tukar di situ.', application: true },
        { id: 'l1-01-q4', q: 'Uang kertas modern tetap diterima terutama karena...', options: ['Selalu bisa ditukar dengan emas di bank sentral', 'Ia terbuat dari bahan yang mahal', 'Diterima luas dan diakui hukum sebagai alat bayar', 'Dicetak dengan warna yang sulit ditiru'], answer: 2, explain: 'Penerimaan luas dan status hukum menjaga nilainya. Kesulitan menirunya hanya melindungi dari pemalsuan.' },
      ],
      labs: [], glossary: ['g-uang', 'g-kepercayaan'], sources: ['src-masteringbitcoin'],
    },

    /* ---------------------------------------------------------------- L1-02 */
    {
      id: 'l1-02', slug: 'tunai-vs-digital', level: 1, order: 2,
      title: 'Uang tunai dan uang digital', minutes: 8,
      objectives: [
        'Membedakan cara kerja pembayaran tunai dan pembayaran digital.',
        'Menjelaskan kenapa uang digital berupa catatan, bukan benda.',
        'Mengenali masalah baru yang muncul ketika uang bisa disalin.',
      ],
      prerequisites: ['l1-01'],
      hook: 'Kamu menyerahkan uang Rp50.000 ke penjual, dan uang itu kini hilang dari tanganmu. Saat kamu transfer lewat aplikasi, tidak ada benda yang berpindah sama sekali. Lalu apa yang berpindah?',
      sections: [
        {
          h: 'Tunai berpindah sebagai benda',
          p: [
            'Saat membayar tunai, lembaran itu berpindah tangan. Kamu tidak bisa membayar dua orang dengan lembaran yang sama, karena lembarannya hanya ada satu dan hanya bisa berada di satu tangan.',
            'Aturan ini tidak perlu ditegakkan siapa pun. Fisika yang menegakkannya.',
          ],
        },
        {
          h: 'Digital berpindah sebagai catatan',
          p: [
            'Pada transfer bank, angka saldomu berkurang dan angka saldo penerima bertambah di catatan bank. Tidak ada benda yang keluar dari sana. Yang berubah hanya isi catatan.',
            'Karena itu keamanan uang digital sepenuhnya bergantung pada siapa yang memegang catatan, siapa boleh mengubahnya, dan bagaimana perubahan diperiksa.',
          ],
        },
        {
          h: 'Data mudah disalin',
          p: [
            'File foto bisa kamu kirim ke sepuluh orang tanpa kehilangan fotonya. Bila uang hanyalah file, siapa pun bisa mengirim file yang sama berkali-kali. Ini bukan masalah teori. Ini alasan utama kenapa uang digital selalu butuh pihak atau mekanisme yang menjaga agar satu unit hanya dipakai sekali.',
          ],
        },
      ],
      technical: {
        title: 'Saldo bank sebagai baris di basis data',
        p: [
          'Di sisi bank, saldo biasanya berupa baris di basis data. Transfer dijalankan sebagai transaksi basis data yang atomik: pengurangan di satu rekening dan penambahan di rekening lain berhasil bersamaan atau batal bersamaan.',
          'Atomik berarti tidak pernah ada keadaan setengah jadi di mana uang berkurang tapi tidak sampai. Jaminan ini disediakan oleh sistem tunggal yang dikendalikan satu organisasi.',
        ],
      },
      misconceptions: [
        { salah: 'Transfer digital berarti ada file uang yang dikirim dari aku ke penerima.', benar: 'Yang berubah adalah catatan saldo. Tidak ada file uang yang berpindah.' },
      ],
      summary: [
        'Uang tunai berpindah sebagai benda, jadi tidak bisa dipakai dua kali.',
        'Uang digital berpindah sebagai perubahan catatan.',
        'Data mudah disalin, sehingga uang digital butuh mekanisme pencegah pemakaian ganda.',
      ],
      quiz: [
        { id: 'l1-02-q1', q: 'Apa yang sebenarnya berubah saat kamu mentransfer uang lewat aplikasi bank?', options: ['Sebuah file uang berpindah ke penerima', 'Catatan saldo di sistem bank berubah', 'Uang fisik dikirim lewat jaringan', 'Kartu debitmu diperbarui'], answer: 1, explain: 'Transfer mengubah catatan saldo. Tidak ada benda atau file uang yang dikirim.' },
        { id: 'l1-02-q2', q: 'Kenapa uang tunai tidak bisa dibelanjakan dua kali dengan lembaran yang sama?', options: ['Karena bank mengawasi setiap lembaran', 'Karena lembaran fisik hanya bisa berada di satu tangan', 'Karena tiap lembaran punya kunci digital', 'Karena pajak melarangnya'], answer: 1, explain: 'Sifat fisik benda sudah mencegah pemakaian ganda tanpa butuh pengawas.' },
        { id: 'l1-02-q3', q: 'Sebuah aplikasi menyimpan "koin" sebagai file di ponselmu dan bisa kamu salin. Masalah apa yang paling mungkin muncul?', options: ['File koin terlalu besar', 'Koin yang sama bisa digandakan dan dibayarkan ke banyak orang', 'Ponsel menjadi lambat', 'Koin kehilangan warna'], answer: 1, explain: 'Data yang bisa disalin bebas berarti satu koin bisa dipakai berkali-kali, kecuali ada mekanisme yang mencegahnya.', application: true },
      ],
      labs: [], glossary: ['g-uang', 'g-buku-besar'], sources: ['src-masteringbitcoin'],
    },

    /* ---------------------------------------------------------------- L1-03 */
    {
      id: 'l1-03', slug: 'pencatatan-terpusat', level: 1, order: 3,
      title: 'Pencatatan terpusat dan pihak tepercaya', minutes: 9,
      objectives: [
        'Menjelaskan peran buku besar dan pihak tepercaya dalam sistem pembayaran digital.',
        'Menyebut kelebihan dan kelemahan sistem terpusat.',
        'Merumuskan pertanyaan yang ingin dijawab Bitcoin.',
      ],
      prerequisites: ['l1-02'],
      hook: 'Bank bisa membekukan rekeningmu, melakukan perawatan sistem sampai tengah malam, atau salah mencatat. Kamu percaya mereka akan membereskannya. Itulah inti pembayaran digital hari ini: kepercayaan pada satu pihak.',
      sections: [
        {
          h: 'Buku besar dan penjaganya',
          p: [
            '**Buku besar** (ledger) adalah catatan siapa memiliki berapa dan siapa membayar siapa. Dalam sistem pembayaran biasa, satu organisasi memegang buku besar itu, misalnya bank atau penyedia dompet digital.',
            'Organisasi ini disebut **pihak tepercaya**. Ia memeriksa apakah pengirim punya saldo cukup, lalu mencatat transfernya.',
          ],
          visual: 'ledger',
        },
        {
          h: 'Apa yang bagus dari model ini',
          p: [
            'Model terpusat sederhana dan cepat. Bila ada sengketa, ada satu tempat untuk mengadu. Kesalahan bisa dikoreksi, dan penipuan bisa dibatalkan oleh pihak yang berwenang.',
          ],
        },
        {
          h: 'Apa yang rapuh dari model ini',
          p: [
            'Semua bergantung pada satu pihak. Bila pihak itu berhenti beroperasi, diretas, membuat kesalahan, atau memutuskan menolak transaksimu, kamu hanya punya sedikit pilihan.',
            'Pihak tepercaya juga melihat seluruh riwayat transaksimu. Itu kenyamanan sekaligus risiko privasi.',
          ],
        },
        {
          h: 'Pertanyaan yang tersisa',
          p: [
            'Bisakah dua orang yang tidak saling kenal bertukar nilai secara digital, tanpa satu pihak pun yang memegang buku besar tunggal? Pertanyaan inilah yang dijawab Bitcoin dengan cara tertentu, dengan konsekuensi yang akan kita telusuri satu per satu.',
          ],
        },
      ],
      technical: {
        title: 'Satu titik kegagalan',
        p: [
          'Dalam rekayasa sistem, komponen tunggal yang bila gagal menghentikan seluruh sistem disebut titik kegagalan tunggal. Sistem terpusat sering menutupinya dengan cadangan dan replikasi, tetapi pengendalian dan kewenangan tetap ada di satu organisasi.',
          'Mereplikasi basis data ke beberapa server milik organisasi yang sama meningkatkan ketahanan teknis, tetapi tidak mengubah siapa yang berwenang menulis ke catatan.',
        ],
      },
      misconceptions: [
        { salah: 'Sistem terpusat pasti buruk dan sistem tanpa pusat pasti lebih baik.', benar: 'Keduanya punya trade-off. Terpusat lebih sederhana dan bisa dikoreksi, tetapi bergantung pada satu pihak. Tanpa pusat mengurangi ketergantungan itu, dengan biaya kerumitan dan keterbatasan lain.' },
      ],
      summary: [
        'Buku besar adalah catatan kepemilikan dan transaksi.',
        'Pada sistem biasa, satu pihak tepercaya memegang dan memeriksa buku besar.',
        'Kelemahannya adalah ketergantungan pada satu pihak. Bitcoin mencoba menjawab pertanyaan itu.',
      ],
      quiz: [
        { id: 'l1-03-q1', q: 'Apa tugas pihak tepercaya dalam sistem pembayaran terpusat?', options: ['Mencetak uang fisik', 'Memegang buku besar dan memeriksa transaksi', 'Menentukan harga barang', 'Menghapus semua riwayat transaksi'], answer: 1, explain: 'Pihak tepercaya memegang catatan, memeriksa saldo, dan mencatat transfer.' },
        { id: 'l1-03-q2', q: 'Manakah yang merupakan kelemahan sistem pembayaran terpusat?', options: ['Transaksi tidak bisa dikoreksi sama sekali', 'Pengguna harus bergantung pada satu pihak yang bisa gagal atau menolak transaksi', 'Selalu lebih lambat dari sistem lain', 'Tidak bisa mencatat saldo'], answer: 1, explain: 'Ketergantungan pada satu pihak adalah kelemahan utamanya. Koreksi justru termasuk kelebihannya.' },
        { id: 'l1-03-q3', q: 'Sebuah penyedia dompet digital mengalami gangguan seharian, dan penggunanya tidak bisa membayar. Ini contoh dari...', options: ['Double spending', 'Ketergantungan pada satu titik kegagalan', 'Kriptografi yang lemah', 'Halving'], answer: 1, explain: 'Semua transaksi bergantung pada satu penyedia, jadi gangguannya berdampak ke semua pengguna.', application: true },
        { id: 'l1-03-q4', q: 'Replikasi basis data ke beberapa server milik satu perusahaan terutama meningkatkan...', options: ['Desentralisasi kewenangan', 'Ketahanan teknis, tetapi kewenangan tetap terpusat', 'Anonimitas pengguna', 'Jumlah uang beredar'], answer: 1, explain: 'Replika menambah ketahanan teknis, tetapi organisasi yang sama tetap menentukan isi catatan.' },
      ],
      labs: [], glossary: ['g-buku-besar', 'g-pihak-tepercaya', 'g-kepercayaan', 'g-desentralisasi'], sources: ['src-whitepaper', 'src-masteringbitcoin'],
    },

    /* ---------------------------------------------------------------- L1-04 */
    {
      id: 'l1-04', slug: 'double-spending', level: 1, order: 4,
      title: 'Double spending', minutes: 10,
      objectives: [
        'Menjelaskan apa itu double spending dan kenapa ia mengancam uang digital.',
        'Menjelaskan bagaimana pihak tepercaya mencegahnya.',
        'Menyebut apa yang harus dipecahkan sistem tanpa pihak tepercaya.',
      ],
      prerequisites: ['l1-03'],
      hook: 'Kamu punya saldo 100 dan mengirim 100 ke Ani. Di detik yang sama kamu mengirim 100 yang sama ke Budi. Hanya satu dari mereka yang boleh menerimanya. Siapa yang memutuskan?',
      sections: [
        {
          h: 'Apa itu double spending',
          p: [
            '**Double spending** adalah memakai nilai yang sama lebih dari satu kali. Uang tunai kebal terhadapnya karena sifat fisiknya. Uang digital tidak, karena data bisa disalin atau diajukan ke dua tempat sekaligus.',
          ],
        },
        {
          h: 'Cara bank mencegahnya',
          p: [
            'Bank memegang satu buku besar. Dua perintah transfer tiba, bank memprosesnya satu per satu. Perintah pertama membuat saldo habis, perintah kedua ditolak karena saldo tidak cukup.',
            'Kuncinya ada pada **satu urutan** yang disepakati. Pihak tepercaya menentukan mana yang pertama.',
          ],
        },
        {
          h: 'Kalau tidak ada penentu urutan',
          p: [
            'Bayangkan buku besar disalin ke banyak komputer, dan tiap komputer menerima kabar secara berbeda. Komputer A mendengar pembayaran ke Ani lebih dulu. Komputer B mendengar pembayaran ke Budi lebih dulu. Keduanya merasa benar, dan pada saat itu tidak ada pihak yang berwenang menyatakan mana yang sah.',
            'Inilah masalah yang harus dipecahkan: bagaimana banyak pihak yang tidak saling percaya bisa **sepakat atas satu urutan transaksi**.',
          ],
        },
        {
          h: 'Coba sendiri',
          p: [
            'Di lab double spending kamu bisa mengirim koin yang sama ke dua penerima dan melihat bagaimana urutan di buku besar menentukan mana yang diterima. Ingat, itu simulasi sederhana, bukan jaringan Bitcoin.',
          ],
        },
      ],
      technical: {
        title: 'Konsensus atas urutan',
        p: [
          'Dalam sistem terdistribusi, masalah ini dikenal sebagai kebutuhan akan kesepakatan (konsensus) atas urutan operasi. Dengan satu server, urutan ditentukan oleh server itu. Dengan banyak peserta yang bisa berbohong atau terlambat, dibutuhkan protokol khusus.',
          'Bitcoin menjawabnya dengan mengelompokkan transaksi ke dalam blok yang disusun berurutan dan dilindungi proof of work. Detailnya kita bahas di level berikutnya. Untuk saat ini cukup pahami bahwa tujuannya adalah satu urutan yang bisa diperiksa semua orang.',
        ],
      },
      misconceptions: [
        { salah: 'Double spending hanya terjadi bila seseorang meretas sistem.', benar: 'Percobaannya hanya butuh dua pembayaran yang saling bertentangan. Yang menentukan hasilnya adalah mekanisme urutan dan validasi sistem.' },
        { salah: 'Bank tidak punya masalah double spending karena uangnya tersimpan aman.', benar: 'Bank punya masalah yang sama. Ia hanya menyelesaikannya dengan satu buku besar dan satu penentu urutan.' },
      ],
      summary: [
        'Double spending adalah memakai nilai yang sama lebih dari sekali.',
        'Pihak tepercaya mencegahnya dengan memproses transaksi dalam satu urutan.',
        'Tanpa pihak tepercaya, banyak komputer harus sepakat atas satu urutan transaksi.',
      ],
      quiz: [
        { id: 'l1-04-q1', q: 'Apa itu double spending?', options: ['Membayar dua kali lipat dari harga barang', 'Memakai nilai yang sama lebih dari satu kali', 'Mengirim uang ke dua rekening milik sendiri', 'Membuat dua dompet'], answer: 1, explain: 'Double spending adalah mencoba membelanjakan unit yang sama berulang kali.' },
        { id: 'l1-04-q2', q: 'Bagaimana bank biasanya menolak pembayaran kedua yang bertentangan?', options: ['Memeriksa saldo setelah pembayaran pertama diproses dalam satu urutan', 'Meminta pengirim menunggu sebulan', 'Menghapus pembayaran pertama', 'Mengirim uang fisik'], answer: 0, explain: 'Setelah pembayaran pertama mengurangi saldo, pembayaran kedua gagal karena saldo tidak cukup.' },
        { id: 'l1-04-q3', q: 'Dua komputer dalam sebuah jaringan menerima dua pembayaran yang bertentangan dengan urutan berbeda. Apa masalah utamanya?', options: ['Kabelnya terlalu panjang', 'Tidak ada kesepakatan tentang urutan mana yang sah', 'Pembayarannya terlalu kecil', 'Komputer kehabisan memori'], answer: 1, explain: 'Tanpa kesepakatan atas urutan, dua pihak bisa menganggap transaksi berbeda sebagai yang pertama.', application: true },
        { id: 'l1-04-q4', q: 'Kenapa uang tunai tidak punya masalah double spending seperti uang digital?', options: ['Karena tunai selalu bernilai lebih tinggi', 'Karena lembaran fisik hanya bisa dipegang satu orang pada satu waktu', 'Karena tunai dicatat bank', 'Karena tunai tidak bisa dipalsukan'], answer: 1, explain: 'Sifat fisik benda sudah mencegahnya. Uang digital tidak punya batasan itu secara otomatis.' },
      ],
      labs: ['lab-double-spend'], glossary: ['g-double-spending', 'g-buku-besar', 'g-pihak-tepercaya'], sources: ['src-whitepaper'],
    },

    /* ---------------------------------------------------------------- L1-05 */
    {
      id: 'l1-05', slug: 'bitcoin-dan-whitepaper', level: 1, order: 5,
      title: 'Bitcoin dan whitepaper', minutes: 9,
      objectives: [
        'Menyebut siapa penulis whitepaper Bitcoin dan kapan terbit.',
        'Menjelaskan masalah yang disebut whitepaper hendak dipecahkan.',
        'Membedakan Bitcoin sebagai jaringan dan bitcoin (BTC) sebagai satuan.',
      ],
      prerequisites: ['l1-04'],
      hook: 'Pada 31 Oktober 2008, seseorang memakai nama Satoshi Nakamoto mengirim makalah sembilan halaman ke milis kriptografi. Isinya menawarkan cara mencegah double spending tanpa pihak tepercaya.',
      sections: [
        {
          h: 'Makalah sembilan halaman',
          p: [
            'Judulnya "Bitcoin: A Peer-to-Peer Electronic Cash System". Makalah itu diterbitkan **31 Oktober 2008**, dan dokumen asli masih tersedia di bitcoin.org.',
            'Identitas asli Satoshi Nakamoto sampai sekarang tidak diketahui secara pasti. Nama itu dipakai sebagai nama pena.',
          ],
        },
        {
          h: 'Masalah yang hendak dipecahkan',
          p: [
            'Makalah itu membuka dengan keluhan bahwa perdagangan di internet hampir selalu bergantung pada lembaga keuangan sebagai pihak tepercaya. Model itu punya kelemahan bawaan: sengketa harus dimediasi dan biayanya ikut menaikkan ongkos transaksi, sehingga pembayaran kecil menjadi tidak praktis.',
            'Usulannya: sistem pembayaran elektronik yang memakai bukti kriptografi alih-alih kepercayaan, sehingga dua pihak bisa bertransaksi langsung.',
          ],
        },
        {
          h: 'Gagasan inti',
          p: [
            'Transaksi diumumkan ke seluruh jaringan dan dikelompokkan ke dalam blok. Blok disambung berurutan dalam rantai, dan menambah blok butuh usaha komputasi yang disebut **proof of work**. Peserta yang jujur mengikuti rantai yang punya kerja paling banyak.',
            'Detail tiap bagian akan kita bongkar di Level 2 sampai 5. Sekarang cukup pegang bahwa urutan transaksi dijaga oleh jaringan, bukan oleh satu organisasi.',
          ],
          visual: 'chain',
        },
        {
          h: 'Bitcoin dengan B besar dan b kecil',
          p: [
            'Penulisan umum: **Bitcoin** (B besar) merujuk ke protokol dan jaringannya. **bitcoin** atau BTC merujuk ke satuan nilainya. Dalam materi ini kita ikut konvensi itu bila perbedaannya penting.',
          ],
        },
      ],
      technical: {
        title: 'Yang dikerjakan whitepaper dan yang belum',
        p: [
          'Whitepaper menjelaskan desain dasar: transaksi berbasis tanda tangan digital, rantai blok, proof of work, insentif bagi penambang, dan pemeriksaan pembayaran sederhana. Ia tidak mendefinisikan semua detail yang ada di perangkat lunak sekarang.',
          'Perilaku jaringan hari ini ditentukan oleh perangkat lunak node dan aturan konsensusnya, dengan penyempurnaan yang terdokumentasi dalam proposal perbaikan (BIP) dan dokumentasi pengembang. Whitepaper adalah titik awal, bukan spesifikasi lengkap.',
        ],
      },
      misconceptions: [
        { salah: 'Bitcoin sepenuhnya anonim.', benar: 'Bitcoin bersifat pseudonim. Transaksi tercatat publik dengan alamat, dan alamat bisa dikaitkan ke identitas lewat berbagai cara.' },
        { salah: 'Whitepaper adalah spesifikasi teknis lengkap yang dijalankan persis oleh jaringan sekarang.', benar: 'Whitepaper adalah gagasan awal. Aturan yang berjalan sekarang ada di perangkat lunak dan dokumentasi pengembang.' },
      ],
      summary: [
        'Whitepaper Bitcoin terbit 31 Oktober 2008 atas nama Satoshi Nakamoto.',
        'Tujuannya: pembayaran langsung antar pihak tanpa pihak tepercaya, dengan bukti kriptografi.',
        'Bitcoin (B besar) adalah jaringan, bitcoin atau BTC adalah satuannya.',
      ],
      quiz: [
        { id: 'l1-05-q1', q: 'Kapan whitepaper Bitcoin diterbitkan?', options: ['3 Januari 2009', '31 Oktober 2008', '9 Januari 2009', '1 Januari 2010'], answer: 1, explain: 'Makalah terbit 31 Oktober 2008. Blok genesis ditambang 3 Januari 2009.' },
        { id: 'l1-05-q2', q: 'Apa masalah utama yang dibahas whitepaper?', options: ['Cara membuat kartu kredit lebih murah', 'Cara melakukan pembayaran elektronik langsung tanpa pihak tepercaya', 'Cara menyimpan emas dengan aman', 'Cara membuat internet lebih cepat'], answer: 1, explain: 'Whitepaper mengusulkan sistem pembayaran elektronik berbasis bukti kriptografi.' },
        { id: 'l1-05-q3', q: 'Temanmu bilang transaksi Bitcoin tidak bisa dilacak siapa pun karena anonim. Koreksi yang paling tepat?', options: ['Benar, Bitcoin sepenuhnya anonim', 'Bitcoin pseudonim: transaksi tercatat publik dengan alamat yang bisa dikaitkan ke identitas', 'Bitcoin dipantau oleh bank sentral', 'Transaksi Bitcoin hanya tercatat di ponsel pengirim'], answer: 1, explain: 'Riwayat transaksi terbuka. Alamat bukan nama, tetapi bisa dihubungkan ke seseorang lewat berbagai cara.', application: true },
        { id: 'l1-05-q4', q: 'Mana yang paling tepat tentang hubungan whitepaper dengan jaringan Bitcoin sekarang?', options: ['Whitepaper adalah satu-satunya aturan yang dijalankan', 'Whitepaper menjelaskan gagasan awal, aturan sekarang ada di perangkat lunak dan dokumentasi', 'Whitepaper sudah tidak relevan sama sekali', 'Whitepaper berisi kode lengkap jaringan'], answer: 1, explain: 'Whitepaper adalah titik awal. Detail aturan sekarang dipelihara di perangkat lunak dan dokumentasi pengembang.' },
      ],
      labs: [], glossary: ['g-bitcoin', 'g-whitepaper', 'g-satoshi-nakamoto', 'g-pseudonim'], sources: ['src-whitepaper', 'src-devdocs'],
    },

    /* ---------------------------------------------------------------- L1-06 */
    {
      id: 'l1-06', slug: 'genesis-block', level: 1, order: 6,
      title: 'Genesis block', minutes: 8,
      objectives: [
        'Menjelaskan apa itu genesis block dan kapan ditambang.',
        'Memahami fungsi transaksi coinbase.',
        'Menjelaskan arti pesan yang tertanam di blok pertama.',
      ],
      prerequisites: ['l1-05'],
      hook: 'Rantai blok Bitcoin punya blok nomor 0, dan di dalamnya tertanam kalimat yang merujuk ke judul berita. Kenapa seorang pencipta sistem uang menyelipkan judul surat kabar ke blok pertama?',
      sections: [
        {
          h: 'Blok pertama',
          p: [
            '**Genesis block** adalah blok pertama di rantai Bitcoin, ditambang pada **3 Januari 2009**. Ia disebut blok nomor 0, dan semua blok setelahnya terhubung ke blok itu, langsung atau lewat rantai panjang.',
            'Berbeda dari blok lain, genesis block tertanam langsung di dalam perangkat lunak node sebagai data awal, bukan diterima dari jaringan.',
          ],
        },
        {
          h: 'Transaksi coinbase',
          p: [
            'Tiap blok punya satu transaksi khusus di urutan pertama yang disebut **coinbase**. Transaksi itu tidak mengambil koin dari pengirim mana pun. Ia menciptakan koin baru sebagai imbalan bagi penambang blok tersebut.',
            'Coinbase genesis block juga membuat imbalan 50 BTC. Menurut perilaku perangkat lunak yang diketahui, imbalan blok genesis tidak bisa dibelanjakan.',
          ],
        },
        {
          h: 'Pesan di blok pertama',
          p: [
            'Di dalam coinbase genesis block tertanam teks yang merujuk ke judul berita The Times tertanggal 3 Januari 2009, tentang pemerintah Inggris yang bersiap memberi bantuan dana kedua kepada bank.',
            'Pesan itu sering ditafsirkan sebagai penanda waktu, yaitu bukti bahwa blok tidak dibuat sebelum tanggal itu, sekaligus sebagai kritik terhadap sistem perbankan. Tafsiran motifnya tetap tafsiran, karena penulisnya tidak menjelaskannya secara rinci di sumber yang kita pakai di sini.',
          ],
        },
      ],
      technical: {
        title: 'Isi blok awal',
        p: [
          'Blok genesis punya satu transaksi, yaitu coinbase. Kolom input coinbase tidak merujuk ke output sebelumnya, dan kolom skripnya boleh berisi data bebas. Di situlah teks rujukan berita ditempatkan.',
          'Header blok genesis berisi hash blok sebelumnya yang bernilai nol semua, karena tidak ada blok sebelum itu. Di level berikutnya kita akan membedah isi header secara lengkap.',
        ],
      },
      misconceptions: [
        { salah: 'Genesis block bisa ditambang ulang oleh siapa pun untuk mengubah sejarah.', benar: 'Genesis block adalah data awal yang sudah tertanam di perangkat lunak node. Mengubahnya berarti membuat rantai berbeda yang tidak diakui node lain.' },
      ],
      summary: [
        'Genesis block adalah blok nomor 0, ditambang 3 Januari 2009.',
        'Transaksi coinbase menciptakan koin baru sebagai imbalan penambang.',
        'Pesan di blok pertama merujuk ke judul berita The Times, dan motifnya hanya bisa ditafsirkan.',
      ],
      quiz: [
        { id: 'l1-06-q1', q: 'Kapan genesis block ditambang?', options: ['31 Oktober 2008', '3 Januari 2009', '12 Desember 2010', '1 Januari 2012'], answer: 1, explain: 'Genesis block ditambang pada 3 Januari 2009.' },
        { id: 'l1-06-q2', q: 'Apa fungsi transaksi coinbase di sebuah blok?', options: ['Memindahkan koin dari pengguna ke bursa', 'Menciptakan koin baru sebagai imbalan bagi penambang blok', 'Menyimpan data pengguna', 'Membatalkan transaksi lain'], answer: 1, explain: 'Coinbase tidak mengambil dari pengirim mana pun. Ia menerbitkan imbalan blok untuk penambang.' },
        { id: 'l1-06-q3', q: 'Seseorang mengklaim bahwa pesan berita di blok pertama adalah bukti bahwa blok itu tidak dibuat sebelum 3 Januari 2009. Bagaimana menilai klaim itu dengan hati-hati?', options: ['Pasti benar, itu fakta resmi', 'Itu tafsiran yang masuk akal sebagai penanda waktu, tetapi motif penulis tidak dijelaskan langsung', 'Pasti salah karena blok tidak bisa memuat teks', 'Tidak relevan sama sekali'], answer: 1, explain: 'Teks itu memang bisa berfungsi sebagai penanda waktu, tetapi tafsiran motif tidak dijelaskan di sumber utama.', application: true },
      ],
      labs: [], glossary: ['g-genesis-block', 'g-coinbase', 'g-satoshi-nakamoto'], sources: ['src-whitepaper', 'src-bitcoincore', 'src-masteringbitcoin'],
    },
  ];

  const glossary = [
    { id: 'g-uang', term: 'Uang', aliases: ['money'], definition: 'Alat tukar yang diterima luas, sekaligus satuan hitung harga dan penyimpan nilai.', related: ['g-kepercayaan', 'g-buku-besar'] },
    { id: 'g-kepercayaan', term: 'Kepercayaan', aliases: ['trust'], definition: 'Keyakinan bahwa pihak lain akan menjalankan aturan yang disepakati. Uang modern bertumpu pada kepercayaan pada penerbit dan pada sesama pengguna.', related: ['g-pihak-tepercaya'] },
    { id: 'g-buku-besar', term: 'Buku besar', aliases: ['ledger'], definition: 'Catatan yang menunjukkan siapa memiliki berapa dan transaksi apa yang telah terjadi.', related: ['g-pihak-tepercaya', 'g-double-spending'] },
    { id: 'g-pihak-tepercaya', term: 'Pihak tepercaya', aliases: ['trusted third party'], definition: 'Organisasi yang dipercaya memegang buku besar dan memeriksa transaksi, misalnya bank atau penyedia dompet digital.', related: ['g-buku-besar', 'g-desentralisasi'] },
    { id: 'g-desentralisasi', term: 'Desentralisasi', aliases: ['decentralization', 'terdesentralisasi'], definition: 'Kewenangan dan pemeliharaan sistem dibagi ke banyak peserta, bukan dipegang satu pihak.', related: ['g-pihak-tepercaya'] },
    { id: 'g-double-spending', term: 'Double spending', aliases: ['pemakaian ganda', 'belanja ganda'], definition: 'Upaya memakai nilai yang sama lebih dari sekali. Sistem pembayaran digital harus mencegahnya.', related: ['g-buku-besar'] },
    { id: 'g-bitcoin', term: 'Bitcoin', aliases: ['BTC'], definition: 'Bitcoin dengan huruf besar merujuk ke protokol dan jaringannya. Bitcoin atau BTC dengan huruf kecil merujuk ke satuan nilainya.', related: ['g-whitepaper', 'g-genesis-block'] },
    { id: 'g-whitepaper', term: 'Whitepaper', aliases: ['makalah Bitcoin'], definition: 'Makalah "Bitcoin: A Peer-to-Peer Electronic Cash System" yang terbit 31 Oktober 2008 atas nama Satoshi Nakamoto.', related: ['g-satoshi-nakamoto', 'g-bitcoin'] },
    { id: 'g-satoshi-nakamoto', term: 'Satoshi Nakamoto', aliases: [], definition: 'Nama pena penulis whitepaper Bitcoin. Identitas aslinya tidak diketahui secara pasti.', related: ['g-whitepaper'] },
    { id: 'g-genesis-block', term: 'Genesis block', aliases: ['blok genesis', 'blok 0'], definition: 'Blok pertama di rantai Bitcoin, ditambang 3 Januari 2009 dan tertanam di perangkat lunak node.', related: ['g-coinbase'] },
    { id: 'g-pseudonim', term: 'Pseudonim', aliases: ['pseudonymous'], definition: 'Memakai nama samaran atau alamat, bukan nama asli. Berbeda dari anonim, karena identitas masih bisa terungkap lewat petunjuk lain.', related: ['g-bitcoin'] },
  ];

  D.addLessons(lessons);
  D.addGlossary(glossary);
})(typeof self !== 'undefined' ? self : globalThis);

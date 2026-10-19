/**
 * Every string the page can show (VH-105), from the "Bahasa Malaysia"
 * column of the filled translator's sheet:
 *
 *   reviews/2026-10-18/VH-105-strings-filled.csv
 *
 * Written by `scripts/strings-table.mjs`: change the sheet and regenerate,
 * never this file. Machine translation, with the agent's repairs listed in
 * the sheet's last column, until a native-speaking reviewer signs it off.
 */

import type { Messages } from './index'

export const msMY: Messages = {
  meta: {
    locale: 'ms-MY',
    durationList: 'narrow',
    separators: {
      list: ', ',
      series: '; ',
      sentences: ' ',
    },
  },
  app: {
    title: 'Pembantu Video UoN',
    description:
      'Tambahkan penjenamaan Universiti Nottingham yang diluluskan dan tahap audio yang konsisten pada video dan dapatkan semula fail yang dioptimumkan, tanpa memuat naiknya ke mana-mana sahaja.',
    skipLink: 'Langkau ke kandungan utama',
  },
  language: {
    label: 'Bahasa halaman',
    switched: 'Bahasa halaman: {name}.',
    machine: {
      title: 'Terjemahan mesin',
      text: 'Halaman ini diterjemahkan daripada bahasa Inggeris oleh komputer, jadi beberapa perkataan mungkin tidak tepat.',
      link: 'Cadangkan perkataan yang lebih baik melalui e-mel ke {address}',
    },
  },
  lede: {
    intro: 'Alat ini melakukan perkara berikut pada video anda:',
    promises: [
      'Menambah penjenamaan yang diluluskan.',
      'Memastikan tahap audio yang konsisten.',
      'Mengeluarkan jenis dan saiz fail yang dioptimumkan.',
    ],
    privacy:
      'Video anda diproses pada peranti anda, ia tidak pernah dimuat naik dan fail asal tidak berubah.',
  },
  browserNote: {
    pending:
      'Aplikasi ini direka bentuk dan dibina untuk Chrome, pelayar lain mungkin tidak berfungsi.',
    notPassed:
      'Aplikasi ini direka bentuk dan dibina untuk Chrome, dan pelayar ini belum lulus semua pemeriksaannya. Pemeriksaan sistem di kaki halaman menyatakan apa yang hilang.',
    passed:
      'Aplikasi ini direka bentuk dan dibina untuk Chrome dan pelayar ini telah lulus pemeriksaan untuknya.',
  },
  videoKind: {
    label: 'Jenis video',
    options: {
      staff: 'Video staf',
      submission: 'Serahan pelajar',
    },
    result: {
      staff: 'Anda memilih penutup, dan sama ada ia memaparkan “{words}”.',
      submission: 'Jika video mempunyai penutup, penutup itu memaparkan “{words}”.',
    },
  },
  videoLanguage: {
    label: 'Bahasa video',
    helper:
      'Perkataan yang ditambah oleh aplikasi pada video anda adalah dalam bahasa ini. Apa yang anda taip dikekalkan seperti yang ditaip.',
  },
  steps: {
    choose: 'Pilih video',
    trim: 'Potong',
    titleCard: 'Kad tajuk',
    closing: 'Penjenamaan penutup',
    preset: 'Saiz/kualiti fail',
    create: 'Cipta',
  },
  choose: {
    dropHint: 'Atau letakkannya di sini.',
    dropHeld: 'Lepaskan untuk membaca video ini.',
    reading: 'Membaca video itu…',
    drop: {
      making:
        'Video sedang dibuat. Batalkannya atau tunggu sehingga selesai sebelum memilih yang lain.',
      saving:
        'Video sedang disimpan. Hentikan penyimpanan atau tunggu sehingga ia selesai sebelum memilih yang lain.',
      starting: 'Alat ini masih dalam proses penyediaan. Lepaskan semula video itu sebentar lagi.',
      unavailable:
        'Pelayar ini tidak dapat menjalankan alat ini, jadi tiada video yang boleh dibaca di sini. Mesej di bawah menyatakan apa yang perlu dilakukan.',
      nothing: 'Tiada apa-apa yang dilepaskan yang boleh dibaca. Lepaskan fail video.',
      several: 'Itu adalah {count} fail. Lepaskan satu video pada satu masa.',
      notVideo:
        'Itu bukan fail video. Lepaskan video — fail yang namanya berakhir dengan .mp4 atau .mov, contohnya — atau pilih satu di atas.',
    },
  },
  source: {
    readSummary: 'Video dibaca. {facts}.',
    variableFrameRate: 'kadar bingkai boleh ubah',
    noSound: 'tiada bunyi',
    properties: 'Ciri-ciri video',
    lossesTitle: 'Tidak dibawa ke dalam fail baharu',
    rows: {
      duration: 'Tempoh',
      videoFormat: 'Format video',
      fileSize: 'Saiz fail',
      resolution: 'Resolusi',
      frameRate: 'Kadar bingkai',
      soundFormat: 'Format bunyi',
      soundChannels: 'Saluran bunyi',
      sampleRate: 'Kadar sampel bunyi',
      sound: 'Bunyi',
      captions: 'Kapsyen',
      fileType: 'Jenis fail',
    },
    cannotDecodeVideo: 'Pelayar ini tidak dapat membaca format video ini.',
    cannotDecodeAudio: 'Pelayar ini tidak dapat membaca format audio ini.',
    rotated: 'Diputar {degrees}°. Output akan tegak.',
    variesOnAverage: '{rate} secara purata, tetapi ia berbeza-beza',
    variesNote:
      'Rakaman daripada Teams, Zoom dan tangkapan skrin selalunya berbeza-beza. Output akan menggunakan kadar bingkai yang stabil, yang memastikan bunyi dan gambar kekal segerak.',
    outputRate: 'Output akan berjalan pada {rate}, jadi beberapa bingkai akan diulang.',
    sampleRate: '{kilohertz} kHz — {hertz} mengambil sampel sesaat',
    noSoundTrack: 'Tiada trek bunyi ditemui',
    noSoundNote: 'Perataan memerlukan bunyi. Kerja selebihnya masih berjalan.',
    captionsUnchecked: 'Tidak dapat disemak dalam fail jenis ini',
    captionsFound: 'Dijumpai {found}',
    captionsNone: 'Tiada yang ditemui dalam fail ini',
    captionTracks: {
      one: '{count} trek kapsyen',
      other: '{count} trek kapsyen',
    },
    chapterTracks: {
      one: '{count} trek bab',
      other: '{count} trek bab',
    },
    moreVideoTracks: {
      one: '{count} lagi trek video',
      other: '{count} lagi trek video',
    },
    moreSoundTracks: {
      one: '{count} lagi trek bunyi',
      other: '{count} lagi trek bunyi',
    },
    losses: {
      extraTracksTitle: 'Fail ini mempunyai {found}',
      extraTracksDetail:
        'Fail baharu menyimpan satu gambar dan satu trek bunyi — yang disenaraikan di bawah Ciri-ciri video. Trek lain tidak akan dibawa, dan salah satunya mungkin menyimpan alternatif, seperti bahasa lain atau perihalan audio. Jika anda memerlukannya, simpan fail asal bersama.',
      uncheckedTitle: 'Trek kapsyen dan bab tidak dapat disemak',
      uncheckedDetail:
        'Fail jenis ini tidak boleh disemak untuknya. Jika fail anda mempunyainya, ia tidak akan dibawa ke mana-mana.',
      captionsConsequence:
        'Fail baharu tidak akan mempunyai trek kapsyen, jadi di mana sahaja anda menerbitkannya, ia mesti memberikan kapsyen. EchoVideo membuatnya sendiri selepas muat naik — semaknya. Fail yang dihantar terus memerlukan kapsyen yang ditambahkan oleh anda. Kapsyen yang dilukis ke dalam gambar kekal.',
      chaptersConsequence: 'Bab-bab tersebut tidak akan berada dalam fail baharu.',
      keepOriginals: 'Jika anda memerlukan fail asal, simpan fail ini bersama-sama.',
    },
  },
  trim: {
    intro:
      'Pilihan. Potong bahan yang tidak diingini dari awal atau akhir. Dibiarkan sahaja, keseluruhan video akan disimpan. Pratonton memainkan video asal anda seperti sekarang: bunyi diratakan dan penutup ditambah apabila video dibuat.',
    noPreview: 'Pratonton tidak tersedia untuk fail ini. Anda masih boleh menetapkan masa.',
    start: 'Mula',
    end: 'Tamat',
    startTime: 'Masa mula',
    endTime: 'Masa tamat',
    setStart: 'Tetapkan permulaan di sini',
    setEnd: 'Tetapkan hujung di sini',
    format: 'Minit dan saat, seperti 1:05.5, atau saat, seperti 65.5.',
    useWhole: 'Gunakan keseluruhan video',
    reading: 'Membaca video itu…',
    unreadable: 'Tiada video untuk dipotong: fail itu tidak dapat dibaca.',
    tooShort: 'Ia lebih pendek daripada {seconds} saat, jadi ia tidak boleh dipangkas.',
    keepingWhole: 'Menyimpan keseluruhan video, {duration}.',
    keeping: 'Menyimpan {kept} daripada {duration}.',
    handleBeginning: 'permulaan',
    handleEnd: 'penghujungnya',
    problem: {
      notATime: {
        start:
          'Tulis masa mula sebagai minit dan saat, seperti 1:05.5, atau sebagai saat, seperti 65.5.',
        end: 'Tulis masa tamat sebagai minit dan saat, seperti 1:05.5, atau sebagai saat, seperti 65.5.',
      },
      afterEnd: {
        start: 'Masa mula adalah selepas tamat video, yang mana panjangnya {length}.',
        end: 'Waktu tamat adalah selepas tamatnya video, yang sepanjang {length}.',
      },
      notTimes: 'Permulaan atau pengakhiran video bukanlah masa.',
      startAfterEnd: 'Permulaannya adalah selepas tamatnya video.',
      endBeforeStart: 'Pengakhiran mesti datang selepas permulaan.',
      keepAtLeast: 'Simpan sekurang-kurangnya {seconds} saat video tersebut.',
    },
    correctToContinue:
      'Letakkan masa mula dan tamat dengan betul dalam langkah 2 untuk meneruskan.',
  },
  titleCard: {
    legend: 'Kad tajuk',
    intro:
      'Kad yang dipaparkan selama {seconds} saat sebelum video anda bermula, dalam teks putih di atas biru.',
    add: 'Tambah kad tajuk',
    title: 'Tajuk',
    department: 'Jabatan',
    authors: 'Pengarang',
    date: 'Tarikh',
    dateHelper:
      'Diisi dengan tarikh hari ini dalam bahasa video. Anda boleh menukar atau mengosongkannya.',
    forSubmission: 'Tidak digunakan untuk serahan pelajar.',
    full: 'Medan ini sudah penuh, jadi selebihnya tidak ditambah.',
    refused: {
      field: 'Ini terlalu panjang untuk dimuatkan pada kad. Pendekkannya.',
      card: 'Bersama-sama, medan ini terlalu panjang untuk dimuatkan pada kad. Pendekkan medan ini atau medan lain.',
    },
    empty: 'Isi sekurang-kurangnya satu daripada empat medan, atau nyahtanda Tambah kad tajuk.',
    correctToContinue: 'Betulkan kad tajuk dalam langkah 3 untuk meneruskan.',
  },
  closing: {
    legend: 'Penjenamaan penutup',
    typeLabel: 'Jenis animasi',
    types: {
      cut: 'Potong',
      fade: 'Pudar',
      slide: 'Luncur',
      none: 'Tiada',
    },
    onsetLabel: 'Permulaan animasi',
    onsets: {
      existing: 'Di atas yang sedia ada',
      freeze: 'Di atas bingkai pembekuan yang dijana',
    },
    helpLabel: 'Perihal permulaan animasi',
    helpExistingTerm: 'Di atas yang sedia ada',
    helpExistingText:
      '— bahagian penutup dimainkan pada saat terakhir video anda. Ia menutupi saat itu semasa ia terbentuk.',
    helpFreezeTerm: 'Di atas bingkai pembekuan yang dijana',
    helpFreezeText:
      '— bingkai terakhir anda ditahan selama satu saat tambahan. Penutup dimainkan di atasnya, jadi tiada apa-apa dalam video anda diliputi.',
    colourLabel: 'Warna',
    colours: {
      blue: 'Biru',
      white: 'Putih',
    },
    internalLabel: 'Untuk kegunaan dalaman sahaja',
    internalWords: 'Untuk kegunaan dalaman sahaja',
    notUsedWith: {
      cut: 'Tidak digunakan dengan Potong.',
      none: 'Tidak digunakan dengan Tiada.',
    },
    internalForSubmission: 'Sentiasa dihidupkan untuk serahan pelajar.',
    result: {
      none: 'Tiada penutup Universiti akan ditambah.',
      adds: {
        one: 'Menambah {count} saat.',
        other: 'Menambah {count} saat.',
      },
      internal: 'Kad itu memaparkan “{words}” di bawah logo.',
      cut: {
        blue: 'Video anda dipotong ke kad penutup biru. {adds}',
        white: 'Video anda dipotong ke kad penutup putih. {adds}',
      },
      overFreeze: {
        blue: {
          fade: 'Bingkai terakhir anda ditahan sementara penutupan biru pudar masuk, jadi tiada apa yang ditutup. {adds}',
          slide:
            'Bingkai terakhir anda dipegang semasa penutup biru meluncur masuk, jadi tiada apa yang ditutup. {adds}',
        },
        white: {
          fade: 'Bingkai terakhir anda dipegang sementara penutup putih pudar masuk, jadi tiada apa yang ditutupi. {adds}',
          slide:
            'Bingkai terakhir anda dipegang semasa penutup putih meluncur masuk, jadi tiada apa yang ditutup. {adds}',
        },
      },
      overPicture: {
        blue: {
          fade: 'Penutup biru pudar masuk pada saat terakhir video anda, menutupinya semasa ia terbentuk. {adds}',
          slide:
            'Penutup biru meluncur masuk pada saat terakhir video anda, menutupinya semasa ia terbentuk. {adds}',
        },
        white: {
          fade: 'Penutupan putih pudar masuk pada saat terakhir video anda, menutupinya semasa ia terbentuk. {adds}',
          slide:
            'Penutup putih meluncur masuk pada saat terakhir video anda, menutupinya semasa ia terbentuk. {adds}',
        },
      },
    },
  },
  preset: {
    legend: 'Saiz/kualiti fail',
    labels: {
      best: 'Lebih besar / lebih baik',
      smaller: 'Lebih kecil / dikurangkan',
    },
    details: {
      best: 'Untuk EchoVideo atau YouTube dll.',
      smaller: 'Untuk pesanan atau emel dan sebagainya.',
    },
  },
  create: {
    note: 'Video yang telah siap kekal di sini sehingga anda menyimpannya atau menutup tab ini.',
    announceProgress: 'Umumkan kemajuan',
    announceHelp:
      'Menyebutkan setiap peringkat dengan kuat untuk pembaca skrin semasa video dibuat. Keputusan sentiasa diumumkan.',
    progressLabel: 'Mencipta video anda',
    create: 'Cipta video itu',
    cancel: 'Batal',
    continueAnyway: 'Teruskan juga',
    stopCheck: 'Hentikan pemeriksaan',
    checkAgain: 'Semak semula',
    stopSaving: 'Berhenti menyimpan',
    save: 'Simpan video itu',
    saved: 'Disimpan',
    discard: 'Buang dan mulakan semula',
    keep: 'Kekalkannya',
    lockedMaking: 'Dikunci semasa video anda sedang dibuat.',
    lockedSaving: 'Dikunci semasa video anda disimpan.',
  },
  status: {
    checking: 'Menyemak video ini pada peranti anda…',
    checkStopped: 'Semakan dihentikan.',
    stoppingSave: 'Menghentikan penyimpanan…',
    cancelling: 'Membatalkan…',
    cancelled: 'Dibatalkan. Tiada apa yang disimpan dan fail asal anda tidak berubah.',
    saving: 'Menyimpan…',
    saveStopped: 'Penyimpanan dihentikan. Video masih ada di sini apabila anda mahukannya.',
    notSaved: 'Tidak disimpan. Video itu masih ada di sini apabila anda mahukannya.',
    refusedSource:
      'Itulah fail yang anda gunakan untuk bermula. Pilih nama atau folder yang berbeza — alat ini tidak akan mengubah fail asal anda.',
    saved:
      'Disimpan. Semaknya di tempat anda menyimpannya, kemudian muat naik ke tempat yang dituju — atau pilih video lain dalam langkah 1.',
    saveFailed: 'Video itu tidak dapat disimpan. Ia masih di sini untuk dicuba lagi.',
    storageWayOut:
      'Kurangkan video, pilih {smaller} atau kosongkan sedikit ruang, kemudian tekan Semak semula.',
    creating: 'Mencipta video anda. {notice}',
    ready: 'Video anda sudah siap.',
    couldNotCreate: 'Video itu tidak dapat dihasilkan. {sentence}',
    verdictSpoken: 'Pemeriksaan peranti selesai. {heading}.',
  },
  discard: {
    title: 'Video ini belum disimpan lagi',
    delivered:
      'Muat turun anda mungkin masih dalam proses selesai. Memulakan semula akan membuang video yang baru anda buat.',
    unsaved: 'Anda belum menyimpan video yang baru anda buat. Memulakan semula akan membuangnya.',
    spoken: 'Video ini belum disimpan lagi. {question}',
  },
  result: {
    finished: 'Video siap — {size}',
    previous: 'Video sebelumnya — {size}',
    lifetime: 'Ia kekal di sini hanya sehingga anda menyimpannya atau menutup tab ini.',
    lifetimeDelivered: 'Ia kekal di sini sehingga anda memulakan video lain atau menutup tab ini.',
    keptWhole: 'keseluruhan video ({duration})',
    keptPart: '{kept} daripada {duration}, dari {from} hingga {to}',
    closingNone: 'tiada penutup Universiti',
    closingInternal: '{closing}, bertanda “{words}”',
    closingCut: {
      blue: 'potongan kepada kad penutup biru',
      white: 'potongan pada kad penutup putih',
    },
    closingOverFreeze: {
      blue: {
        fade: 'penutupan biru pudar masuk di atas bingkai terakhir yang ditahan',
        slide: 'penutupan biru meluncur masuk ke atas bingkai terakhir yang dipegang',
      },
      white: {
        fade: 'penutupan putih yang pudar masuk di atas bingkai terakhir yang dipegang',
        slide: 'penutup putih meluncur masuk ke atas bingkai terakhir yang dipegang',
      },
    },
    closingOverPicture: {
      blue: {
        fade: 'penutup biru pudar masuk di atas gambar',
        slide: 'penutup biru meluncur masuk ke atas gambar',
      },
      white: {
        fade: 'penutup putih pudar masuk di atas gambar',
        slide: 'penutup putih meluncur masuk ke atas gambar',
      },
    },
    summary: 'Dibuat daripada {name}: {part}, {output}, {closing}.',
    summaryWithCard:
      'Dibuat daripada {name}: kad tajuk {seconds} saat, kemudian {part}, {output}, {closing}.',
    notLoaded:
      'Penutupan tidak dapat dimuatkan, jadi ia tiada dalam video ini. Semua yang lain telah digunakan seperti yang diminta.',
    fellBackToCut: {
      blue: {
        fade: 'Anda memilih Pudar, tetapi animasi tidak dapat dimuatkan, jadi video ini dipotong ke kad penutup biru.',
        slide:
          'Anda memilih Luncur, tetapi animasi tidak dapat dimuatkan, jadi video ini dipotong ke kad penutup biru.',
      },
      white: {
        fade: 'Anda memilih Pudar, tetapi animasi tidak dapat dimuatkan, jadi video ini dipotong ke kad penutup putih.',
        slide:
          'Anda memilih Luncur, tetapi animasi tidak dapat dimuatkan, jadi video ini dipotong ke kad penutup putih.',
      },
    },
    fellBackToFreeze: {
      blue: {
        fade: 'Video anda lebih pendek daripada animasi pudar. Penutupan biru pudar masuk di atas bingkai terakhir yang ditahan dan bukannya di atas gambar.',
        slide:
          'Video anda lebih pendek daripada animasi luncur. Penutup biru meluncur masuk ke atas bingkai terakhir yang ditahan dan bukannya ke atas gambar.',
      },
      white: {
        fade: 'Video anda lebih pendek daripada animasi pudar. Penutupan putih pudar masuk di atas bingkai terakhir yang ditahan dan bukannya di atas gambar.',
        slide:
          'Video anda lebih pendek daripada animasi luncur. Penutupan putih meluncur masuk ke atas bingkai terakhir yang ditahan dan bukannya ke atas gambar.',
      },
    },
    fellBackToPicture: {
      blue: {
        fade: 'Penutupan biru pudar masuk di atas gambar, bukan di atas bingkai terakhir yang ditahan seperti yang dipilih.',
        slide:
          'Penutup biru meluncur masuk ke atas gambar, bukan ke atas bingkai terakhir yang ditahan seperti yang dipilih.',
      },
      white: {
        fade: 'Penutupan putih pudar masuk di atas gambar, bukan di atas bingkai terakhir yang dipegang seperti yang dipilih.',
        slide:
          'Penutup putih meluncur masuk ke atas gambar, bukan ke atas bingkai terakhir yang dipegang seperti yang dipilih.',
      },
    },
  },
  progress: {
    stages: {
      preparing: 'Bersedia',
      analysing: 'Menganalisis audio',
      encoding: 'Pengekodan video',
      finishing: 'Menyelesaikan fail',
      checking: 'Memeriksa fail',
    },
    milestones: ['suku selesai', 'separuh siap', 'tiga suku selesai'],
    stagePercent: '{stage} — {percent}',
    stageMilestone: '{stage} — {milestone}',
    ready: 'Sedia',
    title: {
      stage: '{stage} — {app}',
      ready: 'Sedia — {app}',
      failed: 'Tidak dibuat — {app}',
      cancelled: 'Dibatalkan — {app}',
    },
    jobNotice:
      'Pastikan tab ini kelihatan dan komputer anda terjaga semasa video dibuat. Menutup tab akan menamatkan kerja.',
  },
  preflight: {
    headings: {
      proceed: 'Sedia untuk bermula',
      warn: 'Bersedia, dengan satu perkara yang perlu diketahui',
      warnSeveral: {
        '2': 'Bersedia, dengan dua perkara yang perlu diketahui',
        '3': 'Bersedia, dengan tiga perkara yang perlu diketahui',
        '4': 'Bersedia, dengan empat perkara yang perlu diketahui',
        '5': 'Bersedia, dengan lima perkara yang perlu diketahui',
        '6': 'Bersedia, dengan enam perkara yang perlu diketahui',
        other: 'Bersedia, dengan {count} perkara yang perlu diketahui',
      },
      discourage: 'Ini akan berkesan, tetapi ia akan menjadi perlahan',
      mobile: 'Ini mungkin tidak selesai pada telefon atau tablet',
      block: 'Ini tidak boleh dijalankan di sini',
    },
    tryChrome:
      'Chrome pada komputer ialah pelayar yang digunakan untuk alat ini — cubalah di sana.',
    chromeLacks:
      'Salinan Chrome ini mungkin sudah lapuk atau tetapan pada komputer ini mungkin telah mematikan ciri ini. Kemas kini Chrome atau tanya sesiapa yang mengurus komputer tersebut.',
    reasons: {
      noWebCodecs: 'Pelayar ini tidak dapat memproses video. {remedy}',
      noAacEncodeHere: 'Pelayar ini tidak boleh menambah bunyi pada fail video. {remedy}',
      noAacEncodeElsewhere:
        'Pelayar ini tidak boleh menambah bunyi pada fail video. {remedy} Firefox boleh memainkan video tetapi tidak boleh mencipta bunyi yang diperlukan.',
      noH264Encode:
        'Pelayar ini tidak dapat mencipta format video yang diperlukan oleh alat ini. {remedy}',
      noSourceDecodeHere:
        'Pelayar ini tidak dapat membaca gambar atau bunyi di dalam fail ini. Ia mungkin disimpan dalam format yang dibuat untuk perisian penyuntingan. Eksportnya sekali lagi sebagai MP4 — fail yang namanya berakhir dengan .mp4 — dan pilih fail tersebut.',
      noSourceDecodeElsewhere:
        'Pelayar ini tidak dapat membaca gambar atau bunyi di dalam fail ini. {remedy} Jika ia juga tidak dapat dibuka di sana, fail itu mungkin disimpan dalam format yang dibuat untuk perisian penyuntingan. Eksportnya semula sebagai MP4 — fail yang namanya berakhir dengan .mp4.',
      noOpfsHere:
        'Pelayar ini tidak akan memberikan alat ini ruang kerja yang diperlukan untuk membina video anda. Jika anda melayari secara peribadi, tetingkap biasa biasanya berfungsi; jika tidak, tetapan pada komputer ini mungkin menyekat storan tapak — tanya sesiapa yang mengurusnya.',
      noOpfsElsewhere:
        'Pelayar ini tidak akan memberikan alat ini ruang kerja yang diperlukan untuk membina video anda. {remedy} Jika anda melayari secara peribadi, tetingkap biasa biasanya berfungsi.',
      insecureContext:
        'Halaman ini memerlukan sambungan yang selamat sebelum ia boleh berfungsi dengan video anda. Bukanya di alamat https:// atau di localhost jika anda menjalankannya sendiri.',
      insufficientStorageResolvable:
        'Ruang kosong pada peranti ini tidak mencukupi. Kerja ini memerlukan kira-kira {size} ruang kerja. Kosongkan sedikit ruang dan cuba lagi, kurangkan video atau pilih {smaller}.',
      insufficientStorage:
        'Ruang kosong pada peranti ini tidak mencukupi. Kerja ini memerlukan kira-kira {size} ruang kerja. Kosongkan sedikit ruang dan cuba lagi.',
      storageUnknown:
        'Pelayar ini tidak akan menyatakan berapa banyak ruang kosong yang ada. Jika ia kehabisan ruang separuh jalan, kerja akan berhenti dan tiada apa yang disimpan — fail asal anda tidak terjejas.',
      veryLongJob:
        'Ini akan mengambil masa kira-kira {time}. Anda boleh teruskan, tetapi komputer desktop akan jauh lebih pantas.',
      veryLongJobUnknown:
        'Ini akan mengambil masa yang agak lama. Anda boleh teruskan, tetapi komputer desktop akan jauh lebih pantas.',
      longJob:
        'Ini akan mengambil masa kira-kira {time}. Pastikan tab ini terbuka semasa ia berjalan — menutupnya akan menghentikan kerja.',
      longJobUnknown:
        'Ini akan mengambil masa yang agak lama. Pastikan tab ini terbuka semasa ia berjalan — menutupnya akan menghentikan kerja.',
      mobileDevice:
        'Telefon dan tablet jauh lebih perlahan dalam hal ini berbanding komputer, dan pelayar di sana mungkin menamatkan kerja separuh jalan untuk mengosongkan memori. Gunakan komputer jika boleh.',
      estimateUnavailable:
        'Kami tidak dapat menentukan berapa lama masa yang akan diambil untuk peranti ini. Anda masih boleh meneruskan.',
    },
    shouldTake: 'Ini sepatutnya mengambil masa kira-kira {time}.',
    shouldTakeFewSeconds: 'Ini sepatutnya mengambil masa beberapa saat.',
    sizeUpTo: 'Anggaran saiz sehingga {size}.',
    sameSize:
      'Video anda telah dimampatkan setakat tetapan ini, jadi fail baharu akan mempunyai saiz yang lebih kurang sama.',
    slides:
      'Ini kelihatan seperti slaid atau rakaman skrin, jadi fail tersebut dibuat lebih kecil. Jika kebanyakannya rakaman kamera, pilih {best} sebagai gantinya.',
  },
  warnings: {
    soundHeading: 'Perlu diketahui tentang bunyinya',
    finishedHeading: 'Perlu diketahui tentang video yang telah siap',
    reassurance:
      'Tiada satu pun daripada ini yang menghalang anda daripada meneruskan. Fail asal anda tidak diubah dalam apa jua cara.',
    spoken: '{heading}: {titles}.',
    noAudio: {
      heading: 'Video ini tiada bunyi',
      detail:
        'Tiada bunyi untuk diratakan, jadi kerja selebihnya berjalan tanpanya. Jika anda menjangkakan bunyi, semak rakaman sebelum menerbitkan.',
    },
    clipping: {
      heading: 'Bunyi mungkin terherot di beberapa tempat',
      detail:
        'Rakaman sering mencapai tahap maksimumnya, jadi sebahagian daripadanya mungkin terpotong. Ini biasanya bermakna mikrofon ditetapkan terlalu tinggi. Perataan masih berjalan, tetapi herotan yang sedia ada dalam rakaman tidak dapat dialih keluar.',
    },
    veryQuiet: {
      heading: 'Rakaman ini sangat senyap',
      detail:
        'Ia jauh di bawah tahap pendengaran yang selesa. Meratakan akan meningkatkannya — tetapi meningkatkan pertuturan yang perlahan juga akan meningkatkan apa sahaja yang ada di dalam bilik.',
    },
    highlyVariable: {
      heading: 'Kelantangannya banyak berbeza',
      detail:
        'Bahagian yang paling kuat dan paling senyap berada berjauhan. Perataan membetulkan hanyutan perlahan secara beransur-ansur, terlalu perlahan untuk didengar, tetapi perbezaan mendadak antara ayat akan kekal.',
    },
    noisy: {
      heading: 'Mungkin terdapat bunyi latar belakang',
      detail:
        'Walaupun saat-saat paling sunyi, bunyi tetap ada — kipas, penghawa dingin atau bilik yang bising. Alat ini tidak dapat menghilangkan bunyi bising, dan menjadikan pertuturan lebih kuat akan menjadikan latar belakang lebih kuat bersamanya.',
    },
    extendedSilence: {
      heading: 'Terdapat tempoh senyap yang panjang',
      detail:
        'Lebih kurang {duration} hampir senyap dalam satu tempoh berterusan. Jika itu disengajakan, tiada apa yang salah. Jika tidak, adalah wajar untuk menyemak rakaman sebelum anda menerbitkannya.',
    },
    targetMissed: {
      heading: 'Bunyi yang telah siap tidak berada pada tahap biasa',
      detail:
        'Video ini bagus untuk digunakan; cuma ia mungkin kedengaran sedikit lebih senyap atau lebih kuat daripada video lain yang diratakan dengan alat ini.',
    },
    metadataLost: {
      heading: 'Tajuk dan tarikh fail tidak dapat disalin',
      detail:
        'Gambar dan bunyi tidak terjejas. Jika fail asal anda mempunyai tajuk, pengarang atau tarikh, fail baharu tidak akan mempunyainya — anda masih boleh menambahkannya di mana sahaja anda memuat naiknya.',
    },
  },
  announce: {
    lossesCount: {
      '1': 'Satu perkara yang perlu diketahui tentang apa yang masuk ke dalam fail baharu.',
      '2': 'Dua perkara yang perlu diketahui tentang apa yang dimasukkan ke dalam fail baharu.',
      '3': 'Tiga perkara yang perlu diketahui tentang apa yang dimasukkan ke dalam fail baharu.',
      '4': 'Empat perkara yang perlu diketahui tentang apa yang dimasukkan ke dalam fail baharu.',
      other:
        '{count} perkara yang perlu diketahui tentang apa yang dimasukkan ke dalam fail baharu.',
    },
    lossSaid: '{title}. {detail}',
  },
  failure: {
    originalUnchanged: 'Fail asal anda tidak diubah.',
    unreadable: {
      what: 'Fail ini tidak dapat dibaca sebagai video.',
      notAVideo:
        'Fail ini tidak dapat dibaca sebagai video. Ia perlu fail video — yang namanya berakhir dengan .mp4, .mov, .mkv atau .webm — dan ia mungkin rosak.',
      soundOnly:
        'Fail ini mempunyai bunyi tetapi tiada video. Alat ini menambah penjenamaan pada video, jadi ia memerlukan fail dengan gambar.',
      noTracks:
        'Tiada video atau bunyi ditemui dalam fail ini. Ia mungkin tidak lengkap atau mungkin telah disimpan secara salah.',
      readError:
        'Sesuatu tidak kena semasa membaca fail ini. Ia mungkin rosak atau dalam format yang tidak dapat dibaca oleh alat ini.',
      tookTooLong:
        'Membaca fail ini mengambil masa lebih lama daripada yang dijangkakan, atau alat tersebut menghadapi masalah.',
      next: 'Pilih fail lain atau simpan fail ini sekali lagi daripada aplikasi yang membuatnya, sebagai fail yang namanya berakhir dengan .mp4.',
    },
    badTrim: {
      what: 'Waktu mula dan tamat tidak dapat digunakan.',
      next: 'Letakkan masa mula dan tamat dengan betul dalam langkah 2 dan cuba lagi.',
    },
    unlevellable: {
      what: 'Bunyi rakaman ini tidak dapat dibawa ke tahap biasa, jadi video itu tidak dibuat.',
      next: 'Laporkannya dengan butang Hantar maklum balas — butiran yang ditambahkannya akan membantu.',
    },
    outputLoudness: {
      what: 'Bunyi yang telah siap tidak keluar pada tahap biasa, jadi video itu tidak dapat disimpan.',
    },
    outputPeak: {
      what: 'Bunyi yang telah siap kedengaran lebih kuat pada kemuncaknya daripada yang dibenarkan, jadi video itu tidak disimpan.',
    },
    outputUnreadable: {
      what: 'Video yang telah siap tidak dapat dibaca semula, jadi ia tidak disimpan.',
    },
    outOfSpace: {
      what: 'Peranti ini kehabisan ruang kerja di pertengahan jalan.',
      next: 'Kosongkan sedikit ruang atau pilih {smaller} dan cuba lagi.',
    },
    encoderRefused: {
      what: 'Pelayar ini berhenti mengekod video di pertengahan jalan.',
      next: 'Cuba output lain di bawah Saiz/kualiti fail. Jika ia berlaku lagi, laporkannya dengan butang Hantar maklum balas — butiran yang ditambahkan akan membantu.',
    },
    checkFailed: {
      what: 'Pemeriksaan peranti tidak selesai.',
      next: 'Tekan Semak semula untuk menjalankannya sekali lagi. Jika gagal lagi, laporkannya dengan butang Hantar maklum balas.',
    },
    timedOut: {
      what: 'Kerja itu berhenti melaporkan kemajuan, jadi ia dihentikan.',
    },
    titleCardRefused: {
      what: 'Perkataan kad tajuk tidak muat pada video, jadi video tidak dibuat.',
      next: 'Pendekkan medan kad tajuk dalam langkah 3 dan cuba lagi.',
    },
    unknown: {
      what: 'Ada masalah yang berlaku semasa membuat video.',
    },
    tryAgain:
      'Cuba lagi. Jika ia berlaku lagi, laporkannya dengan butang Hantar maklum balas — butiran yang ditambahkan akan membantu.',
    startup: {
      insecure:
        'Halaman ini memerlukan sambungan yang selamat sebelum ia boleh berfungsi dengan video anda. Bukanya di alamat yang bermula dengan https://.',
      noWebCodecs:
        'Pelayar ini tidak dapat memproses video, jadi alat ini tidak dapat dijalankan di sini. {remedy}',
      noH264:
        'Pelayar ini tidak dapat mencipta format video yang diperlukan oleh alat ini, jadi alat ini tidak dapat dijalankan di sini. {remedy}',
      noWorkingStore:
        'Pelayar ini tidak memberikan ruang kerja kepada alat ini untuk membina video. Jika anda melayari secara peribadi, tetingkap biasa biasanya berfungsi. {remedy}',
      workerNotStarted:
        'Bahagian alat yang melakukan kerja tidak bermula. Muat semula halaman. Jika ia berlaku lagi, laporkannya dengan butang Hantar maklum balas.',
    },
    captured:
      'Sesuatu yang tidak kena telah berlaku dalam alat ini. Video yang sedang dibuat mungkin tidak siap; fail asal anda tidak terjejas. Laporkannya dengan butang Hantar maklum balas, yang akan menambah butiran ini.',
  },
  systemCheck: {
    summary: 'Pemeriksaan sistem — {result}',
    results: {
      problems: {
        one: '{count} masalah',
        other: '{count} masalah',
      },
      warnings: {
        one: '{count} amaran',
        other: '{count} amaran',
      },
      checking: 'menyemak',
      allPassed: 'semua lulus',
    },
    marks: {
      pass: 'OK',
      fail: 'Tidak',
      warn: '!',
      pending: '…',
    },
    rows: {
      secure: 'Sambungan selamat (diperlukan untuk akses storan)',
      webcodecs: 'Pemprosesan video dalam pelayar (WebCodecs)',
      h264: 'Format video yang dibuat oleh alat ini (H.264)',
      aac: 'Format bunyi yang dihasilkan oleh alat (AAC)',
      opfs: 'Storan kerja persendirian',
      worker: 'Pemprosesan latar belakang',
    },
    values: {
      checking: 'Memeriksa',
      available: 'Tersedia',
      notAvailable: 'Tidak tersedia',
      supported: 'Disokong',
      notSupported: 'Tidak disokong',
      aacNotSupported: 'Tidak disokong — video dengan bunyi tidak boleh dibuat di sini',
      failedToStart: 'Gagal bermula',
      readyIn: 'Bersedia dalam {time}',
      noResponse: 'Tiada respons',
    },
  },
  errors: {
    heading: 'Ralat ditangkap',
    technicalDetails: 'Butiran teknikal',
    report: 'Laporkan masalah ini',
  },
  feedback: {
    open: 'Hantar maklum balas',
    heading: 'Hantar maklum balas',
    intro:
      'Mesej anda dihantar ke {address} daripada aplikasi e-mel anda sendiri. Anda akan melihat e-mel tersebut sebelum ia dihantar.',
    messageLabel: 'Mesej anda',
    writeFirst: 'Tulis mesej dulu.',
    whatSent: 'Apa yang akan dihantar bersamanya',
    whatSentDetail:
      'Butiran yang membantu mencari masalah: versi aplikasi, pelayar anda, sejauh mana anda telah berjaya, dan panjang video anda, saiz dan format gambar. Butiran ini tidak pernah merangkumi video, namanya atau apa-apa sahaja di dalamnya.',
    openEmail: 'Buka aplikasi e-mel',
    copy: 'Salin mesej dan butiran',
    close: 'Tutup',
    tooLong:
      'Mesej anda terlalu panjang untuk dihantar ke aplikasi e-mel anda sekaligus. Pilih "Salin mesej dan butiran" dan tampalkannya ke dalam e-mel ke {address}.',
    opened:
      'Aplikasi e-mel anda sepatutnya telah dibuka dengan mesej anda sedia untuk dihantar. Jika tidak, pilih "Salin mesej dan butiran" dan tampalkannya ke dalam e-mel ke {address}.',
    someOmitted: 'Beberapa butiran tidak muat dalam e-mel; salinannya mengandungi semuanya.',
    copied: 'Disalin. Tampalkannya ke dalam e-mel ke {address}.',
    couldNotCopy:
      'Tidak dapat menyalin. Buka "Apa yang akan dihantar bersamanya", pilih butirannya dan salin butiran tersebut bersama mesej anda.',
    onlyInCopy: 'Terlalu panjang untuk e-mel ini, jadi hanya dalam "Salin mesej dan butiran":',
  },
  statement: {
    heading: 'Kenyataan kebolehcapaian',
    covers:
      'Kenyataan ini meliputi Pembantu Video UoN, iaitu halaman yang sedang anda gunakan. Halaman ini dikendalikan oleh Joe Bell di Universiti Nottingham.',
    aim: 'Kami mahu seramai mungkin orang dapat menggunakan alat ini. Anda sepatutnya dapat:',
    abilities: [
      'menggunakannya dengan papan kekunci sahaja',
      'menggunakannya dengan pembaca skrin, yang membacakan setiap peringkat dan keputusan',
      'membesarkan paparan hingga 200% tanpa teks terkeluar dari skrin',
      'menggunakan warna pilihan anda sendiri, dan mod kontras tinggi komputer anda',
      'mematikan pergerakan pada halaman melalui tetapan komputer anda',
    ],
    plain: 'Bahasanya mudah, dan teks mempunyai kontras yang tinggi dengan latar belakangnya.',
    limits: {
      heading: 'Tahap kebolehcapaian alat ini',
      intro: 'Kami sedar bahawa sesetengah bahagian belum boleh diakses sepenuhnya:',
      items: [
        'Alat ini dibina untuk Google Chrome pada komputer. Dalam pelayar lain, ia mungkin tidak berfungsi.',
        'Halaman bahasa Cina dan Bahasa Malaysia diterjemahkan oleh komputer. Rakan sekerja yang fasih dalam setiap bahasa sedang menyemaknya pada halaman yang telah dilancarkan.',
        'Teks bahasa Cina menggunakan fon Cina pada komputer anda sendiri, jadi paparannya mungkin berbeza antara satu komputer dengan komputer yang lain.',
        'Pratonton memainkan video anda sendiri. Kapsyennya, dan sama ada ia berkelip, bergantung pada rakaman anda.',
        'Sesetengah singkatan tidak dieja penuh: unit saiz fail, seperti MB dan GB, dan nama format video, seperti H.264 dan AAC.',
      ],
    },
    contact: {
      heading: 'Maklum balas dan maklumat hubungan',
      text: 'Jika anda menemui masalah dengan alat ini, atau memerlukan maklumatnya dalam bentuk lain, sila hantar e-mel kepada Joe Bell di {address}.',
    },
    enforcement: {
      heading: 'Prosedur penguatkuasaan',
      text: 'Suruhanjaya Kesaksamaan dan Hak Asasi Manusia (Equality and Human Rights Commission) menguatkuasakan peraturan kebolehcapaian. Jika anda tidak berpuas hati dengan cara kami menjawab aduan anda, anda boleh menghubungi {service}.',
      service:
        'Perkhidmatan Nasihat dan Sokongan Kesaksamaan (Equality Advisory and Support Service)',
    },
    compliance: {
      heading: 'Status pematuhan',
      text: 'Alat ini mematuhi sebahagian Garis Panduan Kebolehcapaian Kandungan Web (WCAG) versi 2.2 pada tahap AA, iaitu tahap pertengahan daripada tiga tahapnya. Setakat ini hanya semakan automatik telah dijalankan, jadi kami belum dapat menyatakan bahawa alat ini mematuhinya sepenuhnya. Kami menyasarkan tahap AAA, iaitu tahap tertinggi.',
    },
    testing: {
      heading: 'Cara kami menguji alat ini',
      wave: 'Pada {date}, kami menyemak halaman ini dengan WAVE, alat penilaian kebolehcapaian web daripada WebAIM. Halaman ini mendapat skor 10 daripada 10.',
      automated:
        'Setiap kali kod berubah, ujian automatik menyemak kontras teks dengan latar belakangnya, serta tahap kesukaran bacaan perkataannya.',
      manual:
        'Kami juga telah menyemaknya secara manual dalam Chrome, pada lebar skrin komputer dan telefon, semasa membinanya.',
    },
    plans: {
      heading: 'Ujian yang dirancang seterusnya',
      intro: 'Kami belum memilih ujian seterusnya. Kami sedang mempertimbangkan:',
      items: [
        'penggunaan alat ini dengan papan kekunci sahaja',
        'penggunaannya dengan pembaca skrin NVDA dalam Chrome pada Windows, dan dengan VoiceOver pada Mac',
        'pembesaran paparan hingga 400%, dan skrin selebar 320 piksel',
        'tema kontras Windows',
        'alat automatik kedua, seperti axe atau Lighthouse',
        'sesi bersama kakitangan kurang upaya yang menggunakan alat ini',
      ],
    },
    about: {
      heading: 'Mengenai kenyataan ini',
      dates:
        'Kenyataan ini ditulis pada {date} dan disemak oleh Joe Bell. Kami akan mengkajinya semula selewat-lewatnya pada {reviewDate}.',
    },
  },
  footer: {
    contact: {
      intro: 'Untuk bantuan dengan alat ini:',
      creators: 'Hantar e-mel kepada pasukan pencipta',
      learningContent: 'Hantar e-mel kepada pasukan kandungan pembelajaran',
    },
  },
  save: {
    pickerDescription: 'Video MP4 (.mp4)',
    stem: 'video',
    marks: {
      branded: 'berjenama',
      levelled: 'diratakan',
      converted: 'ditukar',
    },
    fileName: '{stem} ({mark}).mp4',
    downloadIos: 'Menyimpan ke aplikasi Fail, di bawah Muat Turun',
    downloadOther: 'Menyimpan ke folder muat turun anda',
    download:
      '{where} — pelayar mungkin masih sedang menyelesaikannya. Sebaik sahaja ia berada di sana, muat naik ke tempat yang dituju atau pilih video lain dalam langkah 1. Video tersebut kekal di sini sehingga anda memulakan video lain.',
  },
  format: {
    unknown: 'tidak diketahui',
    lessThanASecond: 'kurang daripada satu saat',
    fewSeconds: 'beberapa saat',
    frameRate: '{rate} bingkai sesaat',
    resolution: '{width} × {height}',
    channels: {
      mono: 'Mono (satu saluran)',
      stereo: 'Stereo (dua saluran)',
      surround51: '5.1 keliling',
      surround71: '7.1 keliling',
      several: '{count} saluran',
    },
  },
}

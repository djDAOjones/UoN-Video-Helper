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
      'Tambahkan penjenamaan Universiti Nottingham yang diluluskan pada video, seimbangkan audionya dan dapatkan fail video yang saiz dan formatnya sesuai untuk tujuan penggunaan anda, tanpa memuat naiknya ke mana-mana.',
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
    promises: [
      'Membolehkan anda memotong rakaman yang tidak diingini di awal dan akhir.',
      'Menambah grafik pembukaan dan grafik penutup.',
      'Menyamakan paras audio untuk pengalaman penonton yang lebih baik.',
      'Menyimpan dalam format yang boleh dipercayai.',
      'Menjadikan saiz fail sesuai dengan tujuan anda.',
    ],
    formatHelp: {
      label: 'Perihal format video',
      text: 'Video wujud dalam banyak format. Sesetengahnya dimainkan pada satu peranti tetapi tidak pada peranti lain, atau tidak berfungsi dengan sesetengah aplikasi. Alat ini menyimpan video anda sebagai MP4, format video yang paling saling boleh kendali. Ini bermakna ia boleh dimainkan pada hampir mana-mana telefon, komputer atau laman web.',
    },
    privacy:
      'Video anda diproses pada peranti anda, ia tidak pernah dimuat naik dan fail asal tidak berubah.',
  },
  browserNote: {
    notPassed:
      'Alat ini direka bentuk dan dibina untuk Chrome, dan pelayar ini belum lulus semua pemeriksaan yang diperlukan untuk menjalankannya. Pemeriksaan sistem di kaki halaman menyatakan apa yang hilang.',
  },
  videoKind: {
    label: 'Jenis video',
    options: {
      staff: 'Video staf',
      submission: 'Serahan pelajar',
    },
    result: {
      staff: 'Anda memilih grafik penutup, dan sama ada grafik itu memaparkan “{words}”.',
      submission: 'Jika video mempunyai grafik penutup, grafik itu memaparkan “{words}”.',
    },
  },
  videoLanguage: {
    label: 'Bahasa video',
    helper: 'Perkataan yang ditambah oleh alat pada video anda adalah dalam bahasa ini.',
    typed: 'Apa yang anda taip dikekalkan seperti yang ditaip.',
    nextVideo:
      'Perubahan pada jenis video atau bahasa video digunakan untuk video seterusnya yang anda buat.',
  },
  steps: {
    choose: 'Pilih video',
    trim: 'Potong',
    titleCard: 'Kad tajuk',
    closing: 'Grafik penutup',
    preset: 'Saiz/kualiti fail',
    create: 'Cipta',
  },
  choose: {
    starting: 'Menyemak sama ada pelayar ini boleh menjalankan alat ini…',
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
        'Itu bukan fail video. Lepaskan fail video, seperti fail yang namanya berakhir dengan .mp4 atau .mov, atau pilih satu di atas.',
    },
  },
  source: {
    readSummary: 'Video dibaca.',
    noSound: 'Tiada audio.',
    properties: 'Ciri-ciri video',
    lossesTitle: 'Tidak dibawa ke dalam fail baharu',
    rows: {
      duration: 'Tempoh',
      videoFormat: 'Format video',
      fileSize: 'Saiz fail',
      resolution: 'Resolusi',
      frameRate: 'Kadar bingkai',
      soundFormat: 'Format audio',
      soundChannels: 'Saluran audio',
      sampleRate: 'Kadar sampel audio',
      sound: 'Audio',
      captions: 'Kapsyen',
      fileType: 'Jenis fail',
    },
    cannotDecodeVideo: 'Pelayar ini tidak dapat membaca format video ini.',
    cannotDecodeAudio: 'Pelayar ini tidak dapat membaca format audio ini.',
    rotated: 'Diputar {degrees}°. Output akan tegak.',
    variesOnAverage: '{rate} secara purata, tetapi ia berbeza-beza',
    variesNote:
      'Rakaman daripada Teams, Zoom dan tangkapan skrin selalunya berbeza-beza. Output akan menggunakan kadar bingkai yang stabil, yang memastikan audio dan gambar kekal segerak.',
    outputRate:
      'Untuk mencapai kadar bingkai standard, beberapa bingkai akan diulang atau ditinggalkan.',
    sampleRate: '{kilohertz} kHz — {hertz} mengambil sampel sesaat',
    noSoundTrack: 'Tiada trek audio ditemui',
    noSoundNote: 'Perataan memerlukan audio. Kerja selebihnya masih berjalan.',
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
      one: '{count} lagi trek audio',
      other: '{count} lagi trek audio',
    },
    losses: {
      extraTracksTitle: 'Fail ini mempunyai {found}',
      extraTracksDetail:
        'Fail baharu menyimpan satu gambar dan satu trek audio — yang disenaraikan di bawah Ciri-ciri video. Trek lain tidak akan dibawa, dan salah satunya mungkin menyimpan alternatif, seperti bahasa lain atau perihalan audio. Jika anda memerlukannya, simpan fail asal bersama fail baharu.',
      uncheckedTitle: 'Trek kapsyen dan bab tidak dapat disemak',
      uncheckedDetail:
        'Fail jenis ini tidak boleh disemak untuk trek kapsyen atau bab. Jika fail anda mempunyainya, ia tidak akan dibawa.',
      captionsConsequence:
        'Fail baharu tidak akan mempunyai trek kapsyen, jadi kapsyen mesti datang dari tempat anda menerbitkannya. EchoVideo membuat kapsyennya sendiri selepas muat naik, jadi semaklah kapsyen itu. Jika anda menghantar fail secara terus, tambahkan kapsyen sendiri. Kapsyen yang dilukis ke dalam gambar kekal.',
      chaptersConsequence: 'Bab-bab tersebut tidak akan berada dalam fail baharu.',
      keepOriginals: 'Jika anda memerlukan trek asal, simpan fail ini bersama fail baharu.',
    },
  },
  trim: {
    intro:
      'Pilihan. Potong bahan yang tidak diingini dari awal atau akhir. Dibiarkan sahaja, keseluruhan video akan disimpan. Pratonton memainkan video asal anda seperti sekarang, kerana audio diratakan dan grafik penutup ditambah apabila video dibuat.',
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
    unreadable: 'Tiada video untuk dipotong, kerana fail itu tidak dapat dibaca.',
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
      notTimes: 'Masa mula atau tamat tidak dapat dibaca sebagai masa.',
      startAfterEnd: 'Permulaannya adalah selepas tamatnya video.',
      endBeforeStart: 'Pengakhiran mesti datang selepas permulaan.',
      keepAtLeast: 'Simpan sekurang-kurangnya {seconds} saat video tersebut.',
    },
    correctToContinue: 'Betulkan masa mula dan tamat dalam langkah 2 untuk meneruskan.',
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
    dateHelper: 'Diisi dengan tarikh hari ini dalam bahasa video.',
    dateHelperNext: 'Anda boleh menukar atau mengosongkannya.',
    forSubmission: 'Serahan pelajar sentiasa mempunyai kad tajuk.',
    fieldsRule: 'Taip tajuk, jabatan atau pengarang untuk membuat kad.',
    fieldsRuleNext: 'Tarikh diisi untuk anda.',
    full: 'Medan ini sudah penuh, jadi selebihnya tidak ditambah.',
    refused: {
      field: 'Ini terlalu panjang untuk dimuatkan pada kad. Pendekkannya.',
      card: 'Bersama-sama, medan ini terlalu panjang untuk dimuatkan pada kad. Pendekkan medan ini atau medan lain.',
    },
    empty: 'Taip tajuk, jabatan atau pengarang, atau nyahtanda Tambah kad tajuk.',
    correctToContinue: 'Betulkan kad tajuk dalam langkah 3 untuk meneruskan.',
    submission: {
      fieldsRule: 'Keempat-empat medan diperlukan.',
      assignment: 'Tajuk atau nombor tugasan',
      module: 'Kod dan tajuk modul',
      convenor: 'Penyelaras modul atau tutor',
      ids: 'Nombor ID pelajar',
      idsHelper: 'Setiap nombor ID (identiti) pelajar ialah {digits} digit.',
      idsHelperNext:
        'Taip sehingga {max}, dipisahkan dengan ruang, koma atau baris baharu. Jangan tambah nama.',
      filled:
        'Kad ini juga menunjukkan masa tayangan, {running}, dan tarikh hari ini, ditandakan sebagai tarikh kad dibuat, bukan tarikh penyerahan.',
      missing: {
        assignment: 'Taip tajuk atau nombor tugasan.',
        module: 'Taip kod dan tajuk modul.',
        convenor: 'Taip nama penyelaras modul atau tutor.',
        ids: 'Taip sekurang-kurangnya satu nombor ID pelajar.',
      },
      idNotAnId: '“{id}” bukan nombor ID pelajar. Setiap satu ialah {digits} digit.',
      idTwice: '{id} ada dua kali dalam senarai. Buang satu.',
      idsTooMany: 'Itu {count} nombor. Kad ini boleh memuatkan sehingga {max}.',
    },
    card: {
      module: 'Modul',
      convenor: 'Penyelaras atau tutor',
      ids: {
        one: 'Nombor ID pelajar',
        other: 'Nombor ID pelajar',
      },
      running: 'Masa tayangan',
      made: 'Kad dibuat',
      madeValue: '{date} — bukan tarikh penyerahan',
    },
  },
  closing: {
    legend: 'Grafik penutup',
    typeLabel: 'Jenis animasi',
    types: {
      cut: 'Potong',
      fade: 'Pudar',
      slide: 'Luncur',
      none: 'Tiada grafik penutup',
    },
    onsetLabel: 'Dimainkan di atas',
    onsets: {
      existing: 'Saat terakhir video',
      freeze: 'Bingkai akhir ditahan',
    },
    helpLabel: 'Perihal apa yang ditindih grafik',
    helpExistingTerm: 'Saat terakhir video',
    helpExistingText: '— grafik penutup menutupinya semasa ia terbentuk.',
    helpFreezeTerm: 'Bingkai akhir ditahan',
    helpFreezeText:
      '— bingkai terakhir anda ditahan selama satu saat tambahan. Grafik penutup dimainkan di atasnya, jadi tiada apa-apa dalam video anda diliputi.',
    colourLabel: 'Warna',
    colours: {
      blue: 'Biru',
      white: 'Putih',
    },
    internalLabel: 'Untuk kegunaan dalaman sahaja',
    internalWords: 'Untuk kegunaan dalaman sahaja',
    notUsedWith: {
      cut: 'Tidak digunakan dengan Potong.',
      none: 'Tidak digunakan tanpa grafik penutup.',
    },
    internalForSubmission: 'Sentiasa dihidupkan untuk serahan pelajar.',
    result: {
      none: 'Tiada grafik penutup Universiti akan ditambah.',
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
          fade: 'Bingkai terakhir anda ditahan sementara grafik penutup biru pudar masuk, jadi tiada apa yang ditutup. {adds}',
          slide:
            'Bingkai terakhir anda dipegang semasa grafik penutup biru meluncur masuk, jadi tiada apa yang ditutup. {adds}',
        },
        white: {
          fade: 'Bingkai terakhir anda dipegang sementara grafik penutup putih pudar masuk, jadi tiada apa yang ditutupi. {adds}',
          slide:
            'Bingkai terakhir anda dipegang semasa grafik penutup putih meluncur masuk, jadi tiada apa yang ditutup. {adds}',
        },
      },
      overPicture: {
        blue: {
          fade: 'Grafik penutup biru pudar masuk pada saat terakhir video anda, menutupinya semasa ia terbentuk. {adds}',
          slide:
            'Grafik penutup biru meluncur masuk pada saat terakhir video anda, menutupinya semasa ia terbentuk. {adds}',
        },
        white: {
          fade: 'Grafik penutup putih pudar masuk pada saat terakhir video anda, menutupinya semasa ia terbentuk. {adds}',
          slide:
            'Grafik penutup putih meluncur masuk pada saat terakhir video anda, menutupinya semasa ia terbentuk. {adds}',
        },
      },
    },
  },
  preset: {
    legend: 'Saiz/kualiti fail',
    labels: {
      best: 'Kualiti tinggi, untuk penerbitan',
      smaller: 'Fail lebih kecil, untuk tugasan dan perkongsian',
    },
    details: {
      best: 'Untuk EchoVideo, YouTube dan laman yang serupa.',
      smaller: 'Untuk muat naik tugasan Moodle, e-mel dan mesej.',
    },
    inRecord: {
      best: 'kualiti tinggi',
      smaller: 'fail yang lebih kecil',
    },
    inSentence: {
      best: 'kualiti tinggi',
      smaller: 'fail yang lebih kecil',
    },
  },
  create: {
    lockedStopping: 'Dikunci semasa kerja dihentikan.',
    note: 'Video yang telah siap kekal di sini sehingga anda memulakan video lain atau menutup tab ini. Simpan sebelum itu.',
    announceProgress: 'Umumkan kemajuan',
    announceHelp:
      'Menyebutkan setiap peringkat dengan kuat untuk pembaca skrin semasa video dibuat. Keputusan sentiasa diumumkan.',
    progressLabel: 'Mencipta video anda',
    create: 'Cipta video itu',
    again: 'Cipta video itu semula',
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
    saveFailedNext: 'Ia masih di sini untuk dicuba lagi.',
    saveFailedWhat: 'Video itu tidak dapat disimpan.',
    stoppingAfterFailure: 'Kerja sedang dihentikan. Sila tunggu sebelum mencuba lagi.',
    checking: 'Menyemak video ini pada peranti anda…',
    checkStopped: 'Semakan dihentikan.',
    stoppingSave: 'Menghentikan penyimpanan…',
    cancelling: 'Membatalkan…',
    cancelled: 'Dibatalkan. Tiada apa yang disimpan dan fail asal anda tidak berubah.',
    saving: 'Menyimpan…',
    saveStopped: 'Penyimpanan dihentikan. Video masih ada di sini apabila anda mahukannya.',
    notSaved: 'Tidak disimpan. Video itu masih ada di sini apabila anda mahukannya.',
    refusedSource:
      'Itulah fail yang anda gunakan untuk bermula. Pilih nama atau folder yang berbeza, kerana alat ini tidak akan mengubah fail asal anda.',
    saved:
      'Disimpan. Buka fail yang disimpan untuk menyemaknya, kemudian muat naik ke tempat anda akan menggunakannya, atau pilih video lain dalam langkah 1.',
    storageWayOut:
      'Kurangkan video, pilih {smaller} atau kosongkan sedikit ruang, kemudian tekan Semak semula.',
    creating: 'Mencipta video anda. {notice}',
    ready: 'Video anda sudah siap.',
    couldNotCreate: 'Video itu tidak dapat dicipta. {sentence}',
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
    lifetime:
      'Ia belum disimpan. Ia kekal di sini sehingga anda memulakan video lain atau menutup tab ini.',
    lifetimeDelivered: 'Ia kekal di sini sehingga anda memulakan video lain atau menutup tab ini.',
    keptWhole: 'keseluruhan video ({duration})',
    keptPart: '{kept} daripada {duration}, dari {from} hingga {to}',
    closingNone: 'tiada grafik penutup Universiti',
    closingInternal: '{closing}, bertanda “{words}”',
    closingCut: {
      blue: 'potongan kepada kad penutup biru',
      white: 'potongan pada kad penutup putih',
    },
    closingOverFreeze: {
      blue: {
        fade: 'grafik penutup biru pudar masuk di atas bingkai terakhir yang ditahan',
        slide: 'grafik penutup biru meluncur masuk ke atas bingkai terakhir yang dipegang',
      },
      white: {
        fade: 'grafik penutup putih yang pudar masuk di atas bingkai terakhir yang dipegang',
        slide: 'grafik penutup putih meluncur masuk ke atas bingkai terakhir yang dipegang',
      },
    },
    closingOverPicture: {
      blue: {
        fade: 'grafik penutup biru pudar masuk di atas gambar',
        slide: 'grafik penutup biru meluncur masuk ke atas gambar',
      },
      white: {
        fade: 'grafik penutup putih pudar masuk di atas gambar',
        slide: 'grafik penutup putih meluncur masuk ke atas gambar',
      },
    },
    summary: 'Dibuat daripada {name}: {part}, {output}, {closing}.',
    summaryWithCard: {
      staff:
        'Dibuat daripada {name}: kad tajuk staf {seconds} saat, kemudian {part}, {output}, {closing}.',
      submission:
        'Dibuat daripada {name}: kad serahan {seconds} saat, kemudian {part}, {output}, {closing}.',
    },
    videoLanguage: 'Bahasa video: {language}.',
    notLoaded:
      'Grafik penutup tidak dapat dimuatkan, jadi ia tiada dalam video ini. Semua yang lain telah digunakan seperti yang diminta.',
    endedEarly: {
      picture:
        'Fail yang anda pilih berakhir lebih awal. Gambarnya berhenti pada {stops} daripada {end}.',
      sound:
        'Fail yang anda pilih berakhir lebih awal. Audionya berhenti pada {stops} daripada {end}.',
      together:
        'Fail yang anda pilih berakhir lebih awal. Gambar dan audionya berhenti pada {stops} daripada {end}.',
      both: 'Fail yang anda pilih berakhir lebih awal. Gambarnya berhenti pada {picture} dan audionya pada {sound}, daripada {end}.',
      held: 'Dari situ hingga grafik penutup, video menahan bingkai terakhirnya.',
      next: 'Jika anda mempunyai salinan yang lengkap, cipta video itu semula daripada salinan tersebut.',
    },
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
        fade: 'Video anda lebih pendek daripada animasi pudar. Grafik penutup biru pudar masuk di atas bingkai terakhir yang ditahan dan bukannya di atas gambar.',
        slide:
          'Video anda lebih pendek daripada animasi luncur. Grafik penutup biru meluncur masuk ke atas bingkai terakhir yang ditahan dan bukannya ke atas gambar.',
      },
      white: {
        fade: 'Video anda lebih pendek daripada animasi pudar. Grafik penutup putih pudar masuk di atas bingkai terakhir yang ditahan dan bukannya di atas gambar.',
        slide:
          'Video anda lebih pendek daripada animasi luncur. Grafik penutup putih meluncur masuk ke atas bingkai terakhir yang ditahan dan bukannya ke atas gambar.',
      },
    },
    fellBackToPicture: {
      blue: {
        fade: 'Grafik penutup biru pudar masuk di atas gambar, bukan di atas bingkai terakhir yang ditahan seperti yang dipilih.',
        slide:
          'Grafik penutup biru meluncur masuk ke atas gambar, bukan ke atas bingkai terakhir yang ditahan seperti yang dipilih.',
      },
      white: {
        fade: 'Grafik penutup putih pudar masuk di atas gambar, bukan di atas bingkai terakhir yang dipegang seperti yang dipilih.',
        slide:
          'Grafik penutup putih meluncur masuk ke atas gambar, bukan ke atas bingkai terakhir yang dipegang seperti yang dipilih.',
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
    timeLeft: 'Kira-kira {time} lagi',
    fewSecondsLeft: 'Beberapa saat lagi',
    withTimeLeft: '{progress}. {left}',
    job: 'Video ini: {kind}. Bahasa video: {language}.',
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
      noAacEncodeHere: 'Pelayar ini tidak boleh menambah audio pada fail video. {remedy}',
      noAacEncodeElsewhere:
        'Pelayar ini tidak boleh menambah audio pada fail video. {remedy} Firefox boleh memainkan video tetapi tidak boleh mencipta audio yang diperlukan.',
      noH264Encode:
        'Pelayar ini tidak dapat mencipta format video yang diperlukan oleh alat ini. {remedy}',
      noSourceDecodeHere:
        'Pelayar ini tidak dapat membaca gambar atau audio di dalam fail ini. Ia mungkin disimpan dalam format yang dibuat untuk perisian penyuntingan. Eksportnya sekali lagi sebagai MP4 — fail yang namanya berakhir dengan .mp4 — dan pilih fail tersebut.',
      noSourceDecodeElsewhere:
        'Pelayar ini tidak dapat membaca gambar atau audio di dalam fail ini. {remedy} Jika ia juga tidak dapat dibuka di sana, fail itu mungkin disimpan dalam format yang dibuat untuk perisian penyuntingan. Eksportnya semula sebagai MP4 — fail yang namanya berakhir dengan .mp4.',
      noOpfsHere:
        'Pelayar ini tidak akan memberikan alat ini ruang kerja yang diperlukan untuk mencipta video anda. Jika anda melayari secara peribadi, tetingkap biasa biasanya berfungsi; jika tidak, tetapan pada komputer ini mungkin menyekat storan tapak — tanya sesiapa yang mengurusnya.',
      noOpfsElsewhere:
        'Pelayar ini tidak akan memberikan alat ini ruang kerja yang diperlukan untuk mencipta video anda. {remedy} Jika anda melayari secara peribadi, tetingkap biasa biasanya berfungsi.',
      insecureContext:
        'Halaman ini memerlukan sambungan yang selamat sebelum ia boleh berfungsi dengan video anda. Bukanya di alamat https:// atau di localhost jika anda menjalankannya sendiri.',
      insufficientStorageResolvable:
        'Ruang kosong pada peranti ini tidak mencukupi. Kerja ini memerlukan kira-kira {size} ruang kerja. Kosongkan sedikit ruang dan cuba lagi, kurangkan video atau pilih {smaller}.',
      insufficientStorage:
        'Ruang kosong pada peranti ini tidak mencukupi. Kerja ini memerlukan kira-kira {size} ruang kerja. Kosongkan sedikit ruang dan cuba lagi.',
      storageUnknown:
        'Pelayar ini tidak akan menyatakan berapa banyak ruang kosong yang ada. Jika ia kehabisan ruang separuh jalan, kerja akan berhenti dan tiada apa yang disimpan. Fail asal anda tidak terjejas.',
      veryLongJob:
        'Ini akan mengambil masa kira-kira {time}. Anda boleh teruskan, tetapi komputer desktop akan jauh lebih pantas.',
      veryLongJobUnknown:
        'Ini akan mengambil masa yang agak lama. Anda boleh teruskan, tetapi komputer desktop akan jauh lebih pantas.',
      longJob:
        'Ini akan mengambil masa kira-kira {time}. Pastikan tab ini terbuka semasa kerja berjalan, kerana menutup tab akan menghentikan kerja.',
      longJobUnknown:
        'Ini akan mengambil masa yang agak lama. Pastikan tab ini terbuka semasa kerja berjalan, kerana menutup tab akan menghentikan kerja.',
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
    soundHeading: 'Perlu diketahui tentang audionya',
    finishedHeading: 'Perlu diketahui tentang video yang telah siap',
    reassurance:
      'Tiada satu pun daripada ini yang menghalang anda daripada meneruskan. Fail asal anda tidak diubah dalam apa jua cara.',
    spoken: '{heading}: {titles}.',
    endsEarly: {
      heading: 'Fail ini berakhir lebih awal',
      detail:
        'Audionya berhenti pada {stops} daripada {end}. Fail ini mungkin terputus semasa disalin atau dirakam. Selepas {stops}, video baharu akan senyap. Jika anda mempunyai salinan yang lengkap, pilih salinan itu sebaliknya.',
    },
    cutShort: {
      heading: 'Fail video lebih pendek daripada yang dijangka',
      detail:
        'Fail ini mungkin terputus semasa disalin atau dirakam. Semak video baharu sebelum anda menggunakannya. Jika anda mempunyai salinan lengkap, pilih salinan itu.',
    },
    noAudio: {
      heading: 'Video ini tiada audio',
      detail:
        'Tiada audio untuk diratakan, jadi kerja selebihnya berjalan tanpanya. Jika anda menjangkakan audio, semak rakaman sebelum menerbitkan.',
    },
    decodeDamage: {
      heading: {
        one: 'Satu bahagian yang rosak akan disenyapkan',
        other: 'Beberapa bahagian yang rosak akan disenyapkan',
      },
      detail: {
        one: 'Pada {times} dalam video asal, fail ini mengandungi letusan hingar yang lebih kuat daripada yang mungkin bagi audio yang tidak rosak. Ia berpunca daripada kerosakan pada fail, bukan daripada video anda. Pecahan saat itu akan disenyapkan, jadi tiada sesiapa yang mendengarnya dan perataan masih berfungsi seperti sepatutnya.',
        other:
          'Pada {times} dalam video asal, fail ini mengandungi letusan hingar yang lebih kuat daripada yang mungkin bagi audio yang tidak rosak. Ia berpunca daripada kerosakan pada fail, bukan daripada video anda. Setiap pecahan saat itu akan disenyapkan, jadi tiada sesiapa yang mendengarnya dan perataan masih berfungsi seperti sepatutnya.',
      },
      more: {
        one: '{count} bahagian lain',
        other: '{count} bahagian lain',
      },
    },
    clipping: {
      heading: 'Audio mungkin terherot di beberapa tempat',
      detail:
        'Rakaman sering mencapai tahap maksimumnya, jadi sebahagian daripadanya mungkin terpotong. Ini biasanya bermakna mikrofon ditetapkan terlalu tinggi. Perataan masih berjalan, tetapi herotan yang sedia ada dalam rakaman tidak dapat dialih keluar.',
    },
    veryQuiet: {
      heading: 'Rakaman ini sangat senyap',
      detail:
        'Ia jauh di bawah tahap pendengaran yang selesa. Perataan akan menaikkan tahapnya, tetapi menaikkan pertuturan yang perlahan juga menaikkan apa-apa bunyi lain yang dirakam di dalam bilik.',
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
      heading: 'Audio yang telah siap tidak berada pada tahap biasa',
      detail:
        'Video ini bagus untuk digunakan; cuma ia mungkin kedengaran sedikit lebih senyap atau lebih kuat daripada video lain yang diratakan dengan alat ini.',
    },
    metadataLost: {
      heading: 'Tajuk, pengarang dan tarikh fail tidak dapat disalin',
      detail:
        'Gambar dan audio tidak terjejas. Jika fail asal anda mempunyai tajuk, pengarang atau tarikh, fail baharu tidak akan mempunyainya. Anda masih boleh menambahkannya di mana sahaja anda memuat naiknya.',
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
        'Fail ini tidak dapat dibaca sebagai video. Ia mungkin bukan fail video, atau ia mungkin rosak. Nama fail video biasanya berakhir dengan .mp4, .mov, .mkv atau .webm.',
      soundOnly:
        'Fail ini mempunyai audio tetapi tiada video. Alat ini menambah penjenamaan pada video, jadi ia memerlukan fail dengan gambar.',
      noTracks:
        'Tiada video atau audio ditemui dalam fail ini. Ia mungkin tidak lengkap atau mungkin telah disimpan secara salah.',
      readError:
        'Sesuatu tidak kena semasa membaca fail ini. Ia mungkin rosak atau dalam format yang tidak dapat dibaca oleh alat ini.',
      tookTooLong:
        'Membaca fail ini mengambil masa lebih lama daripada yang dijangkakan, atau alat tersebut menghadapi masalah.',
      next: 'Pilih fail lain atau simpan fail ini sekali lagi daripada aplikasi yang membuatnya, sebagai fail yang namanya berakhir dengan .mp4.',
    },
    badTrim: {
      what: 'Waktu mula dan tamat tidak dapat digunakan.',
      next: 'Betulkan masa mula dan tamat dalam langkah 2 dan cuba lagi.',
    },
    unlevellable: {
      what: 'Audio rakaman ini tidak dapat dibawa ke tahap biasa, jadi video itu tidak dibuat.',
      next: 'Laporkan masalah itu dengan butang Hantar maklum balas, yang menambah butiran yang akan membantu.',
    },
    outputLoudness: {
      what: 'Audio yang telah siap tidak keluar pada tahap biasa, jadi video itu tidak dapat disimpan.',
    },
    outputPeak: {
      what: 'Audio yang telah siap kedengaran lebih kuat pada kemuncaknya daripada yang dibenarkan, jadi video itu tidak disimpan.',
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
      next: 'Cuba pilihan lain di bawah Saiz/kualiti fail. Jika masalah itu berlaku lagi, laporkannya dengan butang Hantar maklum balas, yang menambah butiran yang akan membantu.',
    },
    checkFailed: {
      what: 'Pemeriksaan peranti tidak selesai.',
      next: 'Tekan Semak semula untuk menjalankan semakan sekali lagi. Jika semakan gagal lagi, laporkan masalah itu dengan butang Hantar maklum balas.',
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
      'Cuba lagi. Jika masalah itu berlaku lagi, laporkannya dengan butang Hantar maklum balas, yang menambah butiran yang akan membantu.',
    startup: {
      insecure:
        'Halaman ini memerlukan sambungan yang selamat sebelum ia boleh berfungsi dengan video anda. Bukanya di alamat yang bermula dengan https://.',
      noWebCodecs:
        'Pelayar ini tidak dapat memproses video, jadi alat ini tidak dapat dijalankan di sini. {remedy}',
      noH264:
        'Pelayar ini tidak dapat mencipta format video yang diperlukan oleh alat ini, jadi alat ini tidak dapat dijalankan di sini. {remedy}',
      noWorkingStore:
        'Pelayar ini tidak memberikan ruang kerja kepada alat ini untuk mencipta video. Jika anda melayari secara peribadi, tetingkap biasa biasanya berfungsi. {remedy}',
      workerNotStarted:
        'Bahagian alat yang melakukan kerja tidak bermula. Muat semula halaman. Jika masalah itu berlaku lagi, laporkannya dengan butang Hantar maklum balas.',
    },
    captured:
      'Sesuatu yang tidak kena telah berlaku dalam alat ini. Video yang sedang dibuat mungkin tidak siap; fail asal anda tidak terjejas. Laporkan masalah itu dengan butang Laporkan masalah ini, yang akan menambah butiran ini.',
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
      secure: 'Sambungan selamat',
      webcodecs: 'Pemprosesan video (WebCodecs)',
      h264: 'Format video keluaran (H.264)',
      aac: 'Format audio keluaran (AAC)',
      opfs: 'Storan kerja persendirian',
      worker: 'Pemprosesan latar belakang',
    },
    values: {
      checking: 'Memeriksa',
      available: 'Tersedia',
      notAvailable: 'Tidak tersedia',
      supported: 'Disokong',
      notSupported: 'Tidak disokong',
      aacNotSupported: 'Tidak disokong — video dengan audio tidak boleh dibuat di sini',
      failedToStart: 'Gagal bermula',
      readyIn: 'Bersedia dalam {time}',
      noResponse: 'Tiada respons',
    },
  },
  errors: {
    revealed:
      'Masalah ditemui. Gunakan Laporkan masalah ini dalam Ralat ditangkap untuk menghantar butiran.',
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
      'Butiran yang membantu mencari masalah: versi alat, pelayar anda, sejauh mana anda telah berjaya, dan panjang video anda, saiz dan format gambar. Butiran ini tidak pernah merangkumi video, namanya atau apa-apa sahaja di dalamnya.',
    openEmail: 'Buka aplikasi e-mel',
    copy: 'Salin mesej dan butiran',
    close: 'Tutup',
    tooLong:
      'Mesej anda terlalu panjang untuk dihantar ke aplikasi e-mel anda. Pilih “Salin mesej dan butiran” dan tampalkannya ke dalam e-mel ke {address}.',
    opened:
      'Aplikasi e-mel anda sepatutnya telah dibuka dengan mesej anda sedia untuk dihantar. Jika tidak, pilih “Salin mesej dan butiran” dan tampalkannya ke dalam e-mel ke {address}.',
    someOmitted:
      'Beberapa butiran tidak muat dalam e-mel; “Salin mesej dan butiran” mengandungi semuanya.',
    copied: 'Disalin. Tampalkannya ke dalam e-mel ke {address}.',
    couldNotCopy:
      'Tidak dapat menyalin. Buka “Apa yang akan dihantar bersamanya”, pilih butirannya dan salin butiran tersebut bersama mesej anda.',
    onlyInCopy: 'Terlalu panjang untuk e-mel ini, jadi hanya dalam “Salin mesej dan butiran”:',
  },
  statement: {
    heading: 'Kenyataan kebolehcapaian',
    covers: 'Kenyataan ini meliputi Pembantu Video UoN, iaitu halaman yang sedang anda gunakan.',
    aim: 'Kami mahu seramai mungkin orang dapat menggunakan alat ini. Anda sepatutnya dapat:',
    abilities: [
      'Menggunakannya dengan papan kekunci sahaja.',
      'Menggunakannya dengan pembaca skrin, yang membacakan setiap peringkat dan keputusan.',
      'Membesarkan paparan hingga 200% tanpa teks terkeluar dari skrin.',
      'Menggunakan warna pilihan anda sendiri, dan mod kontras tinggi komputer anda.',
      'Mematikan pergerakan pada halaman melalui tetapan komputer anda.',
    ],
    plain: 'Bahasanya mudah, dan teks mempunyai kontras yang tinggi dengan latar belakangnya.',
    limits: {
      heading: 'Tahap kebolehcapaian alat ini',
      intro: 'Kami sedar bahawa sesetengah bahagian belum boleh diakses sepenuhnya:',
      items: [
        'Alat ini dibina untuk Google Chrome pada komputer. Dalam pelayar lain, ia mungkin tidak berfungsi.',
        'Halaman bahasa Cina dan Bahasa Malaysia diterjemahkan oleh komputer. Kami sedang meminta rakan sekerja yang fasih dalam setiap bahasa untuk menyemaknya, jadi sesetengah perkataan mungkin salah sehingga semakan itu selesai.',
        'Teks bahasa Cina menggunakan fon Cina pada komputer anda sendiri, jadi paparannya mungkin berbeza antara satu komputer dengan komputer yang lain.',
        'Pratonton memainkan video anda sendiri seadanya. Kapsyennya, perihalan audio dan alternatif lain, serta sama ada ia berkelip, bergantung pada rakaman anda.',
        'Sesetengah singkatan tidak dieja penuh. UoN ialah singkatan bagi University of Nottingham. Singkatan lain ialah unit saiz fail, seperti MB dan GB, dan nama format video, seperti H.264 dan AAC.',
        'Butang Pilih Fail ialah milik pelayar anda. Pada halaman bahasa Cina dan Bahasa Malaysia, perkataannya dalam bahasa pelayar anda. Untuk menggunakannya dengan suara, sebut nama langkah itu, “Pilih video”.',
      ],
    },
    contact: {
      heading: 'Maklum balas dan maklumat hubungan',
      text: 'Jika anda menemui masalah dengan alat ini, atau memerlukan maklumatnya dalam bentuk lain, sila hantar e-mel kepada Joe Bell di {address}.',
    },
    enforcement: {
      heading: 'Prosedur penguatkuasaan',
      text: 'Suruhanjaya Kesaksamaan dan Hak Asasi Manusia (Equality and Human Rights Commission) menguatkuasakan peraturan kebolehcapaian. Jika anda tidak berpuas hati dengan cara kami menjawab aduan anda, anda boleh menghubungi {service} untuk mendapatkan bantuan.',
      service:
        'Perkhidmatan Nasihat dan Sokongan Kesaksamaan (Equality Advisory and Support Service, dibuka dalam tab baharu)',
    },
    compliance: {
      heading: 'Status pematuhan',
      text: 'Alat ini mematuhi sebahagian Garis Panduan Kebolehcapaian Kandungan Web (WCAG) versi 2.2 pada tahap AA, iaitu tahap pertengahan daripada tiga tahapnya. Ini disebabkan oleh perkara yang disenaraikan di bawah “Tahap kebolehcapaian alat ini”, dan kerana belum ada sesiapa yang mengujinya dengan pembaca skrin atau teknologi bantuan lain. Kami menyasarkan tahap AAA, iaitu tahap tertinggi.',
    },
    testing: {
      heading: 'Cara kami menguji alat ini',
      wave: 'Pada {date}, kami menyemak halaman ini dengan WAVE, alat penilaian kebolehcapaian web daripada WebAIM. Halaman ini mendapat skor 10 daripada 10.',
      automated:
        'Setiap kali kod berubah, ujian automatik menyemak kontras teks dengan latar belakangnya, serta tahap kesukaran bacaan perkataan bahasa Inggeris.',
      manual:
        'Kami juga telah menyemaknya secara manual dalam Chrome, dalam ketiga-tiga bahasa, pada lebar skrin komputer dan telefon, semasa membinanya.',
      walk: 'Pada Oktober 2026, satu semakan automatik dalam Chrome meliputi keadaan utama halaman dalam ketiga-tiga bahasa, pada lebar skrin komputer dan telefon, dalam warna cerah dan gelap, dalam mod kontras tinggi tiruan Chrome, dan dengan teks yang lebih besar. Ini bukan ujian oleh seseorang.',
    },
    plans: {
      heading: 'Ujian yang dirancang seterusnya',
      intro:
        'Kami belum menjalankan ujian ini. Kami memerlukannya sebelum dapat menyatakan bahawa alat ini mematuhi garis panduan itu sepenuhnya:',
      items: [
        'Penggunaan alat ini dengan papan kekunci sahaja.',
        'Penggunaannya dengan pembaca skrin NVDA dalam Chrome pada Windows, dan dengan VoiceOver pada Mac.',
        'Pembesaran paparan hingga 400%, dan penggunaan skrin selebar 320 piksel.',
        'Penggunaan tema kontras Windows.',
      ],
      optionalIntro: 'Kami juga sedang mempertimbangkan:',
      optionalItems: [
        'Alat automatik kedua, seperti axe atau Lighthouse.',
        'Sesi bersama kakitangan kurang upaya yang menggunakan alat ini.',
      ],
    },
    about: {
      heading: 'Mengenai kenyataan ini',
      dates:
        'Kenyataan ini ditulis pada {date} dan dikemas kini pada {updatedDate}. Joe Bell telah menyemaknya. Kami akan mengkajinya semula selewat-lewatnya pada {reviewDate}.',
    },
  },
  footer: {
    feedbackForm: 'Isi borang maklum balas (dibuka dalam tab baharu)',
    contact: {
      intro: 'Untuk bantuan dengan alat ini:',
      creators: 'Pasukan pencipta di Teams (dibuka dalam tab baharu)',
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
      '{where} — pelayar mungkin masih sedang menyelesaikannya. Sebaik sahaja ia berada di sana, muat naik ke tempat anda akan menggunakannya, atau pilih video lain dalam langkah 1.',
  },
  format: {
    unknown: 'tidak diketahui',
    lessThanASecond: 'kurang daripada satu saat',
    fewSeconds: 'beberapa saat',
    alone: {
      unknown: 'Tidak diketahui',
      lessThanASecond: 'Kurang daripada satu saat',
    },
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

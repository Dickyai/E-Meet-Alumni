// Konfigurasi ALUMNI E-MEET — isi saat deployment.
window.EMEET_CONFIG = {
  // Tempel URL Web App Apps Script (berakhiran /exec) di sini.
  // Selama kosong, form RSVP TIDAK akan menyimpan apa pun dan UI tidak menampilkan "sukses".
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwnzjYwCudnK4otOF18DAF7A6GPRKrdIHTU3EGCgXon30i906pTCxszdN6nd4CALM3m3w/exec',

  // Tenggat RSVP: 12 November 2026 pukul 23.59 WIB
  DEADLINE_ISO: '2026-11-12T23:59:59+07:00',

  // Waktu mulai acara (untuk hitung mundur di scene akhir): Minggu 15 November 2026, 17.00 WIB
  EVENT_START_ISO: '2026-11-15T17:00:00+07:00',

  // Khusus pengujian: isi mis. '2026-11-13T09:00:00+07:00' untuk mensimulasikan RSVP ditutup.
  // WAJIB dikosongkan (null) sebelum rilis.
  NOW_OVERRIDE: null,

  YEAR_MIN: 1980,
  YEAR_MAX: 2026,

  SHARE: {
    title: 'ALUMNI E-MEET — Bakar-Bakar X Alumni Meet',
    text: 'Kamu diundang reuni Asisten Lab Dasar Karawaci, Minggu 15 November 2026, 17.00 WIB. Yuk konfirmasi kehadiran!'
  },

  REQUEST_TIMEOUT_MS: 15000
};
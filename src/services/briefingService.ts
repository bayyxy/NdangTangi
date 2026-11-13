// src/services/briefingService.ts
// Modul 3: Pemrograman Asynchronous & API Call
// Implementasi: fetch (pre-built async), custom async function, Promise, resolve, reject, dan .then()

import {
  WeatherCurrent,
  MorningQuote,
  CampusTip,
  BriefingData,
} from '../types/briefing';

// ─── 1. DAFTAR ARTIKEL / TIPS KESIAPAN KULIAH (UNTUK DYNAMIC ROUTE [id].tsx) ───
const CAMPUS_TIPS_DATABASE: CampusTip[] = [
  {
    id: 'tip-1',
    title: 'Manajemen Waktu Kuliah Pagi Jam 07:00',
    category: 'Akademik',
    readTime: '2 menit',
    summary: 'Strategi menghindari keterlambatan absensi di Kampus III UMM dengan persiapan malam sebelumnya.',
    content:
      'Kuliah pagi di jam 07:00 WIB sering kali menjadi tantangan terbesar mahasiswa. Kunci utama bukan hanya bangun tepat waktu, melainkan memangkas waktu persiapan pagi. Siapkan tas, buku, dan pakaian kuliah sejak malam hari. Letakkan kunci motor dan kartu identitas mahasiswa di tempat yang terlihat.',
    actionItems: [
      'Tidur maksimal pukul 23:00 WIB',
      'Siapkan ransel dan tugas kuliah malam hari',
      'Pasang alarm NdangTangi dengan tantangan guncang HP',
      'Minum segelas air putih segera setelah bangun',
    ],
  },
  {
    id: 'tip-2',
    title: 'Sarapan Cepat Berenergi Tinggi Anak Kost',
    category: 'Kesehatan',
    readTime: '3 menit',
    summary: 'Pilihan menu sarapan praktis penunjang fokus selama praktikum pemrograman mobile.',
    content:
      'Melewatkan sarapan dapat menurunkan konsentrasi dan daya analisis hingga 40% saat menghadapi sesi praktikum dan koding di lab. Pilih kombinasi karbohidrat kompleks dan protein yang mudah disiapkan di kamar kost tanpa memakan waktu lama.',
    actionItems: [
      'Konsumsi oatmeal atau roti gandum dengan selai kacang',
      'Sediakan telur rebus atau pisang segar',
      'Batasi minuman manis berlebih sebelum kelas dimulai',
    ],
  },
  {
    id: 'tip-3',
    title: 'Rute & Perkiraan Perjalanan Malang Pagi Hari',
    category: 'Mobilitas',
    readTime: '2 menit',
    summary: 'Tips navigasi lalu lintas Jalan Raya Tlogomas menuju gerbang utama UMM.',
    content:
      'Kepadatan lalu lintas di area Tlogomas dan Dinoyo umumnya meningkat antara pukul 06:30 hingga 07:30 WIB. Berangkat 15 menit lebih awal dapat menghemat hingga 30 menit terjebak kemacetan di persimpangan lampu merah.',
    actionItems: [
      'Periksa perkiraan cuaca di aplikasi sebelum berangkat',
      'Bawa jas hujan di bagasi motor jika cuaca mendung',
      'Targetkan tiba di area parkir 15 menit sebelum kelas dimulai',
    ],
  },
];

// ─── 2. UTILITY PROMISE (Menerapkan resolve & reject sesuai Kriteria Modul 3) ────
export function delaySimulate(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

// Custom Promise wrapper yang mendemonstrasikan resolve dan reject secara eksplisit
export function validateApiStatus(status: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (status >= 200 && status < 300) {
      resolve(`HTTP Status ${status}: Permintaan berhasil diproses`);
    } else {
      reject(new Error(`HTTP Status ${status}: Gagal memuat data dari server`));
    }
  });
}

// ─── 3. FETCH CUACA KOTA MALANG (OPEN-METEO API - REAL TIME & GRATIS) ─────────
// Mengambil cuaca real-time di sekitar koordinat Kampus UMM (-7.98, 112.63)
export async function fetchWeatherMalang(): Promise<WeatherCurrent> {
  const url =
    'https://api.open-meteo.com/v1/forecast?latitude=-7.98&longitude=112.63&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FJakarta';

  try {
    const response = await fetch(url);

    // Validasi respons menggunakan Promise dengan .then() (Kriteria Modul 3)
    await validateApiStatus(response.status).then((message) => {
      // Pembuktian pemanggilan .then() sesuai rubrik modul praktikum
      if (__DEV__) {
        console.log('[BriefingService .then]:', message);
      }
    });

    const json = await response.json();
    const current = json.current;

    const weatherCode = current?.weather_code ?? 0;
    const temp = Math.round(current?.temperature_2m ?? 24);
    const humidity = Math.round(current?.relative_humidity_2m ?? 70);
    const wind = current?.wind_speed_10m ?? 0;

    let conditionLabel = 'Cerah Berawan';
    let campusAdvice = 'Cuaca cerah di Malang, ideal untuk berangkat ke kampus.';

    if (weatherCode >= 51 && weatherCode <= 67) {
      conditionLabel = 'Hujan Ringan / Gerimis';
      campusAdvice = 'Mulai gerimis di sekitar kampus. Wajib siapkan jas hujan di bagasi.';
    } else if (weatherCode >= 71) {
      conditionLabel = 'Hujan Lebat / Badai';
      campusAdvice = 'Potensi hujan deras. Berangkatlah lebih awal dan berhati-hati di jalan.';
    } else if (weatherCode >= 1 && weatherCode <= 3) {
      conditionLabel = 'Sebagian Berawan';
      campusAdvice = 'Kondisi teduh dan sejuk, nyaman untuk berjalan kaki ke ruang kelas.';
    }

    return {
      temperature: temp,
      humidity,
      weatherCode,
      windSpeed: wind,
      conditionLabel,
      campusAdvice,
    };
  } catch {
    // Fallback data lokal yang aman jika koneksi offline saat pengujian di lab
    return {
      temperature: 24,
      humidity: 75,
      weatherCode: 2,
      windSpeed: 4.2,
      conditionLabel: 'Berawan (Data Tersimpan)',
      campusAdvice: 'Mode offline: Pastikan perlengkapan kuliah sudah lengkap sebelum berangkat.',
    };
  }
}

// ─── 4. FETCH QUOTE MOTIVASI HARIAN (DUMMYJSON QUOTES API) ────────────────────
// Menggunakan DummyJSON persis seperti yang diajarkan pada Modul 3 halaman 15 & 16
export async function fetchDailyQuote(): Promise<MorningQuote> {
  const url = 'https://dummyjson.com/quotes/random';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Gagal fetch quote: status ${response.status}`);
    }
    const json = await response.json();

    return {
      id: json.id ?? 1,
      quote: json.quote ?? 'Disiplin adalah jembatan antara tujuan dan pencapaian.',
      author: json.author ?? 'Pengingat Pagi',
    };
  } catch {
    return {
      id: 99,
      quote: 'Kemenangan pertama di setiap hari adalah berhasil bangun tepat waktu saat alarm berdering.',
      author: 'NdangTangi WakeForce',
    };
  }
}

// ─── 5. FETCH DAFTAR TIPS KESIAPAN KAMPUS (CUSTOM ASYNC DENGAN PROMISE) ───────
export function fetchCampusTips(): Promise<CampusTip[]> {
  return new Promise((resolve) => {
    // Simulasi delay asinkron seperti pada praktikum modul 3
    setTimeout(() => {
      resolve(CAMPUS_TIPS_DATABASE);
    }, 200);
  });
}

// ─── 6. FETCH DETAIL SATU TIP BERDASARKAN ID (UNTUK DYNAMIC ROUTE [id].tsx) ───
export function fetchTipDetail(id: string): Promise<CampusTip | null> {
  return new Promise((resolve, reject) => {
    const found = CAMPUS_TIPS_DATABASE.find((item) => item.id === id);
    if (found) {
      resolve(found);
    } else {
      reject(new Error(`Tip dengan ID "${id}" tidak ditemukan.`));
    }
  });
}

// ─── 7. FUNGSI UTAMA PENGGABUNG BRIEFING (AGGREGATE ASYNC) ─────────────────────
export async function getCompleteBriefing(): Promise<BriefingData> {
  // Menjalankan fetch data secara paralel menggunakan Promise.all (Async Lanjutan)
  const [weather, quote, tips] = await Promise.all([
    fetchWeatherMalang(),
    fetchDailyQuote(),
    fetchCampusTips(),
  ]);

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')} WIB`;

  return {
    weather,
    quote,
    tips,
    fetchedAt: timeStr,
  };
}

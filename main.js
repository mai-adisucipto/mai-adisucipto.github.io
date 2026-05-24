/* ===========================
   MASJID AL IKHLAS - MAIN.JS
   =========================== */

// ===========================
// INIT ON DOM READY
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  initLoadingScreen();
  initDarkMode();
  initNavbar();
  initHamburger();
  initClock();
  initPrayerTimes();
  initKajianGrid();
  initScrollReveal();
  initBackToTop();
  initMobileBottomNav();
  initSmoothScroll();
  initMobileMenuLinks();
});

// ===========================
// LOADING SCREEN
// ===========================
function initLoadingScreen() {
  const loading = document.getElementById('loading-screen');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loading.classList.add('hide');
      setTimeout(() => loading.remove(), 500);
    }, 800);
  });
  // Fallback
  setTimeout(() => {
    loading.classList.add('hide');
  }, 3000);
}

// ===========================
// DARK MODE
// ===========================
function initDarkMode() {
  const toggle = document.getElementById('dark-mode-toggle');
  const html = document.documentElement;

  // Check saved preference or system preference
  const saved = localStorage.getItem('darkMode');
  if (saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
  }

  toggle.addEventListener('click', () => {
    html.classList.toggle('dark');
    localStorage.setItem('darkMode', html.classList.contains('dark'));
    // Re-init icons after toggle
    setTimeout(() => lucide.createIcons(), 50);
  });
}

// ===========================
// NAVBAR SCROLL
// ===========================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const logoText = document.getElementById('logo-text');
  const logoSub = document.getElementById('logo-sub');

  function handleScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// ===========================
// HAMBURGER MENU
// ===========================
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  let isOpen = false;

  hamburger.addEventListener('click', () => {
    isOpen = !isOpen;
    mobileMenu.classList.toggle('open', isOpen);

    // Swap icon
    if (isOpen) {
      hamburgerIcon.setAttribute('data-lucide', 'x');
    } else {
      hamburgerIcon.setAttribute('data-lucide', 'menu');
    }
    lucide.createIcons();
  });
}

function initMobileMenuLinks() {
  const links = document.querySelectorAll('.mobile-nav-link');
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburgerIcon = document.getElementById('hamburger-icon');

  links.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburgerIcon.setAttribute('data-lucide', 'menu');
      lucide.createIcons();
    });
  });
}

// ===========================
// REALTIME CLOCK
// ===========================
function initClock() {
  const clockEl = document.getElementById('digital-clock');
  const dateEl = document.getElementById('masehi-date');
  const iconEl = document.getElementById('day-night-icon');

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  function update() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');

    if (clockEl) clockEl.textContent = `${h}:${m}:${s}`;

    if (dateEl) {
      const day = dayNames[now.getDay()];
      const date = now.getDate();
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      dateEl.textContent = `${day}, ${date} ${month} ${year}`;
    }

    // Day/night icon
    const hour = now.getHours();
    if (iconEl) {
      const isDay = hour >= 6 && hour < 18;
      iconEl.setAttribute('data-lucide', isDay ? 'sun' : 'moon');
      iconEl.className = `w-5 h-5 ${isDay ? 'text-gold-400' : 'text-blue-300'}`;
      lucide.createIcons();
    }
  }

  update();
  setInterval(update, 1000);
}

// ===========================
// PRAYER TIMES
// ===========================
const PRAYER_NAMES = {
  subuh: 'Subuh',
  terbit: 'Terbit',
  dzuhur: 'Dzuhur',
  ashar: 'Ashar',
  maghrib: 'Maghrib',
  isya: 'Isya'
};

const PRAYER_ICONS = {
  subuh: 'sunrise',
  terbit: 'sun',
  dzuhur: 'sun',
  ashar: 'cloud-sun',
  maghrib: 'sunset',
  isya: 'moon'
};

// Keys that are NOT actual shalat times (skip for active highlight)
const PRAYER_INFO_ONLY = ['terbit'];

async function initPrayerTimes() {
  const grid = document.getElementById('prayer-grid');
  const skeleton = document.getElementById('prayer-skeleton');
  const nextLabel = document.getElementById('next-prayer-label');
  const hijriEl = document.getElementById('hijri-date');

  // Try to get today's date
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  // Solo city id = 1733 (Surakarta)
  const CITY_ID = '1733';

  // Always set Hijri date (hardcoded for 24 Mei 2026 = 7 Dzulhijjah 1447H)
  if (hijriEl) hijriEl.textContent = getHijriDate();

  try {
    // Fetch prayer times
    const url = `https://api.myquran.com/v2/sholat/jadwal/${CITY_ID}/${year}/${month}/${day}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.status || !data.data) throw new Error('Invalid response');

    const jadwal = data.data.jadwal;

    const prayers = [
      { key: 'subuh',   time: jadwal.subuh },
      { key: 'terbit',  time: jadwal.terbit  || jadwal.syuruq || jadwal.sunrise || '05:38' },
      { key: 'dzuhur',  time: jadwal.dzuhur  || jadwal.dhuhr },
      { key: 'ashar',   time: jadwal.ashar   || jadwal.asr },
      { key: 'maghrib', time: jadwal.maghrib },
      { key: 'isya',    time: jadwal.isya    || jadwal.isha }
    ];

    renderPrayerCards(prayers, grid, skeleton, nextLabel);

  } catch (err) {
    console.warn('Prayer API failed, using fallback data:', err.message);
    // Fallback static data — waktu Solo, 24 Mei 2026
    const fallback = [
      { key: 'subuh',   time: '04:22' },
      { key: 'terbit',  time: '05:38' },
      { key: 'dzuhur',  time: '11:37' },
      { key: 'ashar',   time: '14:57' },
      { key: 'maghrib', time: '17:29' },
      { key: 'isya',    time: '18:42' }
    ];

    renderPrayerCards(fallback, grid, skeleton, nextLabel);
  }
}

function renderPrayerCards(prayers, grid, skeleton, nextLabel) {
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  // Only actual shalat keys (exclude info-only like terbit)
  const shalatPrayers = prayers.filter(p => !PRAYER_INFO_ONLY.includes(p.key));

  const shalatMins = shalatPrayers.map(p => {
    const [h, m] = p.time.split(':').map(Number);
    return h * 60 + m;
  });

  // Find active shalat index (among shalat-only list)
  let activeShalatIdx = null;
  for (let i = 0; i < shalatPrayers.length; i++) {
    if (currentMins >= shalatMins[i]) {
      activeShalatIdx = i;
    }
  }

  // Next shalat index
  let nextShalatIdx = null;
  if (activeShalatIdx !== null && activeShalatIdx < shalatPrayers.length - 1) {
    nextShalatIdx = activeShalatIdx + 1;
  } else {
    nextShalatIdx = 0;
  }

  // Build HTML — loop over ALL prayers (including terbit)
  let html = '';
  prayers.forEach((prayer) => {
    const isInfoOnly = PRAYER_INFO_ONLY.includes(prayer.key);
    // Map back: is this the active shalat?
    const shalatIdx = shalatPrayers.findIndex(p => p.key === prayer.key);
    const isActive = !isInfoOnly && shalatIdx === activeShalatIdx;

    html += `
      <div class="prayer-card ${isActive ? 'active' : ''} ${isInfoOnly ? 'info-only' : ''}">
        <div class="prayer-icon">
          <i data-lucide="${PRAYER_ICONS[prayer.key]}" class="w-4 h-4 ${isActive ? 'text-emerald-400' : isInfoOnly ? 'text-gold-300/60' : 'text-white/40'}"></i>
        </div>
        <p class="prayer-name">${PRAYER_NAMES[prayer.key]}</p>
        <p class="prayer-time">${prayer.time}</p>
        <span class="active-badge">
          <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
          Waktu Ini
        </span>
      </div>
    `;
  });

  grid.innerHTML = html;

  // Hide skeleton, show grid — 6 columns for 6 items
  grid.style.gridTemplateColumns = `repeat(${prayers.length}, 1fr)`;
  if (skeleton) skeleton.classList.add('hidden');
  grid.classList.remove('hidden');

  lucide.createIcons();

  // Update next prayer label
  if (nextLabel && nextPrayer !== null) {
    const np = prayers[nextPrayer];
    if (np) {
      const minsLeft = calcMinsLeft(np.time, new Date());
      if (minsLeft >= 0 && minsLeft < 1440) {
        const h = Math.floor(minsLeft / 60);
        const m = minsLeft % 60;
        const timeStr = h > 0 ? `${h}j ${m}m` : `${m} menit`;
        nextLabel.textContent = `${PRAYER_NAMES[np.key]} dalam ${timeStr}`;
      } else {
        nextLabel.textContent = `Berikutnya: ${PRAYER_NAMES[np.key]} · ${np.time}`;
      }
    }
  }

  // Update prayer highlight every minute
  setInterval(() => {
    const now2 = new Date();
    const cur = now2.getHours() * 60 + now2.getMinutes();
    let newActiveShalat = null;
    shalatMins.forEach((pm, i) => {
      if (cur >= pm) newActiveShalat = i;
    });

    let shalatCounter = 0;
    document.querySelectorAll('.prayer-card').forEach((card) => {
      if (card.classList.contains('info-only')) return;
      const isActive = shalatCounter === newActiveShalat;
      card.classList.toggle('active', isActive);
      const icon = card.querySelector('[data-lucide]');
      if (icon) icon.className = `w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-white/40'}`;
      shalatCounter++;
    });
    lucide.createIcons();
  }, 60000);
}

function calcMinsLeft(timeStr, now) {
  const [h, m] = timeStr.split(':').map(Number);
  const target = h * 60 + m;
  const current = now.getHours() * 60 + now.getMinutes();
  let diff = target - current;
  if (diff < 0) diff += 1440;
  return diff;
}

/**
 * Return Hijri date string.
 * Base: 24 Mei 2026 Masehi = 7 Dzulhijjah 1447 H
 * We calculate the offset from that anchor date.
 */
function getHijriDate() {
  const hijriMonths = [
    'Muharram', 'Safar', "Rabi'ul Awwal", "Rabi'ul Akhir",
    'Jumadal Ula', 'Jumadal Akhirah', 'Rajab', "Sya'ban",
    'Ramadhan', 'Syawwal', "Dzulqa'dah", 'Dzulhijjah'
  ];

  // Anchor: 24 Mei 2026 = 7 Dzulhijjah 1447
  const ANCHOR_MILADI = new Date(2026, 4, 24); // Month 4 = Mei (0-indexed)
  const ANCHOR_HIJRI = { day: 7, month: 12, year: 1447 }; // Dzulhijjah = bulan ke-12

  const today = new Date();
  // Strip time
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const anchorMidnight = new Date(ANCHOR_MILADI.getFullYear(), ANCHOR_MILADI.getMonth(), ANCHOR_MILADI.getDate());

  const diffDays = Math.round((todayMidnight - anchorMidnight) / 86400000);

  // Add diffDays to the Hijri anchor
  // Hijri months alternate 30 and 29 days; simplified average = 29.5306 days/month
  let hDay = ANCHOR_HIJRI.day + diffDays;
  let hMonth = ANCHOR_HIJRI.month;
  let hYear = ANCHOR_HIJRI.year;

  // Days per Hijri month (simplified pattern: 30,29,30,29,30,29,30,29,30,29,30,29/30)
  const daysInMonth = (m, y) => {
    const isLeap = [2,5,7,10,13,16,18,21,24,26,29].includes(((y - 1) % 30) + 1);
    if (m === 12) return isLeap ? 30 : 29;
    return m % 2 === 1 ? 30 : 29;
  };

  // Normalize forward
  while (hDay > daysInMonth(hMonth, hYear)) {
    hDay -= daysInMonth(hMonth, hYear);
    hMonth++;
    if (hMonth > 12) { hMonth = 1; hYear++; }
  }
  // Normalize backward
  while (hDay < 1) {
    hMonth--;
    if (hMonth < 1) { hMonth = 12; hYear--; }
    hDay += daysInMonth(hMonth, hYear);
  }

  return `${hDay} ${hijriMonths[hMonth - 1]} ${hYear} H`;
}

// Keep old name as alias for backwards compat
function formatHijri(date) { return getHijriDate(); }

// ===========================
// KAJIAN GRID
// ===========================
const kajianData = [
  {
    hari: 'Senin',
    waktu: 'Pukul 16.15 – 17.00',
    kitab: 'Kitab Al-Adab Al-Mufrad',
    ustadz: 'Ustadz Yunan Hilmi, Lc.',
    tipe: 'umum',
    pekan: ''
  },
  {
    hari: 'Selasa',
    waktu: "Ba'da Maghrib – Isya'",
    kitab: 'Kitab Ad-Durar An-Nafisah',
    ustadz: 'Ustadz Muhammad Alif, Lc., M.Pd.',
    tipe: 'umum',
    pekan: 'Pekan 1 & 3'
  },
  {
    hari: 'Selasa',
    waktu: "Ba'da Maghrib – Isya'",
    kitab: 'Kitab Mandzhumah Ha\'iyah',
    ustadz: 'Ustadz Adi Abdul Jabbar',
    tipe: 'umum',
    pekan: 'Pekan 2 & 4'
  },
  {
    hari: 'Rabu',
    waktu: "Ba'da Maghrib – Isya'",
    kitab: 'Kitab Bahjatul Qulubil Abrar',
    ustadz: 'Ustadz Abu Faza Ridwan, Lc., M.H.',
    tipe: 'umum',
    pekan: ''
  },
  {
    hari: 'Kamis',
    waktu: "Ba'da Maghrib – Isya'",
    kitab: 'Aqidah Ahlus Sunnah wal Jama\'ah',
    ustadz: 'Ustadz Abu Ubaid Rizqi, Lc., M.Pd.',
    tipe: 'umum',
    pekan: ''
  },
  {
    hari: 'Ahad',
    waktu: "Ba'da Maghrib – Isya'",
    kitab: 'Kitab Al-Wajiz',
    ustadz: 'Ustadz Hamzah Al-Fajri, S.Pd.',
    tipe: 'umum',
    pekan: 'Pekan 1, 3, 4'
  },
  {
    hari: 'Ahad',
    waktu: 'Pukul 09.00 – 10.00',
    kitab: 'Kitab Bekal Berhijrah',
    ustadz: 'Ustadzah Syaima Ummu Qonita',
    tipe: 'muslimah',
    pekan: 'Pekan 1 & 4'
  },
  {
    hari: 'Ahad',
    waktu: "Ba'da Maghrib – Selesai",
    kitab: 'Kajian Tematik Spesial',
    ustadz: 'Ustadz Ahmas Faiz Asifuddin, Lc., M.A.',
    tipe: 'umum',
    pekan: 'Pekan 2'
  },
  {
    hari: 'Ahad',
    waktu: 'Pukul 09.00 – 10.30',
    kitab: 'Kitab Para Shahabiyat Nabi',
    ustadz: 'Ustadzah Fitriyah Ummu Haitsam',
    tipe: 'muslimah',
    pekan: 'Pekan 3'
  }
];

const DAY_MAP = {
  0: 'Ahad',  // Sunday
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu'
};

function initKajianGrid() {
  const grid = document.getElementById('kajian-grid');
  if (!grid) return;

  const today = DAY_MAP[new Date().getDay()];
  let html = '';

  kajianData.forEach((k, index) => {
    const isToday = k.hari === today;
    const badgeClass = k.tipe === 'muslimah' ? 'badge-muslimah' : 'badge-umum';
    const badgeText = k.tipe === 'muslimah' ? 'Kajian Muslimah' : 'Kajian Umum';
    const badgeIcon = k.tipe === 'muslimah' ? 'heart' : 'users';

    html += `
      <div class="kajian-card ${isToday ? 'today' : ''}" style="animation-delay:${index * 0.06}s">
        <!-- Header -->
        <div class="flex items-start justify-between gap-2 mb-4">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="kajian-day-badge">
              <span class="today-indicator"></span>
              ${k.hari}
            </span>
            ${isToday ? '<span class="today-badge"><i data-lucide="zap" class="w-2.5 h-2.5"></i> Hari Ini</span>' : ''}
          </div>
          <span class="${badgeClass}">
            <i data-lucide="${badgeIcon}" class="w-2.5 h-2.5"></i>
            ${badgeText}
          </span>
        </div>

        <!-- Pekan (if any) -->
        ${k.pekan ? `
        <div class="flex items-center gap-1.5 mb-2">
          <i data-lucide="calendar" class="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0"></i>
          <span class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">${k.pekan}</span>
        </div>` : ''}

        <!-- Time -->
        <div class="flex items-center gap-1.5 mb-3">
          <i data-lucide="clock" class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0"></i>
          <span class="text-xs text-gray-500 dark:text-gray-400">${k.waktu}</span>
        </div>

        <!-- Divider -->
        <div class="h-px bg-gray-100 dark:bg-gray-700/50 mb-3"></div>

        <!-- Kitab -->
        <div class="flex items-start gap-2 mb-3">
          <div class="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <i data-lucide="book-open" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"></i>
          </div>
          <div>
            <p class="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Kitab / Materi</p>
            <p class="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">${k.kitab}</p>
          </div>
        </div>

        <!-- Ustadz -->
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <i data-lucide="user" class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500"></i>
          </div>
          <div>
            <p class="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Pemateri</p>
            <p class="text-xs font-medium text-gray-700 dark:text-gray-300">${k.ustadz}</p>
          </div>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
  lucide.createIcons();

  // Scroll reveal for cards
  const cards = grid.querySelectorAll('.kajian-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s, box-shadow 0.3s ease, border-color 0.3s ease`;
  });

  // Observer for kajian cards
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => observer.observe(card));
}

// ===========================
// COPY REKENING
// ===========================
function copyRekening() {
  const rekening = document.getElementById('rekening-number').textContent.trim();
  navigator.clipboard.writeText(rekening.replace(/-/g, '')).then(() => {
    showToast('Nomor rekening berhasil disalin ✓');
  }).catch(() => {
    // Fallback
    const el = document.createElement('textarea');
    el.value = rekening.replace(/-/g, '');
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast('Nomor rekening berhasil disalin ✓');
  });
}

// ===========================
// TOAST
// ===========================
function showToast(message) {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toast-message');
  if (!toast || !msg) return;

  msg.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ===========================
// SCROLL REVEAL
// ===========================
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

// ===========================
// BACK TO TOP
// ===========================
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===========================
// MOBILE BOTTOM NAV ACTIVE
// ===========================
function initMobileBottomNav() {
  const links = document.querySelectorAll('.mobile-bottom-link');
  const sections = document.querySelectorAll('section[id]');

  function updateActive() {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 150;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    links.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === current);
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
}

// ===========================
// SMOOTH SCROLL
// ===========================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ===========================
// DOWNLOAD QRIS
// ===========================
window.downloadQris = async function(e) {
  // Jika dibuka di server (http/https), kita bisa pakai fetch untuk memaksa download
  if (window.location.protocol.startsWith('http')) {
    e.preventDefault();
    try {
      const url = 'assets/images/qris.png';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = 'QRIS_Masjid_Al_Ikhlas.png';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      
      if (typeof showToast === 'function') showToast('Berhasil mengunduh QRIS!');
    } catch (error) {
      console.error('Error downloading QRIS:', error);
      // Fallback ke default behavior
      window.open('assets/images/qris.png', '_blank');
    }
  } else {
    // Jika dibuka via file:// (lokal komputer), browser memblokir fetch.
    // Kita biarkan tag <a> bekerja secara native (mungkin akan membuka gambar di tab baru).
    // Tidak perlu memanggil e.preventDefault()
  }
};

// ===========================
// EXPOSE GLOBALS
// ===========================
window.copyRekening = copyRekening;

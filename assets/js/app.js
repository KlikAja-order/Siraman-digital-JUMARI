/**
 * Main Application Script - Siraman Digital Portal Publik
 */

import { initTheme, toggleTheme } from "./utils/theme.js";
import { getAllDocuments, getSingleDocument, createDocument } from "./services/firestore-service.js";
import { uploadImage } from "./services/storage-service.js";
import { formatDate, sanitizeInput, showToast, truncateText } from "./utils/helpers.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Inisialisasi Theme Engine (Dark/Light)
  initTheme();
  
  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  // 2. Mobile Nav Toggle
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // 3. Load Data dari Firestore
  loadSettings();
  loadProfile();
  loadAnnouncements();
  loadPrograms();
  loadNews();
  loadGallery();
  loadEvents();
  loadFAQ();

  // 4. Handle Form Aspirasi Submit
  const formAspirasi = document.getElementById("form-aspirasi");
  if (formAspirasi) {
    formAspirasi.addEventListener("submit", handleAspirasiSubmit);
  }
});

// Load Settings & General Branding
async function loadSettings() {
  try {
    const settings = await getSingleDocument("settings", "general");
    if (settings) {
      if (settings.heroTitle) document.getElementById("hero-title").innerText = settings.heroTitle;
      if (settings.heroSubtitle) document.getElementById("hero-subtitle").innerText = settings.heroSubtitle;
      if (settings.address) document.getElementById("contact-address").innerText = settings.address;
      if (settings.phone) document.getElementById("contact-phone").innerText = settings.phone;
      if (settings.email) document.getElementById("contact-email").innerText = settings.email;
      if (settings.footerText) document.getElementById("footer-text").innerText = settings.footerText;
      if (settings.logoUrl) document.getElementById("site-logo").src = settings.logoUrl;
    }
  } catch (err) {
    console.warn("Using default static settings.");
  }
}

// Load Profil & Sambutan Lurah
async function loadProfile() {
  try {
    const profile = await getSingleDocument("profile", "kelurahan");
    if (profile) {
      if (profile.namaLurah) document.getElementById("nama-lurah").innerText = profile.namaLurah;
      if (profile.sambutanLurah) document.getElementById("sambutan-lurah").innerText = profile.sambutanLurah;
      if (profile.fotoLurah) document.getElementById("foto-lurah").src = profile.fotoLurah;
      if (profile.deskripsi) document.getElementById("deskripsi-kelurahan").innerHTML = sanitizeInput(profile.deskripsi);
      if (profile.visi) document.getElementById("visi-text").innerText = profile.visi;
      
      if (profile.misi && Array.isArray(profile.misi)) {
        const misiList = document.getElementById("misi-list");
        misiList.innerHTML = profile.misi.map(m => `<li>${sanitizeInput(m)}</li>`).join("");
      }
    }
  } catch (err) {
    console.error("Error loading profile:", err);
  }
}

// Load Pengumuman Utama
async function loadAnnouncements() {
  try {
    const announcements = await getAllDocuments("announcements");
    const activeAlert = announcements.find(a => a.active === true);
    const container = document.getElementById("announcement-container");
    
    if (activeAlert && container) {
      container.innerHTML = `
        <div class="announcement-bar fade-in">
          <strong>📢 Pengumuman:</strong> ${sanitizeInput(activeAlert.title)} - ${sanitizeInput(activeAlert.content)}
        </div>
      `;
    }
  } catch (err) {
    console.warn("No active announcement.");
  }
}

// Load Program Kerja
async function loadPrograms() {
  const container = document.getElementById("program-container");
  try {
    const programs = await getAllDocuments("programs");
    if (!programs.length) {
      container.innerHTML = "<p>Belum ada program kerja.</p>";
      return;
    }
    container.innerHTML = programs.map(p => `
      <div class="glass-panel card fade-in">
        <span class="badge badge-info">${sanitizeInput(p.status || 'Berjalan')}</span>
        <h4 style="margin: 0.75rem 0 0.5rem;">${sanitizeInput(p.title)}</h4>
        <p style="font-size: 0.9rem; color: var(--text-secondary);">${sanitizeInput(p.description)}</p>
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = "<p>Gagal memuat program kerja.</p>";
  }
}

// Load Berita
async function loadNews() {
  const container = document.getElementById("news-container");
  try {
    const news = await getAllDocuments("news");
    if (!news.length) {
      container.innerHTML = "<p>Belum ada berita terbaru.</p>";
      return;
    }
    container.innerHTML = news.map(n => `
      <article class="glass-panel card fade-in" style="padding: 0; overflow: hidden;">
        <img src="${n.imageUrl || 'https://via.placeholder.com/400x200'}" alt="${sanitizeInput(n.title)}" style="width: 100%; height: 180px; object-fit: cover;" />
        <div style="padding: 1.25rem;">
          <span style="font-size: 0.75rem; color: var(--text-muted);">${formatDate(n.createdAt)}</span>
          <h4 style="margin: 0.5rem 0;">${sanitizeInput(n.title)}</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">${truncateText(sanitizeInput(n.content), 90)}</p>
        </div>
      </article>
    `).join("");
  } catch (err) {
    container.innerHTML = "<p>Gagal memuat berita.</p>";
  }
}

// Load Galeri
async function loadGallery() {
  const container = document.getElementById("gallery-container");
  try {
    const items = await getAllDocuments("gallery");
    if (!items.length) {
      container.innerHTML = "<p>Belum ada galeri foto.</p>";
      return;
    }
    container.innerHTML = items.map(g => `
      <div class="glass-panel card fade-in" style="padding: 0.5rem;">
        <img src="${g.imageUrl}" alt="${sanitizeInput(g.title)}" style="width: 100%; height: 150px; object-fit: cover; border-radius: var(--radius-sm);" />
        <p style="font-size: 0.8rem; text-align: center; margin-top: 0.4rem; font-weight: 500;">${sanitizeInput(g.title)}</p>
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = "<p>Gagal memuat galeri.</p>";
  }
}

// Load Jadwal Kegiatan
async function loadEvents() {
  const container = document.getElementById("events-container");
  try {
    const events = await getAllDocuments("events");
    if (!events.length) {
      container.innerHTML = "<p class='text-center'>Belum ada jadwal kegiatan terencana.</p>";
      return;
    }
    container.innerHTML = `
      <ul style="list-style: none;">
        ${events.map(e => `
          <li style="padding: 1rem 0; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <strong>${sanitizeInput(e.title)}</strong>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">${sanitizeInput(e.location)}</p>
            </div>
            <span class="badge badge-warning" style="align-self: center;">${formatDate(e.eventDate)}</span>
          </li>
        `).join("")}
      </ul>
    `;
  } catch (err) {
    container.innerHTML = "<p>Gagal memuat jadwal kegiatan.</p>";
  }
}

// Load FAQ
async function loadFAQ() {
  const container = document.getElementById("faq-container");
  try {
    const faqs = await getAllDocuments("faq");
    if (!faqs.length) {
      container.innerHTML = "<p>Belum ada FAQ.</p>";
      return;
    }
    container.innerHTML = faqs.map(f => `
      <details class="glass-panel card" style="margin-bottom: 1rem; cursor: pointer;">
        <summary style="font-weight: 600; font-size: 1rem;">${sanitizeInput(f.question)}</summary>
        <p style="margin-top: 0.75rem; color: var(--text-secondary); font-size: 0.95rem;">${sanitizeInput(f.answer)}</p>
      </details>
    `).join("");
  } catch (err) {
    container.innerHTML = "<p>Gagal memuat FAQ.</p>";
  }
}

// Handler Submit Form Aspirasi Warga
async function handleAspirasiSubmit(e) {
  e.preventDefault();
  const btnSubmit = document.getElementById("btn-submit-aspirasi");
  btnSubmit.disabled = true;
  btnSubmit.innerText = "Mengirim...";

  try {
    const nama = document.getElementById("aspirasi-nama").value.trim();
    const padukuhan = document.getElementById("aspirasi-padukuhan").value.trim();
    const phone = document.getElementById("aspirasi-phone").value.trim();
    const kategori = document.getElementById("aspirasi-kategori").value;
    const pesan = document.getElementById("aspirasi-pesan").value.trim();
    const fotoInput = document.getElementById("aspirasi-foto");

    let imageUrl = "";
    if (fotoInput.files && fotoInput.files[0]) {
      imageUrl = await uploadImage(fotoInput.files[0], "aspirations");
    }

    const payload = {
      name: sanitizeInput(nama),
      padukuhan: sanitizeInput(padukuhan),
      phone: sanitizeInput(phone),
      category: kategori,
      message: sanitizeInput(pesan),
      imageUrl: imageUrl,
      status: "Pending"
    };

    await createDocument("aspirations", payload);

    showToast("Aspirasi Anda berhasil dikirim! Terima kasih.", "success");
    document.getElementById("form-aspirasi").reset();
  } catch (err) {
    console.error("Gagal mengirim aspirasi:", err);
    showToast("Gagal mengirim aspirasi. Silakan coba lagi.", "error");
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerText = "Kirim Aspirasi";
  }
}
// Append di bagian bawah file assets/js/app.js

// 5. Registrasi PWA Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then((reg) => {
        console.log("PWA Service Worker terdaftar sukses! Scope:", reg.scope);
      })
      .catch((err) => {
        console.error("Registrasi Service Worker gagal:", err);
      });
  });
}

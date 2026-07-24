/**
 * Admin Dashboard Engine - Siraman Digital
 * Handles Firebase Auth, Navigation, and CRUD Operations
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  updatePassword 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { firebaseConfig } from "./config/firebase-config.js";
import { initTheme, toggleTheme } from "./utils/theme.js";
import { getAllDocuments, createDocument, deleteDocument } from "./services/firestore-service.js";
import { uploadImage } from "./services/storage-service.js";
import { formatDate, sanitizeInput, showToast } from "./utils/helpers.js";

// Init Firebase App & Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let currentModul = "dashboard";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  document.getElementById("theme-toggle-btn")?.addEventListener("click", toggleTheme);

  // Auth Listener
  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.getElementById("login-overlay").style.display = "none";
      document.getElementById("admin-user-info").innerText = `Terhubung: ${user.email}`;
      loadDashboardStats();
    } else {
      document.getElementById("login-overlay").style.display = "flex";
    }
  });

  // Event Handlers
  document.getElementById("form-login")?.addEventListener("submit", handleLogin);
  document.getElementById("btn-logout")?.addEventListener("click", () => signOut(auth));
  document.getElementById("form-change-password")?.addEventListener("submit", handleChangePassword);
  
  // Navigation Listener
  document.querySelectorAll(".nav-modul").forEach((elem) => {
    elem.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".nav-modul").forEach(a => a.classList.remove("active"));
      elem.classList.add("active");
      
      currentModul = elem.dataset.modul;
      switchModul(currentModul);
    });
  });

  // Modal CRUD Listeners
  document.getElementById("btn-add-new")?.addEventListener("click", () => openModalForm());
  document.getElementById("btn-close-modal")?.addEventListener("click", closeModalForm);
  document.getElementById("btn-cancel-form")?.addEventListener("click", closeModalForm);
  document.getElementById("dynamic-form")?.addEventListener("submit", handleFormSubmit);
});

// Login Handler
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const pass = document.getElementById("login-password").value;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    showToast("Login Berhasil!", "success");
    
    // Cek jika menggunakan password default "admin123" -> Paksa ganti password
    if (pass === "admin123") {
      document.getElementById("modal-change-password").classList.add("active");
    }
  } catch (err) {
    showToast("Email atau Password salah!", "error");
  }
}

// Change Password Handler
async function handleChangePassword(e) {
  e.preventDefault();
  const newPass = document.getElementById("new-password").value;
  try {
    if (auth.currentUser) {
      await updatePassword(auth.currentUser, newPass);
      showToast("Password berhasil diperbarui!", "success");
      document.getElementById("modal-change-password").classList.remove("active");
    }
  } catch (err) {
    showToast("Gagal memperbarui password: " + err.message, "error");
  }
}

// Switch View Modul
async function switchModul(modulName) {
  const sectionDashboard = document.getElementById("section-dashboard");
  const sectionCrud = document.getElementById("section-crud");
  
  if (modulName === "dashboard") {
    sectionDashboard.style.display = "block";
    sectionCrud.style.display = "none";
    loadDashboardStats();
    return;
  }

  sectionDashboard.style.display = "none";
  sectionCrud.style.display = "block";
  document.getElementById("crud-title").innerText = `Kelola Data: ${modulName.toUpperCase()}`;
  
  loadTableData(modulName);
}

// Load Stats
async function loadDashboardStats() {
  try {
    const news = await getAllDocuments("news");
    const aspirations = await getAllDocuments("aspirations");
    const programs = await getAllDocuments("programs");
    const gallery = await getAllDocuments("gallery");

    document.getElementById("stat-news").innerText = news.length;
    document.getElementById("stat-aspirations").innerText = aspirations.length;
    document.getElementById("stat-programs").innerText = programs.length;
    document.getElementById("stat-gallery").innerText = gallery.length;
  } catch (err) {
    console.error("Gagal memuat stats dashboard:", err);
  }
}

// Render Table Data Dynamically
async function loadTableData(collectionName) {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem;">Memuat data...</td></tr>`;

  try {
    const docs = await getAllDocuments(collectionName);
    if (!docs.length) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem;">Belum ada data pada modul ini.</td></tr>`;
      return;
    }

    tbody.innerHTML = docs.map((item, index) => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 1rem;">${index + 1}</td>
        <td style="padding: 1rem;"><strong>${sanitizeInput(item.title || item.name || item.question || 'Data')}</strong></td>
        <td style="padding: 1rem;">${formatDate(item.createdAt)}</td>
        <td style="padding: 1rem; text-align: right;">
          <button class="btn btn-danger btn-delete" data-id="${item.id}" style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">Hapus</button>
        </td>
      </tr>
    `).join("");

    // Attach Delete Event
    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
          await deleteDocument(collectionName, btn.dataset.id);
          showToast("Data berhasil dihapus.", "success");
          loadTableData(collectionName);
        }
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem;">Gagal memuat data.</td></tr>`;
  }
}

// Open Dynamic Modal Form
function openModalForm() {
  const container = document.getElementById("form-fields-container");
  document.getElementById("modal-form-title").innerText = `Tambah Data ${currentModul.toUpperCase()}`;

  // Direct Schema Generator based on current active module
  if (currentModul === "news" || currentModul === "announcements") {
    container.innerHTML = `
      <div class="form-group" style="margin-bottom: 1rem;">
        <label class="form-label">Judul</label>
        <input type="text" id="field-title" class="form-input" required />
      </div>
      <div class="form-group" style="margin-bottom: 1rem;">
        <label class="form-label">Konten / Isi</label>
        <textarea id="field-content" class="form-input" rows="4" required></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Gambar Header</label>
        <input type="file" id="field-image" class="form-input" accept="image/*" />
      </div>
    `;
  } else if (currentModul === "faq") {
    container.innerHTML = `
      <div class="form-group" style="margin-bottom: 1rem;">
        <label class="form-label">Pertanyaan</label>
        <input type="text" id="field-title" class="form-input" required />
      </div>
      <div class="form-group">
        <label class="form-label">Jawaban</label>
        <textarea id="field-content" class="form-input" rows="3" required></textarea>
      </div>
    `;
  } else {
    // Default Schema for Gallery / Programs / Events
    container.innerHTML = `
      <div class="form-group" style="margin-bottom: 1rem;">
        <label class="form-label">Judul / Nama Program</label>
        <input type="text" id="field-title" class="form-input" required />
      </div>
      <div class="form-group" style="margin-bottom: 1rem;">
        <label class="form-label">Keterangan / Deskripsi</label>
        <textarea id="field-content" class="form-input" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">File Gambar (Opsional)</label>
        <input type="file" id="field-image" class="form-input" accept="image/*" />
      </div>
    `;
  }

  document.getElementById("modal-crud").classList.add("active");
}

function closeModalForm() {
  document.getElementById("modal-crud").classList.remove("active");
}

// Handle Generic Form Submit
async function handleFormSubmit(e) {
  e.preventDefault();
  const btnSave = document.getElementById("btn-save-form");
  btnSave.disabled = true;
  btnSave.innerText = "Menyimpan...";

  try {
    const titleVal = document.getElementById("field-title")?.value.trim();
    const contentVal = document.getElementById("field-content")?.value.trim();
    const imageInput = document.getElementById("field-image");

    let imageUrl = "";
    if (imageInput && imageInput.files[0]) {
      imageUrl = await uploadImage(imageInput.files[0], currentModul);
    }

    const payload = {
      title: titleVal ? sanitizeInput(titleVal) : "",
      content: contentVal ? sanitizeInput(contentVal) : "",
      description: contentVal ? sanitizeInput(contentVal) : "",
      question: titleVal ? sanitizeInput(titleVal) : "",
      answer: contentVal ? sanitizeInput(contentVal) : "",
      imageUrl: imageUrl
    };

    await createDocument(currentModul, payload);
    showToast("Data berhasil disimpan!", "success");
    closeModalForm();
    loadTableData(currentModul);
  } catch (err) {
    showToast("Gagal menyimpan data.", "error");
  } finally {
    btnSave.disabled = false;
    btnSave.innerText = "Simpan Data";
  }
}

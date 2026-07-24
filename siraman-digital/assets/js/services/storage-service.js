/**
 * Storage Service - Alternative Base64 Image Handler (100% Free / No Firebase Storage Required)
 */

import { compressImage } from "./image-compressor.js";

/**
 * Mengubah file gambar menjadi Base64 Data URL yang sudah dikompres
 * @param {File} file - File gambar dari input form
 * @param {string} folder - (Opsional) Kategori
 * @returns {Promise<string>} Base64 String URL
 */
export async function uploadImage(file, folder = "general") {
  if (!file) return "";

  try {
    // 1. Kompres gambar terlebih dahulu agar ukurannya sangat kecil (< 200KB)
    const compressedFile = await compressImage(file, 800, 0.7);

    // 2. Ubah file hasil kompresi menjadi string Base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(compressedFile);
    });
  } catch (error) {
    console.error("Gagal memproses gambar:", error);
    throw error;
  }
}

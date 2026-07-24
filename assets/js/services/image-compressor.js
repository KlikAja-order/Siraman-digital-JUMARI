/**
 * Utility Kompresi Gambar Otomatis (Canvas Client-Side)
 * Mengubah gambar besar menjadi ukuran efisien (WebP/JPEG, max width 1200px)
 */

export const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/image.*/)) {
      return reject(new Error("File yang dipilih harus berupa gambar."));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scaling proporsional
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert ke Blob/File terkompresi
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Gagal mengompres gambar."));
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: "image/webp",
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          "image/webp",
          quality
        );
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
};

/**
 * Theme Engine - Siraman Digital
 * Mengelola Dark Mode & Light Mode
 */

const THEME_KEY = 'siraman_theme_preference';

export const initTheme = () => {
  const savedTheme = localStorage.getItem(THEME_KEY);
  
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    // Cek preferensi sistem HP/Laptop pengguna
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }
};

export const setTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem(THEME_KEY, theme);
  updateThemeIcon(theme);
};

export const toggleTheme = () => {
  const currentTheme = localStorage.getItem(THEME_KEY) || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
};

const updateThemeIcon = (theme) => {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.innerHTML = theme === 'dark' 
      ? '<span class="theme-icon">☀️</span>' 
      : '<span class="theme-icon">🌙</span>';
  }
};

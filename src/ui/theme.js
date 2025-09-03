/**
 * Applies the specified theme (light or dark) to the document.
 * @param {string} theme - The theme to apply ('light' or 'dark').
 */
export function applyTheme(theme) {
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (theme === "dark") {
    document.body.classList.add("dark");
    themeColorMeta.setAttribute("content", "#0f0f0f");
  } else {
    document.body.classList.remove("dark");
    themeColorMeta.setAttribute("content", "#ffffff");
  }
}

/**
 * Retrieves the saved theme from localStorage.
 * @returns {string} The saved theme, or 'light' as a default.
 */
export function getSavedTheme() {
  return localStorage.getItem("theme") || "light";
}

/**
 * Saves the selected theme to localStorage.
 * @param {string} theme - The theme to save ('light' or 'dark').
 */
export function saveTheme(theme) {
  localStorage.setItem("theme", theme);
}

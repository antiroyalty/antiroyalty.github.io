(() => {
  const key = 'theme';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = localStorage.getItem(key) || (prefersDark ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', initial === 'dark');

  window.toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(key, isDark ? 'dark' : 'light');
  };
})();
(() => {
  const key = 'theme';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = localStorage.getItem(key) || (prefersDark ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', initial === 'dark');

  window.toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(key, isDark ? 'dark' : 'light');
  };

  // Retro loading animation
  let isLoading = false;
  
  window.showRetroLoading = () => {
    if (isLoading) return;
    isLoading = true;
    
    const loader = document.createElement('div');
    loader.className = 'retro-loading active';
    loader.innerHTML = `
      <div>
        <div class="loading-text">Loading...</div>
        <div class="loading-bar">
          <div class="loading-progress"></div>
        </div>
        <div class="loading-text">Please wait...</div>
      </div>
    `;
    
    document.body.appendChild(loader);
    
    setTimeout(() => {
      loader.classList.remove('active');
      setTimeout(() => {
        document.body.removeChild(loader);
        isLoading = false;
      }, 300);
    }, 2000);
  };

  // Visitor counter
  const visitorCounterKey = 'humanVisitorCount';
  let count = parseInt(localStorage.getItem(visitorCounterKey) || '0');
  
  // Increment on page load (with some randomness to feel more authentic)
  if (Math.random() > 0.1) { // 90% chance to increment
    count++;
    localStorage.setItem(visitorCounterKey, count.toString());
  }
  
  window.getVisitorCount = () => count;
  
  // Add last updated timestamp
  window.getLastUpdated = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // Auto-trigger loading on navigation (optional)
  document.addEventListener('DOMContentLoaded', () => {
    // Uncomment to show loading animation on page load
    // showRetroLoading();
  });
})();
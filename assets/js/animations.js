export function initCursor() {
  const ring = Object.assign(document.createElement('div'), { className: 'cursor-ring' });
  const dot  = Object.assign(document.createElement('div'), { className: 'cursor-dot'  });
  document.body.append(ring, dot);

  window.addEventListener('pointermove', e => {
    ring.style.left = dot.style.left = e.clientX + 'px';
    ring.style.top  = dot.style.top  = e.clientY + 'px';
  });

  document.querySelectorAll('a,button').forEach(el => {
    el.addEventListener('pointerenter', () => { ring.style.width = ring.style.height = '48px'; ring.style.opacity = '0.8'; });
    el.addEventListener('pointerleave', () => { ring.style.width = ring.style.height = '32px'; ring.style.opacity = '0.5'; });
  });
}

export function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
}

export function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  window.addEventListener('scroll', () => {
    const offset = window.scrollY * 0.4;
    hero.style.backgroundPosition = `center ${offset}px`;
  });
}
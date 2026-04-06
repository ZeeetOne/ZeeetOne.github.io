/**
 * Project card interactions: 3D tilt, mouse-following glow, click-to-open.
 */

export function initCards(isMobile) {
  const cards = document.querySelectorAll('.project-card');

  if (!cards.length) return;

  cards.forEach(card => {
    // Click to open project URL
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking the direct link
      if (e.target.closest('.project-link')) return;

      const url = card.dataset.url;
      if (url) window.open(url, '_blank', 'noopener');
    });

    if (!isMobile) {
      // Mouse glow effect — update CSS custom properties
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    }
  });

  // Initialize VanillaTilt on desktop
  if (!isMobile && typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(cards, {
      max: 12,
      speed: 400,
      glare: true,
      'max-glare': 0.15,
      perspective: 1000,
      gyroscope: false
    });
  }
}

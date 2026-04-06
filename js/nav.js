/**
 * Navigation: sticky nav, active section tracking, smart-hide, mobile hamburger.
 */

export function initNav() {
  const nav = document.getElementById('main-nav');
  const toggle = nav.querySelector('.nav-toggle');
  const links = nav.querySelectorAll('.nav-links a');
  const navLinks = nav.querySelector('.nav-links');

  if (!nav) return;

  let lastScrollY = 0;
  let ticking = false;

  // Scroll handler — smart hide + background change
  function onScroll() {
    const currentY = window.scrollY;

    // Add/remove scrolled class
    if (currentY > 50) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }

    // Smart hide: hide on scroll down, show on scroll up
    if (currentY > lastScrollY && currentY > 300) {
      nav.classList.add('nav-hidden');
    } else {
      nav.classList.remove('nav-hidden');
    }

    lastScrollY = currentY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // Active section tracking
  if (typeof ScrollTrigger !== 'undefined') {
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (self.isActive) {
            links.forEach(link => link.classList.remove('active'));
            const activeLink = nav.querySelector(`a[href="#${section.id}"]`);
            if (activeLink) activeLink.classList.add('active');
          }
        }
      });
    });
  }

  // Smooth scroll on nav link click
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        // Close mobile menu first
        nav.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');

        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Logo click — scroll to top
  const logo = nav.querySelector('.nav-logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Mobile hamburger toggle
  if (toggle) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('nav-open') &&
          !navLinks.contains(e.target) &&
          !toggle.contains(e.target)) {
        nav.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

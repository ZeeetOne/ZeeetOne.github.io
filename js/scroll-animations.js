/**
 * GSAP ScrollTrigger animations for all sections.
 * Assumes gsap and ScrollTrigger are loaded globally via CDN.
 */

export function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const defaults = {
    duration: 0.8,
    ease: 'power2.out'
  };

  // Generic reveal (fade up)
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.fromTo(el, {
      y: 40,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      ...defaults,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true
      }
    });
  });

  // Reveal from left
  gsap.utils.toArray('.reveal-left').forEach(el => {
    gsap.fromTo(el, {
      x: -60,
      opacity: 0
    }, {
      x: 0,
      opacity: 1,
      ...defaults,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true
      }
    });
  });

  // Reveal from right
  gsap.utils.toArray('.reveal-right').forEach(el => {
    gsap.fromTo(el, {
      x: 60,
      opacity: 0
    }, {
      x: 0,
      opacity: 1,
      ...defaults,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true
      }
    });
  });

  // Stagger children
  gsap.utils.toArray('.reveal-stagger').forEach(container => {
    gsap.fromTo(container.children, {
      y: 30,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: container,
        start: 'top 85%',
        once: true
      }
    });
  });

  // Skill bars fill animation
  gsap.utils.toArray('.skill-bar-fill').forEach(bar => {
    const percent = getComputedStyle(bar).getPropertyValue('--percent');
    gsap.fromTo(bar, {
      width: '0%'
    }, {
      width: percent,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: bar,
        start: 'top 90%',
        once: true
      }
    });
  });

  // Project cards — scale in with back easing
  gsap.utils.toArray('.project-card').forEach((card, i) => {
    gsap.fromTo(card, {
      scale: 0.85,
      opacity: 0,
      y: 30
    }, {
      scale: 1,
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'back.out(1.4)',
      delay: i * 0.1,
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        once: true
      }
    });
  });

  // Timeline items — alternating slide directions
  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    const fromX = i % 2 === 0 ? -60 : 60;
    gsap.fromTo(item, {
      x: fromX,
      opacity: 0
    }, {
      x: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
        once: true
      }
    });
  });

  // Blog cards fade in
  gsap.utils.toArray('.blog-card').forEach((card, i) => {
    gsap.fromTo(card, {
      y: 30,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out',
      delay: i * 0.1,
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        once: true
      }
    });
  });

  // Section title wipe-in effect
  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.fromTo(title, {
      clipPath: 'inset(0 100% 0 0)',
      opacity: 0
    }, {
      clipPath: 'inset(0 0% 0 0)',
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
        once: true
      }
    });
  });

  // Hero content parallax on scroll (fade out as you scroll down)
  gsap.to('.hero-content', {
    y: -80,
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  // Scroll indicator fade out
  gsap.to('.scroll-indicator', {
    opacity: 0,
    y: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: '10% top',
      end: '30% top',
      scrub: true
    }
  });

  // Social links stagger
  gsap.fromTo('.social-links .social-icon', {
    scale: 0,
    opacity: 0
  }, {
    scale: 1,
    opacity: 1,
    duration: 0.5,
    ease: 'back.out(2)',
    stagger: 0.1,
    scrollTrigger: {
      trigger: '.social-links',
      start: 'top 88%',
      once: true
    }
  });
}

/**
 * App entry point — orchestrates all modules and creative effects.
 */
import { initHero } from './three-hero.js';
import { initScrollAnimations } from './scroll-animations.js';
import { initNav } from './nav.js';
import { initCards } from './cards.js';
import { hideLoader } from './loader.js';

const isMobile = window.matchMedia('(max-width: 768px)').matches || navigator.maxTouchPoints > 0;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================
// Text Scramble Effect
// ============================================
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`01';
    this.frameRequest = null;
  }

  setText(newText) {
    const length = newText.length;
    const queue = [];

    for (let i = 0; i < length; i++) {
      queue.push({
        char: newText[i],
        start: Math.floor(Math.random() * 30),
        end: Math.floor(Math.random() * 30) + 30
      });
    }

    let frame = 0;
    const update = () => {
      let output = '';
      let complete = 0;

      for (let i = 0; i < queue.length; i++) {
        const { char, start, end } = queue[i];

        if (frame >= end) {
          complete++;
          output += char;
        } else if (frame >= start) {
          output += this.chars[Math.floor(Math.random() * this.chars.length)];
        } else {
          output += '';
        }
      }

      this.el.textContent = output;

      if (complete < queue.length) {
        this.frameRequest = requestAnimationFrame(update);
        frame++;
      }
    };

    this.frameRequest = requestAnimationFrame(update);
  }

  cancel() {
    if (this.frameRequest) cancelAnimationFrame(this.frameRequest);
  }
}

// ============================================
// Magnetic Button Effect
// ============================================
function initMagneticButtons() {
  if (isMobile) return;

  const magnetics = document.querySelectorAll('.magnetic');

  magnetics.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      // Move element toward cursor (max ~8px)
      const moveX = dx * 0.2;
      const moveY = dy * 0.2;

      el.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      el.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      setTimeout(() => { el.style.transition = ''; }, 400);
    });
  });
}

// ============================================
// Cursor Trail
// ============================================
function initCursorTrail() {
  if (isMobile || prefersReducedMotion) return;

  const canvas = document.getElementById('cursor-trail');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const trail = [];
  const maxTrail = 18;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', (e) => {
    trail.push({ x: e.clientX, y: e.clientY, life: 1 });
    if (trail.length > maxTrail) trail.shift();
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = trail.length - 1; i >= 0; i--) {
      const point = trail[i];
      point.life -= 0.04;

      if (point.life <= 0) {
        trail.splice(i, 1);
        continue;
      }

      const size = point.life * 6;
      const alpha = point.life * 0.3;

      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(108, 99, 255, ${alpha})`;
      ctx.fill();

      // Outer glow
      ctx.beginPath();
      ctx.arc(point.x, point.y, size * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(108, 99, 255, ${alpha * 0.3})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  draw();
}

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Three.js hero (skip if reduced motion)
  if (!prefersReducedMotion) {
    try {
      await initHero(document.getElementById('hero-canvas'), {
        reducedParticles: isMobile
      });
    } catch (err) {
      console.warn('Three.js hero failed to initialize:', err);
    }
  }

  // Hide loader
  hideLoader();

  // Wait a tick for GSAP scripts to be ready
  requestAnimationFrame(() => {
    // Scroll animations
    initScrollAnimations();

    // Navigation
    initNav();

    // Card interactions
    initCards(isMobile);

    // Creative effects
    initMagneticButtons();
    initCursorTrail();

    // Text scramble on hero tagline
    if (!prefersReducedMotion) {
      const tagline = document.querySelector('.hero-tagline');
      if (tagline) {
        const originalText = tagline.dataset.text || tagline.textContent;
        tagline.textContent = '';
        setTimeout(() => {
          const scramble = new TextScramble(tagline);
          scramble.setText(originalText);
        }, 600);
      }
    }
  });
});

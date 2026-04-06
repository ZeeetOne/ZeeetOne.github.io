/**
 * Loading screen controller.
 * Fades out the loader overlay and marks the body as loaded.
 */
export function hideLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  loader.classList.add('loader-fade');
  loader.addEventListener('transitionend', () => {
    loader.style.display = 'none';
    document.body.classList.add('loaded');
  }, { once: true });

  // Fallback if transitionend doesn't fire
  setTimeout(() => {
    loader.style.display = 'none';
    document.body.classList.add('loaded');
  }, 1000);
}

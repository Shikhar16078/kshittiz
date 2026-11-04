/** Smooth-scrolls to the section an in-page link points at (instant with reduced motion). */
export function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>) {
  const targetId = e.currentTarget.getAttribute('href');
  if (!targetId?.startsWith('#')) return;
  e.preventDefault();
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
  if (targetId === '#about') {
    window.scrollTo({ top: 0, behavior });
  } else {
    document.querySelector(targetId)?.scrollIntoView({ behavior });
  }
}

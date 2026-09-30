(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const active = new Map();
  const reveal = (element, delay = 0) => {
    if (preference.matches || element.contains(document.activeElement)) return;
    active.get(element)?.cancel();
    const animation = element.animate([
      { opacity: 0, transform: 'translateY(16px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 560, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
    active.set(element, animation);
    const cleanup = () => { if (active.get(element) === animation) active.delete(element); };
    animation.onfinish = cleanup;
    animation.oncancel = cleanup;
  };
  const observer = new IntersectionObserver(entries => {
    let stagger = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      reveal(entry.target, Math.min(stagger++ * 70, 210));
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  document.querySelectorAll('.hero > *, .section-heading, .project-main, .project-visual, .capability-grid article, .career, .qualifications, .campus-photo, .course-group, .contact-inner > *').forEach(element => observer.observe(element));
  document.querySelectorAll('details').forEach(details => {
    details.addEventListener('toggle', () => {
      if (details.open) {
        const content = details.querySelector('.case-content, .course-grid');
        if (content) reveal(content);
      }
    });
  });
  // Focus and changed accessibility preferences must never wait for an animation.
  document.addEventListener('focusin', event => {
    for (const [element, animation] of active) {
      if (element.contains(event.target)) animation.cancel();
    }
  });
  preference.addEventListener('change', () => {
    if (preference.matches) for (const animation of active.values()) animation.cancel();
  });
})();

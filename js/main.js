/* ════════════════════════════════════════════════════
   MARIOLA NARANJO — La Sala
   GSAP + ScrollTrigger + Lenis
   ════════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

const isTouch = window.matchMedia('(hover: none)').matches;
const isMobile = window.matchMedia('(max-width: 768px)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Lenis smooth scroll ───────────────────────── */
let lenis = null;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1.05 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ── Preloader ─────────────────────────────────── */
const preloader = document.getElementById('preloader');
// índice de animación por letra
preloader.querySelectorAll('.preloader__name span').forEach((s, i) => {
  s.style.setProperty('--i', i);
});

window.addEventListener('load', () => {
  setTimeout(() => {
    preloader.classList.add('is-done');
    document.body.classList.add('is-loaded');
    document.getElementById('nav').classList.add('is-visible');
    setTimeout(() => preloader.remove(), 1200);
  }, 2100);
});
// Fallback si load tarda demasiado
setTimeout(() => {
  if (!document.body.classList.contains('is-loaded')) {
    preloader.classList.add('is-done');
    document.body.classList.add('is-loaded');
    document.getElementById('nav').classList.add('is-visible');
    setTimeout(() => preloader.remove(), 1200);
  }
}, 5000);


/* ── Nav hide on scroll down ───────────────────── */
let lastY = 0;
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > 200 && y > lastY) nav.classList.add('is-hidden');
  else nav.classList.remove('is-hidden');
  lastY = y;
}, { passive: true });

/* ── Hero parallax ─────────────────────────────── */
if (!reduceMotion) {
  gsap.to('.hero__bg img', {
    scale: 1.0,
    yPercent: 8,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2,
    },
  });
  gsap.to('.hero__content', {
    yPercent: -12,
    opacity: 0.25,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom 30%',
      scrub: 1,
    },
  });
}

/* ── Manifiesto: reveal por líneas ─────────────── */
(function splitManifesto() {
  const el = document.querySelector('.manifesto__text');
  if (!el) return;
  // dividir en palabras conservando <em>
  const splitNode = (node, parent) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { parent.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span');
        w.className = 'w';
        w.textContent = part;
        parent.appendChild(w);
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const clone = node.cloneNode(false);
      parent.appendChild(clone);
      [...node.childNodes].forEach((ch) => splitNode(ch, clone));
    }
  };
  const frag = document.createDocumentFragment();
  [...el.childNodes].forEach((ch) => splitNode(ch, frag));
  el.innerHTML = '';
  el.appendChild(frag);

  gsap.fromTo(el.querySelectorAll('.w'),
    { opacity: 0.08, y: 14 },
    {
      opacity: 1, y: 0,
      stagger: 0.04,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 78%',
        end: 'top 30%',
        scrub: 0.8,
      },
    });

  gsap.fromTo('.manifesto__attr span',
    { y: '110%' },
    {
      y: '0%',
      ease: 'power3.out',
      duration: 1,
      scrollTrigger: { trigger: '.manifesto__attr', start: 'top 85%' },
    });
})();

/* ── Sala: scroll horizontal pineado ───────────── */
if (!isMobile) {
  const track = document.getElementById('salaTrack');
  const pin = document.getElementById('salaPin');
  const counter = document.getElementById('salaCounter');
  const bar = document.getElementById('salaBar');
  const obras = gsap.utils.toArray('.obra');
  const total = obras.length;

  const getDistance = () => track.scrollWidth - window.innerWidth;

  gsap.to(track, {
    x: () => -getDistance(),
    ease: 'none',
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: () => `+=${getDistance()}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const idx = Math.min(total, Math.max(1, Math.round(self.progress * (total - 1)) + 1));
        counter.textContent = `${String(idx).padStart(2, '0')} / ${total}`;
        bar.style.transform = `scaleX(${self.progress})`;
      },
    },
  });

  // entrada sutil de cada obra al asomar
  obras.forEach((obra) => {
    gsap.fromTo(obra.querySelector('.obra__frame'),
      { y: 40, opacity: 0.4 },
      {
        y: 0, opacity: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: obra,
          containerAnimation: ScrollTrigger.getById ? undefined : undefined,
          start: 'left 95%',
          horizontal: false,
        },
      });
  });
} else {
  // móvil: reveal vertical clásico
  gsap.utils.toArray('.obra').forEach((obra) => {
    gsap.fromTo(obra,
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: obra, start: 'top 88%' },
      });
  });
}

/* ── Lightbox ──────────────────────────────────── */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCap = document.getElementById('lightboxCap');

document.querySelectorAll('.obra').forEach((obra) => {
  obra.addEventListener('click', () => {
    const img = obra.querySelector('img');
    const name = obra.querySelector('.obra__name').textContent;
    const tech = obra.querySelector('.obra__tech').textContent;
    const dim = obra.querySelector('.obra__dim').textContent;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCap.textContent = `${name} — ${tech} · ${dim}`;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop();
  });
});

const closeLightbox = () => {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  if (lenis) lenis.start();
};
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

/* ── Materia: preview flotante ─────────────────── */
if (!isTouch && !isMobile) {
  const preview = document.getElementById('materiaPreview');
  const previewImg = preview.querySelector('img');
  let pvX = 0, pvY = 0, pvTX = 0, pvTY = 0;

  gsap.ticker.add(() => {
    pvX += (pvTX - pvX) * 0.12;
    pvY += (pvTY - pvY) * 0.12;
    preview.style.left = `${pvX}px`;
    preview.style.top = `${pvY}px`;
  });

  document.querySelectorAll('.materia__item').forEach((item) => {
    item.addEventListener('mouseenter', () => {
      previewImg.src = item.dataset.img;
      preview.classList.add('is-on');
    });
    item.addEventListener('mouseleave', () => preview.classList.remove('is-on'));
    item.addEventListener('mousemove', (e) => {
      pvTX = e.clientX + 30;
      pvTY = e.clientY - 160;
    });
  });
}

/* ── Bio: portrait reveal ──────────────────────── */
ScrollTrigger.create({
  trigger: '.bio__portrait',
  start: 'top 75%',
  once: true,
  onEnter: () => document.querySelector('.bio__portrait').classList.add('is-revealed'),
});

/* ── Reveals genéricos (expo, contacto) ────────── */
gsap.utils.toArray('.expo__inner > *, .contacto > *').forEach((el) => {
  gsap.fromTo(el,
    { y: 36, opacity: 0 },
    {
      y: 0, opacity: 1,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
});

/* ── Anclas con Lenis ──────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
    else target.scrollIntoView({ behavior: 'smooth' });
  });
});

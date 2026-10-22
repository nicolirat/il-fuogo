// Animate existing artwork without altering the Figma layout or SVG transforms.
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const smallScreen = matchMedia('(max-width: 700px)');
const ease = 'cubic-bezier(.22, 1, .36, 1)';
let stop = () => {};

export function setupMotion(root) {
  stop();
  if (reduced.matches || !('IntersectionObserver' in window)) return;
  const animations = new Set();
  const targets = new Map();
  let disposed = false;
  const add = (selector, kind) => root.querySelectorAll(selector).forEach(el => {
    if (!el.closest('.traced') || el.matches('.traced')) targets.set(el, kind);
  });
  add('.dish-photo, .hero-photo, .carta-bg, .promo-card>img, .merch>img, .shop-hero>img, .shop-gallery>img, .product-row>img, .contact-hero>img, .venue-gallery>img', 'photo');
  add('.eyebrow, .hero-meta, .daily-copy>div, .daily-copy>p:last-child, .dish-label, .promo-card .offer, .promo-card h3, .location h1, .reservation h2, .menu-item, .drink-block, .design-text', 'rise');
  add('.carta h2, .promos-heading h2, .merch h2, .shop-hero h1, .menu-section>h2', 'title');
  add('.traced, .hero-note, .hero-signature, .promo-card .day', 'ink');
  add('.carta p, .shop-hero p:last-child, .merch-copy>p:not(.eyebrow)', 'words');
  root.querySelectorAll('.design-art').forEach(el => {
    const src = el.querySelector('img')?.getAttribute('src') || '';
    if (/texto-trazado|textos-manuscrito/.test(src)) targets.set(el, 'ink');
    // Large decorative SVGs stay static to keep mobile scrolling light.
  });
  // A parent reveal already handles its children; avoid compounded fades.
  for (const el of targets.keys()) {
    if ([...targets.keys()].some(parent => parent !== el && parent.contains(el))) targets.delete(el);
  }
  const play = (el, kind, delay = 0) => {
    if (disposed || el.dataset.motionState === 'shown') return;
    el.dataset.motionState = 'shown';
    const mobile = smallScreen.matches;
    let frames, duration;
    if (kind === 'ink') {
      frames = [{clipPath:'inset(0 100% 0 0)',opacity:.3},{clipPath:'inset(0 0% 0 0)',opacity:1}];
      duration = mobile ? 1000 : 1350;
    } else if (kind === 'photo') {
      frames = [{opacity:.12,filter:`blur(${mobile ? 2 : 5}px)`},{opacity:1,filter:'blur(0px)'}];
      duration = mobile ? 700 : 1000;
    } else {
      frames = [{opacity:0,translate:`0 ${kind === 'title' ? 22 : 12}px`},{opacity:1,translate:'0 0'}];
      duration = mobile ? 550 : 800;
    }
    // No persistent hidden CSS: interrupted or unsupported animation stays readable.
    const animate = (node, keyframes, options) => {
      const a = node.animate(keyframes, options);
      animations.add(a);
      a.finished.catch(() => {}).finally(() => animations.delete(a));
    };
    if (kind === 'words') {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      let index = 0;
      nodes.forEach(node => {
        const fragment = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(word => {
          if (!word.trim()) return fragment.append(document.createTextNode(word));
          const span = document.createElement('span');
          span.className = 'motion-word';
          span.textContent = word;
          fragment.append(span);
          animate(span, [{opacity:0,translate:'0 .35em'},{opacity:1,translate:'0 0'}], {duration:650,delay:delay+Math.min(index++*24,500),easing:ease,fill:'backwards'});
        });
        node.replaceWith(fragment);
      });
    } else {
      animate(el, frames, {duration,delay,easing:ease,fill:'backwards'});
    }
  };
  const observer = new IntersectionObserver(entries => {
    let order = 0;
    entries.filter(e => e.isIntersecting).sort((a,b) => a.boundingClientRect.top-b.boundingClientRect.top).forEach(entry => {
      const el = entry.target;
      observer.unobserve(el);
      const delay = Math.min(order++*55,165);
      const images = el.matches('img') ? [el] : [...el.querySelectorAll('img')];
      // Start artwork reveals after decoding, so the animation is actually visible.
      const ready = Promise.all(images.map(img => img.decode?.().catch(() => {})));
      ready.then(() => play(el, targets.get(el), delay));
    });
  }, {threshold:0,rootMargin:'0px 0px -5% 0px'});
  targets.forEach((kind, el) => {
    el.dataset.motion = kind;
    el.dataset.motionState = 'waiting';
    observer.observe(el);
  });
  const revealFocused = event => {
    for (const el of targets.keys()) if (el.contains(event.target)) {
      el.dataset.motionState = 'shown';
      observer.unobserve(el);
      el.getAnimations().forEach(a => a.cancel());
    }
  };
  root.addEventListener('focusin', revealFocused);
  const cancel = () => {
    disposed = true;
    observer.disconnect();
    animations.forEach(a => a.cancel());
    animations.clear();
    root.removeEventListener('focusin', revealFocused);
    reduced.removeEventListener('change', cancel);
  };
  reduced.addEventListener('change', cancel);
  stop = cancel;
}

let routeAnimation;
export async function transitionPage(render) {
  routeAnimation?.cancel();
  const main = document.querySelector('main');
  if (reduced.matches) { render(); return; }
  const animation = main.animate([{opacity:1},{opacity:0}], {duration:140,easing:'ease-out',fill:'forwards'});
  routeAnimation = animation;
  try { await animation.finished; } catch { return; }
  animation.cancel();
  render();
  routeAnimation = null;
}

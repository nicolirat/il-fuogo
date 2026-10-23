let cleanup = () => {};
export function setupCartaHover(root) {
  cleanup();
  const section = root.querySelector('.carta');
  if (!section) return;
  const photos = [...section.querySelectorAll('.carta-bg')];
  const shade = section.querySelector('.carta-shade');
  const layers = [...photos, shade];
  const links = [...section.querySelectorAll('.category-link')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let revision = 0, selected = 'compartir', timer, resolvePause;
  const animations = new Set();
  const cancel = () => {
    revision++;
    layers.forEach(photo => { photo.style.opacity = getComputedStyle(photo).opacity; });
    animations.forEach(animation => animation.cancel());
    animations.clear();
    clearTimeout(timer);
    resolvePause?.();
    resolvePause = null;
  };
  const fade = (photo, to, duration) => {
    const from = getComputedStyle(photo).opacity;
    photo.style.opacity = String(to);
    const animation = photo.animate([{opacity:from},{opacity:to}],{duration,easing:'cubic-bezier(.4,0,.2,1)'});
    animations.add(animation);
    return animation.finished.catch(() => {}).finally(() => animations.delete(animation));
  };
  const show = async key => {
    if (selected === key) return;
    selected = key;
    cancel();
    const token = revision;
    const next = photos.find(photo => photo.dataset.category === key);
    try { await next.decode(); } catch { return; }
    if (token !== revision) return;
    if (!reduced.matches) {
      await Promise.all(layers.filter(photo => Number(photo.style.opacity)>0).map(photo => fade(photo,0,320)));
      if (token !== revision) return;
      await new Promise(resolve => { resolvePause=resolve; timer=setTimeout(resolve,65); });
      if (token !== revision) return;
      resolvePause=null;
    }
    photos.forEach(photo => { photo.setAttribute('aria-hidden',String(photo !== next)); if (photo !== next) photo.style.opacity='0'; });
    section.dataset.category = key;
    if (reduced.matches) { next.style.opacity='1'; shade.style.opacity='1'; }
    else await Promise.all([fade(next,1,600),fade(shade,1,600)]);
  };
  const handlers = links.map(link => {
    const key = link.getAttribute('href').split('/').pop();
    const enter = event => { if (event.pointerType !== 'touch') show(key); };
    const focus = () => show(key);
    link.addEventListener('pointerenter',enter);
    link.addEventListener('focus',focus);
    return () => { link.removeEventListener('pointerenter',enter); link.removeEventListener('focus',focus); };
  });
  // Keep the last preview when moving between circles; links still open in one tap.
  photos.forEach(photo => photo.decode().catch(() => {}));
  cleanup = () => { cancel(); handlers.forEach(remove => remove()); };
}

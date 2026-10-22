// A native scroll track pins the hero; no wheel/touch cancellation or scroll lock.
let cleanup = () => {};
export function setupHeroScroll(root) {
  cleanup();
  const scene = root.querySelector('.hero-scroll');
  if (!scene) return;
  const hero = scene.querySelector('.hero');
  const slides = [...scene.querySelectorAll('.hero-slide')];
  const buttons = [...scene.querySelectorAll('[data-slide]')];
  const counter = scene.querySelector('.hero-gallery-count');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let step = 400, top = 0, start = 0, frame = 0, active = -1;
  const show = index => {
    if (index === active) return;
    active = index;
    scene.dataset.slide = String(index);
    slides.forEach((slide,i) => {
      slide.classList.toggle('is-active',i===index);
      slide.setAttribute('aria-hidden',String(i!==index));
      buttons[i].setAttribute('aria-pressed',String(i===index));
    });
    counter.textContent = `${String(index+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
  };
  const update = () => {
    frame = 0;
    const progress = Math.max(0, window.scrollY - start + top);
    show(Math.min(slides.length-1, Math.floor(progress/step)));
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const measure = () => {
    const height = hero.offsetHeight;
    // A tall mobile hero pins only once its photograph fits in the viewport.
    top = Math.min(0, window.innerHeight-height);
    step = Math.max(240, Math.min(560, window.innerHeight*.55));
    start = scene.getBoundingClientRect().top + window.scrollY;
    scene.style.setProperty('--hero-pin-top',`${top}px`);
    scene.style.height = `${height+step*(slides.length-.5)}px`;
    update();
  };
  const resize = new ResizeObserver(measure);
  resize.observe(hero);
  window.addEventListener('resize',measure,{passive:true});
  window.addEventListener('scroll',schedule,{passive:true});
  buttons.forEach((button,i) => button.addEventListener('click',() => {
    window.scrollTo({top:start-top+step*(i+.1),behavior:reduced.matches?'instant':'smooth'});
  }));
  scene.querySelector('.hero-gallery-skip').addEventListener('click',() => {
    root.querySelector('#carta').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
  });
  slides.slice(1).forEach(slide => { const img=slide.querySelector('img'); img.decode?.().catch(()=>{}); });
  measure();
  cleanup = () => {
    resize.disconnect();
    window.removeEventListener('resize',measure);
    window.removeEventListener('scroll',schedule);
    cancelAnimationFrame(frame);
  };
}

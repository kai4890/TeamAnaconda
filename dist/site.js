const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
menuToggle.hidden = false;

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
}

menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});

const dayList = document.querySelector('.days');
const dayPanels = [...document.querySelectorAll('[data-day]')];
dayList.setAttribute('role', 'tablist');

const dayTabs = dayPanels.map(panel => {
  const tab = document.createElement('button');
  tab.id = `tab-${panel.id}`;
  tab.type = 'button';
  tab.textContent = panel.dataset.day;
  tab.setAttribute('aria-label', panel.querySelector('h3').textContent);
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', panel.id);
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', tab.id);
  panel.tabIndex = 0;
  dayList.append(tab);
  return tab;
});

function selectDay(index, focus = false) {
  dayTabs.forEach((tab, position) => {
    const selected = index === position;
    tab.tabIndex = selected ? 0 : -1;
    tab.setAttribute('aria-selected', String(selected));
    dayPanels[position].hidden = !selected;
  });
  if (focus) dayTabs[index].focus();
}

dayTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectDay(index));
  tab.addEventListener('keydown', event => {
    const finalIndex = dayTabs.length - 1;
    const next = {
      ArrowLeft: index === 0 ? finalIndex : index - 1,
      ArrowRight: index === finalIndex ? 0 : index + 1,
      Home: 0,
      End: finalIndex,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectDay(next, true);
  });
});
selectDay(0);
dayList.hidden = false;

const videoLink = document.querySelector('.video-play');
videoLink.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
  event.preventDefault();
  const player = document.createElement('iframe');
  player.title = 'Team Anaconda Doyalson facility walkthrough';
  player.src = 'https://www.youtube-nocookie.com/embed/wQlT7bGioYg?autoplay=1&rel=0';
  player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  player.referrerPolicy = 'strict-origin-when-cross-origin';
  player.allowFullscreen = true;
  videoLink.parentElement.replaceChildren(player);
  player.focus();
});

const scene = document.querySelector('[data-scene]');
const layers = [...scene.querySelectorAll('[data-depth]')].map(element => ({
  element, depth: Number(element.dataset.depth),
}));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const compactScreen = window.matchMedia('(max-width: 640px)');
let frame = 0;
let shift = 0;
let target = 0;

function animateDepth() {
  shift += (target - shift) * 0.22;
  const settled = Math.abs(target - shift) < 0.35;
  if (settled) shift = target;
  for (const { element, depth } of layers) {
    element.style.setProperty('--shift', `${(shift * depth).toFixed(2)}px`);
  }
  frame = settled ? 0 : requestAnimationFrame(animateDepth);
}

function updateDepth() {
  if (reducedMotion.matches) return;
  const maxTravel = Math.min(scene.offsetHeight, 660);
  const mobileScale = compactScreen.matches ? 0.58 : 1;
  const next = Math.max(0, Math.min(window.scrollY, maxTravel)) * mobileScale;
  if (target === next) return;
  target = next;
  if (!frame) frame = requestAnimationFrame(animateDepth);
}

function syncMotion() {
  if (!reducedMotion.matches) {
    updateDepth();
    return;
  }
  cancelAnimationFrame(frame);
  frame = 0;
  shift = 0;
  target = 0;
  for (const { element } of layers) element.style.removeProperty('--shift');
}

window.addEventListener('scroll', updateDepth, { passive: true });
window.addEventListener('resize', updateDepth, { passive: true });
reducedMotion.addEventListener('change', syncMotion);
syncMotion();

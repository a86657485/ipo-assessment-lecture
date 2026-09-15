const pages = [...document.querySelectorAll('.deck-page')];
const analysisScroll = document.querySelector('.analysis-scroll');
const blankScene = document.querySelector('.blank-scene');
const questionShowcaseFrame = document.querySelector('#question-showcase-frame');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let pageIndex = 0;
let blankStep = 0;
let blankLock = 0;
let wheelLast = 0;
let wheelAmount = 0;
let controlsTimer;

function showControls() {
  document.body.classList.add('show-controls');
  clearTimeout(controlsTimer);
  controlsTimer = setTimeout(() => document.body.classList.remove('show-controls'), 1700);
}
function replayCover() {
  const cover = pages[0];
  cover.classList.remove('is-entering');
  requestAnimationFrame(() => requestAnimationFrame(() => cover.classList.add('is-entering')));
}
function setPage(next) {
  const target = Math.max(0, Math.min(pages.length - 1, next));
  if (target === pageIndex) return;
  pageIndex = target;
  document.body.dataset.page = pageIndex;
  document.querySelector('#page-count').textContent = `${pageIndex + 1} / ${pages.length}`;
  document.querySelector('#page-up').disabled = pageIndex === 0;
  document.querySelector('#page-down').disabled = pageIndex === pages.length - 1;
  pages.forEach((page, index) => page.inert = index !== pageIndex);
  if (pageIndex === 0) replayCover();
  if (pageIndex === 1) updateGallery();
  if (pageIndex === 2) setBlankStep(0, true);
  if (pageIndex === 4) window.startIPO?.();
  else window.stopIPO?.();
}

function setBlankStep(next, reset = false) {
  if (!reset && performance.now() < blankLock) return;
  const target = Math.max(0, Math.min(5, next));
  if (!reset && target === blankStep) return;
  blankStep = target;
  blankLock = performance.now() + (reduced.matches ? 80 : 500);
  blankScene.dataset.step = blankStep;
  document.querySelector('#scene-back').disabled = blankStep === 0;
  document.querySelector('#scene-next').disabled = blankStep === 5;
  document.querySelector('#word-count').textContent = blankStep === 2 ? '1个字' : '0个字';
  document.querySelector('#scene-status').textContent = ['Word已打开，文档空白。','面对空白文档，光标等待输入。','写下“一、”，然后停住。','删去开头，重新面对空白。','第一道题，该怎样开始？','从哪里开始？'][blankStep];
}

// Page 2: horizontal evidence windows.
const gallery = document.querySelector('.gallery');
const panels = [...document.querySelectorAll('.panel')];
const tabs = [...document.querySelectorAll('[data-tab]')];
let galleryIndex = 0;
let galleryFrame;
function updateGallery() {
  tabs.forEach((tab, index) => tab.setAttribute('aria-current', String(index === galleryIndex)));
  document.querySelector('#position').textContent = `${galleryIndex + 1} / 4`;
  document.querySelector('#previous').disabled = galleryIndex === 0;
  document.querySelector('#next').disabled = galleryIndex === 3;
  panels.forEach((panel, index) => panel.inert = pageIndex !== 1 || index !== galleryIndex);
}
function goGallery(index) {
  galleryIndex = Math.max(0, Math.min(3, index));
  const panel = panels[galleryIndex];
  gallery.scrollTo({left: panel.offsetLeft - (gallery.clientWidth - panel.clientWidth) / 2, behavior: reduced.matches ? 'instant' : 'smooth'});
  updateGallery();
}
tabs.forEach(tab => tab.addEventListener('click', () => goGallery(Number(tab.dataset.tab))));
document.querySelector('#previous').addEventListener('click', () => goGallery(galleryIndex - 1));
document.querySelector('#next').addEventListener('click', () => goGallery(galleryIndex + 1));
gallery.addEventListener('scroll', () => {
  cancelAnimationFrame(galleryFrame);
  galleryFrame = requestAnimationFrame(() => {
    const center = gallery.getBoundingClientRect().left + gallery.clientWidth / 2;
    const distances = panels.map(panel => Math.abs(panel.getBoundingClientRect().left + panel.clientWidth / 2 - center));
    galleryIndex = distances.indexOf(Math.min(...distances)); updateGallery();
  });
});

// Page 2: course-standard book and image zoom.
const reader = document.querySelector('#reader');
const zoom = document.querySelector('#zoom');
const readerImage = document.querySelector('#reader-image');
const readerTitle = document.querySelector('#reader-title');
let bookPage = 0;
const bookPages = [['命题依据1 · 命题原则与命题规划','basis1.png'],['命题依据2 · 第四学段学业质量描述','basis2.png']];
function turnBook(index) {
  bookPage = Math.max(0, Math.min(1, index));
  const [title, file] = bookPages[bookPage];
  readerTitle.textContent = title; readerImage.alt = title; readerImage.src = `assets/requirements/${file}`;
  readerImage.classList.remove('flip'); if (!reduced.matches) requestAnimationFrame(() => readerImage.classList.add('flip'));
  document.querySelector('#book-page').textContent = `${bookPage + 1} / 2`;
  document.querySelector('#book-prev').disabled = bookPage === 0;
  document.querySelector('#book-next').disabled = bookPage === 1;
}
function openBook() { reader.showModal(); turnBook(0); }
document.querySelector('#open-book').addEventListener('click', openBook);
document.querySelector('#read-book').addEventListener('click', openBook);
document.querySelector('#book-prev').addEventListener('click', () => turnBook(bookPage - 1));
document.querySelector('#book-next').addEventListener('click', () => turnBook(bookPage + 1));
document.querySelector('#reader-image-button').addEventListener('click', () => { const image = document.querySelector('#zoom-image'); image.src = readerImage.src; image.alt = readerImage.alt; zoom.showModal(); });
document.querySelectorAll('dialog .close').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));

// Page 2: key claim and table reveal.
function emphasize() {
  const rules = document.querySelector('.rules');
  const active = rules.classList.toggle('focused');
  const button = document.querySelector('#emphasize');
  button.textContent = active ? '返回三点总览' : '聚焦重点'; button.setAttribute('aria-pressed', String(active));
}
document.querySelector('#emphasize').addEventListener('click', emphasize);
document.querySelector('#focus-rule').addEventListener('click', emphasize);
document.querySelector('#expand-structure').addEventListener('click', event => { const detail = document.querySelector('.structure-detail'); detail.hidden = !detail.hidden; event.currentTarget.setAttribute('aria-expanded', String(!detail.hidden)); });

// Page 2: document focus follows the pointer, while links open the local reader.
const materialLinks = [...document.querySelectorAll('.material')];
let focusTimer;
function focusMaterial(index) { materialLinks.forEach((link, i) => link.classList.toggle('is-active', i === index)); }
materialLinks.forEach((link, index) => {
  link.addEventListener('pointerenter', () => { clearTimeout(focusTimer); focusTimer = setTimeout(() => focusMaterial(index), 100); });
  link.addEventListener('pointerleave', () => clearTimeout(focusTimer));
  link.addEventListener('focus', () => focusMaterial(index));
});

async function fullscreen() {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch {}
}
document.querySelector('#page-up').addEventListener('click', () => setPage(pageIndex - 1));
document.querySelector('#page-down').addEventListener('click', () => setPage(pageIndex + 1));
document.querySelector('#scene-back').addEventListener('click', () => setBlankStep(blankStep - 1));
document.querySelector('#scene-next').addEventListener('click', () => setBlankStep(blankStep + 1));
document.querySelector('#replay').addEventListener('click', () => pageIndex === 0 ? replayCover() : pageIndex === 2 ? setBlankStep(0, true) : pageIndex === 3 ? window.resetCollaboration() : pageIndex === 4 ? window.replayIPO() : analysisScroll.scrollTo({top:0,behavior:'smooth'}));
document.querySelector('#fullscreen').addEventListener('click', fullscreen);
window.addEventListener('message', event => {
  if (event.source === questionShowcaseFrame?.contentWindow && event.data?.type === 'question-showcase-page') {
    setPage(pageIndex + event.data.direction);
  }
});
document.addEventListener('pointermove', showControls);
window.addEventListener('resize', () => { if (pageIndex === 1) goGallery(galleryIndex); });
document.addEventListener('keydown', event => {
  if (document.querySelector('dialog[open]') || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
  if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); setPage(pageIndex + 1); return; }
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); setPage(pageIndex - 1); return; }
  if (event.key.toLowerCase() === 'f') fullscreen();
  if (event.key.toLowerCase() === 'r') document.querySelector('#replay').click();
  if (pageIndex === 1 && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
    event.preventDefault();
    analysisScroll.scrollBy({top: (event.key === 'ArrowDown' ? 1 : -1) * analysisScroll.clientHeight * .72, behavior: reduced.matches ? 'instant' : 'smooth'});
  }
  if (pageIndex === 2 && event.key === 'ArrowDown') { event.preventDefault(); setBlankStep(blankStep + 1); }
  if (pageIndex === 2 && event.key === 'ArrowUp') { event.preventDefault(); setBlankStep(blankStep - 1); }
});
document.addEventListener('wheel', event => {
  if (document.querySelector('dialog[open]') || event.ctrlKey || pageIndex === 1 || pageIndex === 3 || pageIndex === 4 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  event.preventDefault();
  const now = performance.now(); if (now - wheelLast > 260) wheelAmount = 0; wheelLast = now;
  if (!Number.isFinite(wheelAmount)) return;
  wheelAmount += event.deltaY;
  if (Math.abs(wheelAmount) > 90) { if (pageIndex === 0 && wheelAmount > 0) setPage(1); else if (pageIndex === 2) setBlankStep(blankStep + Math.sign(wheelAmount)); wheelAmount = Infinity; }
}, {passive:false});

focusMaterial(0); setBlankStep(0, true); pages.forEach((page,index)=>page.inert=index!==0); updateGallery(); replayCover();

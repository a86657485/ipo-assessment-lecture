const dialog = document.createElement('dialog');
dialog.id = 'pdf-viewer';
dialog.setAttribute('aria-labelledby', 'pdf-document-title');
dialog.innerHTML = `<header class="pdf-toolbar"><h2 id="pdf-document-title"></h2><div class="pdf-actions"><button data-action="previous" aria-label="上一页">←</button><input id="pdf-page-input" type="number" min="1" value="1" aria-label="页码"><span class="pdf-total"></span><button data-action="next" aria-label="下一页">→</button><button data-action="out" aria-label="缩小">−</button><span class="pdf-scale">100%</span><button data-action="in" aria-label="放大">＋</button><button data-action="close" aria-label="关闭文件">×</button></div></header><div class="pdf-scroll" tabindex="0" aria-label="PDF正文"><p class="pdf-message" role="status">正在打开…</p><div class="pdf-pages"></div><button class="pdf-retry" hidden>重新打开</button></div>`;
document.body.append(dialog);
const scroller = dialog.querySelector('.pdf-scroll');
const pagesRoot = dialog.querySelector('.pdf-pages');
const message = dialog.querySelector('.pdf-message');
const retry = dialog.querySelector('.pdf-retry');
const input = dialog.querySelector('input');
let loadTask;
let documentPdf;
let observer;
let renderTask;
let generation = 0;
let currentPage = 1;
let magnification = 1;
let baseWidth = 0;
let pageRatio = 1;
let busy = false;
let sourceUrl;
let sourceTitle;
let resizeTimer;
const visible = new Set();
const queue = new Set();
let shells = [];

function controls() {
  input.value = currentPage;
  input.max = documentPdf?.numPages || 1;
  input.disabled = !documentPdf;
  dialog.querySelector('.pdf-total').textContent = `/ ${documentPdf?.numPages || '—'}`;
  dialog.querySelector('.pdf-scale').textContent = `${Math.round(magnification * 100)}%`;
  for (const button of dialog.querySelectorAll('[data-action]')) {
    const action = button.dataset.action;
    button.disabled = action !== 'close' && (!documentPdf || (action === 'previous' && currentPage === 1) || (action === 'next' && currentPage === documentPdf.numPages) || (action === 'out' && magnification <= .6) || (action === 'in' && magnification >= 2));
  }
}
function report(error) {
  if (!dialog.open) return;
  message.textContent = '文件未能显示，请重新打开。';
  message.hidden = false;
  retry.hidden = false;
  console.error('PDF rendering failed:', error);
}
async function drain() {
  if (busy || !documentPdf || !queue.size) return;
  busy = true;
  const version = generation;
  const pdf = documentPdf;
  try {
    while (queue.size && version === generation) {
      const number = [...queue].sort((a, b) => Math.abs(a - currentPage) - Math.abs(b - currentPage))[0];
      queue.delete(number);
      const shell = shells[number - 1];
      if (!shell || shell.querySelector('canvas') || !visible.has(number)) continue;
      const page = await pdf.getPage(number);
      if (version !== generation) break;
      const width = baseWidth * magnification;
      const original = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: width / original.width });
      shell.style.height = `${viewport.height}px`;
      const canvas = document.createElement('canvas');
      const pixelRatio = Math.min(devicePixelRatio || 1, 1.5, 3600 / viewport.width);
      canvas.width = Math.ceil(viewport.width * pixelRatio);
      canvas.height = Math.ceil(viewport.height * pixelRatio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `${sourceTitle} 第${number}页`);
      renderTask = page.render({canvasContext: canvas.getContext('2d'), viewport, transform: [pixelRatio, 0, 0, pixelRatio, 0, 0]});
      await renderTask.promise;
      renderTask = undefined;
      if (version !== generation) break;
      if (visible.has(number)) shell.append(canvas);
      else { canvas.width = 0; canvas.height = 0; }
      page.cleanup();
    }
  } catch (error) {
    if (version === generation && error.name !== 'RenderingCancelledException') report(error);
  } finally {
    busy = false;
    if (queue.size && dialog.open && documentPdf) void drain();
  }
}
function layout() {
  generation++;
  renderTask?.cancel();
  observer?.disconnect();
  visible.clear(); queue.clear();
  baseWidth = Math.min(1360, scroller.clientWidth - 56);
  pagesRoot.replaceChildren();
  shells = Array.from({length: documentPdf.numPages}, (_, index) => {
    const shell = document.createElement('section');
    shell.className = 'pdf-page'; shell.dataset.page = index + 1;
    shell.setAttribute('aria-label', `第${index + 1}页`);
    shell.style.width = `${baseWidth * magnification}px`;
    shell.style.height = `${baseWidth * magnification * pageRatio}px`;
    pagesRoot.append(shell);
    return shell;
  });
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const number = Number(entry.target.dataset.page);
      if (entry.isIntersecting) { visible.add(number); queue.add(number); }
      else {
        visible.delete(number); queue.delete(number);
        const canvas = entry.target.querySelector('canvas');
        if (canvas) { canvas.width = 0; canvas.height = 0; canvas.remove(); }
      }
    }
    void drain();
  }, {root: scroller, rootMargin: '450px 0px'});
  shells.forEach(shell => observer.observe(shell));
  jump(currentPage);
}
function jump(value) {
  if (!documentPdf) return;
  const parsed = Number(value);
  currentPage = Number.isFinite(parsed) ? Math.max(1, Math.min(documentPdf.numPages, Math.round(parsed))) : currentPage;
  const shell = shells[currentPage - 1];
  scroller.scrollTop = shell.offsetTop - 28;
  controls();
}
async function dispose() {
  generation++;
  observer?.disconnect(); renderTask?.cancel();
  queue.clear(); visible.clear();
  documentPdf = undefined;
  shells.forEach(shell => { const c = shell.querySelector('canvas'); if (c) { c.width = 0; c.height = 0; } });
  shells = []; pagesRoot.replaceChildren();
  const task = loadTask; loadTask = undefined;
  if (task) await task.destroy();
}
async function openPdf(url, title) {
  await dispose();
  const version = generation;
  sourceUrl = url; sourceTitle = title;
  currentPage = 1; magnification = 1;
  dialog.querySelector('h2').textContent = title;
  message.textContent = '正在打开…'; message.hidden = false; retry.hidden = true;
  if (!dialog.open) dialog.showModal();
  controls();
  try {
    const encoded = window.PDF_DATA?.[url];
    if (!encoded || !window.PDFJS) throw new Error('Local PDF data is unavailable.');
    const binary = atob(encoded);
    const data = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) data[i] = binary.charCodeAt(i);
    if (version !== generation) return;
    loadTask = window.PDFJS.getDocument({data, isEvalSupported: false, useWorkerFetch: false});
    const pdf = await loadTask.promise;
    if (version !== generation) return;
    const first = await pdf.getPage(1);
    if (version !== generation) return;
    const viewport = first.getViewport({scale: 1});
    pageRatio = viewport.height / viewport.width;
    documentPdf = pdf; message.hidden = true;
    layout(); controls();
  } catch (error) { if (version === generation) report(error); }
}
document.querySelectorAll('a[data-document]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  void openPdf(link.getAttribute('href'), link.dataset.document);
}));
dialog.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
  const action = button.dataset.action;
  if (action === 'close') dialog.close();
  if (action === 'previous') jump(currentPage - 1);
  if (action === 'next') jump(currentPage + 1);
  if ((action === 'in' || action === 'out') && documentPdf) {
    magnification = Math.max(.6, Math.min(2, Math.round((magnification + (action === 'in' ? .2 : -.2)) * 10) / 10));
    layout(); controls();
  }
}));
input.addEventListener('change', () => jump(input.value));
input.addEventListener('keydown', event => { if (event.key === 'Enter') jump(input.value); });
scroller.addEventListener('scroll', () => {
  if (!documentPdf) return;
  const top = scroller.scrollTop + Math.min(240, scroller.clientHeight / 3);
  const shell = shells.find(s => s.offsetTop <= top && s.offsetTop + s.offsetHeight > top);
  if (shell) { currentPage = Number(shell.dataset.page); if (document.activeElement !== input) controls(); }
}, {passive: true});
dialog.addEventListener('close', () => { void dispose(); });
retry.addEventListener('click', () => void openPdf(sourceUrl, sourceTitle));
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { if (dialog.open && documentPdf) layout(); }, 160);
});
document.addEventListener('keydown', event => {
  if (!dialog.open) return;
  event.stopImmediatePropagation();
  if (event.target === input || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); jump(currentPage + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); jump(currentPage - 1); }
}, true);

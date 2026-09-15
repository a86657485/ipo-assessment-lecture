(() => {
  const root = document.querySelector('.ipo-workflow');
  const output = document.querySelector('#ipo-open-dashboard');
  const modal = document.querySelector('#ipo-dashboard-dialog');
  const frame = modal.querySelector('iframe');

  function showStaticIPO() {
    root.dataset.stage = 'o';
    output.disabled = false;
    document.querySelectorAll('.ipo-gate').forEach(gate => { gate.disabled = true; });
    document.querySelector('#ipo-cycle').disabled = true;
  }

  function closeDashboard() {
    modal.close();
    frame.removeAttribute('src');
    output.focus({ preventScroll: true });
  }

  window.startIPO = showStaticIPO;
  window.stopIPO = () => {};
  window.replayIPO = showStaticIPO;

  output.addEventListener('click', () => {
    frame.src = 'resources/ipo-dashboard/index.html';
    modal.showModal();
  });
  window.addEventListener('message', event => {
    if (event.source === frame.contentWindow && event.data?.type === 'ipo-dashboard-close' && modal.open) {
      closeDashboard();
    }
  });
  modal.addEventListener('cancel', event => {
    event.preventDefault();
    closeDashboard();
  });

  showStaticIPO();
  if (location.hash === '#ipo') setPage(4);
})();

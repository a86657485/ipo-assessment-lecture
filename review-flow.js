(() => {
  const page = document.querySelector('.review-page');
  const stage = document.querySelector('.review-stage');
  const trailNodes = [...document.querySelectorAll('.review-trail-node')];
  const finalFlow = document.querySelector('.review-final-flow');
  const humanNode = finalFlow.querySelector('.review-final-node.human');
  const humanDetail = humanNode.querySelector('p');
  humanDetail.remove();
  const detailRow = document.createElement('div');
  detailRow.className = 'review-final-detail-row';
  detailRow.innerHTML = `
    <article class="review-detail-box detail-1">课程标准与学业质量<br>教材学习目标与命题要求<br>历年试题与参考资料</article>
    <article class="review-detail-box detail-2">学习 SOLO 评价模型<br>学习专家命题经验<br>整理命题 Skill 与学习报告</article>
    <article class="review-detail-box detail-3">教师拟定命题理念<br>审定多维细目表<br>迭代 IPO 命题工作流</article>
    <article class="review-detail-box detail-4">教师明确图意与关系<br>AI依据草图生成配图<br>人工核对图文与题意</article>
    <article class="review-detail-box detail-5">试卷、参考答案、评分标准<br>试卷说明表、查重报告<br>命题设计理念</article>
  `;
  finalFlow.after(detailRow);
  let step = -1;
  let animating = false;
  let settleTimer;
  let wheelAmount = 0;
  let wheelAt = 0;

  function render(next, instant = false) {
    step = Math.max(-1, Math.min(5, next));
    stage.classList.remove('is-stable');
    void stage.offsetWidth;
    stage.dataset.step = String(step);
    trailNodes.forEach((node, index) => {
      node.classList.toggle('is-complete', step >= index || step === 5);
      node.classList.toggle('is-current', step === index && step < 5);
    });
    clearTimeout(settleTimer);
    animating = !instant;
    if (!instant) settleTimer = setTimeout(() => { animating = false; }, 620);
  }

  function finishMotion() {
    clearTimeout(settleTimer);
    animating = false;
    stage.classList.add('is-stable');
  }

  function move(direction) {
    if (animating) {
      finishMotion();
      return;
    }
    render(step + direction);
  }

  window.startReviewFlow = () => render(-1, true);
  window.resetReviewFlow = () => render(-1, true);

  document.addEventListener('keydown', event => {
    if (document.body.dataset.page !== '6' || document.querySelector('dialog[open]') || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowUp') { event.preventDefault(); move(-1); }
  });

  document.addEventListener('wheel', event => {
    if (document.body.dataset.page !== '6' || document.querySelector('dialog[open]') || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    event.preventDefault();
    const now = performance.now();
    if (now - wheelAt > 260) wheelAmount = 0;
    wheelAt = now;
    wheelAmount += event.deltaY;
    if (Math.abs(wheelAmount) > 80) {
      move(Math.sign(wheelAmount));
      wheelAmount = Infinity;
    }
  }, { passive: false });

  render(-1, true);
})();

(() => {
  const page = document.createElement('section');
  page.className = 'deck-page city-page';
  page.dataset.pageIndex = '7';
  page.setAttribute('aria-label', '从区赛到市赛');
  page.innerHTML = `<header class="city-heading">从区赛到市赛</header>
    <div class="city-scenes" data-scene="0">
      <section class="city-scene city-guidance"><div class="city-guidance-copy"><p class="city-eyebrow">专业指导 · 再次打磨</p><h1>再次优化。<br><em>继续迭代。</em></h1><p class="city-credit">陈学宏老师<br>细心、专业的建议与培训指导</p><button class="city-document" data-city-pdf="11-命题修改建议.pdf"><span>命题修改建议</span><b>学生立场<br>规范表达<br>情境与问题关联</b><i>阅读建议 ↗</i></button></div><div class="city-photo-stage"><button class="city-photo city-photo-long" data-city-photo="assets/collaboration/city-training-long.png" aria-label="查看长袖培训现场照片"><img src="assets/collaboration/city-training-long.png" alt="陈学宏老师培训指导现场"><span>命题培训</span></button><button class="city-photo city-photo-short" data-city-photo="assets/collaboration/city-training.png" aria-label="查看短袖培训现场照片"><img src="assets/collaboration/city-training.png" alt="陈学宏老师再次培训指导"><span>再次指导</span></button><div class="city-milestones" aria-label="从区赛到市赛的变化"><strong>长袖到短袖</strong><strong>区二到市一</strong></div></div></section>
      <section class="city-scene city-rounds"><div class="city-round first-round"><span class="city-round-number">01</span><p>第一轮</p><h2>报送试卷<br>评选</h2><button data-city-pdf="12-市赛通知.pdf">市赛通知 ↗</button></div><span class="city-round-arrow">↗</span><div class="city-round second-round"><span class="city-round-number">02</span><p>评选入围 · 第二轮</p><h2>说题<br>与答辩</h2><div class="city-times"><span><b>5</b>分钟<small>说题上限</small></span><span><b>3</b>分钟<small>答辩上限</small></span></div><button data-city-pdf="13-第二轮参赛指引.pdf">第二轮参赛指引 ↗</button></div></section>
      <section class="city-scene city-presentation"><div class="city-talk-heading"><h2>说题。</h2><p>把命题背后的理念讲清楚。</p></div><a class="city-screen" href="resources/original-talk/index.html" target="_blank" rel="noopener"><img src="resources/original-talk/images/cover-16x10.png" alt="原说题项目封面"><span>进入说题现场 ↗</span></a></section>
      <section class="city-scene city-defense has-proof"><p class="city-eyebrow">答辩</p><button class="city-question" data-question="0">您认为这张卷子<br>需要<em>多久时间</em><br>写完？</button><button class="city-question-proof city-word-proof" data-city-pdf="15-答辩问题库.pdf" aria-label="打开决赛答辩问题库PDF"><img src="assets/collaboration/answer-bank-excerpt.png" alt="深圳市2026年信息科技学科命题比赛决赛答辩问题库截图"><span>答辩问题库 · 打开 PDF ↗</span></button><button class="city-question" data-question="1" hidden>第一道综合题<br>为什么用<em>深中通道</em><br>这个情境？</button><button class="city-question-proof" data-city-pdf="14-综合题第一题.pdf" hidden aria-label="打开综合题第一题完整PDF"><img src="assets/collaboration/question1-excerpt.png" alt="综合题第一题截图"><span>综合题第一题 · 打开原卷 ↗</span></button><div class="city-question-switch"><button data-select-question="0" aria-current="true">第一问</button><button data-select-question="1" aria-current="false">第二问</button></div></section>
    </div><nav class="city-progress" aria-label="市赛四幕"><button aria-label="专业指导" aria-current="true"></button><button aria-label="两轮考验"></button><button aria-label="说题现场"></button><button aria-label="答辩"></button></nav>`;
  document.querySelector('main').append(page);
  const answer = document.createElement('dialog');
  answer.className = 'city-answer';
  answer.innerHTML = '<header><span>答辩思路</span><button aria-label="关闭回答">×</button></header><div class="city-answer-body"></div>';
  document.body.append(answer);
  const photo = document.createElement('dialog');
  photo.className = 'city-photo-dialog';
  photo.innerHTML = '<button aria-label="关闭照片">×</button><img src="assets/collaboration/city-training.png" alt="陈学宏老师再次培训指导完整照片">';
  document.body.append(photo);
  answer.querySelector('button').onclick = () => answer.close();
  photo.querySelector('button').onclick = () => photo.close();
  page.querySelectorAll('[data-city-photo]').forEach(button => button.onclick = () => {
    const image = photo.querySelector('img');
    image.src = button.dataset.cityPhoto;
    image.alt = button.querySelector('img').alt;
    photo.showModal();
  });
  const answers = [
    '<h2>时间，要回到学生身上。</h2><p>作答时间应以目标年级学生的实际表现为依据。需要分别评估<strong>阅读材料、理解任务、分析推理、作答与检查</strong>的用时，重点关注两道综合题的阅读量、问题链长度与表达负担。</p><p>尚未获得学生试做数据时，具体时长只能作为<em>设计预估</em>。应通过不同学习水平学生的试做，结合完成时间、未完成题目和卡顿位置，调整题量与表达。</p><p class="city-answer-conclusion">让学生有时间思考，<br><em>是时间设计的底线。</em></p>',
    '<h2>情境，要参与学生的高阶思维过程。</h2><p>选择深中通道，关键在于它能否<em>承载一条从知识识别走向综合应用的思维链</em>。智慧交通监控网络中的信息传输、链路可靠性与故障排查，为网络诊断、路由绕行、协议选择、网页解析和信息安全提供了共同的问题背景。</p><p>这个情境不是一次确定的，而是<button class="city-ipo-trigger" aria-expanded="false">基于 IPO 命题流程反复迭代优化的结果</button>：在 I 输入中提取、重构并映射学业质量要求，形成可观察任务；在 P 处理中沿着“诊断—绕行—传输—解析—发布”组织问题链；再通过学生的判断、选择与解释形成 O 评价证据。</p><div class="city-answer-figures" hidden><button data-answer-image="assets/collaboration/answer-ipo-input.png"><span>I · 输入</span><img src="assets/collaboration/answer-ipo-input.png" alt="IPO命题流程的Input输入设计图"></button><button data-answer-image="assets/collaboration/answer-ipo-process.png"><span>P · 处理</span><img src="assets/collaboration/answer-ipo-process.png" alt="IPO命题流程的Process处理设计图"></button></div><p>问题链的设计意图，是推动学生从多点知识识别走向关联诊断、方案选择和迁移解释，并进一步思考交通服务、安全运行与信息社会责任。<strong>高阶性来自学生必须完成的认知加工，而不是来自“深中通道”这个名称本身。</strong></p><p>地域意义可以帮助学生理解技术的公共价值，但作答所需的网络与数据材料仍必须由题目充分提供。</p><p class="city-answer-conclusion">情境的价值，<br>在于推动学生走向<em>关联、迁移与价值判断。</em></p>'
  ];
  page.querySelectorAll('[data-question]').forEach(button => button.onclick = () => {
    answer.querySelector('.city-answer-body').innerHTML = answers[Number(button.dataset.question)];
    const ipoTrigger = answer.querySelector('.city-ipo-trigger');
    if (ipoTrigger) {
      const figures = answer.querySelector('.city-answer-figures');
      ipoTrigger.onclick = () => {
        if (!figures.hidden) return;
        figures.hidden = false;
        requestAnimationFrame(() => figures.classList.add('is-revealed'));
        ipoTrigger.setAttribute('aria-expanded', 'true');
      };
    }
    answer.querySelectorAll('[data-answer-image]').forEach(imageButton => imageButton.onclick = () => {
      const image = photo.querySelector('img');
      image.src = imageButton.dataset.answerImage;
      image.alt = imageButton.querySelector('img').alt;
      photo.showModal();
    });
    answer.showModal();
    answer.querySelector('.city-answer-body').scrollTop = 0;
  });
  page.querySelectorAll('[data-city-pdf]').forEach(button => button.onclick = () => openPdf('resources/pdf/' + button.dataset.cityPdf, button.textContent.replace('↗', '').trim().split('\n')[0]));
  const scenes = [...page.querySelectorAll('.city-scene')];
  const progress = [...page.querySelectorAll('.city-progress button')];
  let current = 0, question = 0, lastWheel = 0;
  function selectQuestion(index) {
    question = index;
    page.querySelectorAll('[data-question]').forEach((node, i) => node.hidden = i !== index);
    page.querySelectorAll('[data-select-question]').forEach((node, i) => node.setAttribute('aria-current', String(i === index)));
    page.querySelectorAll('.city-question-proof').forEach((node, i) => node.hidden = i !== index);
  }
  function show(index) {
    current = Math.max(0, Math.min(3, index));
    scenes.forEach((node, i) => { node.classList.toggle('city-active', i === current); node.inert = i !== current; });
    progress.forEach((node, i) => node.setAttribute('aria-current', String(i === current)));
  }
  function move(direction) {
    if (page.getAnimations({subtree:true}).some(animation => animation.playState === 'running')) {
      page.getAnimations({subtree:true}).forEach(animation => animation.finish());
      return;
    }
    if (current === 3 && direction > 0 && question === 0) return selectQuestion(1);
    if (current === 3 && direction < 0 && question === 1) return selectQuestion(0);
    show(current + direction);
  }
  progress.forEach((button, i) => button.onclick = () => show(i));
  page.querySelectorAll('[data-select-question]').forEach(button => button.onclick = () => selectQuestion(Number(button.dataset.selectQuestion)));
  document.addEventListener('keydown', event => {
    if (document.body.dataset.page !== '7' || document.querySelector('dialog[open]') || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); move(event.key === 'ArrowDown' ? 1 : -1); }
  });
  page.addEventListener('wheel', event => {
    if (document.querySelector('dialog[open]') || event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    if (performance.now() - lastWheel < 850 || Math.abs(event.deltaY) < 12) return;
    lastWheel = performance.now(); move(Math.sign(event.deltaY));
  }, {passive:false});
  window.resetCityStage = () => {
    selectQuestion(0);
    scenes.forEach(node => node.classList.remove('city-active'));
    current = 0;
    void page.offsetWidth;
    show(0);
  };
  show(0);
})();

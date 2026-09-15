(() => {
  const scroll = document.querySelector('.collab-scroll');
  const acts = [...scroll.querySelectorAll('.collab-act')];
  const dots = [...document.querySelectorAll('.collab-dots button')];
  const rail = document.querySelector('.source-rail');
  const cards = [...rail.children];
  let act = 0, source = 0;
  const behavior = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  function goAct(i) { scroll.scrollTo({top: acts[Math.max(0, Math.min(acts.length-1,i))].offsetTop, behavior:behavior()}); }
  function goSource(i) {
    source=Math.max(0,Math.min(cards.length-1,i));
    selectExhibit(source);
    cards[source].focus({preventScroll:true});
  }
  scroll.addEventListener('scroll', () => {
    const next = Math.max(0,Math.min(acts.length-1,Math.round(scroll.scrollTop / scroll.clientHeight)));
    if (next !== act) acts.forEach((a,i)=>a.classList.toggle("is-current",i===next));
    act = next;
    dots.forEach((d,i) => d.setAttribute('aria-current', String(i===act)));
    acts.forEach((a,i)=>a.inert=i!==act);
  },{passive:true});
  dots.forEach((d,i)=>d.addEventListener('click',()=>goAct(i)));
  const pieces=[...document.querySelectorAll('.exhibit-piece')];
  function selectExhibit(i){source=i;cards.forEach((c,j)=>c.setAttribute('aria-current',String(i===j)));pieces.forEach((p,j)=>{p.hidden=i!==j;});}
  cards.forEach((c,i)=>{c.addEventListener('click',()=>selectExhibit(i));c.addEventListener('focus',()=>selectExhibit(i));});
  selectExhibit(0);
  const training=document.querySelector('#training-gallery');
  document.querySelector('#open-training-gallery').addEventListener('click',()=>training.showModal());
  document.querySelector('#training-strip').addEventListener('click',e=>{
    const img=e.currentTarget.querySelector('img');const rect=img.getBoundingClientRect();const y=(e.clientY-rect.top)/rect.height*31726;
    const ranges=window.TRAINING_REGIONS;
    const region=ranges.find(r=>y>=r[0]&&y<=r[1]) || ranges.reduce((a,b)=>Math.abs((a[0]+a[1])/2-y)<Math.abs((b[0]+b[1])/2-y)?a:b);
    const h=region[1]-region[0];const width=Math.min(innerWidth*.83,(innerHeight*.8)*1456/h);const scale=width/1456;
    const crop=document.querySelector('.training-crop');crop.style.width=width+'px';crop.style.height=h*scale+'px';
    const full=crop.querySelector('img');full.style.width=width+'px';full.style.transform=`translateY(${-region[0]*scale}px)`;
    document.querySelector('#training-detail').showModal();
  });
  cards.forEach(card=>card.addEventListener('click',()=>{
    const rect=card.getBoundingClientRect();
    document.documentElement.style.setProperty('--source-x',`${rect.left+rect.width/2}px`);
    document.documentElement.style.setProperty('--source-y',`${rect.top+rect.height/2}px`);
  },true));
  const table=document.querySelector('.human-trinity');
  const choices=[...table.querySelectorAll('.human-choice')];
  function focusDecision(i){table.dataset.focus=i;choices.forEach((c,j)=>c.classList.toggle('is-focused',i===j));}
  choices.forEach((c,i)=>{c.addEventListener('pointerenter',()=>focusDecision(i));c.addEventListener('focus',()=>focusDecision(i));});
  focusDecision(0);
  const stage = document.querySelector('.agent-stage');
  const character = document.querySelector('.agent-character');
  character.addEventListener('click',()=>{const open=stage.classList.toggle('expanded');character.setAttribute('aria-expanded',String(open));stage.querySelectorAll('.glass-wing').forEach(w=>w.inert=!open);});
  stage.querySelectorAll('.glass-wing').forEach(w=>w.inert=true);
  const viewer = document.querySelector('#collab-image-dialog');
  document.querySelectorAll('[data-collab-image]').forEach(button=>button.addEventListener('click',()=>{
    const img=document.querySelector('#collab-full-image'); img.src=button.dataset.collabImage; img.alt=button.querySelector('h3')?.textContent || button.querySelector('img')?.alt || '学习资料';document.querySelector('#collab-image-title').textContent=img.alt;viewer.showModal();
  }));
  document.querySelector('#show-ipo').addEventListener('click',()=>document.querySelector('#ipo-dialog').showModal());
  document.addEventListener('keydown',e=>{
    if(document.body.dataset.page!=='3'||document.querySelector('dialog[open]')||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const direction=e.key==='ArrowRight'?1:-1;if(act===0)goSource(source+direction);else goAct(act+direction);}
    if(e.code==='Space' && !e.target.closest('button,a,input')){e.preventDefault();goAct(act+1);}
  });
  const recall=document.querySelector('.recall-act');
  const reflection=document.querySelector('.memory-reflection');
  let viewed2025=false;
  document.querySelector('#exam-2025').addEventListener('click',()=>{viewed2025=true;});
  document.querySelector('#pdf-viewer').addEventListener('close',()=>{
    if(viewed2025){viewed2025=false;recall.classList.add('reflecting');reflection.inert=false;document.querySelector('#memory-back').focus({preventScroll:true});}
  });
  document.querySelector('#memory-back').addEventListener('click',()=>{recall.classList.remove('reflecting');reflection.inert=true;document.querySelector('#exam-2025').focus({preventScroll:true});});
  window.resetCollaboration=()=>{recall.classList.remove("reflecting");reflection.inert=true;viewed2025=false;goAct(0);goSource(0);stage.classList.remove('expanded');character.setAttribute('aria-expanded','false');stage.querySelectorAll('.glass-wing').forEach(w=>w.inert=true);};
  acts.forEach((a,i)=>{a.inert=i!==0;a.classList.toggle("is-current",i===0);});
})();
if (location.hash === '#collaboration') setPage(3);

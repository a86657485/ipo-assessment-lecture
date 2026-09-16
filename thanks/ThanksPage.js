(() => {
  const page=document.createElement('section');page.className='deck-page thanks-page';page.dataset.pageIndex='8';page.setAttribute('aria-label','感谢');
  page.innerHTML='<div class="thanks-viewport" aria-hidden="true"></div><div class="thanks-atmosphere" aria-hidden="true"></div><p class="thanks-intro">最后，想说一些感谢。</p><div class="thanks-captions" aria-live="polite"></div><div class="thanks-closing"><p>感谢每一次指导</p><p>感谢每一次并肩</p></div><div class="thanks-final"><h1>THANK YOU</h1><p>从一道题，到一套评价逻辑</p><small>2026　龙岗区布吉贤义外国语学校　信息科技</small></div><footer class="thanks-footer"><span></span><i>致每一位同行者</i></footer>';
  document.querySelector('main').append(page);
  let current=null,generation=0,loading;
  function script(src){return new Promise((resolve,reject)=>{const node=document.createElement('script');node.src=src;node.onload=resolve;node.onerror=reject;document.head.append(node);});}
  function load(){if(!loading)loading=Promise.all([script('resources/vendor/thanks/thanks-images.js'),script('resources/vendor/thanks/thanks-scene.js')]).catch(error=>{loading=null;throw error;});return loading;}
  window.startThanks=async()=>{
    const token=++generation;current?.dispose();current=null;
    page.dataset.phase='intro';page.style.setProperty('--thanks-bg','#121516');page.style.setProperty('--thanks-accent','#283032');
    page.querySelectorAll('.thanks-intro,.thanks-closing,.thanks-final,.thanks-footer').forEach(node=>node.style.opacity='0');
    try{await load();if(token!==generation||document.body.dataset.page!=='8')return;
      current=window.createThanksScene(page,window.gratitudeItems);
    }catch{if(token===generation){page.querySelector('.thanks-final').style.opacity='1';page.dataset.phase='final';}}
  };
  window.stopThanks=()=>{generation++;current?.dispose();current=null;};
  window.resetThanks=window.startThanks;
  // Small diagnostic interface for lifecycle and offline verification; not part of the UI.
  window.thanksStatus=()=>({active:!!current,running:current?.running||false,target:current?.scroll.target,current:current?.scroll.current,velocity:current?.scroll.velocity,mode:page.dataset.renderMode,phase:page.dataset.phase,textureCount:current?.textures.length||0,cameraZ:current?.camera?.position.z,quality:current?.quality});
})();

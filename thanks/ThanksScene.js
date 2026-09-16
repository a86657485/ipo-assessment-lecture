import * as THREE from 'three';
import {ThanksScroll} from './ThanksScroll.js';
import {ThanksGallery} from './ThanksGallery.js';

const smooth=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b);
class ThanksScene {
  constructor(page,items){
    this.page=page;this.items=items;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.scroll=new ThanksScroll(items.length,this.reduced);this.textures=[];this.running=false;this.disposed=false;this.raf=null;
    this.started=performance.now();this.endingAt=null;this.activeCaption=-1;this.quality=true;this.slowFrames=0;this.ready=false;
    this.onResize=()=>{this.resize();this.wake();};
    this.onKey=e=>{if(document.body.dataset.page!=='8'||document.querySelector('dialog[open]')||e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();this.advance(e.key==='ArrowDown'?1:-1);}};
    this.onWheel=e=>{if(e.ctrlKey||Math.abs(e.deltaY)<=Math.abs(e.deltaX)||document.body.dataset.page!=='8')return;e.preventDefault();
      if(!this.ready)return;if(performance.now()-this.started<2600){this.started=performance.now()-2700;this.wake();return;}
      if(this.scroll.wheel(e,performance.now())){this.endingAt=null;this.wake();}};
    this.onVisibility=()=>{if(document.hidden){cancelAnimationFrame(this.raf);this.raf=null;this.running=false;}else this.wake();};
    this.onLost=e=>{e.preventDefault();if(!this.disposed){this.releaseGPU();this.useFallback();this.wake();}};
    this.captions=items.map(item=>{
      const node=document.createElement('div');node.className='thanks-caption';node.dataset.side=item.side;
      const title=document.createElement('h2'),text=document.createElement('p');title.textContent=item.title;text.textContent=item.text;
      node.append(title,text);page.querySelector('.thanks-captions').append(node);return node;
    });
  }
  async init(){
    try{
      this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(45,16/9,.1,180);
      this.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
      this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.setClearColor(0x000000,0);
      this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
      this.renderer.domElement.addEventListener('webglcontextlost',this.onLost);
      this.page.querySelector('.thanks-viewport').append(this.renderer.domElement);
      const loader=new THREE.TextureLoader();
      this.textures=await Promise.all(this.items.map(async item=>{
        const src=this.source(item);
        try{const texture=await loader.loadAsync(src);texture.colorSpace=THREE.SRGBColorSpace;return texture;}
        catch{return this.placeholder(item);}
      }));
      if(this.disposed){this.textures.forEach(t=>t.dispose());this.textures=[];return;}
      this.gallery=new ThanksGallery(this.scene,this.items,this.textures);
      this.page.dataset.renderMode='webgl';
    }catch(error){if(this.disposed)return;this.releaseGPU();this.useFallback();}
    if(this.disposed)return;
    this.ready=true;this.resize();this.page.addEventListener('wheel',this.onWheel,{passive:false});
    document.addEventListener('keydown',this.onKey);document.addEventListener('visibilitychange',this.onVisibility);window.addEventListener('resize',this.onResize);
    this.wake();
  }
  source(item){return location.protocol==='file:'?(window.THANKS_IMAGE_DATA?.[item.image]||item.image):item.image;}
  placeholder(item){
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=800;const ctx=canvas.getContext('2d');
    ctx.fillStyle=item.themeColor||'#292b2e';ctx.fillRect(0,0,1200,800);ctx.fillStyle='#c4c4bc';ctx.font='32px sans-serif';ctx.textAlign='center';ctx.fillText('此处留给一段记忆',600,380);
    ctx.font='22px sans-serif';ctx.fillText(item.title,600,435);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t;
  }
  useFallback(){
    this.page.dataset.renderMode='fallback';this.fallbacks=this.items.map(item=>{
      const frame=document.createElement('div');frame.className='thanks-fallback-photo';frame.dataset.side=item.side;
      const img=document.createElement('img');img.alt=item.title;img.src=this.source(item);
      img.onerror=()=>{img.remove();frame.textContent='此处留给一段记忆';frame.style.background=item.themeColor;};frame.append(img);
      this.page.querySelector('.thanks-viewport').append(frame);return frame;
    });
  }
  resize(){if(!this.renderer)return;const r=this.page.getBoundingClientRect();if(!r.width||!r.height)return;
    this.renderer.setSize(r.width,r.height,false);this.camera.aspect=r.width/r.height;this.camera.updateProjectionMatrix();this.gallery?.resize(this.camera.aspect);}
  advance(direction){if(!this.ready)return;if(performance.now()-this.started<2600){this.started=performance.now()-2700;this.wake();return;}
    if(this.scroll.move(direction,performance.now())){this.endingAt=null;this.wake();}}
  wake(){if(this.disposed||document.hidden||this.running)return;this.running=true;this.previousTime=performance.now();this.frame(this.previousTime);}
  frame(now){
    if(this.disposed)return;
    const elapsed=(now-this.started)/1000,rawDt=(now-this.previousTime)/1000,dt=Math.min(.5,Math.max(.001,rawDt));this.previousTime=now;
    if(rawDt>.04)this.slowFrames++;else this.slowFrames=Math.max(0,this.slowFrames-1);
    if(this.slowFrames>8&&this.quality){this.quality=false;if(this.renderer){this.renderer.setPixelRatio(1);this.resize();}this.page.dataset.quality='low';}
    const intro=elapsed<2.6;
    this.page.querySelector('.thanks-intro').style.opacity=String(smooth(.4,.9,elapsed)*(1-smooth(1.65,2.1,elapsed)));
    if(elapsed>1.85)this.scroll.update(dt);
    const p=this.scroll.current,last=this.items.length-1,end=Math.max(0,p-last);
    this.page.querySelector('.thanks-viewport').style.opacity=String(smooth(1.8,2.65,elapsed));
    if(this.renderer){
      this.camera.position.z=10-Math.min(p,last)*12;
      this.camera.position.y=this.reduced?0:this.scroll.velocity*.018;
      this.gallery.update(p,this.scroll.velocity,this.quality,this.reduced);this.renderer.render(this.scene,this.camera);
    }else if(this.fallbacks){
      this.fallbacks.forEach((frame,i)=>{const r=i-Math.min(p,last),fade=Math.max(0,1-Math.abs(r));
        frame.style.opacity=String(fade*(1-end));frame.style.transform=`translateZ(${-r*420-end*650}px) rotate(${this.items[i].rotation||0}deg)`;});
    }
    const selected=Math.max(0,Math.min(last,Math.round(p)));
    const captionIndex=!intro&&end<.05&&Math.abs(selected-p)<.32?selected:-1;
    if(this.activeCaption!==captionIndex){this.activeCaption=captionIndex;this.captions.forEach((node,i)=>node.classList.toggle('is-current',i===captionIndex));}
    const mood=elapsed<1.85||end>.12?{background:'#121516',accent:'#283032'}:{background:this.items[selected].themeColor,accent:this.items[selected].accentColor||this.items[selected].themeColor};
    const moodKey=mood.background+'|'+mood.accent;
    if(this.mood!==moodKey){this.mood=moodKey;this.page.style.transitionDuration=(Math.abs(this.scroll.velocity)>.5?'1.2s':'1.5s');this.page.style.setProperty('--thanks-bg',mood.background);this.page.style.setProperty('--thanks-accent',mood.accent);this.moodUntil=now+1650;}
    this.page.dataset.memory=String(selected);this.page.dataset.target=String(this.scroll.target);
    this.page.querySelector('.thanks-footer').style.opacity=String(!intro&&end<.1?.55:0);
    this.page.querySelector('.thanks-footer span').textContent=`${String(selected+1).padStart(2,'0')} / ${String(this.items.length).padStart(2,'0')}`;
    const closing=this.page.querySelector('.thanks-closing'),final=this.page.querySelector('.thanks-final');
    if(end>.96){
      if(this.endingAt===null)this.endingAt=now;
      const t=(now-this.endingAt)/1000;
      closing.style.opacity=String(smooth(0,.9,t)*(1-smooth(2.7,3.5,t)));
      final.style.opacity=String(smooth(3.6,5,t));final.style.transform=`translateY(${(1-smooth(3.6,5,t))*18}px)`;
      this.page.dataset.phase=t>=5?'final':'closing';
    }else{closing.style.opacity='0';final.style.opacity='0';this.page.dataset.phase=intro?'intro':'gallery';this.endingAt=null;}
    const unsettled=intro||Math.abs(this.scroll.current-this.scroll.target)>.0001||Math.abs(this.scroll.velocity)>.001||now<(this.moodUntil||0)||end>.96&&now-this.endingAt<5300;
    if(unsettled){this.raf=requestAnimationFrame(t=>this.frame(t));}else{this.running=false;this.raf=null;}
  }
  releaseGPU(){
    this.gallery?.dispose();this.gallery=null;
    this.textures.forEach(t=>t.dispose());this.textures=[];
    if(this.renderer){this.renderer.domElement.removeEventListener('webglcontextlost',this.onLost);this.renderer.dispose();this.renderer.forceContextLoss();this.renderer.domElement.remove();this.renderer=null;}
  }
  dispose(){
    this.disposed=true;this.running=false;cancelAnimationFrame(this.raf);this.raf=null;
    this.page.removeEventListener('wheel',this.onWheel);document.removeEventListener('keydown',this.onKey);document.removeEventListener('visibilitychange',this.onVisibility);window.removeEventListener('resize',this.onResize);
    this.releaseGPU();this.fallbacks?.forEach(node=>node.remove());this.captions.forEach(node=>node.remove());
  }
}
window.createThanksScene=(page,items)=>{const scene=new ThanksScene(page,items);scene.init();return scene;};

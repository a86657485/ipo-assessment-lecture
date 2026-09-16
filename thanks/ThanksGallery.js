import * as THREE from 'three';

// Depth layout, aspect scaling and opacity sampling derive from Depth Gallery/Gallery.js.
// Unlike the demo, photo edges are never cropped and movement ceases at rest.
const vertex = `varying vec2 vUv; uniform float uVelocity;
void main(){vUv=uv;vec3 p=position;
p.z += sin(uv.y*3.14159265)*sin(uv.x*3.14159265)*uVelocity*0.018;
gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`;
const fragment = `varying vec2 vUv;uniform sampler2D uMap;uniform float uOpacity;uniform float uFocus;
void main(){vec4 pixel=texture2D(uMap,vUv);float l=dot(pixel.rgb,vec3(.2126,.7152,.0722));
vec3 c=mix(vec3(l),pixel.rgb,.96);c*=mix(.60,1.0,uFocus);
float edge=min(min(vUv.x,1.0-vUv.x),min(vUv.y,1.0-vUv.y));
float feather=smoothstep(0.0,.052,edge);
gl_FragColor=vec4(c,pixel.a*uOpacity*feather);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
export class ThanksGallery {
  constructor(scene, items, textures) {
    this.scene = scene; this.items = items; this.gap = 12; this.geometry = new THREE.PlaneGeometry(1,1,12,8);
    this.planes = items.map((item,i) => {
      const texture = textures[i];
      const material = new THREE.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false,
        uniforms:{uMap:{value:texture},uOpacity:{value:0},uFocus:{value:1},uVelocity:{value:0}}});
      const plane = new THREE.Mesh(this.geometry,material);
      plane.userData.aspect = texture.image.width / texture.image.height;
      plane.position.z = -i * this.gap;
      scene.add(plane);return plane;
    });
    this.resize(16/9);
  }
  resize(aspect) {
    const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(45/2)) * 10;
    this.viewWidth = viewHeight * aspect;
    this.planes.forEach((plane,i)=>{
      const centered=this.items[i].side==='center';
      const width=Math.min(this.viewWidth*(centered?.53:.51),viewHeight*(centered?.64:.77)*plane.userData.aspect);
      plane.userData.width=width;plane.userData.height=width/plane.userData.aspect;
    });
  }
  update(progress, velocity, quality, reduced) {
    const last=this.items.length-1;const ending=Math.max(0,progress-last);
    const clamped=Math.min(progress,last);
    this.planes.forEach((plane,i)=>{
      const item=this.items[i], relative=i-clamped;
      // Keep the next photograph present in deep space. During travel the
      // current and next frames overlap; perspective, rather than a flat
      // crossfade, carries the transition.
      let opacity=relative<0 ? 1-THREE.MathUtils.smoothstep(-relative,.04,.86)
        : relative<=1 ? .07+(1-THREE.MathUtils.smoothstep(relative,0,1))*.93
        : relative<2 ? .025*(2-relative) : 0;
      if(ending>0)opacity=i===last?Math.pow(1-ending,1.5):0;
      plane.visible=opacity>.002;
      const motion=reduced?0:Math.min(Math.abs(velocity)*.18,1);
      const side=item.side==='left'?-1:item.side==='right'?1:0;
      plane.position.x=side*this.viewWidth*.207;
      plane.position.y=item.side==='center'?.6:0;
      plane.position.z=-i*this.gap-(i===last?ending*22:0);
      plane.rotation.z=THREE.MathUtils.degToRad(item.rotation||0);
      plane.rotation.y=(reduced?0:velocity*.006)*side;
      plane.scale.set(plane.userData.width*(1+motion*.012),plane.userData.height*(1+motion*.012),1);
      plane.material.uniforms.uOpacity.value=opacity;
      plane.material.uniforms.uFocus.value=Math.max(.12,1-Math.abs(relative));
      plane.material.uniforms.uVelocity.value=quality&&!reduced?Math.max(-1,Math.min(1,velocity)) : 0;
    });
  }
  dispose(){this.planes.forEach(plane=>{this.scene.remove(plane);plane.material.dispose();});this.geometry.dispose();this.planes=[];}
}

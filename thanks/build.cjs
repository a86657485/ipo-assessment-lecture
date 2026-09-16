// Developer utility. End users only double-click index.html; Node is not needed to present.
const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const items={};
for(const name of fs.readdirSync(path.join(root,'public/images/thanks')).filter(name=>/\.(jpg|jpeg|png)$/i.test(name))){
  const image='public/images/thanks/'+name;items[image]='data:image/'+(/\.png$/i.test(name)?'png':'jpeg')+';base64,'+fs.readFileSync(path.join(root,image)).toString('base64');
}
fs.writeFileSync(path.join(root,'resources/vendor/thanks/thanks-images.js'),'window.THANKS_IMAGE_DATA='+JSON.stringify(items)+';\n');
require('esbuild').buildSync({entryPoints:[path.join(__dirname,'ThanksScene.js')],bundle:true,format:'iife',minify:true,target:'chrome100',outfile:path.join(root,'resources/vendor/thanks/thanks-scene.js'),nodePaths:(process.env.NODE_PATH||'').split(path.delimiter).filter(Boolean),legalComments:'eof'});
console.log('Built local Three.js gallery and '+Object.keys(items).length+' offline textures.');

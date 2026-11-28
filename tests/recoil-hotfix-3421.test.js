// Execute the actual client recoil helper so idle mobs/bosses cannot crash the render loop.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const helper=html.match(/function activeRecoil3421\([^\n]+/)[0],curve=html.match(/function impactCurve314\([^\n]+/)[0];
const run=new Function(helper+'\n'+curve+'\nreturn activeRecoil3421')();
let checks=0;const ok=v=>{assert.ok(v);checks++};
for(const record of [undefined,null,{}, {start:0},{duration:10},{start:0,duration:0},{start:0,duration:-1},{start:NaN,duration:10},{start:0,duration:Infinity}])for(const t of [0,1,100,Infinity,NaN])ok(run(record,t)===null);
for(let t=-10;t<=250;t++){const v=run({start:10,duration:200},t);ok((v!==null)===(t>=10&&t<210));if(v)ok(Object.values(v).every(Number.isFinite));}
ok(html.includes('rx=activeRecoil3421(h,now)')&&html.includes('fx=activeRecoil3421(hit,now)'));
console.log('V34.2.1 recoil checks passed: '+checks);

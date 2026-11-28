// V34.4 deterministic compatibility regression.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),p=require('../assets/game-policy.js');
let count=0;const ok=(v,msg)=>{assert.ok(v,msg);count++};
for(const aa of [true,false])for(const lp of [true,false]){
 const options=p.rendererOptions344(aa,lp);ok(options.length>=2&&options.length<=3,'bounded fallback');
 for(let fail=0;fail<options.length;fail++){let calls=0;const r=p.createRenderer344(()=>{if(calls++<fail)throw Error('mock GPU failure');return {}},options);ok(r.index===fail&&r.failures.length===fail,'fallback order');}
 let failed=false;try{p.createRenderer344(()=>{throw Error('no context')},options)}catch{failed=true}ok(failed,'all fail');
}
for(const w of [0,1,320,390,1920,7680])for(const h of [0,1,390,844,2160])for(const d of [0,1,2,3,NaN]){const q=p.viewport344(w,h,d,4096,2000000);if(w<2||h<2||!Number.isFinite(d)||d<=0)ok(q===null,'hidden/invalid viewport');else ok(q.ratio>0&&w*q.ratio<=4096.00001&&h*q.ratio<=4096.00001&&w*h*q.ratio*q.ratio<=2000000.00001,'buffer cap');}
for(const hidden of [false,true]){const s={};ok(p.gpuState344(s,'restored')==='ignore','unsolicited restoration');ok(p.gpuState344(s,'lost')==='pause','pause');ok(p.gpuState344(s,'lost')==='ignore','duplicate loss');ok(p.gpuState344(s,'restored',hidden)===(hidden?'defer':'resume'),'first restoration');ok(p.gpuState344(s,'lost')==='pause','second loss');ok(p.gpuState344(s,'restored')==='reload','repeated loss safe reload');}
let released=0;ok(!p.capture344({},1),'unsupported capture');ok(!p.capture344({setPointerCapture(){throw Error('unavailable')}},1),'capture failure');ok(p.capture344({setPointerCapture(){}},1),'capture success');p.release344({hasPointerCapture(){return true},releasePointerCapture(){released++}},1);p.release344({hasPointerCapture(){throw Error()}},1);ok(released===1,'release safe');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');for(const marker of ['createRenderer344(opt=>new T.WebGLRenderer','viewport344(w,h,ratio,maxBuffer74','gpu344.lost','function pause344','function resume344','function clearInput344',"window.addEventListener('pagehide'","window.addEventListener('pageshow'","webglcontextrestored","capture344(joy,e.pointerId)","release344(joy,j)"])ok(html.includes(marker),'client '+marker);
console.log('V34.4 compatibility checks passed: '+count);

const assert=require('node:assert/strict');
const fs=require('node:fs');
const p=require('./assets/game-policy.js');
(async()=>{
 let count=0;
 for(const preset of Object.keys(p.MOBILE_CLARITY171))for(const tier of [0,1,2])for(const weak of [false,true])for(const [w,h] of [[320,568],[390,844],[844,390],[1024,768],[1920,1080]])for(const dpr of [1,2,3,4]){
  const r=p.mobileResolution139(w,h,dpr,1,tier,1,false,4096,preset,weak);
  assert(r>0&&r<=dpr&&r<=p.MOBILE_CLARITY171[preset].max);
  assert(w*h*r*r<=p.mobilePixelBudget355(preset,tier,weak)+.01);count++;
 }
 assert(p.mobileResolution139(390,844,3,1,1,1,false,4096,'balanced')>1.2);
 assert(p.mobileResolution139(390,844,3,1,2,1,false,4096,'sharp',true)**2*390*844<=1000000.01);
 assert.equal(p.mobileResolution139(0,844,3,1,1,1,false,4096),0);
 assert.deepEqual(p.hudPoint355(0,1,320,568,80,80),[.15,1-48/568]);
 assert.deepEqual(p.hudPoint355(0,0,40,40,90,90),[.5,.5]);
 assert.equal(p.hudPoint355(0,0,0,100,50,50),null);
 let cache=new Map(),calls=0;const load=async()=>{calls++;return {asset:true}};
 const a=p.sharedAsset355(cache,'tree',load),b=p.sharedAsset355(cache,'tree',load);
 assert.equal(a,b);assert.equal(await a,await b);assert.equal(calls,1);
 await assert.rejects(p.sharedAsset355(cache,'bad',async()=>{throw Error('offline')}));
 assert(!cache.has('bad'));assert.deepEqual(await p.sharedAsset355(cache,'bad',load),{asset:true});
 const html=fs.readFileSync('index.html','utf8'),hud=fs.readFileSync('assets/ww346-hud.js','utf8');
 assert(html.includes('sharedAsset355(natureAssetMemo213,cacheKey')&&html.includes('preset77,lowMemory71):resolution77'));
 assert(hud.includes('hudPoint355(q[0],q[1]')&&hud.includes('if(!editing)loadLayout()'));
 console.log('V35.0.5 mobile quality: '+count+' budget scenarios, HUD bounds and concurrent load/retry passed');
})().catch(e=>{console.error(e);process.exitCode=1});

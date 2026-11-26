const {chromium}=require('playwright'),fs=require('node:fs');
const URL='https://wish-world.onrender.com/play?perf=1';
(async()=>{
 fs.mkdirSync('live-motion-output',{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:800},recordVideo:{dir:'live-motion-output',size:{width:960,height:600}}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let results=[];
 try{
  const response=await page.goto(URL,{timeout:90000,waitUntil:'domcontentloaded'});console.log('LIVE HTTP',response.status(),page.url());
  const version=await page.evaluate(async()=>await (await fetch('/api/version')).json());console.log('LIVE VERSION',JSON.stringify(version));
  await page.waitForFunction(()=>window.wwGraphics59?.avatarAsset?.startsWith('VRM '),{},{timeout:90000});
  await page.evaluate(()=>{
   document.querySelectorAll('dialog[open]').forEach(d=>d.close());
   window.liveSamples110=[];const original=WWVRM.animate;
   WWVRM.animate=function(a,dt,gait,mode,jump,detail,ground){
    const result=original.apply(this,arguments);if(!ground||!a.poseCheck)return result;
    const T=a.T,raw=a.vrm.humanoid,forward=a.modelForward.clone().applyQuaternion(a.root.getWorldQuaternion(new T.Quaternion())),side=new T.Vector3(0,1,0).cross(forward).normalize();
    const get=n=>raw.getRawBoneNode(n)?.getWorldPosition(new T.Vector3());
    const arms=['left','right'].map(s=>{const A=get(s+'UpperArm'),B=get(s+'LowerArm'),C=get(s+'Hand');if(!A||!B||!C)return null;const u=B.clone().sub(A),v=C.clone().sub(B),w=C.clone().sub(A);return {elbow:u.angleTo(v),swing:w.dot(forward),out:w.dot(side),height:w.y}});
    window.liveSamples110.push({state:a.motionState,profile:a.motionProfile,gait,arms,legs:a.poseCheck.rawLeg,ik:a.footIK?.mode||null});
    if(window.liveSamples110.length>1600)window.liveSamples110.shift();return result;
   };
  });
  async function clear(){await page.evaluate(()=>window.liveSamples110=[])}
  async function collect(id,phase){
   const data=await page.evaluate(()=>window.liveSamples110.splice(0));
   const rows=data.filter(x=>x.state===phase&&x.profile===id),arms=rows.flatMap(x=>x.arms).filter(Boolean),legs=rows.flatMap(x=>x.legs||[]).filter(Boolean);
   const range=(a,k)=>a.length?[+Math.min(...a.map(x=>x[k])).toFixed(3),+Math.max(...a.map(x=>x[k])).toFixed(3)]:null;
   let r={id,phase,frames:rows.length,elbowRad:range(arms,'elbow'),armForward:range(arms,'swing'),armSide:range(arms,'out'),armHeight:range(arms,'height'),kneeFlex:range(legs,'flex'),kneeForward:range(legs,'forward'),ikFrames:rows.filter(x=>x.ik).length};
   results.push(r);console.log('LIVE MOTION',JSON.stringify(r));return r;
  }
  async function move(id,phase,key,run=false){await clear();if(run)await page.keyboard.down('Shift');await page.keyboard.down(key);try{await page.waitForFunction(p=>window.wwGraphics59?.motionState===p,phase,{timeout:15000});await page.waitForTimeout(1600);await page.screenshot({path:'live-motion-output/'+id+'-'+phase+'.png',timeout:45000});return await collect(id,phase)}finally{await page.keyboard.up(key);if(run)await page.keyboard.up('Shift')}}
  async function choose(id){await page.evaluate(()=>studio12());await page.locator('#rosterTabs106 [data-gender="'+(id[0]==='f'?'female':'male')+'"]').click();await page.locator('#rosterCards106 button').nth(Number(id.slice(1))-1).click();await page.waitForFunction(id=>window.wwRosterReady===id,id,{timeout:60000});await page.locator('#saveAvatar106').click();await page.waitForFunction(id=>window.wwGraphics59?.avatarPreset===id,id,{timeout:60000});}
  for(const id of ['m1','f1','m2','f2']){
   if(id!=='m1')await choose(id);
   await clear();await page.waitForTimeout(1000);await collect(id,'idle');
   try{await move(id,'walk','d');await move(id,'run','a',true)}catch(e){console.log('MOVE BLOCKED',id,e.message)}
   await page.waitForFunction(()=>window.wwGraphics59?.motionState==='idle',{},{timeout:20000});
   await clear();await page.keyboard.press('Space');await page.waitForTimeout(1700);
   const data=await page.evaluate(()=>window.liveSamples110.slice());console.log('LIVE JUMP',id,JSON.stringify([...new Set(data.map(x=>x.state))]));
   for(const phase of ['jump_start','jump_takeoff','jump_air','jump_land']){await page.evaluate(d=>window.liveSamples110=d,data);await collect(id,phase)}
  }
  console.log('PAGE ERRORS',JSON.stringify(errors));console.log('LIVE SUMMARY',JSON.stringify({tests:results.length,empty:results.filter(x=>!x.frames).length,errors:errors.length,pet:await page.evaluate(()=>window.wwGraphics59?.petMotion)}));
 }finally{fs.writeFileSync('live-motion-output/metrics.json',JSON.stringify({results,errors},null,2));await page.close();await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

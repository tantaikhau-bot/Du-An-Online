const {chromium}=require('playwright');
const {spawn}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'ww-anime-'));
 const port=18765,origin='http://127.0.0.1:'+port;
 const server=spawn('python',['server.py'],{env:{...process.env,WISH_DB:path.join(temp,'test.sqlite3'),HOST:'127.0.0.1',PORT:String(port)},stdio:'inherit'});
 let browser;
 try{
  for(let i=0;i<60;i++){try{if((await fetch(origin+'/healthz')).ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
  browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://cdn.jsdelivr.net/npm/three@0.164.1/**',async route=>{
   const rel=new URL(route.request().url()).pathname.split('/three@0.164.1/')[1];
   const file=path.resolve('node_modules/three',rel);
   if(!file.startsWith(path.resolve('node_modules/three')+path.sep)||!fs.existsSync(file))return route.abort();
   await route.fulfill({path:file,contentType:'application/javascript',headers:{'Access-Control-Allow-Origin':'*'}});
  });
  await page.route('https://cdn.jsdelivr.net/npm/@pixiv/three-vrm@2.1.2/lib/three-vrm.module.js',route=>route.fulfill({path:path.resolve('node_modules/@pixiv/three-vrm/lib/three-vrm.module.js'),contentType:'application/javascript',headers:{'Access-Control-Allow-Origin':'*'}}));
  await page.route(origin+'/assets/three-vrm.module.js',route=>route.fulfill({path:path.resolve('node_modules/@pixiv/three-vrm/lib/three-vrm.module.js'),contentType:'application/javascript'}));
  await page.goto(origin+'/play?perf=1');
  await page.waitForFunction(()=>window.wwGraphics59?.stage==='running'||window.wwGraphics59?.engine==='classic',{},{timeout:90000});
  const info=await page.evaluate(()=>window.wwGraphics59);
  assert.equal(info.engine,'three',JSON.stringify(info));
  await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
  await page.waitForFunction(()=>window.wwGraphics59?.avatarAsset?.startsWith('VRM ')||window.wwGraphics59?.avatarAsset?.startsWith('fallback:'),{},{timeout:90000});
  const asset=await page.evaluate(()=>window.wwGraphics59.avatarAsset);
  assert.equal(asset,'VRM male');
  await page.waitForFunction(()=>window.wwGraphics59?.motionState==='idle'&&window.wwGraphics59?.npcBlockFallback===0,{},{timeout:45000});
  await page.waitForFunction(()=>window.wwGraphics59?.npcVRM>=1,{},{timeout:90000});
  await page.waitForFunction(()=>window.wwGraphics59?.poseCheck?.profile==='m1',{},{timeout:45000});
  const checkArms=async()=>{const a=await page.evaluate(()=>window.wwGraphics59.poseCheck.rawArm);assert.equal(a.length,2);for(const arm of a){assert.ok(arm&&arm.flex>.35&&arm.flex<1.45,JSON.stringify(arm));assert.ok(arm.wristSide>arm.shoulderSide-.015,JSON.stringify(arm));}console.log('Running arm joints',JSON.stringify(a))};
  const checkPose=async(id)=>{const p=await page.evaluate(()=>window.wwGraphics59.poseCheck);assert.equal(p.profile,id);assert.ok(p.knee.every(v=>v>=-.001&&v<=1.17));assert.ok(p.hip.every(v=>Math.abs(v)<=.63));assert.ok(p.ankle.every(v=>Math.abs(v)<=.31));assert.equal(p.rawLeg.length,2);for(const leg of p.rawLeg){assert.ok(leg&&Number.isFinite(leg.flex)&&leg.flex<1.5,JSON.stringify(leg));assert.ok(leg.thigh>.05&&leg.shin>.05);if(leg.flex>.35)assert.ok(leg.forward>-.025,JSON.stringify(leg))}return p};
  await page.waitForFunction(()=>window.wwGraphics59?.poseCheck?.identity==='satchel',{},{timeout:30000});
  await page.waitForFunction(async()=>!!(await WWClips.ready(await import('three'))),{},{timeout:45000});
  await checkPose('m1');
  const contact=await page.evaluate(()=>window.wwGraphics59.footIK);if(contact){assert.ok(contact.maxCorrection<=.045);assert.equal(contact.mode,'vertical-only')}
  await page.keyboard.down('d');try{await page.waitForFunction(()=>window.wwGraphics59?.motionState==='walk',{},{timeout:30000});}finally{await page.keyboard.up('d')}
  await checkPose('m1');
  await page.keyboard.down('Shift');await page.keyboard.down('a');
  try{await page.waitForFunction(()=>window.wwGraphics59?.motionState==='run'&&window.wwGraphics59.footIK===null,{},{timeout:30000});await checkPose('m1');await checkArms();await page.waitForFunction(()=>window.wwGraphics59?.clipMotion?.startsWith('Running'),{},{timeout:15000});}finally{await page.keyboard.up('a');await page.keyboard.up('Shift')}
  await page.waitForFunction(()=>window.wwGraphics59?.motionState==='idle',{},{timeout:30000});
  await page.evaluate(()=>{window.wwGraphics59.motionHistory=[];jumpRequest()});
  await page.waitForFunction(()=>window.wwGraphics59?.motionHistory?.includes('jump_land'),{},{timeout:45000});
  const states=await page.evaluate(()=>window.wwGraphics59.motionHistory);for(const phase of ['jump_start','jump_takeoff','jump_air','jump_land'])assert.ok(states.includes(phase),states.join(','));console.log('Browser walking and jump transitions:',states);
  fs.mkdirSync('test-output',{recursive:true});
  await page.screenshot({path:'test-output/vrm-world.png',timeout:120000});
  await page.evaluate(()=>studio12());
  await page.waitForFunction(()=>document.getElementById('previewHint52')?.textContent.includes('Anime Fantasy'),{},{timeout:30000});
  await page.waitForFunction(()=>window.wwPreviewHands107===true,{},{timeout:30000});
  await page.selectOption('#expressionAnime','happy');
  assert.equal(await page.locator('#rosterCards106 button').count(),10);
  await page.locator('#rosterTabs106 [data-gender="female"]').click();
  assert.equal(await page.locator('#rosterCards106 button').count(),10);
  await page.waitForFunction(()=>window.wwRosterReady==='f1',{},{timeout:90000});
  await page.locator('#saveAvatar106').click();
  await page.waitForFunction(()=>window.wwGraphics59?.avatarPreset==='f1',{},{timeout:90000});
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('wishworld-v1')).avatar106),'f1');
  await page.waitForFunction(()=>window.wwGraphics59?.handsDown===true,{},{timeout:30000});
  await checkPose('f1');
  await page.keyboard.down('Shift');await page.keyboard.down('d');try{await page.waitForFunction(()=>window.wwGraphics59?.motionState==='run'&&window.wwGraphics59.footIK===null,{},{timeout:30000});await checkPose('f1');await checkArms();}finally{await page.keyboard.up('d');await page.keyboard.up('Shift')}
  await page.evaluate(()=>studio12());
  await page.waitForFunction(()=>window.wwRosterReady==='f1',{},{timeout:90000});
  await page.selectOption('#motionPreview110','1');await page.waitForFunction(()=>window.wwPreviewPose110?.profile==='f1'&&window.wwPreviewPose110.knee.some(k=>k>.2),{},{timeout:30000});
  await page.waitForTimeout(500);
  fs.mkdirSync('test-output',{recursive:true});
  await page.screenshot({path:'test-output/anime-desktop.png',timeout:120000});
  await page.locator('#rosterCards106 button').nth(2).click();
  await page.waitForFunction(()=>window.wwRosterReady==='f3'&&window.wwPreviewPose110?.identity==='flower',{},{timeout:90000});
  await page.screenshot({path:'test-output/identity-f3.png',timeout:120000});
  assert.deepEqual(errors,[]);
  console.log('Three.js rendered and anime atelier preview completed');
 }finally{if(browser)await browser.close();server.kill();await new Promise(r=>server.once('exit',r));fs.rmSync(temp,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1});

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
  // Two separate cookie jars with real authenticated HTTP presence (not a synthetic peer).
  const qa=await browser.newContext(),qb=await browser.newContext();
  try{
   const register=async(ctx,name)=>{const res=await ctx.request.post(origin+'/api/register',{data:{name,password:'test-password-only-134'}});assert.equal(res.status(),200);const me=await ctx.request.get(origin+'/api/me');return (await me.json()).user.id};
   const ai=await register(qa,'QA_Adventure_A'),bi=await register(qb,'QA_Adventure_B');assert.notEqual(ai,bi);
   const pulse=async(ctx,x)=>{const res=await ctx.request.post(origin+'/api/social/pulse',{data:{x,y:575,area:0}});assert.equal(res.status(),200);return res.json()};
   await pulse(qa,490);const b=await pulse(qb,525);assert.ok(b.players.some(p=>p.id===ai&&Number.isFinite(p.sample_ms)));
   const a=await pulse(qa,490);assert.ok(a.players.some(p=>p.id===bi&&p.x===525));assert.ok(Number.isFinite(a.world_ms));
   const leave=await qb.request.post(origin+'/api/social/leave',{data:{}});assert.equal(leave.status(),200);
   assert.ok(!(await pulse(qa,490)).players.some(p=>p.id===bi));
   const ds=await qa.request.post(origin+'/api/dungeon/status',{data:{}});assert.equal(ds.status(),200);const dv=await ds.json();assert.equal(dv.best,0);
   const started=await qa.request.post(origin+'/api/dungeon/start',{data:{rev:dv.rev,stage:1}});assert.equal(started.status(),200);assert.equal((await started.json()).status,'fight');
   const other=await qb.request.post(origin+'/api/dungeon/status',{data:{}});assert.equal((await other.json()).status,'ready');
   console.log('V13.4 independent browser sessions: authenticated presence and leave passed; V13.8 dungeon account isolation passed');
  }finally{await qa.close();await qb.close()}
  const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  async function installRoutes(target){await target.route('https://cdn.jsdelivr.net/npm/three@0.164.1/**',async route=>{
   const rel=new URL(route.request().url()).pathname.split('/three@0.164.1/')[1];
   const file=path.resolve('node_modules/three',rel);
   if(!file.startsWith(path.resolve('node_modules/three')+path.sep)||!fs.existsSync(file))return route.abort();
   await route.fulfill({path:file,contentType:'application/javascript',headers:{'Access-Control-Allow-Origin':'*'}});
  });
  await target.route('https://cdn.jsdelivr.net/npm/@pixiv/three-vrm@2.1.2/lib/three-vrm.module.js',route=>route.fulfill({path:path.resolve('node_modules/@pixiv/three-vrm/lib/three-vrm.module.js'),contentType:'application/javascript',headers:{'Access-Control-Allow-Origin':'*'}}));
  await target.route(origin+'/assets/three-vrm.module.js',route=>route.fulfill({path:path.resolve('node_modules/@pixiv/three-vrm/lib/three-vrm.module.js'),contentType:'application/javascript'}));}await installRoutes(page);
  await page.goto(origin+'/play?perf=1');
  await page.waitForFunction(()=>window.wwGraphics59?.stage==='running'||window.wwGraphics59?.engine==='classic',{},{timeout:90000});
  // Real onboarding flow: do not bypass the initial dialog by editing localStorage.
  await page.locator('#welcome[open]').waitFor({timeout:30000});
  await page.locator('#heroName').fill('QA Explorer');
  await page.locator('#welcomeForm button[type=submit]').click({timeout:30000});
  await page.locator('#modal[open] #confirm').click({timeout:30000});
  await page.waitForFunction(()=>s.intro&&!onboardingPending351&&!document.querySelector('dialog[open]'));
  const startPos=await page.evaluate(()=>({x:player.x,y:player.y}));
  await page.keyboard.down('w');
  try{await page.waitForFunction(p=>Math.hypot(player.x-p.x,player.y-p.y)>.3,startPos,{timeout:15000});}
  finally{await page.keyboard.up('w')}
  await page.locator('.ww291-strike').click({timeout:30000});
  try{await page.waitForFunction(()=>window.wwGraphics59?.footwork320?.kind==='strike',null,{timeout:15000});}catch(e){console.log('COMBAT_QA '+JSON.stringify(await page.evaluate(()=>{const g=window.wwGraphics59;return {input:g.combatInput353,outcome:g.combatOutcome353,delay:g.strikeDelay352,faults:g.frameFaults343,footwork:g.footwork320,stage:g.stage,fps:g.fps};})));throw e;}
  console.log('V35.0.1 onboarding, actual keyboard movement and basic attack passed');
  const info=await page.evaluate(()=>window.wwGraphics59);
  assert.equal(info.engine,'three',JSON.stringify(info));assert.equal(info.vegetation192?.trunkMeshes,3);assert.ok(info.realism191?.terrainBlend&&info.realism191?.rockPBR&&info.realism191?.leafCutout&&info.realism191?.architectureRelief,JSON.stringify(info.realism191));
  assert.equal(info.world137.depth,272);assert.equal(info.world137.width,240);assert.equal(info.world137.tiles,64);assert.ok(info.world137.newSites>=10&&info.world137.newSites<=12);
  const frontier=await page.evaluate(()=>({north:walkable4(-22,-82),south:walkable4(22,82),outside:walkable4(0,WW_WORLD137.halfZ+1),bridge:segment4({x:0,z:-11},{x:0,z:-3}),water:segment4({x:10,z:-11},{x:10,z:-3})}));assert.ok(frontier.north&&frontier.south&&!frontier.outside&&frontier.bridge&&!frontier.water,JSON.stringify(frontier));
  console.log('V13.7 expanded walkability and bridge regression passed');
  const desert=await page.evaluate(()=>({arrival:walkable4(DESERT179.arrivalX,DESERT179.arrivalZ),water:walkable4(DESERT179.oasisX,DESERT179.oasisZ),scene:window.wwGraphics59.desert179}));assert.ok(desert.arrival&&!desert.water&&desert.scene?.pyramid&&desert.scene?.oasis,JSON.stringify(desert));
  console.log('V17.9 desert arrival, oasis collision and scene initialization passed');
  const coast=await page.evaluate(()=>({arrival:walkable4(0,123),pier:segment4({x:0,z:111},{x:0,z:130}),water:walkable4(9,125),scene:window.wwGraphics59.sea180}));assert.ok(coast.arrival&&coast.pier&&!coast.water&&coast.scene?.boats===3,JSON.stringify(coast));
  const heaven=await page.evaluate(()=>({arrival:walkable4(27,-126),height:walkHeight4(27,-126),gap:walkable4(27,-110),bridge:segment4({x:27,z:-126},{x:9,z:-119}),scene:window.wwGraphics59.heaven190}));assert.ok(heaven.arrival&&heaven.height===28&&!heaven.gap&&heaven.bridge&&heaven.scene?.islands===3,JSON.stringify(heaven));
  await page.waitForFunction(()=>window.wwGraphics59?.weather120?.auto===true,{},{timeout:30000});
  await page.evaluate(()=>{const b=document.getElementById('nWeather');b.click();b.click()});
  await page.waitForFunction(()=>window.wwGraphics59?.weather120?.index===1&&window.wwGraphics59.weather120.rain>.01,{},{timeout:30000});
  const wet=await page.evaluate(()=>window.wwGraphics59.weather120);assert.ok(wet.rain<1&&wet.auto===false&&Number.isFinite(wet.fog));
  await page.evaluate(()=>{const b=document.getElementById('nWeather');for(let i=0;i<5;i++)b.click()});
  await page.waitForFunction(()=>window.wwGraphics59?.weather120?.auto===true,{},{timeout:30000});
  console.log('V12.0 manual weather and automatic cycle validated');
  await page.waitForFunction(()=>window.wwGraphics59?.creatureAssets?.length===5,{},{timeout:30000});
  const creatureKinds=await page.evaluate(()=>window.wwGraphics59.creatureAssets);
  assert.deepEqual([...creatureKinds].sort(),['cat','deer','dragon','fox','rabbit']);
  console.log('All five fantasy creature assets active in world:',creatureKinds);
  // Switch to fox to prove the authored skinned GLB replaces the procedural fallback.
  await page.evaluate(()=>{window.__savedPet117=s.pet;s.pet='fox';document.querySelectorAll('dialog[open]').forEach(d=>d.close())});
  await page.waitForFunction(()=>window.wwGraphics59?.activePetModel351?.kind==='fox'&&window.wwGraphics59.activePetModel351.source==='spirit161',{},{timeout:90000});
  console.log('Skinned fox model and authored animation loaded');
  fs.mkdirSync('test-output',{recursive:true});
  await page.screenshot({path:'test-output/rigged-fox-world.png',timeout:120000});
  for(const kind of ['cat','rabbit']){
   await page.evaluate(k=>{s.pet=k},kind);
   await page.waitForFunction(k=>window.wwGraphics59?.activePetModel351?.kind===k&&window.wwGraphics59.activePetModel351.source==='spirit161',kind,{timeout:90000});
   console.log('V11.6.2 visible skinned pet:',kind);
   await page.screenshot({path:'test-output/rigged-'+kind+'-world.png',timeout:120000});
  }
  await page.evaluate(()=>{s.pet=window.__savedPet117});

  // Render an independent lineup from the exact assets used by the world.
  const lineup=await page.evaluate(async()=>{
   const T=await import('three'),scene=new T.Scene();scene.background=new T.Color(0xe7dccb);
   const camera=new T.PerspectiveCamera(33,2.2,.1,30);camera.position.set(2.4,2.2,-6.5);camera.lookAt(0,.66,0);
   scene.add(new T.HemisphereLight(0xfff4e2,0x60706a,2.1));let l=new T.DirectionalLight(0xffedd6,2.5);l.position.set(-3,5,-4);scene.add(l);
   const ground=new T.Mesh(new T.PlaneGeometry(20,20),new T.MeshStandardMaterial({color:0xb5bba0,roughness:1}));ground.rotation.x=-Math.PI/2;scene.add(ground);
   const all=WWCreatures.KINDS.map((k,i)=>{let a=WWCreatures.create(T,k);a.root.visible=true;a.root.position.x=(i-2)*1.08;a.root.rotation.y=.32;scene.add(a.root);return a;});
   const r=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(1100,500);r.setPixelRatio(1);
   for(let a of all)WWCreatures.animate(a,0,16,0);r.render(scene,camera);
   const uri=r.domElement.toDataURL('image/png'),calls=r.info.render.calls,triangles=r.info.render.triangles;r.dispose();return {uri,calls,triangles};
  });
  fs.mkdirSync('test-output',{recursive:true});fs.writeFileSync('test-output/fantasy-creature-lineup.png',Buffer.from(lineup.uri.split(',')[1],'base64'));console.log('Creature lineup render:',lineup.calls,lineup.triangles);

  await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
  await page.waitForFunction(()=>window.wwGraphics59?.avatarAsset?.startsWith('VRM ')||window.wwGraphics59?.avatarAsset?.startsWith('fallback:'),{},{timeout:90000});
  const asset=await page.evaluate(()=>window.wwGraphics59.avatarAsset);
  assert.equal(asset,'VRM male');
  await page.waitForFunction(()=>window.wwGraphics59?.motionState==='idle'&&window.wwGraphics59?.npcBlockFallback===0,{},{timeout:45000});
  // Exercise the real peer render pipeline with isolated synthetic presence snapshots.
  // First deliberately fail VRM loading, then restore it and introduce a fresh peer.
  await page.evaluate(()=>{
   window.__peerLoad117=WWVRM.load;
   WWVRM.load=()=>Promise.reject(new Error('simulated peer VRM load failure'));
   window.__peerId117='peer-render-failure';
   window.__peerTimer117=setInterval(()=>{remotePlayers=[{id:window.__peerId117,name:'Peer QA',area:0,x:player.x+50,y:player.y,body:'male',avatar109:'m1',heading:0,moving:false}]},80);
  });
  await page.waitForFunction(()=>window.wwGraphics59?.peerCount===1&&window.wwGraphics59?.peerVisible===1&&window.wwGraphics59?.peerFallback===1,{},{timeout:30000});
  console.log('Peer load failure: animated fallback visible');
  await page.evaluate(()=>{WWVRM.load=window.__peerLoad117;window.__peerId117='peer-render-success'});
  await page.waitForFunction(()=>window.wwGraphics59?.peerCount===1&&window.wwGraphics59?.peerVisible===1&&window.wwGraphics59?.peerVRM===1,{},{timeout:90000});
  console.log('Peer loaded: VRM visible and fallback replaced');
  fs.mkdirSync('test-output',{recursive:true});
  await page.screenshot({path:'test-output/multiplayer-visible.png',timeout:120000});
  await page.evaluate(()=>{clearInterval(window.__peerTimer117);remotePlayers=[];WWVRM.load=window.__peerLoad117;delete window.__peerLoad117});

  await page.waitForFunction(()=>window.wwGraphics59?.npcVRM>=1,{},{timeout:90000});
  await page.waitForFunction(()=>window.wwGraphics59?.poseCheck?.profile==='m1',{},{timeout:45000});
  const checkArms=async()=>{const a=await page.evaluate(()=>window.wwGraphics59.poseCheck.rawArm);assert.equal(a.length,2);for(const arm of a){assert.ok(arm&&arm.flex>.35&&arm.flex<1.45,JSON.stringify(arm));assert.ok(arm.wristSide>arm.shoulderSide-.015,JSON.stringify(arm));}console.log('Running arm joints',JSON.stringify(a))};
  const checkPose=async(id)=>{const p=await page.evaluate(()=>window.wwGraphics59.poseCheck);assert.equal(p.profile,id);assert.ok(p.knee.every(v=>v>=-.001&&v<=1.17));assert.ok(p.hip.every(v=>Math.abs(v)<=.63));assert.ok(p.ankle.every(v=>Math.abs(v)<=.31));assert.equal(p.rawLeg.length,2);for(const leg of p.rawLeg){assert.ok(leg&&Number.isFinite(leg.flex)&&leg.flex<1.5,JSON.stringify(leg));assert.ok(leg.thigh>.05&&leg.shin>.05);if(leg.flex>.35)assert.ok(leg.forward>-.025,JSON.stringify(leg))}return p};
  await checkPose('m1');
  await page.waitForFunction(()=>Number.isFinite(window.wwGraphics59?.daylight?.hour),{},{timeout:30000});
  await page.waitForFunction(()=>window.wwGraphics59?.look131?.key==='original',{},{timeout:30000});
  await page.evaluate(()=>{lookKey131='clear'});await page.waitForFunction(()=>window.wwGraphics59?.look131?.key==='clear',{},{timeout:30000});await page.evaluate(()=>{lookKey131='original'});
  const day0=await page.evaluate(()=>window.wwGraphics59.daylight.hour);await page.waitForFunction(h=>window.wwGraphics59.daylight.hour>h+.01,day0,{timeout:30000});console.log('Continuous game clock active');
  await page.waitForFunction(()=>window.wwGraphics59?.footIK?.mode==='grounded-idle'&&window.wwGraphics59.footIK.weight>.95&&window.wwGraphics59.footIK.anchorLocked,{},{timeout:30000});
  const contact=await page.evaluate(()=>window.wwGraphics59.footIK);assert.ok(Math.abs(contact.offset)<=.34);assert.equal(contact.planted,2,JSON.stringify(contact));assert.equal(contact.source,'mesh',JSON.stringify(contact));assert.ok(Math.max(...contact.contacts.map(c=>Math.abs(c.gap)))<.025,JSON.stringify(contact));console.log('Idle ground contact:',JSON.stringify(contact));
  await page.keyboard.down('d');try{await page.waitForFunction(()=>window.wwGraphics59?.motionState==='walk',{},{timeout:30000});}finally{await page.keyboard.up('d')}
  await checkPose('m1');
  await page.keyboard.down('Shift');await page.keyboard.down('a');
  try{await page.waitForFunction(()=>window.wwGraphics59?.motionState==='run'&&window.wwGraphics59.footIK===null,{},{timeout:30000});await checkPose('m1');await checkArms();}finally{await page.keyboard.up('a');await page.keyboard.up('Shift')}
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
  await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
  await page.setViewportSize({width:844,height:390});await page.waitForFunction(()=>window.wwGraphics59?.cssWidth>0&&window.wwGraphics59.cssWidth<=844,{},{timeout:30000});
  const mobileCanvas=await page.locator('.next-world canvas').first().boundingBox();assert.ok(mobileCanvas&&mobileCanvas.width<=844&&mobileCanvas.height>0);
  await page.screenshot({path:'test-output/landscape-844x390.png',timeout:120000});
  assert.deepEqual(errors,[]);await page.close();
  const mc=await browser.newContext({viewport:{width:844,height:390},screen:{width:844,height:390},deviceScaleFactor:3,isMobile:true,hasTouch:true});try{await installRoutes(mc);const mp=await mc.newPage(),me=[];mp.on('pageerror',e=>me.push(e.message));await mp.goto(origin+'/play?gfx=low');await mp.waitForFunction(()=>window.wwGraphics59?.stage==='running'||window.wwGraphics59?.engine==='classic',{},{timeout:90000});await mp.waitForFunction(()=>window.wwGraphics59?.fpsCap===30&&window.wwGraphics59?.renderPixels>0,{},{timeout:30000});const mi=await mp.evaluate(()=>window.wwGraphics59);assert.equal(mi.engine,'three');assert.equal(mi.mobile,true);assert.ok(mi.renderPixels<=700000);assert.ok(mi.pixelRatio<=1&&mi.pixelRatio>=.89);assert.ok(mi.mobileClarity171.cssRatio>=.89);await mp.screenshot({path:'test-output/mobile-low-844x390.png',timeout:120000});assert.deepEqual(me,[]);console.log('V13.9 emulated mobile viewport, budget and 30 FPS cap passed (not hardware benchmark)');}finally{await mc.close()}
  console.log('Three.js rendered and anime atelier preview completed');
 }finally{if(browser)await browser.close();server.kill();await new Promise(r=>server.once('exit',r));fs.rmSync(temp,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1});

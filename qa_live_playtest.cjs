const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const origin='https://wish-world.onrender.com';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
 try{
  for(const mobile of [false,true]){
   const ctx=await browser.newContext(mobile?{viewport:{width:844,height:390},screen:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:{width:1280,height:800},deviceScaleFactor:1});
   const page=await ctx.newPage(),errors=[],failures=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('requestfailed',r=>failures.push({url:r.url(),error:r.failure()?.errorText}));
   page.on('response',r=>{if(r.status()>=400)failures.push({url:r.url(),status:r.status()})});
   const result={mobile,errors,failures};
   try{
    const start=Date.now();
    const response=await page.goto(origin+'/play?gfx=low',{waitUntil:'domcontentloaded',timeout:90000});
    result.http=response.status();
    result.version=await (await ctx.request.get(origin+'/api/version')).json();
    await page.waitForFunction(()=>['running','failed'].includes(window.wwGraphics59?.stage)||window.wwGraphics59?.engine==='failed',null,{timeout:90000});
    result.startMs=Date.now()-start;
    const snapshot=()=>page.evaluate(()=>{const g=window.wwGraphics59||{};return {engine:g.engine,stage:g.stage,error:g.error,fps:g.fps,drawCalls:g.drawCalls,triangles:g.triangles,avatarAsset:g.avatarAsset,renderWidth:g.renderWidth,renderHeight:g.renderHeight,position:typeof player==='object'?{x:player.x,y:player.y}:null,dialogs:[...document.querySelectorAll('dialog[open]')].map(d=>d.innerText.slice(0,250)),combat:document.querySelector('.ww290-training-actions')?.hidden,riggedAnimals:g.riggedAnimals,creatureAssets:g.creatureAssets};});
    result.before=await snapshot();
    assert.equal(result.before.engine,'three');
    assert.equal(result.before.stage,'running');
    if(!result.before.dialogs.length){
     if(!mobile){await page.keyboard.down('w');await page.waitForTimeout(2200);await page.keyboard.up('w');}
     else {const joy=page.locator('.joy73');if(await joy.isVisible()){const q=await joy.boundingBox();const cdp=await ctx.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:q.x+q.width/2,y:q.y+q.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:q.x+q.width/2,y:q.y+8}]});await page.waitForTimeout(2200);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}}
     result.afterMove=await snapshot();
     const attack=page.locator('.ww291-strike');if(await attack.isVisible()){await attack.click({timeout:5000});result.attackClicked=true;await page.waitForTimeout(1000)}
    }
    result.after=await snapshot();
   }catch(e){result.error=String(e);result.body=await page.locator('body').innerText().then(s=>s.slice(0,1500)).catch(()=>null)}
   finally{
    fs.mkdirSync('qa-output',{recursive:true});await page.screenshot({path:'qa-output/'+(mobile?'mobile':'desktop')+'.png',timeout:15000}).catch(()=>{});
    console.log('LIVE_PLAYTEST '+JSON.stringify(result));await ctx.close();
   }
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

// Browser geometry regression using the actual production CSS and HUD selectors.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const css = [...fs.readFileSync('index.html','utf8').matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi)].map(x=>x[0]).join('\n');
const dock = ['map','menu','bag','social','interact','boost','auto','full'];
const skills = [['spin',1],['fire',2],['storm',3],['ultimate'],['strike'],['dodge'],['jump'],['lock'],['guard']];
const controls = dock.map(n=>'<button class="act73 '+n+'73"><svg viewBox="0 0 24 24"></svg><span>'+n+'</span></button>').join('');
const buttons = skills.map(([n,slot])=>'<button class="ww291-skill '+({jump:'ww292-jump',lock:'ww294-lock',guard:'ww322-guard'}[n]||'ww291-'+n)+'" '+(slot?'data-slot318="'+slot+'"':'')+'><span>✦</span><small>'+n+'</small><kbd>X</kbd><b></b></button>').join('');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
 for(const [width,height] of [[320,568],[360,640],[390,844],[430,932],[568,320],[667,375],[844,390],[932,430],[1024,768]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:true});
  try{
   await page.setContent('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">'+css+'</head><body class="immersive44 mobile73"><div class="stage ww318-combat ww292-combat-ready" style="position:relative;width:100vw;height:100dvh"><div class="next-world" style="position:absolute;inset:0"><section class="ww290-training"><div>HP 100</div><progress value="100" max="100"></progress><progress class="ww294-energy" value="40" max="100"></progress><small class="ww294-energy-label">Energy 40</small></section><div class="ww290-training-actions">'+buttons+'</div></div><div class="mobile73-ui"><div class="joy73"><div class="joy73-knob"></div></div>'+controls+'</div></div></body></html>');
   const boxes=await page.locator('.ww291-skill,.mobile73-ui button,.joy73,.ww290-training').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {name:e.className,x:r.x,y:r.y,w:r.width,h:r.height}}));
   for(const a of boxes){
    assert(a.w>0&&a.h>0,JSON.stringify({width,height,a}));
    assert(a.x>=-.5&&a.y>=-.5&&a.x+a.w<=width+.5&&a.y+a.h<=height+.5,'offscreen '+JSON.stringify({width,height,a}));
    if(!a.name.includes('ww290-training')) assert(a.w>=40&&a.h>=40,'small hit target '+a.name);
   }
   for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
    const a=boxes[i],b=boxes[j];
    assert(Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)<=.5||Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)<=.5,'overlap '+JSON.stringify({width,height,a,b}));
   }
   await page.locator('.ww290-training-actions').evaluate(e=>e.hidden=true);
   assert.equal(await page.locator('.ww290-training-actions').isVisible(),false);
   console.log('HUD geometry PASS',width,height);
  }finally{await page.close()}
 }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

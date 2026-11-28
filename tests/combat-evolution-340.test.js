// V34.0 regression suite: deterministic client policy, no DOM or GPU required.
const assert=require('node:assert/strict'),policy=require('../assets/game-policy.js'),vrm=require('../assets/vrm-character.js'),motion=require('../assets/smooth-motion.js'),identity=require('../assets/character-identity.js');
let count=0;const ok=(v,m)=>{assert.ok(v,m);count++},params=o=>({get:k=>o[k]??null});
for(const gfx of Object.keys(policy.WW_PERF118))ok(policy.perfPreset118(params({gfx,fx:'basic'}),'high',8,8,true)===gfx,'explicit graphics preset');
ok(policy.perfPreset118(params({fx:'basic'}),'high',8,8,true)==='low','basic fallback');
ok(policy.perfPreset118(params({gfx:'high',perf:'1'}),'high',8,8,true)==='battery','battery priority');
const move={start:100,impact:200,end:400};
for(let t=100;t<600;t++){const o=policy.combatTiming340(move,t);ok(o.hit===(t>=200&&t<=580),'single impact gate');ok(o.cancel===(t>580),'stale cancel');ok(o.progress>=0&&o.progress<=1,'progress');ok(!policy.combatTiming340(move,t,true).hit,'paused');}
ok(!policy.combatTiming340({...move,hit:true},250).hit,'no duplicate hit');
ok(!policy.combatTiming340({...move,waitLanding327:true},250,false,.2).hit,'wait landing');
ok(policy.combatTiming340({...move,waitLanding327:true},350,false,.2).hit,'landing deadline');
for(const bad of [{...move,impact:Infinity},{...move,end:100},{...move,start:500}])ok(policy.combatTiming340(bad,250).cancel,'malformed timing');
for(const reason of ['kit','world','hidden','recovery','pause']){const c={hp:90,energy:45,cd:{strike:400},move,invuln:90,reaction329:{kind:'hurt'},buffer310:300,locked:{hp:5}};policy.combatReset340(c,reason);ok(c.hp===90&&c.energy===45&&c.cd.strike===400&&!c.move&&!c.invuln&&!c.locked&&!c.buffer310,'safe reset');ok(reason==='pause'?!!c.reaction329:!c.reaction329,'reaction policy');}
const ids=Object.keys(vrm.ultimate338);ok(ids.length===20,'20 characters');
for(const id of ids)for(const hz of [30,60]){const st={};for(let i=0;i<hz*3;i++){const p=i/(hz*3);motion.secondary337(st,1/hz,{gait:p<.4?1:0,speed:p<.4?4:0,turn:Math.sin(p*10)*4,vertical:Math.cos(p*6)*3,wind:1,combat:{kind:'ultimate',progress:p}});ok(Object.values(st).every(Number.isFinite)&&Math.abs(st.clothPitch)<=.75&&Math.abs(st.hairRoll)<=.48,'wearable limits');const a=identity.fabricPoint337(.2,0,0,1,0,p,st.pitch,st.roll,st.flutter);ok(a[0]===.2&&a[1]===0&&a[2]===0,'pinned cloth');const b=vrm.ultimatePath338(id,0,2,p,.55,0);ok([b.x,b.y,b.z,b.alpha].every(Number.isFinite),'ultimate path');}}
console.log('V34.0 policy and integration assertions passed: '+count);

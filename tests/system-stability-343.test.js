// V34.3: fault isolation and timing, using production code.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),p=require('../assets/game-policy.js');
let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++};
const report={},guard=p.createFrameGuard343(report);let calls=0,clean=0;
for(let frame=0;frame<600;frame++){
 guard.run('combat',()=>{if(frame===3)throw Error('injected combat failure');calls++},()=>clean++);
 ok(guard.run('environment',()=>{}),'world continues');
}
ok(calls===3&&clean===1,'one cleanup and no retries');
ok(guard.failed('combat')&&!guard.failed('environment'),'independent faults');
ok(report.frameFaults343.combat.message==='injected combat failure','diagnostic');
ok(!guard.run('audio',()=>{throw Error('audio')},()=>{throw Error('cleanup')}),'cleanup fault contained');
ok(report.frameFaults343.audio.cleanup==='cleanup','cleanup diagnostic');
for(const n of [1,3,4,5])for(const i of [-100,-1,0,1,5,100,NaN,Infinity,undefined,1.5]){const k=p.safeComboIndex343(i,n);ok(k>=0&&k<n&&Number.isInteger(k),'combo bounded');}
for(const now of [0,10,100,10000,NaN,Infinity])for(const last of [0,1,100,-5,NaN,Infinity]){const dt=p.frameInterval343(now,last);ok(Number.isFinite(dt)&&dt>=0&&dt<=2000,'frame bounded');}
const stats={};p.frameSample343(stats,10);p.frameSample343(stats,20);p.frameSample343(stats,NaN);ok(stats.count===2&&stats.mean===11&&stats.max===20,'timing sample');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
for(const marker of ["subsystem343('combat',()=>tickCombat290","disableCombat343,'combat-movement'","if(combat290.initFailed)return false","rx=activeRecoil3421(h,now)","fx=activeRecoil3421(hit,now)","game-policy.js?v="])ok(html.includes(marker),'integration '+marker);
const combo=html.match(/function comboStep304\([^\n]+/)[0];const step=new Function('safeComboIndex343','kit304','combo293','equipped303','comboTiming310','rhythm324','kitId304',combo+'\nreturn comboStep304')(p.safeComboIndex343,['sword',[0,2,4]],Array.from({length:5},()=>({duration:450,hit:150})), 'sword',x=>x,{m1:[1,.98,1.04]},'m1');
for(const i of [undefined,NaN,-1,Infinity,5,0,1,2]){const q=step(i);ok(Number.isFinite(q.duration)&&Number.isFinite(q.hit)&&q.hit<q.duration,'actual combo timing');}
console.log('V34.3 checks passed: '+checks);

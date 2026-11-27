const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const start=html.indexOf('function shakeProfile315('),end=html.indexOf('const combatCam315=',start);
assert.ok(start>=0&&end>start);
const fn=new Function(html.slice(start,end)+';return shakeProfile315')();
for(const age of [-Infinity,Infinity,NaN,-1,0,1,75,149,150,151])for(const dur of [0,-1,150,NaN,Infinity])for(const amp of [0,.085,NaN,Infinity])for(const mobile of [true,false])for(const reduce of [true,false]){
 const out=fn(age,dur,amp,mobile,reduce,{x:123,y:456});
 assert.ok(Number.isFinite(out.x)&&Number.isFinite(out.y));
 if(reduce||!Number.isFinite(age)||!Number.isFinite(dur)||!Number.isFinite(amp)||dur<=0||amp<=0||age<0||age>=dur)assert.deepEqual(out,{x:0,y:0});
}
assert.deepEqual(fn(Infinity,1,0,false,false),{x:0,y:0});
assert.ok(Math.abs(fn(40,150,.08,false,false).x)>0);
console.log('800 camera-shake regression cases: finite idle, hit, expired, mobile and reduced-motion values');

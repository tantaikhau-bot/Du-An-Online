/* Run: node test_living267.cjs */
const assert=require('node:assert/strict'),fs=require('node:fs'),D=require('./assets/daylight.js');
const a={surface:'snow',hoof:false,zone:0};
assert.equal(D.trailReset267(a,'snow',false,0,.3),false);
for(const [surface,hoof,zone,d] of [['sand',false,0,.3],['snow',true,0,.3],['snow',false,2,.3],['snow',false,0,3],['snow',false,0,NaN],['',false,0,.3]])assert(D.trailReset267(a,surface,hoof,zone,d));
assert(D.trailReset267(null,'snow',false,0,0));
assert.equal(D.festivalKey267(18,true),'dance:shared');assert.equal(D.festivalKey267(18,false),'dance:local');assert.equal(D.festivalKey267(42,true),'dance:shared');
const h=fs.readFileSync('index.html','utf8');
let scripts=0;for(const m of h.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script>/gi)){if(m[1].includes('src=')||m[1].includes('importmap'))continue;new Function(m[2]);scripts++;}assert(scripts>10);
for(const needle of ['daylight.js?v=2670','26.7-living-world-final','WWDay.trailReset267(','WWDay.festivalKey267(','grassShaderFailed267','v.routeObsCount267!==staticObstacles.length','publicScene&&d<range','festivalTick266();updateCitizens54','updateWild264(x,z,dt,t,dialogOpen71)','interactionTick265(x,z,dx,dz,dt,t,now,jump141.landed)'])assert(h.includes(needle));
console.log('V26.7 integration and continuity checks passed; inline scripts: '+scripts);

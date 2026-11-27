/* Run: node test_sky262.cjs */
const D=require('./assets/daylight.js'),check=(v,m)=>{if(!v)throw Error(m);console.log('PASS '+m)};
let prev=null,maxDelta=0;
for(let i=0;i<=1440;i++){const a=D.celestial262(i/60);if(Math.abs(Math.hypot(...a.sun)-1)>1e-10||Math.abs(Math.hypot(...a.moon)-1)>1e-10||a.sunVisible<0||a.sunVisible>1||a.moonVisible<0||a.moonVisible>1||a.twilight<0||a.twilight>1)throw Error('orbit bound');if(prev)maxDelta=Math.max(maxDelta,Math.hypot(...a.sun.map((v,j)=>v-prev.sun[j])));prev=a}
check(maxDelta<.005,'1441 samples of continuous unit-length celestial paths');
check(D.celestial262(12).sunVisible===1&&D.celestial262(12).moonVisible===0,'day visibility');
check(D.celestial262(0).moonVisible===1&&D.celestial262(0).sunVisible===0,'night visibility');
check(D.celestial262(6).twilight===1&&D.celestial262(18).twilight>.999&&D.celestial262(12).twilight===0,'dawn and dusk twilight peaks');
check(JSON.stringify(D.celestial262(0))===JSON.stringify(D.celestial262(24)),'midnight wrap');
let calm=0,storm=0;for(let i=0;i<600;i++){calm=D.cloudAdvance262(calm,1/60,.45);storm=D.cloudAdvance262(storm,1/60,2.8)}check(storm>calm*2&&calm>0,'wind changes continuous cloud drift');
check(Number.isFinite(D.cloudAdvance262(NaN,NaN,NaN))&&D.celestial262(NaN).sunVisible===1,'invalid input guard');

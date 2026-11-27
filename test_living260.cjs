/* Run: node test_living260.cjs */
const h=require('node:fs').readFileSync('index.html','utf8'),i=h.indexOf('function livingWind260('),j=h.indexOf('let livingCrown260=',i);
const {livingWind260,crownSelection260}=new Function(h.slice(i,j)+';return {livingWind260,crownSelection260}')();
const check=(ok,m)=>{if(!ok)throw Error(m);console.log('PASS '+m)};
let max=0,min=3,delta=0,prev=null;
for(let i=0;i<3600;i++){const w=livingWind260(i/60,2,.5,.1);if(w.strength<0||w.strength>3||w.flow<.82||w.flow>1.36)throw Error('wind bound');max=Math.max(max,w.strength);min=Math.min(min,w.strength);if(prev!==null)delta=Math.max(delta,Math.abs(w.strength-prev));prev=w.strength}
check(max-min>.4&&delta<.02,'smooth bounded gusts across 60 seconds');
check(livingWind260(1,2,1,0).strength>livingWind260(1,2,0,0).strength,'rain increases wind response');
check(Number.isFinite(livingWind260(NaN,NaN,NaN,NaN).flow),'invalid inputs remain finite');
const rows=[];for(let x=-30;x<=30;x+=2)for(let z=-30;z<=30;z+=2)rows.push({q:{parent:{position:{x,z}}}});
for(const [mobile,quality,cap] of [[true,1,20],[true,2,32],[false,1,40],[false,2,64]]){const found=crownSelection260(rows,0,0,mobile,quality);if(found.length!==cap||found[0].q.parent.position.x!==0||found[0].q.parent.position.z!==0)throw Error('selection budget')}
check(true,'all four nearby crown budgets and nearest-first priority');
check(crownSelection260(rows,200,200,true,2).length===0,'distant crowns skipped');

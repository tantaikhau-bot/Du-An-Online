/* Run: node test_weather261.cjs */
const h=require('node:fs').readFileSync('index.html','utf8'),i=h.indexOf('function weatherAxis261('),j=h.indexOf('const weatherFrame261=',i);
const {weatherAxis261,weatherBudget261,weatherRefresh261}=new Function(h.slice(i,j)+';return {weatherAxis261,weatherBudget261,weatherRefresh261}')(),check=(v,m)=>{if(!v)throw Error(m);console.log('PASS '+m)};
for(const c of [-150,-1,0,1,150])for(let i=0;i<500;i++){const x=weatherAxis261(i,.618,c,25,-15.6);if(x<c-12.5-1e-8||x>=c+12.5+1e-8)throw Error('particle bounds')}check(true,'2500 world anchored particle bounds');
const a=weatherAxis261(2,.618,0,25),b=weatherAxis261(2,.618,.1,25);check(Math.abs(a-b)<1e-8,'small camera movement does not drag particles');
check(weatherBudget261(true,0,false,1).rain===180&&weatherBudget261(true,0,false,1).snow===120,'mobile limits');
check(weatherBudget261(false,0,false,1).rain===500&&weatherBudget261(false,0,false,1).snow===180,'desktop limits');
check(weatherBudget261(true,2,false,1).rain===0&&weatherBudget261(true,2,false,1).snow===0&&weatherBudget261(false,0,true,1).snow===0,'overload and basic fallback');
let st={};check(weatherRefresh261(st,0,0,0,'a',33)&&!weatherRefresh261(st,16,0,0,'a',33)&&weatherRefresh261(st,34,0,0,'a',33),'bounded cadence');check(weatherRefresh261(st,35,3,0,'a',33)&&weatherRefresh261(st,36,3,0,'b',33),'movement and tier refresh');

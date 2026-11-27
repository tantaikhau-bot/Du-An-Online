/* Run: node test_expression255.cjs */
const M=require('./assets/smooth-motion.js'),check=(ok,msg)=>{if(!ok)throw Error(msg);console.log('PASS '+msg)};
let st={};for(let i=0;i<240;i++){const w=M.actionBlend132(st,['wave','hug','dance','duet','ride','idle'][Math.floor(i/15)%6],1/60);if(Object.values(w).reduce((a,b)=>a+b,0)>1.000001||Object.values(w).some(x=>x<0))throw Error('action weight')}check(true,'bounded action crossfades');
st={};for(let i=0;i<60;i++)M.actionBlend132(st,'wave',1/60);check(st.clocks255.wave>.99&&st.weights.wave>.99,'local wave clock');
for(let i=0;i<180;i++)M.actionBlend132(st,'idle',1/60);check(!st.clocks255.wave&&!st.weights.wave,'completed action clock cleared');
let face={};for(let i=0;i<120;i++)M.expression132(face,'cheer',1/60,i/60,2);check(face.face.happy>.75,'cheer smile');
for(let i=0;i<120;i++)M.expression132(face,'idle',1/60,i/60,2);check(face.face.happy<.01&&face.face.relaxed>.16,'relaxed recovery');
let max=0,min=1,diff=0;for(let i=0;i<900;i++){const a=M.expression132({},'idle',.016,i/60,0).blink,b=M.expression132({},'idle',.016,i/60,3).blink;max=Math.max(max,a);min=Math.min(min,a);diff+=Math.abs(a-b)}check(max>.95&&min===0&&diff>1,'blink closure and profile variation');
let look={};for(let i=0;i<100;i++)M.socialLook255(look,5,1/60);check(look.yaw<=.38&&look.yaw>.37,'bounded social look');for(let i=0;i<100;i++)M.socialLook255(look,0,1/60);check(Math.abs(look.yaw)<.001,'look returns to neutral');

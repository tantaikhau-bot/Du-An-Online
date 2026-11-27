/* Run: node test_hands251.cjs */
const A=require('./assets/arm-motion.js'),V=require('./assets/vrm-character.js');
const check=(ok,msg)=>{if(!ok)throw Error(msg);console.log('PASS '+msg)};
for(const side of ['left','right'])for(const mode of ['idle','ride','wave','cheer','hand','hug','dance','duet','sit'])for(const gait of [0,.5,1]){
 const targets=V.fingerTargets163(mode,gait,1,10,side,1);
 if(Object.keys(targets).length!==15||!Object.values(targets).every(([a,b])=>Number.isFinite(a)&&a>=0&&a<=1.27&&Number.isFinite(b)&&Math.abs(b)<=.30))throw Error('invalid finger target '+mode);
}check(true,'15 joint targets for each hand across 54 pose combinations');
const idle=V.fingerTargets163('idle',0,0,0,'right'),ride=V.fingerTargets163('ride',0,0,0,'right'),wave=V.fingerTargets163('wave',0,0,0,'right');
check(ride.IndexIntermediate[0]>idle.IndexIntermediate[0]&&wave.IndexIntermediate[0]<idle.IndexIntermediate[0],'relaxed, grip and wave target separation');
const a={name:'IndexProximal',curl:0,spread:0},b={name:'IndexDistal',curl:0,spread:0};
V.fingerResponse251(a,1,0,.016,'ride');V.fingerResponse251(b,1,0,.016,'ride');check(a.curl>b.curl&&b.curl>0,'staggered finger response');
for(let i=0;i<120;i++)V.fingerResponse251(a,1,0,1/60,'ride');check(a.curl>.99&&a.curl<=1,'grip converges without overshoot');
for(let i=0;i<120;i++)V.fingerResponse251(a,.1,0,1/60,'idle');check(a.curl>=.1&&a.curl<.102,'release converges without overshoot');
const arm={};A.armResponse251(arm,0,.2,.2,.016);A.armResponse251(arm,.5,1,.3,.016);check(arm.swing>0&&arm.swing<.5&&arm.flex>.2&&arm.flex<1,'arm easing');
for(let i=0;i<180;i++)A.armResponse251(arm,-10,10,10,1/60);check(arm.swing>=-.83&&arm.flex<=1.35&&arm.spread<=.64,'bounded arm response');

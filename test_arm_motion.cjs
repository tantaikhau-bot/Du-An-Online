const assert=require('node:assert/strict'),T=require('three'),A=require('./assets/arm-motion.js');
let n=0;for(const side of [-1,1])for(let swing=-.53;swing<=.58;swing+=.03)for(let flex=.1;flex<=1.2;flex+=.05){
 const out=new T.Vector3(side,0,0),up=new T.Vector3(0,1,0),forward=new T.Vector3(0,0,1);
 const d=A.directions(T,up,out,forward,swing,flex,.25);
 assert.ok(Math.abs(d.upper.length()-1)<1e-8);assert.ok(Math.abs(d.lower.length()-1)<1e-8);
 assert.ok(d.upper.dot(out)>.1);assert.ok(d.lower.dot(out)>.05);
 assert.ok(Math.abs(d.upper.angleTo(d.lower)-flex)<.15);
 n++;
}
console.log('Arm direction, flex and side clearance passed',n);

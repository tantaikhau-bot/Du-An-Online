const fs = require('node:fs');
const assert = require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
function get(name,next){
 const start=html.indexOf('function '+name+'(');
 const end=html.indexOf(next,start);
 assert.ok(start>=0&&end>start);
 return new Function(html.slice(start,end)+';return '+name)();
}
const clarity=get('clarityStep100','function openPerformance100');
const resolution=get('resolution77','const gl74=');
let v={tier:0,scale:1};
for(let i=0;i<12;i++)v=clarity(v,15,100,45,true,false);
assert.equal(v.tier,2);assert.equal(v.scale,.85);
let mobile=resolution(390,780,3,0,v.scale,false,false,4096,true);
assert.ok(mobile>=1.15);
let hd=resolution(390,780,3,0,v.scale,false,true,4096,true);
assert.ok(hd>=1.5);
let battery=resolution(390,780,3,0,.62,true,false,4096,true);
assert.ok(battery<=1);
let limited=resolution(4096,4096,3,2,1,false,true,1024,true);
assert.ok(limited<=.25);
assert.equal(resolution(390,780,1,1,1,false,false,4096,true),1);
assert.match(html,/BUILD62='10\.1-stability'/);
console.log('Mobile resolution regression checks passed');

const assert=require('node:assert/strict');
const {expression}=require('./assets/anime-character.js');
const fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
for(const [_,attrs,code] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
 if(!attrs.includes('src=')&&!attrs.includes('importmap'))new vm.Script(code);
}
assert.equal(expression('idle',0).eye,1);
assert.ok(expression('idle',3.95).eye<.2);
assert.ok(expression('happy',0).mouth>expression('idle',0).mouth);
assert.ok(expression('angry',0).brow<0);
assert.ok(expression('surprised',0).eye>1);
for(let t=0;t<100;t+=.05)for(const mode of ['idle','smile','happy','angry','surprised']){let e=expression(mode,t,.5);assert.ok(Object.values(e).every(Number.isFinite));assert.ok(e.eye>=.08&&e.eye<=1.15);}
assert.match(html,/WWAnime.makeStyle\(T\)/);
assert.match(html,/expressionAnime/);
console.log('Anime facial motion and all inline script syntax checks passed');

const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8'),day=fs.readFileSync('assets/daylight.js','utf8');
const ctx=vm.createContext({});vm.runInContext(day,ctx);
for(const k of ['sample','atmosphere3513','shadowAnchor3513','world274','weatherState'])assert.equal(typeof ctx.WWDay[k],'function',k);
for(const name of ['atmosphere3521','shadowAnchor3521']){const line=html.split('\n').find(x=>x.startsWith('function '+name+'('));assert(line);vm.runInContext(line,ctx);}
const old={sample:ctx.WWDay.sample};
for(const hour of [0,6,12,18,23.9]){const out={};assert.equal(ctx.atmosphere3521(old,hour,{fog:.012},out),out);assert(Object.values(out).every(Number.isFinite));assert.equal(out.fog,.012);const a=ctx.atmosphere3521(ctx.WWDay,hour,{},{});assert(Object.values(a).every(Number.isFinite));}
assert.deepEqual({...ctx.shadowAnchor3521(old,1,2,3,[1,1,1],20,1024,{})},{x:1,y:2,z:3});
const modern=ctx.shadowAnchor3521(ctx.WWDay,1,2,3,[1,1,1],20,1024,{});assert(Object.values(modern).every(Number.isFinite));
const scripts=[...html.matchAll(/<script\s+src="(\/assets\/[^"]+\.js[^"]*)"/g)];assert(scripts.length>=25);const build=html.match(/BUILD62='(\d+)\.(\d+)\.(\d+)-/);assert(build);const key=build.slice(1).join('');for(const [,src] of scripts)assert(src.endsWith('?v='+key),src);
assert(html.includes('atmosphere3521(WWDay,visualHour1170'));assert(html.includes('shadowAnchor3521(WWDay,x,sy,z'));
console.log('Browser-global daylight exports, stale-module fallback, versioned script URLs passed');
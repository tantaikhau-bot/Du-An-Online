/* V11.8 — conservative client-side performance budgets. */
(function(root){
 const profiles={battery:{label:'Tiết kiệm pin',quality:'auto',scale:1},low:{label:'Thấp',quality:'0',scale:.90},balanced:{label:'Cân bằng',quality:'auto',scale:1},high:{label:'Cao',quality:'2',scale:1},sharp:{label:'Ultra / HD',quality:'2',scale:1.18}};
 function recommend(device){return device.memory&&device.memory<=2?'battery':device.mobile||device.memory&&device.memory<=4||device.cores&&device.cores<=4?'low':'balanced'}
 function profile(mode){return profiles[mode]||profiles.balanced}
 function grid(height,cx,cz,w,d,nx,nz){const values=new Float64Array((nx+1)*(nz+1));for(let z=0;z<=nz;z++)for(let x=0;x<=nx;x++)values[z*(nx+1)+x]=height(cx-w/2+x*w/nx,cz-d/2+z*d/nz);
 return (x,z)=>{const gx=Math.max(0,Math.min(nx,(x-cx+w/2)*nx/w)),gz=Math.max(0,Math.min(nz,(z-cz+d/2)*nz/d)),ix=Math.min(nx-1,Math.floor(gx)),iz=Math.min(nz-1,Math.floor(gz)),u=gx-ix,v=gz-iz,j=iz*(nx+1)+ix,a=values[j],b=values[j+nx+1],c=values[j+nx+2],e=values[j+1];return u+v<=1?a+(e-a)*u+(b-a)*v:c+(b-c)*(1-u)+(e-c)*(1-v)}}
 function interval(distance,tier,local){if(local||distance<7)return 0;if(distance<14)return tier===2?66:33;if(distance<26)return tier===0?66:100;return tier===0?125:180}
 function advance(state,dt,ms){state.elapsed=Math.min(250,(state.elapsed||0)+Math.max(0,dt));if(state.elapsed+.001<ms)return 0;let elapsed=state.elapsed;state.elapsed=0;return elapsed}
 function trim(map,limit,protectedKeys,dispose){for(const [key,value] of map){if(map.size<=limit)break;if(protectedKeys.has(key))continue;map.delete(key);dispose(value)}return map.size}
 function warnings(r){const a=[];if(Number.isFinite(r.fps)&&r.fps<24)a.push('FPS thấp');if(r.frameP95ms>65)a.push('Khung hình chậm');if(r.drawCalls>1600)a.push('Nhiều lượt vẽ');if(r.textures>350||r.geometries>1800)a.push('Nhiều tài nguyên GPU (không phải dung lượng VRAM)');return a}
 const api={profiles,profile,recommend,grid,interval,advance,trim,warnings};if(typeof module!=='undefined')module.exports=api;else root.WWPerf=api;
})(typeof globalThis!=='undefined'?globalThis:this);

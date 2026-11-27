// Original Wish World scores and Foley. All generated material stays on device.
(() => {
  'use strict';
  const labels = {master:'Âm lượng tổng', music:'Nhạc nền', ambient:'Môi trường', actor:'Nhân vật', pet:'Linh thú', vehicle:'Phương tiện', combat:'Chiến đấu', ui:'Giao diện'};
  const defaults = {master:.7,music:.52,ambient:.44,actor:.75,pet:.6,vehicle:.55,combat:.8,ui:.52,enabled:false,spatial:true,light:matchMedia('(pointer:coarse)').matches};
  const settings = {...defaults};
  try {
    const saved = JSON.parse(localStorage.getItem('ww-audio142'));
    for (const k in defaults) if (typeof saved?.[k] === typeof defaults[k]) settings[k] = typeof defaults[k] === 'number' ? Math.min(1,Math.max(0,saved[k])) : saved[k];
  } catch {}
  const banks = new Map(), voices = new Set(), buses = {};
  let ctx, nextBeat=0, beat=0, region='login', surface='grass', nextNature=0, nextMotor=0, nextPet=0;
  const scores = {
    login:[60,.62,0], lobby:[57,.58,3], plaza:[67,.39,0], village:[62,.53,0], falls:[65,.66,0],
    forest:[59,.60,3], hill:[66,.52,3], pine:[55,.65,3], ruins:[52,.70,3], amber:[64,.51,0],
    summit:[69,.72,0], north:[57,.42,3], south:[65,.48,0], meadow:[64,.46,0], housing:[60,.64,0],
    dungeon:[50,.37,3], boss:[45,.26,3], victory:[67,.32,0]
  };
  const running=()=>settings.enabled && ctx?.state==='running' && !document.hidden;
  function refresh(){
    const b=document.getElementById('sound');
    if(b)b.textContent=running()?'♫ Tắt âm thanh':settings.enabled?'♫ Tiếp tục âm thanh':'♫ Bật âm thanh';
    if(ctx)for(const k in buses)buses[k].gain.setTargetAtTime(k==='master'&&!settings.enabled?0:settings[k],ctx.currentTime,.025);
  }
  function save(){try{localStorage.setItem('ww-audio142',JSON.stringify(settings))}catch{}refresh()}
  async function wake(){
    if(!settings.enabled||document.hidden)return;
    try{
      if(!ctx){
        ctx=new (window.AudioContext||window.webkitAudioContext)();
        for(const k in labels)buses[k]=ctx.createGain();
        for(const k in buses)buses[k].connect(k==='master'?ctx.destination:buses.master);
        ctx.onstatechange=refresh;
      }
      refresh();await ctx.resume();refresh();
    }catch{refresh()}
  }
  function toggle(){settings.enabled=!running()&&!(settings.enabled&&document.hidden);save();if(settings.enabled)wake();else ctx?.suspend().catch(()=>{})}
  document.addEventListener('visibilitychange',()=>document.hidden?ctx?.suspend().catch(()=>{}):wake());
  document.addEventListener('pointerdown',()=>{if(settings.enabled&&!running())wake()},{passive:true});
  document.addEventListener('keydown',()=>{if(settings.enabled&&!running())wake()});
  const profiles={
    grass:[140,.16,.8], dirt:[95,.12,.62], wood:[185,.14,.23], stone:[310,.09,.48], snow:[94,.21,.92],sand:[100,.18,.88],
    jump:[285,.22,.4],land:[70,.26,.69],emote:[490,.24,.15],click:[740,.06,.16],
    water:[950,1.65,.98],wind:[130,2.1,.99],rain:[1350,1.8,.99],bird:[1820,.45,.035],cricket:[3200,.42,.12],
    horse:[110,.16,.23],bike:[540,.29,.85],motor:[53,.65,.09],car:[37,.68,.13],
    cat:[470,.5,.08],rabbit:[160,.18,.65],fox:[680,.28,.16],deer:[240,.55,.18],dragon:[58,.85,.43],
    strike:[150,.28,.72],burst:[88,.64,.64],guard:[350,.32,.27],heal:[660,.62,.04],start:[220,.42,.15],lost:[140,.65,.18],retreat:[195,.38,.25],won:[790,.59,.05]
  };
  function buffer(key,variant){
    const id=key+'/'+variant;
    if(banks.has(id))return banks.get(id);
    const note=key.startsWith('note'),[pitch,duration,noise]=note?[Number(key.slice(4)),1.8,.003]:profiles[key];
    const rate=16000,buf=ctx.createBuffer(1,Math.ceil(rate*duration),rate),out=buf.getChannelData(0);
    let phase=0,filtered=0,seed=6753+variant*103;
    for(let i=0;i<out.length;i++){
      const t=i/rate,u=t/duration;
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      filtered+=(seed/2147483648-1-filtered)*(key==='wind'?.035:key==='water'?.28:.52);
      const contour=note?1:key==='bird'?1+.18*Math.sin(u*14):key==='cat'?.8+.45*Math.sin(Math.PI*u):1-.26*u;
      phase+=2*Math.PI*pitch*contour/rate;
      const tone=Math.sin(phase)+.32*Math.sin(phase*2.001)+.13*Math.sin(phase*3.002);
      const envelope=Math.min(1,t/(note?.026:.009))*Math.pow(1-u,note?2.4:1.4);
      out[i]=envelope*(tone*(1-noise)*.53+filtered*noise);
    }
    if(banks.size>=48)banks.delete(banks.keys().next().value);
    banks.set(id,buf);return buf;
  }
  const priority={ambient:0,music:1,pet:2,vehicle:2,actor:3,ui:4,combat:5};
  function release(v){voices.delete(v);v.src.disconnect();v.g.disconnect();v.pan?.disconnect()}
  function play(group,key,volume=1,speed=1,pan=0){
    if(!running()||!settings[group]||!settings.master)return;
    if(voices.size>=(settings.light?10:22)){
      const low=[...voices].sort((a,b)=>priority[a.group]-priority[b.group])[0];
      if(priority[low.group]>priority[group])return;
      low.src.stop();release(low);
    }
    const src=ctx.createBufferSource(),g=ctx.createGain(),v={src,g,group};
    src.buffer=buffer(key,key.startsWith('note')?0:Math.floor(Math.random()*3));
    src.playbackRate.value=speed*(.986+Math.random()*.028);g.gain.value=volume;src.connect(g);
    if(pan&&settings.spatial&&ctx.createStereoPanner){v.pan=ctx.createStereoPanner();v.pan.pan.value=Math.max(-1,Math.min(1,pan));g.connect(v.pan);v.pan.connect(buses[group])}else g.connect(buses[group]);
    voices.add(v);src.onended=()=>release(v);src.start();
  }
  let battle='',zone='login';
  function scene(name){
    zone=name;const target=battle||zone;if(target===region)return;
    region=target;beat=0;nextBeat=0;
    if(ctx)for(const v of voices)if(v.group==='music')v.g.gain.setTargetAtTime(0,ctx.currentTime,.32);
  }
  setInterval(()=>{
    if(!running()||ctx.currentTime<nextBeat)return;
    const [root,pace,minor]=scores[region]||scores.plaza;
    const degrees=[0,minor?3:4,7,12,7,minor?10:9,7,minor?3:4];
    const chord=[0,5,minor?3:9,7][Math.floor(beat/8)%4];
    const note=(semi,gain)=>play('music','note'+Math.round(440*2**((root+chord+semi-69)/12)),gain);
    note(degrees[(beat+(Math.floor(beat/8)%2)*3)%8],.19);
    if(beat%4===0)note(-12,.24);
    if(beat%8===2)note(7,.09);
    beat++;nextBeat=ctx.currentTime+pace;
  },80);
  function world(now,x,z,yaw,places,night,w,vehicle,speed,ground){
    surface=ground;if(!running())return;
    if(now>=nextNature){
      nextNature=now+750+Math.random()*550;
      let best=null,dist=Infinity;
      for(const p of places){const d=Math.hypot(x-p.x,z-p.z);if(d<dist){dist=d;best=p}}
      scene(z<-76?'north':z>76?'south':best?.id||'plaza');
      const falls=places.find(p=>p.id==='falls');
      if(falls){const dx=falls.x-x,dz=falls.z-z,d=Math.hypot(dx,dz);if(d<18)play('ambient','water',.38*(1-d/18),(1+w.rain*.12),(dx*Math.cos(yaw)-dz*Math.sin(yaw))/Math.max(1,d))}
      if(w.rain>.03)play('ambient','rain',.5*w.rain);
      else if(Math.random()<.55)play('ambient',Math.random()<night?'cricket':'bird',.08*(1-w.snow));
      play('ambient','wind',.11+.17*w.wind);
    }
    if(vehicle&&now>=nextMotor){
      nextMotor=now+(vehicle==='horse'?Math.max(170,530-speed*65):425);
      if(speed>.1||vehicle==='motor'||vehicle==='car')play('vehicle',vehicle,.24,Math.min(2,.84+speed*.13));
    }
  }
  let previousPeers=new Map();
  function peers(rows,viewer,yaw){
    const updated=new Map();
    for(const r of rows){
      const dx=(r.x-viewer.x)/35,dz=-(r.y-viewer.y)/14,d=Math.hypot(dx,dz);
      if(d>=16||!Number.isFinite(d))continue;
      const last=previousPeers.get(r.id),m=last?Math.hypot((r.x-last.x)/35,(r.y-last.y)/14):0;
      const jumping=r.jump>.08,travel=(last?.travel||0)+m;
      let key=null;
      if(last&&jumping&&!last.jumping)key='jump';
      else if(last&&!jumping&&last.jumping)key='land';
      else if(last&&m>0&&m<8&&travel>.7&&r.moving&&!jumping)key=({horse:'horse',motor:'motor',bike:'bike',car:'car'})[r.vehicle]||'grass';
      if(key)play('ambient',key,.32*(1-d/16),1,(dx*Math.cos(yaw)-dz*Math.sin(yaw))/Math.max(1,d));
      updated.set(r.id,{x:r.x,y:r.y,jumping,travel:key||m>8?0:travel});
    }
    previousPeers=updated;
  }
  function cue(kind){play('actor',kind==='step'?surface:kind,.4)}
  function pet(kind){if(running()&&profiles[kind]&&ctx.currentTime>=nextPet){play('pet',kind,.32);nextPet=ctx.currentTime+1+Math.random()*2}}
  function fight(action,data,v){
    battle=v.status==='fight'?(v.boss?'boss':'dungeon'):v.status==='won'?'victory':'';
    scene(zone);if(action==='status')return;
    const key=data.skill==='retreat'?'retreat':['won','lost'].includes(v.status)?v.status:data.skill||'start';if(profiles[key])play('combat',key,.6);
  }
  function panel(){
    const d=document.createElement('dialog');d.className='controls76';d.style.cssText='width:min(420px,92vw);max-height:80dvh;overflow:auto';
    const h=document.createElement('h2');h.textContent='Âm thanh';d.append(h);
    function fill(){
      d.replaceChildren(h);
      for(const [k,label] of Object.entries({...labels,enabled:'Bật âm thanh',spatial:'Âm thanh không gian',light:'Chế độ nhẹ'})){
        const row=document.createElement('label'),i=document.createElement('input');row.style.cssText='display:flex;justify-content:space-between;align-items:center;margin:12px 0';row.textContent=label;
        if(k in labels){i.type='range';i.min=0;i.max=100;i.value=settings[k]*100}else{i.type='checkbox';i.checked=settings[k]}
        i.oninput=()=>{settings[k]=k in labels?i.value/100:i.checked;save();if(k==='enabled'){if(settings.enabled)wake();else ctx?.suspend().catch(()=>{})}};
        row.append(i);d.append(row);
      }
      for(const [label,fn] of [['Khôi phục mặc định',()=>{Object.assign(settings,defaults);save();ctx?.suspend().catch(()=>{});fill()}],['Đóng',()=>d.close()]]){
        const b=document.createElement('button');b.textContent=label;b.onclick=fn;d.append(b);
      }
    }
    fill();document.body.append(d);d.onclose=()=>d.remove();d.showModal();
  }
  document.addEventListener('click',e=>{if(e.target.closest?.('button:not(:disabled)'))play('ui','click',.19)},true);
  window.WWAudio={peers,ui(key){play('ui',key,.27)},toggle,panel,cue,pet,world,scene,fight,leaveFight(){battle='';scene(zone)},room(){scene('housing');surface='wood'},refresh};
  document.addEventListener('DOMContentLoaded',refresh);
})();

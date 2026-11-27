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
  let nextFountain=0,nextUi=0,nextRiver=0,nextPetMove=0;
  let nextThunder=0,lastVehicle='',lastSpeed=0,combatRev=-1,lastHP=100;
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
    if(!settings.enabled&&voices.size)silence();
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
  document.addEventListener('visibilitychange',()=>{if(document.hidden){silence();ctx?.suspend().catch(()=>{})}else wake()});
  document.addEventListener('pointerdown',()=>{if(settings.enabled&&!running())wake()},{passive:true});
  document.addEventListener('keydown',()=>{if(settings.enabled&&!running())wake()});
  const profiles={
    grass:[140,.16,.8], dirt:[95,.12,.62], wood:[185,.14,.23], stone:[310,.09,.48], snow:[94,.21,.92],sand:[100,.18,.88],
    jump:[285,.22,.4],land:[70,.26,.69],emote:[490,.24,.15],click:[740,.06,.16],
    water:[950,1.65,.98],wind:[130,2.1,.99],rain:[1350,1.8,.99],bird:[1820,.45,.035],cricket:[3200,.42,.12],
    horse:[110,.16,.23],bike:[540,.29,.85],motor:[53,.65,.09],car:[37,.68,.13],
    cat:[470,.5,.08],rabbit:[160,.18,.65],fox:[680,.28,.16],deer:[240,.55,.18],dragon:[58,.85,.43],
    door:[83,.32,.31],brake:[1550,.21,.49],ignition:[40,.48,.42],cloth:[470,.16,.96],thunder:[43,2.6,.85],warning:[340,.28,.11],hit:[78,.17,.56],strike:[150,.28,.72],burst:[88,.64,.64],guard:[350,.32,.27],heal:[660,.62,.04],start:[220,.42,.15],lost:[140,.65,.18],retreat:[195,.38,.25],won:[790,.59,.05]
  };
  function buffer(key,variant){
    const id=key+'/'+variant;
    if(banks.has(id))return banks.get(id);
    const [instrument,pitchText]=key.split('/'),note=pitchText!==undefined;
    const [pitch,duration,noise]=note?[Number(pitchText),instrument==='strings'?2.2:1.6,.003]:profiles[key];
    const rate=16000,buf=ctx.createBuffer(1,Math.ceil(rate*duration),rate),out=buf.getChannelData(0);
    let phase=0,filtered=0,seed=6753+variant*103;
    for(let i=0;i<out.length;i++){
      const t=i/rate,u=t/duration;
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      filtered+=(seed/2147483648-1-filtered)*(key==='wind'?.035:key==='water'?.28:.52);
      const contour=note?1:key==='bird'?1+.18*Math.sin(u*14):key==='cat'?.8+.45*Math.sin(Math.PI*u):1-.26*u;
      phase+=2*Math.PI*pitch*contour/rate;
      let tone=Math.sin(phase)+.32*Math.sin(phase*2.001)+.13*Math.sin(phase*3.002);
      if(instrument==='harp')tone+=.38*Math.cos(phase*4.01)*Math.exp(-8*t);
      if(instrument==='strings')tone=.46*tone+.42*Math.sin(phase*1.004+.15*Math.sin(32*t))+.15*Math.sin(phase*4);
      if(instrument==='flute')tone=.85*Math.sin(phase+.09*Math.sin(t*30))+.08*Math.sin(phase*3);
      if(key==='cricket')tone*=Math.max(0,Math.sin(t*154))*Math.max(0,Math.sin(t*49));
      if(key==='dragon'||key==='motor'||key==='car'||key==='ignition')tone*=.6+.4*Math.sin(phase*.49);
      if(key==='cat'||key==='deer'||key==='fox')tone*=.8+.2*Math.sin(phase*.018);
      const envelope=Math.min(1,t/(instrument==='strings'?.35:instrument==='flute'?.12:note?.016:.009))*Math.pow(1-u,note?2.4:1.4);
      out[i]=envelope*(tone*(1-noise)*.53+filtered*noise);
    }
    if(banks.size>=48)banks.delete(banks.keys().next().value);
    banks.set(id,buf);return buf;
  }
  // Each file is a small same-origin collection of original one-shot samples.
  const samples={"harp/330":{"group":"music","clips":[[0,1.6]]},"strings/220":{"group":"music","clips":[[1.7,2.2]]},"flute/440":{"group":"music","clips":[[4,1.6]]},"water":{"group":"nature","clips":[[0,1.65]]},"wind":{"group":"nature","clips":[[1.75,2.1]]},"rain":{"group":"nature","clips":[[3.95,1.8]]},"bird":{"group":"nature","clips":[[5.85,0.45]]},"cricket":{"group":"nature","clips":[[6.4,0.42]]},"thunder":{"group":"nature","clips":[[6.92,2.6]]},"grass":{"group":"movement","clips":[[0,0.16],[0.26,0.16],[0.52,0.16]]},"dirt":{"group":"movement","clips":[[0.78,0.12],[1,0.12],[1.22,0.12]]},"wood":{"group":"movement","clips":[[1.44,0.14],[1.68,0.14],[1.92,0.14]]},"stone":{"group":"movement","clips":[[2.16,0.09],[2.35,0.09],[2.54,0.09]]},"snow":{"group":"movement","clips":[[2.73,0.21],[3.04,0.21],[3.35,0.21]]},"sand":{"group":"movement","clips":[[3.66,0.18],[3.94,0.18],[4.22,0.18]]},"jump":{"group":"movement","clips":[[4.5,0.22],[4.82,0.22],[5.14,0.22]]},"land":{"group":"movement","clips":[[5.46,0.26],[5.82,0.26],[6.18,0.26]]},"cloth":{"group":"movement","clips":[[6.54,0.16],[6.8,0.16],[7.06,0.16]]},"emote":{"group":"movement","clips":[[7.32,0.24],[7.66,0.24],[8,0.24]]},"door":{"group":"movement","clips":[[8.34,0.32],[8.76,0.32],[9.18,0.32]]},"cat":{"group":"pets","clips":[[0,0.5],[0.6,0.5],[1.2,0.5]]},"rabbit":{"group":"pets","clips":[[1.8,0.18],[2.08,0.18],[2.36,0.18]]},"fox":{"group":"pets","clips":[[2.64,0.28],[3.02,0.28],[3.4,0.28]]},"deer":{"group":"pets","clips":[[3.78,0.55],[4.43,0.55],[5.08,0.55]]},"dragon":{"group":"pets","clips":[[5.73,0.85],[6.68,0.85],[7.63,0.85]]},"horse":{"group":"vehicles","clips":[[0,0.16]]},"bike":{"group":"vehicles","clips":[[0.26,0.29]]},"motor":{"group":"vehicles","clips":[[0.65,0.65]]},"car":{"group":"vehicles","clips":[[1.4,0.68]]},"brake":{"group":"vehicles","clips":[[2.18,0.21]]},"ignition":{"group":"vehicles","clips":[[2.49,0.48]]},"strike":{"group":"events","clips":[[0,0.28]]},"burst":{"group":"events","clips":[[0.38,0.64]]},"guard":{"group":"events","clips":[[1.12,0.32]]},"heal":{"group":"events","clips":[[1.54,0.62]]},"start":{"group":"events","clips":[[2.26,0.42]]},"lost":{"group":"events","clips":[[2.78,0.65]]},"retreat":{"group":"events","clips":[[3.53,0.38]]},"won":{"group":"events","clips":[[4.01,0.59]]},"hit":{"group":"events","clips":[[4.7,0.17]]},"warning":{"group":"events","clips":[[4.97,0.28]]},"click":{"group":"events","clips":[[5.35,0.06]]}};
  const decoded=new Map(),pending=new Map(),failed=new Map();
  let decodedBytes=0;
  async function loadBank(group){
    if(decoded.has(group))return decoded.get(group);
    if(pending.has(group))return pending.get(group);
    if(performance.now()<(failed.get(group)||0))return null;
    const task=(async()=>{
      try{
        const response=await fetch('/assets/audio-'+group+'.mp3?v=1420');
        if(!response.ok)throw Error('Audio resource '+response.status);
        const raw=await response.arrayBuffer();
        const result=await new Promise((resolve,reject)=>ctx.decodeAudioData(raw,resolve,reject));
        const bytes=result.length*result.numberOfChannels*4;
        while(decoded.size&&decodedBytes+bytes>12*1024*1024){
          const oldest=decoded.keys().next().value,b=decoded.get(oldest);
          decodedBytes-=b.length*b.numberOfChannels*4;decoded.delete(oldest);
        }
        decodedBytes+=bytes;decoded.set(group,result);return result;
      }catch{failed.set(group,performance.now()+60000);return null}
      finally{pending.delete(group)}
    })();pending.set(group,task);return task;
  }
  let epoch=0;
  function silence(){epoch++;for(const v of voices){v.src.stop();release(v)}}
  const priority={ambient:0,music:1,pet:2,vehicle:2,actor:3,ui:4,combat:5};
  function release(v){voices.delete(v);v.src.disconnect();v.g.disconnect();v.pan?.disconnect()}
  async function play(group,key,volume=1,speed=1,pan=0,depth=0){
    if(!running()||!settings[group]||!settings.master)return;
    const [instrument,frequency]=key.split('/'),root={harp:330,strings:220,flute:440}[instrument];
    const sample=samples[root?instrument+'/'+root:key];if(!sample)return;
    const requested=performance.now(),startedEpoch=epoch,requestedRegion=region;
    const loaded=decoded.get(sample.group)||await loadBank(sample.group);
    if(epoch!==startedEpoch||performance.now()-requested>900||(group==='music'&&region!==requestedRegion))return;
    const index=Math.floor(Math.random()*sample.clips.length),clip=sample.clips[index];
    if(!running()||!settings[group]||!settings.master)return;
    if(voices.size>=(settings.light?10:22)){
      const low=[...voices].sort((a,b)=>priority[a.group]-priority[b.group])[0];
      if(priority[low.group]>priority[group])return;
      low.src.stop();release(low);
    }
    const src=ctx.createBufferSource(),g=ctx.createGain(),v={src,g,group};
    src.buffer=loaded||buffer(key,index);
    if(loaded&&root)speed*=Number(frequency)/root;
    src.playbackRate.value=speed*(.986+Math.random()*.028);g.gain.value=volume;src.connect(g);
    if((pan||depth)&&settings.spatial&&!settings.light&&ctx.createPanner){
      v.pan=ctx.createPanner();v.pan.panningModel='HRTF';v.pan.rolloffFactor=0;
      v.pan.setPosition(pan,0,depth);g.connect(v.pan);v.pan.connect(buses[group]);
    }else if(pan&&settings.spatial&&ctx.createStereoPanner){v.pan=ctx.createStereoPanner();v.pan.pan.value=Math.max(-1,Math.min(1,pan));g.connect(v.pan);v.pan.connect(buses[group])}else g.connect(buses[group]);
    voices.add(v);src.onended=()=>release(v);if(loaded)src.start(0,clip[0],clip[1]);else src.start();
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
    const lead=['village','south','meadow','forest'].includes(region)?'flute':['summit','ruins','boss','dungeon','pine'].includes(region)?'strings':'harp';
    const note=(semi,gain,instrument=lead)=>play('music',instrument+'/'+Math.round(440*2**((root+chord+semi-69)/12)),gain);
    note(degrees[(beat+(Math.floor(beat/8)%2)*3)%8],.19);
    if(beat%4===0)note(-12,.24,'strings');
    if(beat%8===2)note(7,.09,'harp');
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
      if(falls){const dx=falls.x-x,dz=falls.z-z,d=Math.hypot(dx,dz);if(d<18)play('ambient','water',.38*(1-d/18)*Math.exp(-d*w.fog*.7),(1+w.rain*.12),(dx*Math.cos(yaw)+dz*Math.sin(yaw))/Math.max(1,d),(dz*Math.cos(yaw)-dx*Math.sin(yaw))/Math.max(1,d))}
      if(w.rain>.9&&w.wind>2.3&&now>nextThunder){play('ambient','thunder',.48);nextThunder=now+9000+Math.random()*14000}
      if(w.rain>.03)play('ambient','rain',.5*w.rain);
      else if(Math.random()<.55)play('ambient',Math.random()<night?'cricket':'bird',.08*(1-w.snow));
      play('ambient','wind',.11+.17*w.wind);
    }
    if(now>=nextRiver){
      nextRiver=now+1100;
      if(typeof RIVER_Z==='number'&&Math.abs(z-RIVER_Z)<8)play('ambient','water',.18*(1-Math.abs(z-RIVER_Z)/8),.8);
      if(typeof s!=='undefined'&&s.pet&&profiles[s.pet]&&speed>.2&&now>nextPetMove){
        nextPetMove=now+6000+Math.random()*9000;
        play('pet',s.pet==='dragon'?'cloth':s.pet==='rabbit'?'grass':s.pet,.14);
      }
    }
    if(vehicle!==lastVehicle){
      for(const v of voices)if(v.group==='vehicle')v.src.stop();
      if(vehicle==='motor'||vehicle==='car')play('vehicle','ignition',.35);
      lastVehicle=vehicle;nextMotor=0;lastSpeed=0;
    }
    if(vehicle==='car'&&lastSpeed>2&&speed<.2)play('vehicle','brake',.2);
    lastSpeed=speed;
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
      if(key)play('ambient',key,.32*(1-d/16),1,(dx*Math.cos(yaw)+dz*Math.sin(yaw))/Math.max(1,d),(dz*Math.cos(yaw)-dx*Math.sin(yaw))/Math.max(1,d));
      updated.set(r.id,{x:r.x,y:r.y,jumping,travel:key||m>8?0:travel});
    }
    previousPeers=updated;
  }
  function cue(kind){play('actor',kind==='step'?surface:kind,.4);if(kind==='jump'||kind==='emote')play('actor','cloth',.12)}
  function pet(kind){if(running()&&profiles[kind]&&ctx.currentTime>=nextPet){play('pet',kind,.32);nextPet=ctx.currentTime+1+Math.random()*2}}
  function fight(action,data,v){
    battle=v.status==='fight'?(v.boss?'boss':'dungeon'):v.status==='won'?'victory':'';
    scene(zone);
    const hp=lastHP;lastHP=v.hp;
    if(action==='status'){combatRev=v.rev;return}
    if(v.rev===combatRev)return;
    combatRev=v.rev;
    if(v.hp<hp&&action==='act')play('combat','hit',.29);
    if(v.status==='fight'&&v.incoming==='Đòn cường kích')play('combat','warning',.25);
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
  new MutationObserver(records=>{
    for(const {target:d} of records)if(d.tagName==='DIALOG')play('ui',d.open?'emote':'door',.16);
  }).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('click',e=>{if(e.target.closest?.('button:not(:disabled)')&&performance.now()>nextUi){nextUi=performance.now()+80;play('ui','click',.19)}},true);
  window.WWAudio={fountains(now,x,z,yaw,objects){
    if(!running()||now<nextFountain)return;
    nextFountain=now+1100;let best=12,source=null;
    for(const o of objects)if(o.userData.audioKind==='fountain'){
      const d=Math.hypot(o.position.x-x,o.position.z-z);if(d<best){source=o;best=d}
    }
    if(source){const dx=source.position.x-x,dz=source.position.z-z;
      play('ambient','water',.34*(1-best/12),1.22,(dx*Math.cos(yaw)+dz*Math.sin(yaw))/Math.max(1,best),(dz*Math.cos(yaw)-dx*Math.sin(yaw))/Math.max(1,best))}
  },stats:()=>({state:ctx?.state||'inactive',voices:voices.size,buffers:banks.size+decoded.size,decodedBytes,loadedBanks:[...decoded.keys()],region}),peers,ui(key){play('ui',key,.27)},toggle,panel,cue,pet,world,scene,fight,leaveFight(){battle='';scene(zone)},room(){if(zone!=='housing')play('ambient','door',.24);scene('housing');surface='wood'},refresh};
  document.addEventListener('DOMContentLoaded',refresh);
})();

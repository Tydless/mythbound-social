/* Mythbound class codex: concept stats, not final balance. */
(() => {
"use strict";
const DATA={
breaker:{color:"#de9779",stats:[4,5,2,2,3],difficulty:2,play:"MELEE · TANK / BRAWLER",skills:[
["✊","Iron Palm","Melee","2.5 m","160% ATK damage","6 sec","Strike a foe and briefly stagger them."],
["◇","Unbroken Stance","Defense","Self","35% damage reduction","18 sec","Brace for impact for 4 seconds."],
["➶","Shoulder Break","Melee dash","4 m","125% ATK damage","12 sec","Charge forward and interrupt the first enemy struck."],
["✦","Fighting Spirit","Passive","Self","+12% guard","Passive","Blocking a powerful hit improves your guard."]]},
animar:{color:"#85c4b2",stats:[4,4,4,4,3],difficulty:5,play:"HYBRID · SHAPESHIFTER / EXPERT",skills:[
["◈","Beast Shift","Stance","Self","Change form","8 sec","Switch between protective and offensive animal forms."],
["✦","Feral Rend","Melee","3 m","145% ATK damage","7 sec","Slash a foe with a beast-form claw."],
["❖","Wild Echo","Support","18 m","Heal 120% WIS","14 sec","Channel restorative energy to an ally."],
["⌁","Instinct","Passive","Self","+8% speed","Passive","Gain movement speed after transforming."]]},
herder:{color:"#c3cf95",stats:[2,3,5,3,4],difficulty:3,play:"MOUNTED · COMPANION SUPPORT",skills:[
["♧","Call the Flock","Summon","20 m","Summon 2 sheep","18 sec","Summon protective sheep to intercept attacks."],
["❃","Woolguard","Shield","22 m","Shield 170% WIS","12 sec","Wrap an ally in a protective woolen ward."],
["➵","Shepherd's Signal","Area support","12 m","+15% defense","22 sec","Command companions to bolster nearby allies."],
["✧","Kindred Bond","Passive","Companions","+10% endurance","Passive","Strengthen the resilience of your summons."]]},
elemis:{color:"#adc4ef",stats:[5,2,3,5,4],difficulty:4,play:"RANGED · ELEMENTAL MAGIC",skills:[
["✳","Primal Spark","Ranged","24 m","155% MAG damage","5 sec","Launch concentrated elemental magic."],
["≈","Tide Snare","Area","18 m","90% MAG + slow","14 sec","A small wave slows enemies."],
["✦","Zephyr Step","Movement","Self","Dash 6 m","10 sec","Fly on a quick gust of wind."],
["◌","Elemental Accord","Passive","Self","+8% magic","Passive","Alternating elements strengthens the next cast."]]},
strider:{color:"#c3afe3",stats:[5,2,1,5,4],difficulty:4,play:"MELEE · PRECISION DUELIST",skills:[
["⚔","Twin Arc","Melee","3 m","2 × 100% ATK","5 sec","Two fluid sword strikes."],
["➳","Passing Step","Movement","7 m","70% ATK + evade","11 sec","Dash through a foe while briefly evading."],
["✧","Opening Cut","Melee","3 m","175% ATK damage","14 sec","Strike an exposed target."],
["◇","Duelist's Eye","Passive","Self","+9% precision","Passive","Gain precision against isolated enemies."]]},
saint:{color:"#f3d5a5",stats:[2,4,5,2,3],difficulty:2,play:"RANGED · HEALER / PROTECTOR",skills:[
["✥","Gentle Benediction","Healing","24 m","Heal 190% WIS","6 sec","Restore an injured ally with holy light."],
["✧","Hallowed Veil","Shield","22 m","Shield 140% WIS","12 sec","Protect an ally with a short-lived halo."],
["✦","Judgment Ray","Ranged","20 m","125% MAG damage","9 sec","Send a beam of sacred light at an enemy."],
["♢","Merciful Heart","Passive","Party","+10% emergency heals","Passive","Blessings are stronger on critically wounded allies."]]}
};
const $=id=>document.getElementById(id);
const stats=$("class-stats"),skills=$("class-skills"),detail=$("skill-detail"),preview=$("class-preview");
if(!stats||!skills||!detail||!preview)return;
const statLabels=["Damage","Defense","Support","Mobility","Control"];
let active="saint",gender="male",chosen=0,activePath=0;
const isUnrevealed=()=>active==="saint"&&activePath===3;
// Add approved specialization content here, grouped by class and path number.
// Each entry may provide name, description, icon, skills (same format as DATA), and signatureMoves.
const SPECIALIZATIONS={
 saint:{
  1:{name:"Archsaint",type:"TRUE PATH",artwork:{male:"../ArchsaintMalePortrait.png",female:"../ArchsaintFemalePortrait.png"},description:"Embrace the Saint's sacred calling. Master greater blessings, restorative miracles and divine protection, sheltering the entire party through the power of holy light.",skills:[],signatureMoves:[]},
  2:{name:"Fallen Saint",type:"CORRUPTED PATH",artwork:{male:"../FallenSaintMalePortrait.png",female:"../FallenSaintFemalePortrait.png"},description:"Twist sacred power into forbidden magic. Siphon life, bestow cursed blessings and sacrifice your own vitality to unleash devastating attacks.",skills:[],signatureMoves:[]},
  3:{name:"Coming soon",type:"UNREVEALED PATH",artwork:{male:"../ComingSoonSaintMalePortrait.png",female:"../ComingSoonSaintFemalePortrait.png"},description:"A new path awaits those who dare to question their sacred calling. More will be revealed in a future chronicle.",skills:[],signatureMoves:[]}
 }
};
const pathData=()=>activePath===0?{name:cap(active),description:"Master the foundations of your class.",skills:DATA[active].skills,signatureMoves:[]}:SPECIALIZATIONS[active]?.[activePath]||{name:"Specialization "+activePath,description:"This advanced path has yet to be revealed.",skills:[],signatureMoves:[]};

/* A fixed gender greeting plus three independent, cyclic voice previews.
   Assets: ../VoiceSaintMaleSwitch.mp3, ../VoiceFallenSaintFemaleSwitch.mp3, etc.
   One player at a time; missing recordings never break the codex. */
const voiceNext=Object.create(null);
let voicePlaying=null,musicVolume=null;
const music=$("mythbound-theme");
const voiceButton=document.createElement("button");
voiceButton.type="button";voiceButton.className="class-voice-button";
voiceButton.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12"/></svg>';
const voiceStatus=document.createElement("span");voiceStatus.className="class-voice-status";voiceStatus.setAttribute("role","status");
const controls=document.createElement("div");controls.className="class-preview-controls";
const genderSwitch=document.querySelector(".gender-switch");
genderSwitch.before(controls);controls.append(genderSwitch,voiceButton);
document.querySelector(".preview-toolbar").after(voiceStatus);
const teaserNote=document.createElement("span");teaserNote.className="unrevealed-voice-note";teaserNote.textContent="Teaser voice line · Not yet revealed";teaserNote.hidden=true;voiceStatus.after(teaserNote);
const cap=s=>s[0].toUpperCase()+s.slice(1);
const voiceClass=()=>active==="saint"&&activePath===1?"Archsaint":active==="saint"&&activePath===2?"FallenSaint":cap(active);
const voiceClassName=()=>voiceClass()==="FallenSaint"?"Fallen Saint":voiceClass();
// Only the approved male Archsaint recordings have been uploaded so far.
const archsaintVoicePending=()=>voiceClass()==="Archsaint"&&gender==="female";
const voiceUnavailable=()=>isUnrevealed()||archsaintVoicePending();
const voiceKey=()=>voiceClass()+":"+gender;
const nextVoice=()=>voiceNext[voiceKey()]||1;
function updateVoiceButton(){
 const mystery=isUnrevealed(),pending=archsaintVoicePending();
 const label=mystery?"Teaser voice line — not yet available":pending?"Female Archsaint voice lines — coming soon":"Play "+voiceClassName()+" "+gender+" voice line "+nextVoice()+" of 3";
 voiceButton.disabled=voiceUnavailable();
 teaserNote.textContent=mystery?"Teaser voice line · Not yet revealed":"Female Archsaint voice preview · Coming soon";
 teaserNote.hidden=!mystery&&!pending;
 voiceButton.title=label;voiceButton.setAttribute("aria-label",label);
 voiceButton.classList.toggle("is-speaking",!!voicePlaying);
}
function restoreMusic(){
 if(music&&musicVolume!==null){try{music.volume=musicVolume}catch{}}
 musicVolume=null;
}
function stopVoice(clearStatus=true){
 const old=voicePlaying;voicePlaying=null;
 if(old){old.pause();old.removeAttribute("src");old.load()}
 restoreMusic();
 if(clearStatus)voiceStatus.textContent="";
 updateVoiceButton();
}
function playVoice(kind){
 if(voiceUnavailable()){stopVoice();return}
 document.dispatchEvent(new Event("mythbound:class-voice-start"));
 stopVoice();
 const filename="Voice"+voiceClass()+cap(gender)+kind+".mp3";
 const audio=new Audio();audio.preload="auto";voicePlaying=audio;
 const fail=()=>{if(voicePlaying!==audio)return;stopVoice(false);voiceStatus.textContent="Voice preview unavailable — recording pending or playback blocked."};
 audio.addEventListener("playing",()=>{
  if(voicePlaying!==audio)return;
  if(music&&musicVolume===null){try{musicVolume=music.volume;music.volume=musicVolume*.28}catch{}}
 },{once:true});
 audio.addEventListener("ended",()=>{if(voicePlaying===audio)stopVoice()},{once:true});
 audio.addEventListener("error",fail,{once:true});
 audio.src="../"+filename;updateVoiceButton();
 try{const result=audio.play();if(result&&typeof result.catch==="function")result.catch(fail)}catch{fail()}
}
voiceButton.addEventListener("click",()=>{
 if(voiceUnavailable())return;
 const key=voiceKey(),line=nextVoice();
 voiceNext[key]=line%3+1;playVoice(String(line));
});
const classPage=$("page-classes");
const voiceVisibility=new MutationObserver(()=>{
 if(classPage.hidden||document.body.classList.contains("mythbound-login-open"))stopVoice();
});
voiceVisibility.observe(classPage,{attributes:true,attributeFilter:["hidden"]});
voiceVisibility.observe(document.body,{attributes:true,attributeFilter:["class"]});
document.addEventListener("mythbound:party-voice-start",()=>stopVoice());
document.addEventListener("visibilitychange",()=>{if(document.hidden)stopVoice()});
window.addEventListener("pagehide",()=>stopVoice());


function avatarArt(){
 const c=DATA[active],male=gender==="male",size=male?44:37;
 const skin="#e6c5ae",hair=c.color;
 const hairShape=male?"M151 115Q130 52 190 60Q243 62 231 120L207 91L151 115Z":"M145 117Q133 53 190 58Q256 58 231 133Q253 190 255 237Q205 209 207 119Q174 151 126 225Z";
 const lower=active==="elemis"?"<path d='M160 280q-30 27 20 44l35-27M218 276q22 36-14 52' fill='none' stroke='"+hair+"' stroke-width='20' stroke-linecap='round'/>":"<path d='M162 275l-18 99M217 275l20 99' fill='none' stroke='"+hair+"' stroke-width='22' stroke-linecap='round'/>";
 const wings=active==="elemis"?"<path d='M164 173Q45 9 74 131Q96 181 161 202M225 175Q343 11 305 135Q287 180 231 205' fill='#9dcbd5' fill-opacity='.37' stroke='#abc9ee' stroke-width='4'/>":"";
 const sheep=active==="herder"?"<ellipse cx='190' cy='299' rx='112' ry='67' fill='#d6d6c4' stroke='#87928b' stroke-width='5'/><circle cx='108' cy='271' r='34' fill='#e9e7d4'/><path d='M86 245q-29-20-27 10M129 245q30-18 24 11' fill='none' stroke='#a79b72' stroke-width='8'/>":"";
 const aura=active==="saint"?"<circle cx='190' cy='77' r='53' fill='none' stroke='#eddaac' stroke-width='3' stroke-dasharray='14 6'/>":"";
 const fists=active==="breaker"?"<circle cx='113' cy='260' r='24' fill='#985566'/><circle cx='271' cy='259' r='24' fill='#985566'/>":"";
 const blade=active==="strider"?"<path d='M275 62L183 320' fill='none' stroke='#c8d6e5' stroke-width='9'/>":"";
 const tail=active==="animar"?"<path d='M133 260Q47 230 71 153' fill='none' stroke='#8ab6a5' stroke-width='23' stroke-linecap='round'/>":"";
 const dress=active==="saint"?"<path d='M143 257Q104 313 119 365Q191 384 265 359Q263 302 235 260Z' fill='#d9d5d7' stroke='#f5deb7' stroke-width='4'/>":"";
 return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 380 420' role='img' aria-label='"+gender+" "+active+" concept avatar'><circle cx='190' cy='218' r='167' fill='none' stroke='"+c.color+"' opacity='.35' stroke-dasharray='3 9'/>"+aura+wings+sheep+tail+lower+dress+blade+"<path d='M146 170Q189 143 232 168L247 276Q180 294 132 269Z' fill='"+c.color+"' stroke='#e3e0dc' stroke-width='4'/><path d='M147 176l-32 79M229 176l41 74' fill='none' stroke='"+c.color+"' stroke-width='20' stroke-linecap='round'/>"+fists+"<circle cx='189' cy='110' r='"+size+"' fill='"+skin+"' stroke='#f6dec8' stroke-width='4'/><path d='"+hairShape+"' fill='"+hair+"' stroke='#688295' stroke-width='4'/><path d='M172 119h9m19 0h9' stroke='#635b5b' stroke-width='3' stroke-linecap='round'/><path d='M184 139q7 4 13-1' fill='none' stroke='#936c70' stroke-width='2'/></svg>";
}
// Original transformation foley. Unlock on the selection gesture; play only when the new image is ready.
let transformAudioContext=null, transformAudioSource=null;
const transformBuffers=Object.create(null);
function transformationMuted(){try{return localStorage.getItem("mythbound-music-enabled")==="false"}catch{return false}}
function prepareTransformationAudio(){
 if(transformationMuted())return;
 try{
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  transformAudioContext=transformAudioContext||new Audio();
  if(transformAudioContext.state==="suspended")transformAudioContext.resume().catch(()=>{});
 }catch{}
}
function stopTransformationAudio(){
 if(transformAudioSource){try{transformAudioSource.stop()}catch{}transformAudioSource=null}
}
function playTransformationAudio(fallen){
 if(transformationMuted()||document.hidden)return;
 const ac=transformAudioContext;if(!ac||ac.state==="closed")return;
 stopTransformationAudio();
 try{
  const key=fallen?"fire":"sparkle";
  if(!transformBuffers[key]){
   const rate=ac.sampleRate,duration=fallen?2.48:1.85;
   const buffer=ac.createBuffer(1,Math.ceil(rate*duration),rate),data=buffer.getChannelData(0);
   if(fallen){
    let low=0,mid=0;
    for(let i=0;i<data.length;i++){
     const t=i/rate,n=Math.random()*2-1;
     low+=.065*(n-low);mid+=.28*(n-mid);
     const env=Math.min(1,t/.20)*Math.pow(Math.max(0,1-t/duration),.75);
     data[i]=(low*.31+(n-mid)*.055)*env;
    }
    for(let k=0;k<63;k++){
     const start=Math.floor((.09+Math.random()*(duration-.30))*rate);
     const length=Math.floor((.007+Math.random()*.031)*rate);
     const strength=.08+Math.random()*.27;
     let previous=0;
     for(let i=0;i<length&&start+i<data.length;i++){
      const n=Math.random()*2-1,env=Math.exp(-i/(length*.21))*Math.min(1,i/Math.max(1,rate*.001));
      data[start+i]+=(.67*n+.33*previous)*strength*env;previous=n;
     }
    }
   }else{
    // A single breathing, luminous chord, not a sequence of bell notes.
    // Layered soft vowel-like harmonics and a diffuse high-frequency shimmer.
    const tau=2*Math.PI;
    const voices=[
     {f:220,g:.070},{f:329.6276,g:.060},{f:440,g:.052},{f:554.3653,g:.026}
    ];
    const harmonics=[1,.30,.20,.075,.045];
    for(const voice of voices){
     for(const detune of [-.0018,.0018]){
      const phase=Math.random()*tau;
      for(let i=0;i<data.length;i++){
       const t=i/rate,q=t/duration;
       const attack=Math.sin(Math.PI*.5*Math.min(1,t/.45))**2;
       const release=Math.cos(Math.PI*.5*Math.max(0,(q-.37)/.63))**2;
       const angle=tau*voice.f*(1+detune)*t+phase+.10*Math.sin(tau*1.7*t+phase);
       let vowel=0;
       for(let k=0;k<harmonics.length;k++)vowel+=harmonics[k]*Math.sin(angle*(k+1)+k*.4);
       data[i]+=voice.g*.5*vowel*attack*release;
      }
     }
    }
    let slow=0,fast=0;
    for(let i=0;i<data.length;i++){
     const t=i/rate,q=t/duration,n=Math.random()*2-1;
     slow+=.025*(n-slow);fast+=.26*(n-fast);
     const air=Math.sin(Math.PI*q)**2;
     const shimmer=Math.sin(tau*1318.510*t+.45*Math.sin(tau*.9*t))*.010+
       Math.sin(tau*1760*t+.35*Math.sin(tau*1.3*t))*.007;
     data[i]+=air*((fast-slow)*.040+shimmer);
    }
    // A very quiet diffuse tail gives the swell a spacious, chapel-like decay.
    const dry=data.slice();
    for(const [delay,level] of [[.063,.13],[.117,.095],[.173,.065],[.247,.04]]){
     const offset=Math.round(delay*rate);
     for(let i=offset;i<data.length;i++)data[i]+=dry[i-offset]*level;
    }
    for(let i=0;i<data.length;i++){
     const tail=Math.min(1,(data.length-1-i)/(rate*.18));
     data[i]*=tail*tail;
    }
   }
   transformBuffers[key]=buffer;
  }
  const sound=ac.createBufferSource(),gain=ac.createGain();sound.buffer=transformBuffers[key];
  gain.gain.value=fallen?.65:.72;sound.connect(gain);gain.connect(ac.destination);
  transformAudioSource=sound;
  sound.onended=()=>{sound.disconnect();gain.disconnect();if(transformAudioSource===sound)transformAudioSource=null};
  sound.start();
 }catch{}
}
document.addEventListener("visibilitychange",()=>{if(document.hidden)stopTransformationAudio()});
window.addEventListener("pagehide",stopTransformationAudio);
$("music-toggle")?.addEventListener("click",()=>{if(transformationMuted())stopTransformationAudio()});
new MutationObserver(()=>{if($("page-classes").hidden||document.body.classList.contains("mythbound-login-open"))stopTransformationAudio()}).observe($("page-classes"),{attributes:true,attributeFilter:["hidden"]});

// Divine manifestation: a broad feathered gradient rising over the old image,
// with little star-shaped glints that appear along its moving boundary.
function revealSaint(stage,oldImage,picture){
 const finish=()=>{
  oldImage.remove();stage.querySelector(".portrait-burn-canvas")?.remove();
  stage.classList.remove("portrait-revealing","portrait-crossfade");picture.classList.remove("portrait-incoming");
 };
 try{
  const b=stage.getBoundingClientRect();
  if(!b.width||!b.height){finish();return}
  const canvas=document.createElement("canvas");
  canvas.className="portrait-burn-canvas";canvas.setAttribute("aria-hidden","true");
  canvas.style.zIndex="3";
  const w=canvas.width=Math.min(720,Math.ceil(b.width*1.3)),h=canvas.height=Math.round(w*b.height/b.width);
  const ctx=canvas.getContext("2d");
  if(!ctx){stage.classList.add("portrait-crossfade");setTimeout(finish,1050);return}
  const masked=window.CSS&&(CSS.supports("mask-image","linear-gradient(black,transparent)")||CSS.supports("-webkit-mask-image","linear-gradient(black,transparent)"));
  oldImage.style.zIndex="2";stage.append(canvas);stage.classList.add("portrait-revealing");
  const duration=1420;
  const stars=Array.from({length:43},(_,i)=>({
   born:.12+Math.random()*.72,x:(.09+Math.random()*.82)*w,
   drift:(Math.random()-.5)*w*.095,dy:(.025+Math.random()*.075)*h,
   life:.32+Math.random()*.42,size:1.1+Math.random()*3.4,
   cross:i%3===0,seed:Math.random()*Math.PI*2
  }));
  let start=null;
  function tick(now){
   if(!stage.isConnected)return;
   if(start===null)start=now;
   const elapsed=now-start,p=Math.min(1,elapsed/duration),smooth=p*p*(3-2*p);
   // Mask fades from the bottom upward, dissolving through a soft 38% band.
   const edge=119-138*smooth,lo=edge-19,hi=edge+19;
   if(masked){
    const mask="linear-gradient(to bottom, #000 "+lo+"%, transparent "+hi+"%)";
    oldImage.style.maskImage=mask;oldImage.style.webkitMaskImage=mask;
   }else oldImage.style.opacity=String(1-smooth);
   if(p===1)oldImage.style.visibility="hidden";
   ctx.clearRect(0,0,w,h);
   const cy=edge*h/100,light=Math.sin(Math.PI*p);
   if(p<1){
    const gradient=ctx.createRadialGradient(w*.5,cy,0,w*.5,cy,w*.46);
    gradient.addColorStop(0,"rgba(255,229,164,"+(.16*light)+")");
    gradient.addColorStop(.45,"rgba(255,222,148,"+(.065*light)+")");gradient.addColorStop(1,"rgba(255,222,148,0)");
    ctx.save();ctx.translate(0,cy);ctx.scale(1,.36);ctx.translate(0,-cy);
    ctx.fillStyle=gradient;ctx.fillRect(0,cy-w*.5,w,w);ctx.restore();
   }
   for(const s of stars){
    const age=elapsed/1000-s.born*duration/1000;
    if(age<0||age>s.life)continue;
    const q=age/s.life,at=s.born*s.born*(3-2*s.born);
    const x=s.x+s.drift*q,y=(1.19-1.38*at)*h-s.dy*q;
    const fade=Math.sin(Math.PI*q)*(.77+.23*Math.cos(s.seed+q*8));
    const r=s.size*(.5+.8*Math.sin(Math.PI*q));
    ctx.globalAlpha=fade*.65;
    const halo=ctx.createRadialGradient(x,y,0,x,y,r*4.5);halo.addColorStop(0,"#fff2b9");halo.addColorStop(1,"rgba(255,220,140,0)");
    ctx.fillStyle=halo;ctx.fillRect(x-r*4.5,y-r*4.5,r*9,r*9);
    ctx.globalAlpha=fade*.95;ctx.fillStyle="#fffbea";ctx.beginPath();
    if(s.cross){
     ctx.moveTo(x,y-r*2.2);ctx.quadraticCurveTo(x+r*.24,y-r*.24,x+r*1.35,y);
     ctx.quadraticCurveTo(x+r*.24,y+r*.24,x,y+r*2.2);ctx.quadraticCurveTo(x-r*.24,y+r*.24,x-r*1.35,y);ctx.quadraticCurveTo(x-r*.24,y-r*.24,x,y-r*2.2);
    }else ctx.arc(x,y,r*.52,0,Math.PI*2);
    ctx.fill();
   }
   ctx.globalAlpha=1;
   if(elapsed<duration+420)requestAnimationFrame(tick);else finish();
  }
  requestAnimationFrame(tick);
 }catch{
  oldImage.style.zIndex="";oldImage.style.maskImage="";oldImage.style.webkitMaskImage="";oldImage.style.opacity="";oldImage.style.visibility="";
  stage.querySelector(".portrait-burn-canvas")?.remove();stage.classList.remove("portrait-revealing");stage.classList.add("portrait-crossfade");setTimeout(finish,1050);
 }
}

function burnPortrait(stage,oldImage,picture,isFallen){
 const finish=()=>{stage.classList.remove("portrait-revealing","portrait-crossfade");picture.classList.remove("portrait-incoming");oldImage.remove();stage.querySelector(".portrait-burn-canvas")?.remove()};
 const fallback=()=>{stage.querySelector(".portrait-burn-canvas")?.remove();stage.classList.add("portrait-crossfade");setTimeout(finish,1050)};
 try{
  const bounds=stage.getBoundingClientRect();
  if(!bounds.width||!bounds.height){finish();return}
  const canvas=document.createElement("canvas");canvas.className="portrait-burn-canvas";canvas.setAttribute("aria-hidden","true");
  const w=canvas.width=Math.min(540,Math.ceil(bounds.width*1.15)),h=canvas.height=Math.round(w*bounds.height/bounds.width);
  const ctx=canvas.getContext("2d"),source=document.createElement("canvas");source.width=w;source.height=h;
  const sc=source.getContext("2d",{willReadFrequently:true});if(!ctx||!sc){fallback();return}
  const scale=Math.min(w/oldImage.naturalWidth,h/oldImage.naturalHeight);
  const dw=oldImage.naturalWidth*scale,dh=oldImage.naturalHeight*scale;
  sc.drawImage(oldImage,(w-dw)/2+(oldImage.classList.contains("fallen-saint-portrait")?-w*.0035:0),(h-dh)/2,dw,dh);
  const original=sc.getImageData(0,0,w,h),frame=ctx.createImageData(w,h),src=original.data,dst=frame.data;
  const field=new Float32Array(w*h);
  const layers=[{s:44,a:.15},{s:16,a:.065},{s:6,a:.025}].map(({s,a})=>{const cols=Math.ceil(w/s)+2,rows=Math.ceil(h/s)+2;return {s,a,cols,grid:Float32Array.from({length:cols*rows},()=>Math.random())}});
  const smooth=t=>t*t*(3-2*t);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   let n=0;
   for(const L of layers){const gx=x/L.s,gy=y/L.s,ix=Math.floor(gx),iy=Math.floor(gy),u=smooth(gx-ix),v=smooth(gy-iy),i=iy*L.cols+ix;const a=L.grid[i]*(1-u)+L.grid[i+1]*u,b=L.grid[i+L.cols]*(1-u)+L.grid[i+L.cols+1]*u;n+=(a*(1-v)+b*v-.5)*L.a}
   field[y*w+x]=.78*(1-y/h)+.10*x/w+n+.11;
  }
  const particles=[];
  // A continuous temperature ramp: glowing gold/rose at the consuming edge,
  // through crimson and wine into smoky violet. Blend two ramps across the field.
  const warm=[[255,232,181],[255,151,107],[225,53,67],[109,28,64],[42,19,52]];
  const cool=[[255,213,230],[240,120,173],[173,50,116],[87,34,101],[35,21,56]];
  const palette=new Uint8Array(32*128*3);
  for(let u=0;u<32;u++)for(let k=0;k<128;k++){
   const v=k/127*4,i=Math.min(3,Math.floor(v)),t=smooth(v-i),mix=u/31,j=(u*128+k)*3;
   for(let ch=0;ch<3;ch++)palette[j+ch]=Math.round((warm[i][ch]*(1-t)+warm[i+1][ch]*t)*(1-mix)+(cool[i][ch]*(1-t)+cool[i+1][ch]*t)*mix);
  }
  const hue=new Uint8Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=y*w+x,variation=.5+.29*Math.sin(x/w*6.1+y/h*3.2)+.15*Math.sin(x/w*12.4-y/h*4.5);
   hue[i]=Math.max(0,Math.min(31,Math.round(31*variation)));
  }
  const emberColors=[[255,224,173],[255,138,109],[240,87,127],[222,124,203],[174,108,233]];
  const emberGlows=["#d67947","#c33153","#ac295f","#a03f9b","#6e3d9a"];
  stage.append(canvas);ctx.putImageData(original,0,0);stage.classList.add("portrait-revealing");oldImage.style.visibility="hidden";
  let begin=0,last=0;const duration=2300;
  function tick(now){
   if(!stage.isConnected)return;
   if(!begin){begin=now;last=now}
   const elapsed=now-begin,dt=Math.min(40,now-last)/1000;last=now;
   const p=Math.min(1,elapsed/duration),threshold=-.12+1.24*(.60*p+.40*p*p*(3-2*p));
   for(let i=0,j=0;i<field.length;i++,j+=4){
    const d=field[i]-threshold,a=Math.max(0,Math.min(1,d/.035));
    if(d<=0){dst[j+3]=0;continue}
    if(d>=.112){dst[j]=src[j];dst[j+1]=src[j+1];dst[j+2]=src[j+2];dst[j+3]=src[j+3];continue}
    const heat=Math.max(0,Math.min(127,Math.round((d-.008)/.104*127)));
    const index=(hue[i]*128+heat)*3;
    const edge=a*(1-smooth(Math.max(0,Math.min(1,(d-.018)/.094))));
    dst[j]=src[j]*(1-edge)+palette[index]*edge;dst[j+1]=src[j+1]*(1-edge)+palette[index+1]*edge;dst[j+2]=src[j+2]*(1-edge)+palette[index+2]*edge;dst[j+3]=src[j+3]*a;
   }
   ctx.putImageData(frame,0,0);
   if(p>.04&&p<.96)for(let k=0;k<100;k++){const i=Math.floor(Math.random()*field.length);if(src[i*4+3]>160&&Math.abs(field[i]-threshold)<.018&&particles.length<85){particles.push({x:i%w,y:Math.floor(i/w),vx:(Math.random()-.5)*45,vy:-22-Math.random()*65,age:0,life:.38+Math.random()*.65,r:.6+Math.random()*1.6,color:Math.floor(Math.random()*emberColors.length)})}}
   ctx.globalCompositeOperation="lighter";
   for(let i=particles.length-1;i>=0;i--){const s=particles[i];s.age+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.age>=s.life){particles.splice(i,1);continue}const a=Math.sin(Math.PI*s.age/s.life);ctx.globalAlpha=a*.75;ctx.fillStyle="rgb("+emberColors[s.color].join(",")+")";ctx.shadowColor=emberGlows[s.color];ctx.shadowBlur=6;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()}
   ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.globalCompositeOperation="source-over";
   if(elapsed<duration+700)requestAnimationFrame(tick);else finish();
  }
  requestAnimationFrame(tick);
 }catch(e){oldImage.style.visibility="";stage.classList.remove("portrait-revealing");fallback()}
}

function renderPreview(allowTransformation=false){
 // Real artwork for both Saint appearances, with the old concept silhouette
 // as a fallback until the two image files have been uploaded to GitHub.
 stopTransformationAudio();
 const previous=preview.querySelector(".saint-portrait-stage .portrait-incoming")||preview.querySelector(".saint-portrait-stage .saint-portrait");
 const oldImage=previous?.complete&&previous.naturalWidth?previous.cloneNode(false):null;
 preview.replaceChildren();
 preview.classList.remove("has-saint-art");
 preview.style.setProperty("--preview-accent",isUnrevealed()?"#b8bed8":DATA[active].color);
 const specialization=activePath===0?null:SPECIALIZATIONS[active]?.[activePath];
 const artwork=specialization?.artwork?.[gender];
 const artworkName=artwork?specialization.name:cap(active);
 preview.setAttribute("aria-label",gender+" "+artworkName+" class artwork preview");
 const note=document.querySelector(".preview-disclaimer");
 if(note)note.textContent="Concept illustration · final models coming later";
 if(active==="saint"){
  const picture=document.createElement("img");
  const isFallen=activePath===2;
  picture.className="saint-portrait"+(isFallen?" fallen-saint-portrait":"")+(isUnrevealed()?" unrevealed-portrait":"");
  const stage=document.createElement("div");stage.className="saint-portrait-stage";
  picture.alt=cap(gender)+" "+artworkName+" class illustration in an ornate floral frame";
  const source=artwork||(gender==="female"?"../FemaleSaint.png":"../MaleSaint.png");
  // Only a change between the holy and corrupted paths triggers a transformation.
  // Gender changes and ordinary class selection are instantaneous.
  const animate=allowTransformation&&!isUnrevealed()&&oldImage&&!oldImage.classList.contains("unrevealed-portrait")&&oldImage.classList.contains("fallen-saint-portrait")!==isFallen&&oldImage.src!==new URL(source,document.baseURI).href&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(animate){
   prepareTransformationAudio();
   oldImage.setAttribute("aria-hidden","true");oldImage.alt="";
   oldImage.classList.remove("portrait-incoming");oldImage.classList.add("portrait-previous");stage.append(oldImage);
   picture.classList.add("portrait-incoming");
   stage.style.setProperty("--reveal-core",isFallen?"#ffbaa0":"#fff5cf");
   stage.style.setProperty("--reveal-glow",isFallen?"#e74338":"#efc16a");
  }
  picture.loading="eager";
  picture.decoding="async";
  picture.addEventListener("load",()=>{
   if(!picture.isConnected)return;
   preview.classList.add("has-saint-art");
   if(isUnrevealed()&&allowTransformation&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches)picture.classList.add("unrevealed-portrait-reveal");
   if(animate){
    playTransformationAudio(isFallen);
    if(isFallen)burnPortrait(stage,oldImage,picture,true);
    else revealSaint(stage,oldImage,picture);
   }
   if(note)note.textContent=artworkName+" · illustrated class artwork";
  });
  picture.addEventListener("error",()=>{
   if(!picture.isConnected)return;
   preview.classList.remove("has-saint-art");
   if(isUnrevealed()){const missing=document.createElement("p");missing.className="unrevealed-missing";missing.textContent="Preview not yet available";preview.replaceChildren(missing)}else preview.innerHTML=avatarArt();
   if(note)note.textContent="Preview silhouette · artwork pending upload";
  });
  stage.append(picture);preview.append(stage);
  picture.src=source;
 }else{
  preview.innerHTML=avatarArt();
 }
 const caption=$("preview-caption");if(caption)caption.textContent=gender.toUpperCase()+" · DEFAULT FORM";
 document.querySelectorAll(".gender-option").forEach(b=>{
  const on=b.dataset.gender===gender;
  b.classList.toggle("is-active",on);
  b.setAttribute("aria-pressed",String(on));
 });
}
let radarDismiss=null;
document.addEventListener("pointerdown",e=>{if(!e.target.closest(".radar-marker"))radarDismiss?.()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")radarDismiss?.()});
function renderStats(){
 radarDismiss=null;
 const mystery=isUnrevealed();
 const values=mystery?null:DATA[active].stats, ns="http://www.w3.org/2000/svg";
 const colors=["#ee958b","#87b8f3","#9ed9a8","#f1c985","#c3a6f1"];
 const svg=document.createElementNS(ns,"svg");
 svg.setAttribute("viewBox","0 0 480 350");
 svg.setAttribute("class","stat-radar");
 svg.setAttribute("role","group");
 svg.setAttribute("aria-labelledby","stat-radar-title stat-radar-description");
 function node(tag,attrs={},parent=svg,text){
  const el=document.createElementNS(ns,tag);
  Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));
  if(text!==undefined)el.textContent=text;
  parent.append(el);return el;
 }
 node("title",{id:"stat-radar-title"},svg,mystery?"Unrevealed class strengths":cap(active)+" class strengths");
 node("desc",{id:"stat-radar-description"},svg,mystery?"All five strength ratings are undisclosed. No values are displayed.":statLabels.map((s,i)=>s+": "+values[i]+" out of 5").join("; "));
 const cx=240,cy=170,r=105;
 const point=(i,d)=>{const a=-Math.PI/2+i*2*Math.PI/5;return [cx+Math.cos(a)*d,cy+Math.sin(a)*d]};
 const polygon=(distances)=>distances.map((d,i)=>point(i,d).map(n=>n.toFixed(2)).join(",")).join(" ");
 const defs=node("defs");
 const gradient=node("radialGradient",{id:"radar-fill",cx:"50%",cy:"50%",r:"65%"},defs);
 node("stop",{offset:"0%","stop-color":DATA[active].color,"stop-opacity":".10"},gradient);
 node("stop",{offset:"100%","stop-color":DATA[active].color,"stop-opacity":".42"},gradient);
 node("circle",{cx,cy,r:129,class:"radar-orbit"});
 node("circle",{cx,cy,r:122,class:"radar-inner-orbit"});
 for(let level=1;level<=5;level++)node("polygon",{points:polygon(Array(5).fill(r*level/5)),class:level===5?"radar-grid radar-grid-outer":"radar-grid"});
 for(let i=0;i<5;i++){
  const [x,y]=point(i,r);node("line",{x1:cx,y1:cy,x2:x,y2:y,class:"radar-spoke"});
 }
 if(mystery){
  svg.setAttribute("role","img");svg.classList.add("unrevealed-radar");
  const labels=[{x:240,y:16,a:"middle"},{x:390,y:133,a:"start"},{x:336,y:311,a:"start"},{x:144,y:311,a:"end"},{x:90,y:133,a:"end"}];
  for(let i=0;i<5;i++){
   const [x,y]=point(i,129),l=labels[i];
   const group=node("g",{class:"unrevealed-radar-node",transform:"translate("+x+" "+y+")","aria-hidden":"true"});
   node("circle",{r:18,fill:"#252938",stroke:"currentColor","stroke-width":1},group);
   node("text",{x:0,y:1,"text-anchor":"middle","dominant-baseline":"middle",class:"unrevealed-radar-question"},group,"?");
   node("text",{x:l.x,y:l.y,"text-anchor":l.a,fill:"#bdc2d4",class:"radar-label"},svg,statLabels[i]);
  }
  const seal=node("g",{class:"unrevealed-radar-seal","aria-hidden":"true"});
  node("circle",{cx,cy,r:34,fill:"#171c2b",stroke:"#b8bed8","stroke-dasharray":"3 6","stroke-opacity":".6"},seal);
  node("text",{x:cx,y:cy+2,"text-anchor":"middle","dominant-baseline":"middle",class:"unrevealed-radar-center"},seal,"?");
  node("text",{x:cx,y:cy+54,"text-anchor":"middle",class:"unrevealed-radar-caption"},svg,"RATINGS UNDISCLOSED");
  stats.replaceChildren(svg);return;
 }
 node("polygon",{points:polygon(values.map(v=>r*v/5)),fill:"url(#radar-fill)",stroke:DATA[active].color,"stroke-width":2.1,"stroke-linejoin":"round",class:"radar-shape"});
 const glyphs=["M7 17L17 7M12 6l6 0 0 6M6 13l5 5M5 19l-2 2","M12 3l7 3v6c0 5-7 9-7 9s-7-4-7-9V6z","M12 5v14M5 12h14","M4 18c4-8 10-12 17-13-1 8-5 14-14 15M4 20l11-10","M20 12a8 8 0 1 1-6-8 5 5 0 1 1-7 7 2 2 0 1 0 3 2"];
 const labelPositions=[{x:240,y:16,a:"middle"},{x:390,y:133,a:"start"},{x:336,y:311,a:"start"},{x:144,y:311,a:"end"},{x:90,y:133,a:"end"}];
 for(let i=0;i<5;i++){
  const [ix,iy]=point(i,129),color=colors[i];
  const group=node("g",{transform:"translate("+ix.toFixed(2)+" "+iy.toFixed(2)+")","aria-hidden":"true"});
  node("circle",{r:17,fill:"#172238","fill-opacity":".48",stroke:color,"stroke-width":1.5},group);
  node("path",{d:glyphs[i],transform:"translate(-10 -10) scale(.83)",stroke:color,fill:"none","stroke-width":2.1,"stroke-linecap":"round","stroke-linejoin":"round"},group);
  const icon=node("image",{href:"../Icon"+statLabels[i]+".png",x:-21,y:-21,width:42,height:42,preserveAspectRatio:"xMidYMid meet"},group);
  // Strength is reflected in the emblem's luminosity without changing the stat palette.
  const rating=Math.max(1,Math.min(5,Number(values[i])||1));
  const intensity=(rating-1)/4;
  const brightness=(0.78+intensity*0.48).toFixed(2);
  const saturation=(0.65+intensity*0.65).toFixed(2);
  const glowRadius=(0.6+intensity*4).toFixed(2);
  const glowColor=color+Math.round(35+intensity*145).toString(16).padStart(2,"0");
  icon.style.filter="brightness("+brightness+") saturate("+saturation+") drop-shadow(0 0 "+glowRadius+"px "+glowColor+")";
  icon.style.transition="filter .25s ease";
  icon.addEventListener("load",()=>{for(const child of group.children)if(child!==icon)child.setAttribute("visibility","hidden")});
  icon.addEventListener("error",()=>icon.remove());
  const l=labelPositions[i];
  node("text",{x:l.x,y:l.y,"text-anchor":l.a,fill:color,class:"radar-label"},svg,statLabels[i]);
 }
 const markers=[];
 for(let i=0;i<5;i++){
  const [x,y]=point(i,r*values[i]/5);
  const marker=node("g",{class:"radar-marker",tabindex:"0",role:"button","aria-label":statLabels[i]+": "+values[i]+" out of 5","aria-pressed":"false"});
  node("circle",{cx:x,cy:y,r:7,fill:colors[i],opacity:".20"},marker);
  node("circle",{cx:x,cy:y,r:4.1,fill:colors[i],stroke:"#fff6df","stroke-width":1.2,class:"radar-marker-dot"},marker);
  node("circle",{cx:x,cy:y,r:15,fill:"transparent",class:"radar-hit"},marker);
  markers.push({marker,x,y,i});
 }
 // One tooltip, painted above every chart element; the rating is otherwise invisible.
 const tooltip=node("g",{class:"radar-tooltip","aria-hidden":"true"});
 const tipRect=node("rect",{width:136,height:31,rx:6,fill:"#121c30",stroke:DATA[active].color,"stroke-width":1},tooltip);
 const tipText=node("text",{x:68,y:16,"text-anchor":"middle","dominant-baseline":"middle",class:"radar-tooltip-text"},tooltip);
 let pinned=null,hovered=null,focused=null;
 function showTip(){
  const current=pinned||hovered||focused;
  markers.forEach(m=>{m.marker.classList.toggle("is-revealed",m===current);m.marker.setAttribute("aria-pressed",String(m===pinned))});
  tooltip.classList.toggle("is-visible",!!current);
  if(!current)return;
  tooltip.setAttribute("transform","translate("+Math.max(4,Math.min(340,current.x-68))+" "+Math.max(4,current.y-48)+")");
  tipRect.setAttribute("stroke",colors[current.i]);
  tipText.setAttribute("fill",colors[current.i]);
  tipText.textContent=statLabels[current.i]+" · "+values[current.i]+" / 5";
 }
 for(const m of markers){
  m.marker.addEventListener("pointerenter",e=>{if(e.pointerType==="mouse"||e.pointerType==="pen"){hovered=m;showTip()}});
  m.marker.addEventListener("pointerleave",()=>{if(hovered===m)hovered=null;showTip()});
  m.marker.addEventListener("focus",()=>{if(m.marker.matches(":focus-visible")){focused=m;showTip()}});
  m.marker.addEventListener("blur",()=>{if(focused===m)focused=null;showTip()});
  const toggle=()=>{pinned=pinned===m?null:m;hovered=null;focused=null;showTip()};
  m.marker.addEventListener("click",e=>{e.stopPropagation();toggle()});
  m.marker.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle()}else if(e.key==="Escape"){pinned=hovered=focused=null;showTip()}});
 }
 svg.addEventListener("click",()=>{pinned=hovered=focused=null;showTip()});
 radarDismiss=()=>{pinned=hovered=focused=null;showTip()};
 stats.replaceChildren(svg);
}
function skillDetail(){
 const s=pathData().skills[chosen];
 detail.replaceChildren();
 if(!s){const p=document.createElement("p");p.className="path-pending";p.textContent="✧  Advanced abilities have yet to be revealed.";detail.append(p);return;}
 const head=document.createElement("div");head.className="skill-detail-head";
 const title=document.createElement("strong");title.textContent=s[1];
 const tag=document.createElement("span");tag.textContent=s[2];head.append(title,tag);
 const desc=document.createElement("p");desc.textContent=s[6];
 const grid=document.createElement("div");grid.className="skill-data";
 [["Range",s[3]],["Effect",s[4]],["Cooldown",s[5]]].forEach(([k,v])=>{
  const cell=document.createElement("div"),small=document.createElement("span"),strong=document.createElement("strong");
  small.textContent=k;strong.textContent=v;cell.append(small,strong);grid.append(cell);
 });
 detail.append(head,desc,grid);
}
function renderSkills(){
 skills.replaceChildren();
 if(isUnrevealed()){
  skills.hidden=true;detail.replaceChildren();
  const sealed=document.createElement("div");sealed.className="unrevealed-sealed-panel";
  const lock=document.createElement("span");lock.className="unrevealed-lock";lock.setAttribute("aria-hidden","true");lock.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></svg>';
  const heading=document.createElement("strong");heading.textContent="ABILITIES SEALED";
  const copy=document.createElement("p");copy.textContent="No abilities have been revealed for this path.";
  sealed.append(lock,heading,copy);detail.append(sealed);return;
 }
 pathData().skills.forEach((s,i)=>{
  const btn=document.createElement("button");btn.type="button";btn.className="skill-icon"+(i===chosen?" is-current":"");
  btn.setAttribute("aria-label","Inspect "+s[1]);btn.setAttribute("aria-pressed",String(i===chosen));btn.title=s[1];
  const glyph=document.createElement("span");glyph.className="skill-symbol";glyph.textContent=s[0];
  const n=document.createElement("span");n.className="skill-name";n.textContent=s[1];
  btn.append(glyph,n);btn.addEventListener("click",()=>{chosen=i;renderSkills()});skills.append(btn);
 });
 skillDetail();
}
function renderPathPresentation(){
 const host=$("class-details"),mystery=isUnrevealed(),wasMystery=host.dataset.unrevealed==="true";
 if(mystery)host.dataset.unrevealed="true";else delete host.dataset.unrevealed;
 host.style.setProperty("--class-highlight",mystery?"#b8bed8":DATA[active].color);
 $("class-codex-path-label").textContent=mystery?"UNREVEALED PATH":"BASIC PATH";
 $("path-inspect-label").textContent=mystery?"UNDISCLOSED":"SELECT TO INSPECT";
 if(mystery){
  const emblem=$("class-emblem");emblem.classList.remove("class-art-host","has-class-art");emblem.textContent="?";
  $("class-name").textContent="Coming soon";
  $("class-type").textContent="UNREVEALED SPECIALIZATION";
  $("class-description").textContent="Not every path has been written in the chronicles. What lies beyond this one remains a mystery.";
 }else if(wasMystery&&typeof selectClass==="function")selectClass(active);
 renderClassMeta(DATA[active]);renderStats();
}
function renderPath(){
 renderPathPresentation();
 const path=pathData(),buttons=$("class-paths");
 if(buttons){
  buttons.querySelectorAll("[data-path]").forEach(b=>{
   const i=Number(b.dataset.path),selected=i===activePath;
   b.classList.toggle("is-current",selected);b.setAttribute("aria-pressed",String(selected));
   const info=i===0?{name:cap(active)}:SPECIALIZATIONS[active]?.[i];
   b.querySelector(".path-name").textContent=i===0?"Base class":info?.name||"???";
   b.title=i===0?cap(active)+" · Base class":info?.name||"Specialization "+i+" — unrevealed";
   b.setAttribute("aria-label",b.title);
   const unknown=active==="saint"&&i===3;
   b.classList.toggle("is-unrevealed-path",unknown);
   if(i===3)b.querySelector(".path-symbol").textContent=unknown?"?":"◈";
   if(i===0&&typeof setClassArtwork==="function")setClassArtwork(b.querySelector(".path-symbol"),active);
  });
 }
 const title=$("path-detail-title"),desc=$("path-description"),label=$("path-type"),core=$("path-core-title"),sig=$("path-signatures");
 if(title)title.textContent=path.name+(activePath===0?" · Base class":"");
 if(desc)desc.textContent=path.description;
 if(label)label.textContent=activePath===0?"BASE PATH":path.type||"ADVANCED PATH";
 if(core)core.textContent=isUnrevealed()?"Unrevealed abilities":activePath===0?"Core abilities":"Specialization abilities";
 if(sig){
  sig.replaceChildren();
  if(isUnrevealed()){
   const panel=document.createElement("div");panel.className="unrevealed-signature";
   const mark=document.createElement("span");mark.className="unrevealed-signature-mark";mark.setAttribute("aria-hidden","true");mark.textContent="?";
   const title=document.createElement("strong");title.textContent="FOOTAGE UNAVAILABLE";
   const copy=document.createElement("p");copy.textContent="This path has yet to make its debut.";
   panel.append(mark,title,copy);sig.append(panel);
  }else if(path.signatureMoves?.length){path.signatureMoves.forEach(move=>{const p=document.createElement("p");p.textContent=move;sig.append(p)})}
  else{const p=document.createElement("p");p.className="signature-pending";p.textContent="To be revealed";sig.append(p)}
 }
 skills.hidden=!path.skills.length;
 renderSkills();
}
$("class-paths")?.querySelectorAll("[data-path]").forEach(b=>b.addEventListener("click",()=>{
 const next=Number(b.dataset.path);
 const previousPath=activePath;
 const changed=next!==previousPath;
 if(changed)stopVoice();
 activePath=next;chosen=0;renderPath();
 if(changed){
  renderPreview(true);updateVoiceButton();
  // Greet on entry to either voiced specialization, or on return to base Saint.
  if(active==="saint"&&(activePath===1||activePath===2||((previousPath===1||previousPath===2)&&activePath===0)))playVoice("Switch");
 }
}));
const atmosphere=document.querySelector(".class-atmosphere");
let environmentRequest=0;
function drawEnvironment(){
 if(!atmosphere)return;
 const host=$("class-details"),landscape=atmosphere.querySelector(".class-landscape"),embers=atmosphere.querySelector(".class-embers");
 host.dataset.environment=active;
 const foreground=host.querySelector(".class-foreground-motes");
 if(foreground&&!foreground.children.length){
  for(let i=0;i<12;i++){
   const p=document.createElement("span");p.className="class-foreground-mote";
   p.style.setProperty("--x",(5+(i*37.13)%90)+"%");
   p.style.setProperty("--y",(9+(i*23.71)%86)+"%");
   p.style.setProperty("--size",(1.5+(i%3)*.65)+"px");
   p.style.setProperty("--duration",(8+i%5*1.3)+"s");
   p.style.setProperty("--delay",(-i*1.83)+"s");
   p.style.setProperty("--drift",((i%5-2)*9)+"px");
   foreground.append(p);
  }
 }
 const request=++environmentRequest;
 atmosphere.classList.remove("has-landscape");
 landscape.style.backgroundImage="";
 const candidates=["../Environment"+cap(active)+".jpg","../Environment"+cap(active)+".png"];
 if(active==="saint")candidates.push("../mythbound-home-watercolor.jpg");
 function tryImage(i){
  if(i>=candidates.length||request!==environmentRequest)return;
  const image=new Image();
  image.onload=()=>{if(request!==environmentRequest)return;landscape.style.backgroundImage='url("'+candidates[i]+'")';atmosphere.classList.add("has-landscape")};
  image.onerror=()=>tryImage(i+1);
  image.src=candidates[i];
 }
 tryImage(0);
 if(!embers.children.length){
  for(let i=0;i<36;i++){
   const p=document.createElement("span");p.className="class-ember"+(i%5===0?" is-star":"");
   p.style.setProperty("--x",((i*37.17+9)%98+1)+"%");
   p.style.setProperty("--y",(13+(i*19.73)%81)+"%");
   p.style.setProperty("--size",(i%5===0?4.5:1.5+i%3)+"px");
   p.style.setProperty("--duration",(5+i%7*.7)+"s");
   p.style.setProperty("--delay",(-i*.71)+"s");
   p.style.setProperty("--drift",((i%7-3)*5)+"px");
   embers.append(p);
  }
 }
}
const ROLE_ICONS={
 melee:'<path d="m5 19 3-3m-4-2 6 6M8 16 20 4l-2 7L10 19M4 4l5 1 4 4"/>',
 ranged:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>',
 tank:'<path d="M12 3 20 6v6c0 5-8 9-8 9s-8-4-8-9V6z"/>',
 healer:'<path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5z"/>',
 hybrid:'<path d="M3 7h17l-4-4m4 14H3l4 4M20 7l-4 4M3 17l4-4"/>',
 beast:'<path d="M5 4 8 9l4-2 4 2 3-5 1 10-8 7-8-7zM8 13h1m6 0h1m-6 4h4"/>',
 mounted:'<path d="M5 20v-6l4-5 1-6 4 3 4 1 3 6-4 3-4-3-3 7zM15 10h1"/>',
 companion:'<path d="M7 15c1-3 3-5 5-5s4 2 5 5c2 4-2 6-5 4-3 2-7 0-5-4z"/><circle cx="5" cy="9" r="2"/><circle cx="10" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="19" cy="9" r="2"/>',
 magic:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>',
 duelist:'<path d="m4 20 4-4m-4-3 7 7m-3-4L20 3l-2 8-8 7"/>'
};
const CLASS_ROLES={breaker:[["melee","Melee"],["tank","Tank / brawler"]],animar:[["hybrid","Hybrid"],["beast","Shapeshifter / expert"]],herder:[["mounted","Mounted"],["companion","Companion support"]],elemis:[["ranged","Range"],["magic","Elemental magic"]],strider:[["melee","Melee"],["duelist","Precision duelist"]],saint:[["ranged","Range"],["healer","Healer"]]};
function closeRoleTooltips(){
 document.querySelectorAll(".class-role-icon.is-tooltip-open").forEach(icon=>{icon.classList.remove("is-tooltip-open");icon.setAttribute("aria-expanded","false")});
}
document.addEventListener("pointerdown",e=>{if(!e.target.closest(".class-role-icon"))closeRoleTooltips()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeRoleTooltips()});
function renderClassMeta(d){
 const combat=$("class-combat"),difficulty=$("class-difficulty");
 combat.replaceChildren();difficulty.replaceChildren();
 if(isUnrevealed()){
  const role=document.createElement("span");role.className="unrevealed-meta-label";role.textContent="ROLE · UNKNOWN";combat.append(role);
  combat.setAttribute("aria-label","Combat role undisclosed");
  difficulty.setAttribute("aria-label","Difficulty undisclosed");difficulty.title="Not yet revealed";
  const label=document.createElement("span");label.className="difficulty-label";label.textContent="DIFFICULTY";
  const unknown=document.createElement("span");unknown.className="unrevealed-difficulty";unknown.textContent="???";difficulty.append(label,unknown);return;
 }
 combat.setAttribute("aria-label","Combat roles");
 for(const [key,label] of CLASS_ROLES[active]){
  const icon=document.createElement("button");icon.type="button";icon.className="class-role-icon";icon.dataset.tooltip=label;icon.setAttribute("aria-label",label);icon.setAttribute("aria-expanded","false");icon.style.padding="0";icon.addEventListener("click",()=>{const open=!icon.classList.contains("is-tooltip-open");closeRoleTooltips();if(open){icon.classList.add("is-tooltip-open");icon.setAttribute("aria-expanded","true")}});
  icon.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+ROLE_ICONS[key]+'</svg>';combat.append(icon);
 }
 difficulty.setAttribute("aria-label","Difficulty: "+d.difficulty+" out of 5");difficulty.title=d.difficulty+" / 5";
 const label=document.createElement("span");label.className="difficulty-label";label.textContent="DIFFICULTY";label.setAttribute("aria-hidden","true");difficulty.append(label);
 for(let i=1;i<=5;i++){const dot=document.createElement("span");dot.className="difficulty-dot"+(i<=d.difficulty?" is-filled":"");dot.setAttribute("aria-hidden","true");difficulty.append(dot)}
}

function draw(){
 $("class-index").textContent=String(Array.from(document.querySelectorAll(".class-grid .class-tile"),b=>b.dataset.class).indexOf(active)+1).padStart(2,"0")+" / 06";
 drawEnvironment();renderPath();renderPreview();
}
document.querySelectorAll("[data-class]").forEach(button=>{
 button.addEventListener("click",()=>{
  if(!DATA[button.dataset.class])return;
  stopVoice();active=button.dataset.class;activePath=0;chosen=0;gender="male";draw();updateVoiceButton();
 });
});
document.querySelectorAll(".gender-option").forEach(button=>button.addEventListener("click",()=>{
 const next=button.dataset.gender;if(next===gender||!["male","female"].includes(next))return;
 gender=next;renderPreview(false);playVoice("Switch");
}));
draw();updateVoiceButton();
})();
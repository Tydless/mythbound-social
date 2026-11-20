/* Independent audio preferences, popovers and soundtrack ducking. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
function read(key,fallback){try{const v=localStorage.getItem(key);return v===null?fallback:v}catch{return fallback}}
function save(key,v){try{localStorage.setItem(key,String(v))}catch{}}
function readLevel(kind,fallback){const v=Number(read("mythbound-"+kind+"-volume",fallback));return Number.isFinite(v)?clamp(v):fallback}
const levels={music:readLevel("music",.3),sfx:readLevel("sfx",1)};
const defaults={music:.3,sfx:1};
const active={music:read("mythbound-music-enabled","true")!=="false"&&levels.music>0,sfx:read("mythbound-sfx-enabled","true")!=="false"&&levels.sfx>0};
const mobile=matchMedia("(max-width: 760px)");
const systemMotion=matchMedia("(prefers-reduced-motion: reduce)");
const keys={autoplay:"mythbound-autoplay",motion:"mythbound-reduce-motion",effects:"mythbound-visual-effects",helper:"mythbound-helper-enabled"};
const prefs={autoplay:read(keys.autoplay,"true")!=="false",motion:read(keys.motion,"false")==="true",effects:read(keys.effects,"true")!=="false",helper:read(keys.helper,"true")!=="false"};
function prefSync(){
 const root=document.documentElement;
 root.classList.toggle("mb-reduce-motion",prefs.motion||systemMotion.matches);
 root.classList.toggle("mb-no-visual-effects",!prefs.effects);
 root.classList.toggle("mb-no-helper",!prefs.helper);
 for(const key of Object.keys(prefs)){const input=$("mb-pref-"+key);if(input)input.checked=prefs[key]}
}
function prefChange(key,value){prefs[key]=Boolean(value);save(keys[key],prefs[key]);prefSync();document.dispatchEvent(new CustomEvent("mythbound:preferences-change",{detail:{key,value:prefs[key]}}))}
window.MythboundPreferences={get:key=>prefs[key],reduced:()=>prefs.motion||systemMotion.matches,visualEffects:()=>prefs.effects,helperEnabled:()=>prefs.helper};
systemMotion.addEventListener("change",()=>{prefSync();document.dispatchEvent(new CustomEvent("mythbound:preferences-change",{detail:{key:"motion",value:prefs.motion||systemMotion.matches}}))});
const effective=kind=>active[kind]?levels[kind]:0;
const ducks=new Map();
const audio=$("mythbound-theme");
let musicContext=null,musicGain=null,fadeFrame=0;
let musicTarget=null;

function sfxVolume(){return effective("sfx")}
// Foreground sounds have priority. Caps follow their actual mixer level, and
// overlapping cues take the quietest target rather than stacking attenuation.
function effectiveMusic(){
 const base=effective("music");let target=base;
 for(const {ratio,cap,reference} of ducks.values()){
  const foreground=reference==="sfx"?sfxVolume():1;
  if(foreground>0)target=Math.min(target,base*ratio,cap*foreground);
 }
 return target;
}
function applyMusic(){
 if(!audio)return;
 const v=effectiveMusic(),previous=musicTarget;musicTarget=v;
 if(fadeFrame){cancelAnimationFrame(fadeFrame);fadeFrame=0}
 try{
  if(musicGain){
   const now=musicContext.currentTime,param=musicGain.gain;
   const current=param.value;
   param.cancelScheduledValues(now);param.setValueAtTime(current,now);
   if(v===0||previous===null||v<current)param.setValueAtTime(v,now);
   else if(v>current)param.linearRampToValueAtTime(v,now+.32);
   audio.volume=1;
  }else{
   const from=audio.volume;
   if(v<=from||previous===null){audio.volume=v;return}
   const start=performance.now();
   const step=now=>{const q=Math.min(1,(now-start)/320);audio.volume=from+(v-from)*q;if(q<1)fadeFrame=requestAnimationFrame(step);else fadeFrame=0};
   fadeFrame=requestAnimationFrame(step);
  }
 }catch{}
}
 // iOS may ignore HTMLMediaElement.volume. Route the local soundtrack through
 // Web Audio after a real gesture on those devices, preserving native autoplay elsewhere.
function unlockMusic(){
 if(!audio||!(/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1)))return;
 try{
  if(!musicContext){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
   musicContext=new C();const gain=musicContext.createGain();
   gain.gain.value=effectiveMusic();
   const source=musicContext.createMediaElementSource(audio);source.connect(gain);gain.connect(musicContext.destination);musicGain=gain;
  }
  if(musicContext.state==="suspended"||musicContext.state==="interrupted")musicContext.resume().catch(()=>{});
  applyMusic();
 }catch{}
}
document.addEventListener("pointerdown",unlockMusic,true);
document.addEventListener("pointerup",unlockMusic,true);
document.addEventListener("touchend",unlockMusic,true);
document.addEventListener("keydown",unlockMusic,true);
document.addEventListener("click",unlockMusic,true);
function sync(){
 for(const kind of ["music","sfx"]){
  const input=$(kind+"-volume"),toggle=$(kind+"-toggle"),out=$(kind+"-volume-value"),mute=$(kind+"-volume-mute");
  const percent=Math.round((mobile.matches?effective(kind):levels[kind])*100);
  const on=effective(kind)>0;
  if(input){input.value=String(percent);input.style.setProperty("--audio-percent",percent+"%")}
  if(out)out.value=percent+"%";
  const av=$("mb-pref-"+kind+"-volume"),ao=$("mb-pref-"+kind+"-value"),ae=$("mb-pref-"+kind+"-enabled");
  if(av)av.value=String(Math.round(levels[kind]*100));if(ao)ao.value=Math.round(levels[kind]*100)+"%";if(ae)ae.checked=on;
  if(mute)mute.textContent=on?"Mute":"Unmute";
  if(toggle){toggle.setAttribute("aria-pressed",String(on));const name=kind==="music"?"Soundtrack":"Sound effects";toggle.setAttribute("aria-label",mobile.matches?name+" volume: "+percent+"%":(on?"Mute ":"Enable ")+name);toggle.title=mobile.matches?name+" volume: "+percent+"%":(on?"Mute ":"Enable ")+name}
 }
}
function changed(kind){
 save("mythbound-"+kind+"-volume",levels[kind]);save("mythbound-"+kind+"-enabled",active[kind]);sync();
 applyMusic();
 if(kind==="music")document.dispatchEvent(new Event("mythbound:music-change"));else document.dispatchEvent(new Event("mythbound:sfx-change"));
}
function setEnabled(kind,next){
 active[kind]=Boolean(next);
 if(active[kind]&&levels[kind]===0)levels[kind]=defaults[kind];
 changed(kind);
}
function setLevel(kind,value){
 if(!(kind in levels))return;
 levels[kind]=clamp(value);
 if(mobile.matches)active[kind]=levels[kind]>0;
 changed(kind);
}
window.MythboundSFX={enabled:()=>effective("sfx")>0,volume:sfxVolume,setEnabled:next=>setEnabled("sfx",next)};
window.MythboundAudio={level:effective,setLevel,applyMusic,duck(owner,ratio,cap=ratio,reference="sfx"){ducks.set(owner,{ratio:clamp(ratio),cap:clamp(cap),reference});applyMusic()},release(owner){if(ducks.delete(owner))applyMusic()}};
mobile.addEventListener("change",()=>{hide();sync()});

let open=null,closeTimer=0,mobileMusicArmed=false;
function hide(){clearTimeout(closeTimer);mobileMusicArmed=false;for(const k of ["music","sfx"]){const p=$(k+"-volume-panel"),b=$(k+"-toggle");if(p)p.hidden=true;b?.setAttribute("aria-expanded","false")}open=null}
function show(kind){clearTimeout(closeTimer);if(open!==kind)hide();open=kind;const p=$(kind+"-volume-panel"),b=$(kind+"-toggle");if(p)p.hidden=false;b?.setAttribute("aria-expanded","true");sync()}
function later(){clearTimeout(closeTimer);closeTimer=setTimeout(()=>{if(open&&!$(open+"-volume-panel")?.contains(document.activeElement)&&document.activeElement!==$(open+"-toggle"))hide()},230)}
for(const kind of ["music","sfx"]){
 const toggle=$(kind+"-toggle"),panel=$(kind+"-volume-panel"),input=$(kind+"-volume");
 if(!toggle||!panel||!input)continue;
 toggle.setAttribute("aria-controls",panel.id);toggle.setAttribute("aria-expanded","false");
 toggle.addEventListener("pointerenter",e=>{if(e.pointerType!=="touch"&&e.pointerType!=="pen")show(kind)});
 toggle.addEventListener("pointerleave",later);
 toggle.addEventListener("focus",()=>show(kind));toggle.addEventListener("blur",later);
 toggle.addEventListener("click",e=>{
  show(kind);
  if(mobile.matches){
   // Focus/hover can reveal the panel before a tap, so arm only on a real activation.
   if(kind==="music"){
    if(mobileMusicArmed){setEnabled("music",effective("music")===0)}
    else{mobileMusicArmed=true;if(e.detail===0)input.focus()}
   }else if(e.detail===0)input.focus();
   return;
  }
  // A blocked soundtrack receives a playback attempt from app.js, not a mute.
  if(kind==="music"&&effective(kind)>0&&audio?.paused)return;
  setEnabled(kind,effective(kind)===0);
 });
 $(kind+"-volume-mute")?.addEventListener("click",()=>setEnabled(kind,effective(kind)===0));
 toggle.addEventListener("keydown",e=>{if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();show(kind);input.focus()}});
 panel.addEventListener("pointerenter",()=>clearTimeout(closeTimer));panel.addEventListener("pointerleave",later);
 panel.addEventListener("focusin",()=>clearTimeout(closeTimer));panel.addEventListener("focusout",later);
 input.addEventListener("input",()=>setLevel(kind,Number(input.value)/100));
}
document.addEventListener("pointerdown",e=>{if(open&&!$(open+"-volume-panel")?.contains(e.target)&&!e.target.closest("#music-toggle,#sfx-toggle"))hide()},true);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&open){const kind=open;const hadFocus=$(kind+"-volume-panel")?.contains(document.activeElement);if(hadFocus)$(kind+"-toggle")?.focus();hide()}});
const expand=$("mb-settings-expand"),advanced=$("mb-settings-advanced"),dialog=$("mb-advanced-settings");
let expanded=false;
function expandSettings(next){expanded=!!next;hide();expand.setAttribute("aria-expanded",String(expanded));expand.setAttribute("aria-label",expanded?"Hide extra settings":"Show extra settings");$("sfx-toggle").hidden=!expanded;advanced.hidden=!expanded}
expand.addEventListener("click",()=>expandSettings(!expanded));
advanced.addEventListener("click",()=>{hide();prefSync();sync();if(!dialog.open){dialog.showModal();$("mb-settings-close").focus({preventScroll:true})}});
$("mb-settings-close").addEventListener("click",()=>dialog.close());
dialog.addEventListener("cancel",e=>e.preventDefault());
dialog.addEventListener("close",()=>advanced.focus({preventScroll:true}));
for(const key of Object.keys(prefs))$("mb-pref-"+key).addEventListener("change",e=>prefChange(key,e.target.checked));
for(const kind of ["music","sfx"]){
 $("mb-pref-"+kind+"-enabled").addEventListener("change",e=>setEnabled(kind,e.target.checked));
 $("mb-pref-"+kind+"-volume").addEventListener("input",e=>{levels[kind]=clamp(Number(e.target.value)/100);active[kind]=levels[kind]>0;changed(kind)});
}
document.addEventListener("pointerdown",e=>{if(expanded&&!dialog.open&&!e.target.closest("#music-toggle,#sfx-toggle,#mb-settings-expand,#mb-settings-advanced,.audio-volume-panel"))expandSettings(false)},true);
prefSync();expandSettings(false);sync();applyMusic();
})();

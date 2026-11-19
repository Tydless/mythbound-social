/* Independent audio preferences, popovers and soundtrack ducking. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
function read(key,fallback){try{const v=localStorage.getItem(key);return v===null?fallback:v}catch{return fallback}}
function save(key,v){try{localStorage.setItem(key,String(v))}catch{}}
function readLevel(kind,fallback){const v=Number(read("mythbound-"+kind+"-volume",fallback));return Number.isFinite(v)?clamp(v):fallback}
let enabled=read("mythbound-sfx-enabled",read("mythbound-music-enabled","true"))!=="false";
const levels={music:readLevel("music",.3),sfx:readLevel("sfx",1)};
const ducks=new Map();
const audio=$("mythbound-theme");
let musicContext=null,musicGain=null;
const button=$("sfx-toggle");
function sfxVolume(){return enabled?levels.sfx:0}
function effectiveMusic(){return levels.music*Math.min(1,...ducks.values())}
function applyMusic(){
 if(!audio)return;
 const v=effectiveMusic();
 try{if(musicGain){musicGain.gain.value=v;audio.volume=1}else audio.volume=v}catch{}
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
document.addEventListener("keydown",unlockMusic,true);
document.addEventListener("click",unlockMusic,true);
function sync(){
 if(button){button.setAttribute("aria-pressed",String(enabled));button.setAttribute("aria-label",enabled?"Mute sound effects":"Enable sound effects");button.title=enabled?"Mute sound effects":"Enable sound effects"}
 for(const kind of ["music","sfx"]){
  const input=$(kind+"-volume"),out=$(kind+"-volume-value"),toggle=$(kind+"-toggle"),mute=document.querySelector('[data-audio-toggle="'+kind+'"]');
  const percent=Math.round(levels[kind]*100);
  if(input){input.value=String(percent);input.style.setProperty("--audio-percent",percent+"%")}
  if(out)out.value=percent+"%";
  if(mute)mute.textContent=toggle?.getAttribute("aria-pressed")==="false"?"Unmute":"Mute";
 }
}
function setEnabled(next){enabled=Boolean(next);save("mythbound-sfx-enabled",enabled);sync();document.dispatchEvent(new Event("mythbound:sfx-change"))}
function setLevel(kind,value){
 if(!(kind in levels))return;
 levels[kind]=clamp(value);save("mythbound-"+kind+"-volume",levels[kind]);sync();
 if(kind==="music")applyMusic();else document.dispatchEvent(new Event("mythbound:sfx-change"));
}
window.MythboundSFX={enabled:()=>enabled,volume:sfxVolume,setEnabled};
window.MythboundAudio={level:kind=>levels[kind],setLevel,applyMusic,duck(owner,ratio){ducks.set(owner,clamp(ratio));applyMusic()},release(owner){ducks.delete(owner);applyMusic()}};
button?.addEventListener("click",()=>setEnabled(!enabled));
let open=null,closeTimer=0;
function hide(){clearTimeout(closeTimer);for(const k of ["music","sfx"]){const p=$(k+"-volume-panel"),b=$(k+"-toggle");if(p)p.hidden=true;b?.setAttribute("aria-expanded","false")}open=null}
function show(kind){clearTimeout(closeTimer);if(open!==kind)hide();open=kind;const p=$(kind+"-volume-panel"),b=$(kind+"-toggle");if(p)p.hidden=false;b?.setAttribute("aria-expanded","true");sync()}
function later(){clearTimeout(closeTimer);closeTimer=setTimeout(()=>{if(open&&!$(open+"-volume-panel")?.contains(document.activeElement)&&document.activeElement!==$(open+"-toggle"))hide()},230)}
for(const kind of ["music","sfx"]){
 const toggle=$(kind+"-toggle"),panel=$(kind+"-volume-panel"),input=$(kind+"-volume"),mute=panel?.querySelector("[data-audio-toggle]");
 if(!toggle||!panel||!input)continue;
 toggle.setAttribute("aria-controls",panel.id);toggle.setAttribute("aria-expanded","false");
 let touch=false;
 toggle.addEventListener("pointerdown",e=>{touch=e.pointerType==="touch"||e.pointerType==="pen"});
 toggle.addEventListener("pointerenter",e=>{if(e.pointerType!=="touch"&&e.pointerType!=="pen")show(kind)});
 toggle.addEventListener("pointerleave",later);
 toggle.addEventListener("focus",()=>show(kind));toggle.addEventListener("blur",later);
 // Mouse clicks retain the existing one-click mute. Touch taps open the mixer;
 // its explicit Mute button forwards a synthetic click to the original handler.
 toggle.addEventListener("click",e=>{
  if(e.isTrusted&&(touch||matchMedia("(hover: none) and (pointer: coarse)").matches)&&e.detail!==0){e.preventDefault();e.stopImmediatePropagation();show(kind)}
  touch=false;
 },true);
 toggle.addEventListener("click",()=>queueMicrotask(sync));
 panel.addEventListener("pointerenter",()=>clearTimeout(closeTimer));panel.addEventListener("pointerleave",later);
 panel.addEventListener("focusin",()=>clearTimeout(closeTimer));panel.addEventListener("focusout",later);
 input.addEventListener("input",()=>setLevel(kind,Number(input.value)/100));
 mute?.addEventListener("click",()=>{toggle.click();sync()});
 if(kind==="music")new MutationObserver(sync).observe(toggle,{attributes:true,attributeFilter:["aria-pressed"]});
}
document.addEventListener("pointerdown",e=>{if(open&&!$(open+"-volume-panel")?.contains(e.target)&&!e.target.closest("#music-toggle,#sfx-toggle"))hide()},true);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&open){const kind=open;hide();if($(kind+"-volume-panel")?.contains(document.activeElement))$(kind+"-toggle")?.focus();hide()}});
sync();applyMusic();
})();

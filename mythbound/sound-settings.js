/* Independent audio preferences, popovers and soundtrack ducking. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
function read(key,fallback){try{const v=localStorage.getItem(key);return v===null?fallback:v}catch{return fallback}}
function save(key,v){try{localStorage.setItem(key,String(v))}catch{}}
function readLevel(kind,fallback){const v=Number(read("mythbound-"+kind+"-volume",fallback));return Number.isFinite(v)?clamp(v):fallback}
const levels={music:readLevel("music",.3),sfx:readLevel("sfx",1)};
for(const kind of ["music","sfx"]){if(read("mythbound-"+kind+"-enabled","true")==="false"){levels[kind]=0;save("mythbound-"+kind+"-volume",0)}save("mythbound-"+kind+"-enabled","true")}
const ducks=new Map();
const audio=$("mythbound-theme");
let musicContext=null,musicGain=null;

function sfxVolume(){return levels.sfx}
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
 for(const kind of ["music","sfx"]){
  const input=$(kind+"-volume"),toggle=$(kind+"-toggle");
  const percent=Math.round(levels[kind]*100);
  if(input){input.value=String(percent);input.style.setProperty("--audio-percent",percent+"%")}
  if(toggle){toggle.setAttribute("aria-pressed",String(percent>0));toggle.setAttribute("aria-label",(kind==="music"?"Soundtrack":"Sound effects")+" volume: "+percent+"%");toggle.title=(kind==="music"?"Soundtrack":"Sound effects")+" volume: "+percent+"%"}
 }
}
function setEnabled(next){setLevel("sfx",next?(levels.sfx||1):0)}
function setLevel(kind,value){
 if(!(kind in levels))return;
 levels[kind]=clamp(value);save("mythbound-"+kind+"-volume",levels[kind]);sync();
 if(kind==="music"){applyMusic();document.dispatchEvent(new Event("mythbound:music-change"))}else document.dispatchEvent(new Event("mythbound:sfx-change"));
}
window.MythboundSFX={enabled:()=>levels.sfx>0,volume:sfxVolume,setEnabled};
window.MythboundAudio={level:kind=>levels[kind],setLevel,applyMusic,duck(owner,ratio){ducks.set(owner,clamp(ratio));applyMusic()},release(owner){ducks.delete(owner);applyMusic()}};

let open=null,closeTimer=0;
function hide(){clearTimeout(closeTimer);for(const k of ["music","sfx"]){const p=$(k+"-volume-panel"),b=$(k+"-toggle");if(p)p.hidden=true;b?.setAttribute("aria-expanded","false")}open=null}
function show(kind){clearTimeout(closeTimer);if(open!==kind)hide();open=kind;const p=$(kind+"-volume-panel"),b=$(kind+"-toggle");if(p)p.hidden=false;b?.setAttribute("aria-expanded","true");sync()}
function later(){clearTimeout(closeTimer);closeTimer=setTimeout(()=>{if(open&&!$(open+"-volume-panel")?.contains(document.activeElement)&&document.activeElement!==$(open+"-toggle"))hide()},230)}
for(const kind of ["music","sfx"]){
 const toggle=$(kind+"-toggle"),panel=$(kind+"-volume-panel"),input=$(kind+"-volume");
 if(!toggle||!panel||!input)continue;
 toggle.setAttribute("aria-controls",panel.id);toggle.setAttribute("aria-expanded","false");
 toggle.addEventListener("pointerenter",e=>{if(e.pointerType!=="touch"&&e.pointerType!=="pen")show(kind)});
 toggle.addEventListener("pointerleave",later);
 toggle.addEventListener("focus",()=>show(kind));toggle.addEventListener("blur",later);
 toggle.addEventListener("click",e=>{show(kind);if(e.detail===0)input.focus()});
 toggle.addEventListener("keydown",e=>{if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();show(kind);input.focus()}});
 panel.addEventListener("pointerenter",()=>clearTimeout(closeTimer));panel.addEventListener("pointerleave",later);
 panel.addEventListener("focusin",()=>clearTimeout(closeTimer));panel.addEventListener("focusout",later);
 input.addEventListener("input",()=>setLevel(kind,Number(input.value)/100));
}
document.addEventListener("pointerdown",e=>{if(open&&!$(open+"-volume-panel")?.contains(e.target)&&!e.target.closest("#music-toggle,#sfx-toggle"))hide()},true);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&open){const kind=open;const hadFocus=$(kind+"-volume-panel")?.contains(document.activeElement);if(hadFocus)$(kind+"-toggle")?.focus();hide()}});
sync();applyMusic();
})();

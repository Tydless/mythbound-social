/* Voice previews and music ducking; class selection remains owned by the codex. */
(()=>{
"use strict";
window.createMythboundClassVoice=function({$,classPage,cap,isUnrevealed,voiceAvailable=()=>true,getState}){
/* A fixed gender greeting plus three independent, cyclic voice previews.
   Assets: ../VoiceSaintMaleSwitch.mp3, ../VoiceFallenSaintFemaleSwitch.mp3, etc.
   One player at a time; missing recordings never break the codex. */
const voiceNext=Object.create(null);
let voicePlaying=null,automaticVoice=false;
const voiceButton=document.createElement("button");
voiceButton.type="button";voiceButton.className="class-voice-button";
voiceButton.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12"/></svg>';
const voiceStatus=document.createElement("span");voiceStatus.className="class-voice-status";voiceStatus.setAttribute("role","status");
const controls=document.createElement("div");controls.className="class-preview-controls";
const genderSwitch=document.querySelector(".gender-switch");
genderSwitch.before(controls);controls.append(genderSwitch,voiceButton);
document.querySelector(".preview-toolbar").after(voiceStatus);
const teaserNote=document.createElement("span");teaserNote.className="unrevealed-voice-note";teaserNote.textContent="Teaser voice line · Available";teaserNote.hidden=true;controls.before(teaserNote);
const voiceClass=()=>{const {active,activePath}=getState();return isUnrevealed()?"ComingSoonSaint":active==="saint"&&activePath===1?"Archsaint":active==="saint"&&activePath===2?"FallenSaint":cap(active)};
const voiceClassName=()=>isUnrevealed()?"Coming Soon":voiceClass()==="FallenSaint"?"Fallen Saint":voiceClass();
// The unrevealed path has one teaser per avatar, not the normal three-line cycle.
const voiceKey=()=>voiceClass()+":"+getState().gender;
const nextVoice=()=>voiceNext[voiceKey()]||1;
function updateVoiceButton(){
 const mystery=isUnrevealed(),{gender}=getState();
 const label=!voiceAvailable()?"Voice recording pending":mystery?"Play "+gender+" teaser voice line":"Play "+voiceClassName()+" "+gender+" voice line "+nextVoice()+" of 3";
 voiceButton.disabled=!voiceAvailable();
 teaserNote.textContent="Teaser voice line · Available";
 teaserNote.hidden=!mystery;
 voiceButton.title=label;voiceButton.setAttribute("aria-label",label);
 voiceButton.classList.toggle("is-speaking",!!voicePlaying);
}
function restoreMusic(){
 window.MythboundAudio?.release("class-voice");
}
function stopVoice(clearStatus=true){
 const old=voicePlaying;voicePlaying=null;
 if(old){old.pause();old.removeAttribute("src");old.load()}
 restoreMusic();
 if(clearStatus)voiceStatus.textContent="";
 updateVoiceButton();
}
function playVoice(kind,automatic=false){
 if(!voiceAvailable())return;
 // All preview requests on the mystery path resolve to its sole approved teaser.
 if(isUnrevealed())kind="Teaser";
 document.dispatchEvent(new Event("mythbound:class-voice-start"));
 stopVoice();
 const filename="Voice"+voiceClass()+cap(getState().gender)+kind+".mp3";
 const audio=new Audio();audio.preload="auto";voicePlaying=audio;automaticVoice=automatic;
 if(automatic)audio.volume=window.MythboundSFX?.volume()??1;
 const fail=()=>{if(voicePlaying!==audio)return;stopVoice(false);voiceStatus.textContent="Voice preview unavailable — recording pending or playback blocked."};
 audio.addEventListener("playing",()=>{
  if(voicePlaying!==audio)return;
  window.MythboundAudio?.duck("class-voice",.28);
 },{once:true});
 audio.addEventListener("ended",()=>{if(voicePlaying===audio)stopVoice()},{once:true});
 audio.addEventListener("error",fail,{once:true});
 audio.src="../"+filename;updateVoiceButton();
 try{const result=audio.play();if(result&&typeof result.catch==="function")result.catch(fail)}catch{fail()}
}
voiceButton.addEventListener("click",()=>{
 if(isUnrevealed()){playVoice("Teaser");return}
 const key=voiceKey(),line=nextVoice();
 voiceNext[key]=line%3+1;playVoice(String(line));
});
const voiceVisibility=new MutationObserver(()=>{
 if(classPage.hidden||document.body.classList.contains("mythbound-login-open"))stopVoice();
});
voiceVisibility.observe(classPage,{attributes:true,attributeFilter:["hidden"]});
voiceVisibility.observe(document.body,{attributes:true,attributeFilter:["class"]});
document.addEventListener("mythbound:party-voice-start",()=>stopVoice());
document.addEventListener("mythbound:sfx-change",()=>{if(voicePlaying&&automaticVoice){if(window.MythboundSFX?.enabled()===false)stopVoice();else voicePlaying.volume=window.MythboundSFX?.volume()??1}});
document.addEventListener("visibilitychange",()=>{if(document.hidden)stopVoice()});
window.addEventListener("pagehide",()=>stopVoice());
return {updateVoiceButton,stopVoice,playVoice};
};
})();

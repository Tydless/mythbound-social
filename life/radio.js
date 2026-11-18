/* Personal radio library. Imported audio is stored as local IndexedDB blobs, never uploaded. */
(()=>{
"use strict";
const $=id=>document.getElementById(id),audio=new Audio(),dialog=$("radio-dialog"),playerId=WorldMemory.player().id;
audio.preload="metadata";audio.volume=.35;
const builtins=[{id:"mythbound-theme",name:"Mythbound — Theme",url:"../mythbound-theme.mp3",builtin:true}];
let tracks=builtins.slice(),selected=null,url=null,db=null,ready=false,requestToken=0;
const session=new Map();
function say(t){$("radio-feedback").textContent=t}
function openDB(){return new Promise((resolve,reject)=>{let r;try{r=indexedDB.open("afterhours-radio-v1",1)}catch(e){reject(e);return}r.onupgradeneeded=()=>r.result.createObjectStore("tracks",{keyPath:"key"});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error("Music storage is blocked"))})}
function transact(mode,fn){return new Promise((resolve,reject)=>{if(!db){reject(Error("Local music storage unavailable"));return}const tx=db.transaction("tracks",mode),rq=fn(tx.objectStore("tracks"));tx.oncomplete=()=>resolve(rq.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
function time(v){const n=Number.isFinite(v)?Math.max(0,Math.floor(v)):0;return Math.floor(n/60)+":"+String(n%60).padStart(2,"0")}
function sync(){const t=tracks.find(t=>t.id===selected);$("radio-track").textContent=t?.name||"No track selected";$("radio-play").textContent=audio.paused?"Play":"Pause";$("radio-time").textContent=time(audio.currentTime)+" / "+time(audio.duration);const seek=$("radio-seek");seek.disabled=!Number.isFinite(audio.duration)||audio.duration<=0;seek.max=seek.disabled?"1":String(audio.duration);seek.value=String(audio.currentTime||0)}
function release(){audio.pause();audio.removeAttribute("src");audio.load();if(url){URL.revokeObjectURL(url);url=null}}
function select(id,play=false){
 const track=tracks.find(t=>t.id===id);if(!track)return;requestToken++;
 release();selected=id;if(track.builtin)audio.src=track.url;else{const file=session.get(id)||track.blob;if(!file){say("The file is no longer available.");render();return}url=URL.createObjectURL(file);audio.src=url}
 render();if(play)playCurrent()
}
function playCurrent(){if(!selected){if(tracks.length)select(tracks[0].id,true);return}const token=requestToken;audio.play().catch(()=>{if(token===requestToken)say("Could not play this file. Try a supported audio format.")})}
function step(dir,play=!audio.paused){if(!tracks.length)return;const i=tracks.findIndex(t=>t.id===selected);select(tracks[(i<0?0:(i+dir+tracks.length)%tracks.length)].id,play)}
function render(){
 const list=$("radio-list");list.replaceChildren();for(const t of tracks){const row=document.createElement("div");row.className="radio-row";const b=document.createElement("button");b.type="button";b.className="radio-song"+(t.id===selected?" selected":"");b.textContent=(t.id===selected?"♫  ":"♪  ")+t.name;b.onclick=()=>select(t.id,true);row.append(b);if(!t.builtin){const del=document.createElement("button");del.type="button";del.textContent="×";del.setAttribute("aria-label","Remove "+t.name);del.onclick=async()=>{try{if(db)await transact("readwrite",s=>s.delete(t.key))}catch{say("Could not remove the saved file.");return}session.delete(t.id);tracks=tracks.filter(o=>o.id!==t.id);if(selected===t.id){release();selected=null}render()};row.append(del)}list.append(row)}sync()
}
async function init(){
 try{db=await openDB();const rows=await transact("readonly",s=>s.getAll());tracks=[...builtins,...rows.filter(t=>t.playerId===playerId&&t.blob instanceof Blob)];ready=true}catch{say("Persistent music storage unavailable; imports can still play in this session.")}render()
}
$("radio-files").onchange=async e=>{
 const files=Array.from(e.target.files||[]);e.target.value="";let stored=0,temp=0,skipped=0;
 for(const f of files){
  if(!f.type.startsWith("audio/")&&!/\.(mp3|wav|ogg|m4a|flac|aac|opus)$/i.test(f.name)){skipped++;continue}
  const id=globalThis.crypto?.randomUUID?.()||"track-"+Date.now()+"-"+Math.random(),t={id,key:playerId+":"+id,playerId,name:f.name.replace(/\.[^.]+$/,""),blob:f};
  try{if(!db)throw Error("No DB");await transact("readwrite",s=>s.put(t));stored++}catch{session.set(id,f);temp++}tracks.push(t)
 }
 render();say([stored?stored+" song(s) saved.":"",temp?temp+" song(s) available for this session only.":"",skipped?skipped+" unsupported file(s) skipped.":""].filter(Boolean).join(" "))
};
$("radio-play").onclick=()=>audio.paused?playCurrent():audio.pause();
$("radio-prev").onclick=()=>step(-1);$("radio-next").onclick=()=>step(1);
$("radio-volume").oninput=e=>{audio.volume=Number(e.target.value)/100;try{localStorage.setItem("afterhours-radio-volume:"+playerId,String(audio.volume))}catch{}};
try{const stored=localStorage.getItem("afterhours-radio-volume:"+playerId);if(stored!==null)audio.volume=Math.max(0,Math.min(1,Number(stored)||0));$("radio-volume").value=String(audio.volume*100)}catch{}
$("radio-seek").oninput=e=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(e.target.value)};
for(const evt of ["loadedmetadata","timeupdate","play","pause","durationchange"])audio.addEventListener(evt,sync);
audio.addEventListener("ended",()=>step(1,true));audio.addEventListener("error",()=>{if(selected)say("This track could not be loaded.");sync()});
$("radio-close").onclick=()=>dialog.close();
window.LifeRadio={open(){dialog.showModal();render()},pause(){audio.pause()},onClose(fn){dialog.addEventListener("close",fn)}};
init();
})();
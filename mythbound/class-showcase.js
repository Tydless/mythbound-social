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
// Add approved specialization content here, grouped by class and path number.
// Each entry may provide name, description, icon, skills (same format as DATA), and signatureMoves.
const SPECIALIZATIONS={};
const pathData=()=>activePath===0?{name:cap(active),description:"Master the foundations of your class.",skills:DATA[active].skills,signatureMoves:[]}:SPECIALIZATIONS[active]?.[activePath]||{name:"Specialization "+activePath,description:"This advanced path has yet to be revealed.",skills:[],signatureMoves:[]};

/* A fixed gender greeting plus three independent, cyclic voice previews.
   Assets: ../VoiceSaintMaleSwitch.mp3, ../VoiceSaintMale1.mp3, etc.
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
const cap=s=>s[0].toUpperCase()+s.slice(1);
const voiceKey=()=>active+":"+gender;
const nextVoice=()=>voiceNext[voiceKey()]||1;
function updateVoiceButton(){
 const label="Play "+cap(active)+" "+gender+" voice line "+nextVoice()+" of 3";
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
 stopVoice();
 const filename="Voice"+cap(active)+cap(gender)+kind+".mp3";
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
 const key=voiceKey(),line=nextVoice();
 voiceNext[key]=line%3+1;playVoice(String(line));
});
const classPage=$("page-classes");
const voiceVisibility=new MutationObserver(()=>{
 if(classPage.hidden||document.body.classList.contains("mythbound-login-open"))stopVoice();
});
voiceVisibility.observe(classPage,{attributes:true,attributeFilter:["hidden"]});
voiceVisibility.observe(document.body,{attributes:true,attributeFilter:["class"]});
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
function renderPreview(){
 // Real artwork for both Saint appearances, with the old concept silhouette
 // as a fallback until the two image files have been uploaded to GitHub.
 preview.replaceChildren();
 preview.classList.remove("has-saint-art");
 preview.style.setProperty("--preview-accent",DATA[active].color);
 preview.setAttribute("aria-label",gender+" "+active+" class artwork preview");
 const note=document.querySelector(".preview-disclaimer");
 if(note)note.textContent="Concept illustration · final models coming later";
 if(active==="saint"){
  const picture=document.createElement("img");
  picture.className="saint-portrait";
  picture.alt=gender==="female"
   ?"Female Saint class illustration: white-haired healer with holy staff in an ornate gold floral frame"
   :"Male Saint class illustration: long-haired healer with holy staff in an ornate gold floral frame";
  picture.loading="eager";
  picture.decoding="async";
  picture.addEventListener("load",()=>{
   if(!picture.isConnected)return;
   preview.classList.add("has-saint-art");
   if(note)note.textContent="Saint · illustrated class artwork";
  });
  picture.addEventListener("error",()=>{
   if(!picture.isConnected)return;
   preview.classList.remove("has-saint-art");
   preview.innerHTML=avatarArt();
   if(note)note.textContent="Preview silhouette · artwork pending upload";
  });
  preview.append(picture);
  picture.src=gender==="female"?"../FemaleSaint.png":"../MaleSaint.png";
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
 const values=DATA[active].stats, ns="http://www.w3.org/2000/svg";
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
 node("title",{id:"stat-radar-title"},svg,cap(active)+" class strengths");
 node("desc",{id:"stat-radar-description"},svg,statLabels.map((s,i)=>s+": "+values[i]+" out of 5").join("; "));
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
 pathData().skills.forEach((s,i)=>{
  const btn=document.createElement("button");btn.type="button";btn.className="skill-icon"+(i===chosen?" is-current":"");
  btn.setAttribute("aria-label","Inspect "+s[1]);btn.setAttribute("aria-pressed",String(i===chosen));btn.title=s[1];
  const glyph=document.createElement("span");glyph.className="skill-symbol";glyph.textContent=s[0];
  const n=document.createElement("span");n.className="skill-name";n.textContent=s[1];
  btn.append(glyph,n);btn.addEventListener("click",()=>{chosen=i;renderSkills()});skills.append(btn);
 });
 skillDetail();
}
function renderPath(){
 const path=pathData(),buttons=$("class-paths");
 if(buttons){
  buttons.querySelectorAll("[data-path]").forEach(b=>{
   const i=Number(b.dataset.path),selected=i===activePath;
   b.classList.toggle("is-current",selected);b.setAttribute("aria-pressed",String(selected));
   const info=i===0?{name:cap(active)}:SPECIALIZATIONS[active]?.[i];
   b.querySelector(".path-name").textContent=i===0?"Base class":info?.name||"???";
   b.title=i===0?cap(active)+" · Base class":info?.name||"Specialization "+i+" — unrevealed";
   b.setAttribute("aria-label",b.title);
   if(i===0&&typeof setClassArtwork==="function")setClassArtwork(b.querySelector(".path-symbol"),active);
  });
 }
 const title=$("path-detail-title"),desc=$("path-description"),label=$("path-type"),core=$("path-core-title"),sig=$("path-signatures");
 if(title)title.textContent=path.name+(activePath===0?" · Base class":"");
 if(desc)desc.textContent=path.description;
 if(label)label.textContent=activePath===0?"BASE PATH":"ADVANCED PATH";
 if(core)core.textContent=activePath===0?"Core abilities":"Specialization abilities";
 if(sig){
  sig.replaceChildren();
  if(path.signatureMoves?.length){path.signatureMoves.forEach(move=>{const p=document.createElement("p");p.textContent=move;sig.append(p)})}
  else{const p=document.createElement("p");p.className="signature-pending";p.textContent="To be revealed";sig.append(p)}
 }
 skills.hidden=!path.skills.length;
 renderSkills();
}
$("class-paths")?.querySelectorAll("[data-path]").forEach(b=>b.addEventListener("click",()=>{
 activePath=Number(b.dataset.path);chosen=0;renderPath();
}));
const atmosphere=document.querySelector(".class-atmosphere");
let environmentRequest=0;
function drawEnvironment(){
 if(!atmosphere)return;
 const host=$("class-details"),landscape=atmosphere.querySelector(".class-landscape"),embers=atmosphere.querySelector(".class-embers");
 host.dataset.environment=active;
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
 for(const [key,label] of CLASS_ROLES[active]){
  const icon=document.createElement("button");icon.type="button";icon.className="class-role-icon";icon.dataset.tooltip=label;icon.setAttribute("aria-label",label);icon.setAttribute("aria-expanded","false");icon.style.padding="0";icon.addEventListener("click",()=>{const open=!icon.classList.contains("is-tooltip-open");closeRoleTooltips();if(open){icon.classList.add("is-tooltip-open");icon.setAttribute("aria-expanded","true")}});
  icon.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+ROLE_ICONS[key]+'</svg>';combat.append(icon);
 }
 difficulty.setAttribute("aria-label","Difficulty: "+d.difficulty+" out of 5");difficulty.title=d.difficulty+" / 5";
 const label=document.createElement("span");label.className="difficulty-label";label.textContent="DIFFICULTY";label.setAttribute("aria-hidden","true");difficulty.append(label);
 for(let i=1;i<=5;i++){const dot=document.createElement("span");dot.className="difficulty-dot"+(i<=d.difficulty?" is-filled":"");dot.setAttribute("aria-hidden","true");difficulty.append(dot)}
}

function draw(){
 const d=DATA[active];
 $("class-index").textContent=String(Object.keys(DATA).indexOf(active)+1).padStart(2,"0")+" / 06";
 renderClassMeta(d);
 $("class-details").style.setProperty("--class-highlight",d.color);
 drawEnvironment();renderStats();renderPath();renderPreview();
}
document.querySelectorAll("[data-class]").forEach(button=>{
 button.addEventListener("click",()=>{
  if(!DATA[button.dataset.class])return;
  stopVoice();active=button.dataset.class;activePath=0;chosen=0;gender="male";draw();updateVoiceButton();
 });
});
document.querySelectorAll(".gender-option").forEach(button=>button.addEventListener("click",()=>{
 const next=button.dataset.gender;if(next===gender||!["male","female"].includes(next))return;
 gender=next;renderPreview();playVoice("Switch");
}));
draw();updateVoiceButton();
})();
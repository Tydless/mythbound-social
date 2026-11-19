/* Mythbound class codex: concept stats, not final balance. */
(() => {
"use strict";
const {DATA,statLabels,statDescriptions,SPECIALIZATIONS,SKILL_ART,SAINT_PATH_ART,SAINT_SCENES,ROLE_ICONS,CLASS_ROLES}=window.MythboundCodexData;
const $=id=>document.getElementById(id);
const stats=$("class-stats"),skills=$("class-skills"),detail=$("skill-detail"),preview=$("class-preview");
if(!stats||!skills||!detail||!preview)return;

let active="saint",gender="male",chosen=null,activePath=0;
const isUnrevealed=()=>active==="saint"&&activePath===3;

const pathData=()=>activePath===0?{name:cap(active),description:"Master the foundations of your class.",skills:DATA[active].skills,media:DATA[active].media,signatureMoves:[]}:SPECIALIZATIONS[active]?.[activePath]||{name:"Specialization "+activePath,description:"This advanced path has yet to be revealed.",skills:[],signatureMoves:[]};
const pathCombatData=()=>{const base=DATA[active],path=pathData();return {...base,stats:path.stats||base.stats,difficulty:path.difficulty??base.difficulty,play:path.play||base.play,roles:path.roles||CLASS_ROLES[active]}};

const cap=s=>s[0].toUpperCase()+s.slice(1);
const classPage=$("page-classes");
const {updateVoiceButton,stopVoice,playVoice}=window.createMythboundClassVoice({$,classPage,cap,isUnrevealed,getState:()=>({active,activePath,gender})});


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
const {prepareTransformationAudio,stopTransformationAudio,playSpecialSound,playTransformationAudio}=window.createMythboundTransformationAudio({$,classPage,isArchsaint:()=>active==="saint"&&activePath===1});
const {revealSpecialPath,revealSaint,burnPortrait,useMobilePortraitEffects,revealMobilePath}=window.MythboundPortraitEffects;




function renderPreview(allowTransformation=false){
 // Real artwork for both Saint appearances, with the old concept silhouette
 // as a fallback until the two image files have been uploaded to GitHub.
 stopTransformationAudio();
 const mobile=useMobilePortraitEffects();
 $("class-details").classList.toggle("mobile-portrait-fx",mobile);
 // If a switch is interrupted while an image is still loading, retain the last
 // loaded portrait rather than cloning the not-yet-ready incoming image.
 const previous=[...preview.querySelectorAll(".saint-portrait-stage .saint-portrait")].reverse().find(img=>img.complete&&img.naturalWidth);
 const oldImage=previous?previous.cloneNode(false):null;
 if(oldImage){oldImage.removeAttribute("style");oldImage.classList.remove("portrait-incoming","portrait-previous","unrevealed-portrait-reveal")}
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
  const special=activePath===1?"archsaint":isUnrevealed()?"mystery":null;
  const animate=allowTransformation&&(!!special||!!oldImage)&&(!oldImage||oldImage.src!==new URL(source,document.baseURI).href)&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(animate){
   prepareTransformationAudio();
   if(oldImage){oldImage.setAttribute("aria-hidden","true");oldImage.alt="";oldImage.classList.remove("portrait-incoming");oldImage.classList.add("portrait-previous");stage.append(oldImage)}
   picture.classList.add("portrait-incoming");
   stage.style.setProperty("--reveal-core",isFallen?"#ffbaa0":"#fff5cf");
   stage.style.setProperty("--reveal-glow",isFallen?"#e74338":"#efc16a");
  }
  picture.loading="eager";
  picture.decoding="async";
  picture.addEventListener("load",()=>{
   if(!picture.isConnected)return;
   preview.classList.add("has-saint-art");
   if(animate){
    if(mobile){
     if(special)playSpecialSound(special);else playTransformationAudio(isFallen);
     revealMobilePath(stage,oldImage,picture,special||(isFallen?"fallen":"base"));
    }else if(special){playSpecialSound(special);revealSpecialPath(stage,oldImage,picture,special)}
    else{playTransformationAudio(isFallen);if(isFallen)burnPortrait(stage,oldImage,picture,true);else revealSaint(stage,oldImage,picture)}
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
  preview.classList.add("has-saint-art");
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
 const values=mystery?null:pathCombatData().stats, ns="http://www.w3.org/2000/svg";
 const colors=["#ee958b","#87b8f3","#9ed9a8","#f1c985","#c3a6f1"];
 const svg=document.createElementNS(ns,"svg");
 svg.setAttribute("viewBox","0 0 480 350");
 svg.setAttribute("class","stat-radar");
 svg.setAttribute("role","group");
 svg.setAttribute("aria-label",mystery?"Unrevealed class strengths":(pathData().stats?pathData().name:cap(active))+" class strengths");
 svg.setAttribute("aria-describedby","stat-radar-description");
 function node(tag,attrs={},parent=svg,text){
  const el=document.createElementNS(ns,tag);
  Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));
  if(text!==undefined)el.textContent=text;
  parent.append(el);return el;
 }
 node("desc",{id:"stat-radar-description"},svg,(mystery?"All five strength ratings are undisclosed. No values are displayed. ": "")+statLabels.map((s,i)=>s+(mystery?"":": "+values[i]+" out of 5")+". "+statDescriptions[i]).join(" "));
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
   const category=node("g",{class:"radar-category"});
   node("title",{},category,statDescriptions[i]);
   const group=node("g",{class:"unrevealed-radar-node",transform:"translate("+x+" "+y+")","aria-hidden":"true"},category);
   node("circle",{r:18,fill:"#252938",stroke:"currentColor","stroke-width":1},group);
   node("text",{x:0,y:1,"text-anchor":"middle","dominant-baseline":"middle",class:"unrevealed-radar-question"},group,"?");
   node("text",{x:l.x,y:l.y,"text-anchor":l.a,fill:"#bdc2d4",class:"radar-label"},category,statLabels[i]);
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
  const category=node("g",{class:"radar-category"});
  node("title",{},category,statDescriptions[i]);
  const group=node("g",{transform:"translate("+ix.toFixed(2)+" "+iy.toFixed(2)+")","aria-hidden":"true"},category);
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
  node("text",{x:l.x,y:l.y,"text-anchor":l.a,fill:color,class:"radar-label"},category,statLabels[i]);
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

function abilityEntries(path){
 const entries=[];
 const core=path.mechanics||[];
 const isArch=active==="saint"&&activePath===1,isFallen=active==="saint"&&activePath===2;
 // General traits remain selectable. Skill-specific rules are shown only with their skill.
 const linked=isArch?{"Heaven's Mercy":[3]}:isFallen?{"Crimson Covenant":[1],"Sanguine Harvest":[1],"Marionette":[2,3]}:{};
 const standalone=isArch?[0,1,2]:isFallen?[0,1]:core.map((_,i)=>i);
 standalone.forEach(i=>{const m=core[i];if(m)entries.push({name:m.name,icon:m.icon,type:m.type,group:"core",mechanic:m})});
 path.skills.forEach(s=>{
  const group=s[5]==="Passive"||s[2]==="Passive"?"core":/signature|ultimate/i.test(s[2])?"ultimate":"standard";
  entries.push({name:s[1],icon:s[0],type:s[2],group,skill:s,mechanics:(linked[s[1]]||[]).map(i=>core[i]).filter(Boolean)});
 });
 return entries;
}
function el(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n}
function abilitySymbol(entry){
 const box=el("span","ability-art");box.setAttribute("aria-hidden","true");
 const art=SKILL_ART[entry.name];
 if(art)box.innerHTML='<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round">'+art+'</svg>';
 else box.textContent=entry.icon;
 return box;
}
function mechanicDetail(m,includeHeading=true){
 const panel=el("section","ability-mechanic");
 if(includeHeading)panel.append(el("h4","",m.name));
 panel.append(el("p","",m.description));
 if(m.table){
  const table=el("table","path-mechanic-table");table.setAttribute("aria-label",m.name+" — proposed scaling");
  const header=el("thead"),tr=el("tr");
  for(const value of m.table.headers){const th=el("th","",value);th.scope="col";tr.append(th)}
  header.append(tr);table.append(header);
  const body=el("tbody");
  for(const row of m.table.rows){const tr=el("tr");row.forEach((value,i)=>{const cell=el(i===0?"th":"td","",value);if(i===0)cell.scope="row";tr.append(cell)});body.append(tr)}
  table.append(body);panel.append(table);
 }
 if(m.note)panel.append(el("p","path-mechanic-note",m.note));
 return panel;
}
function renderAbilityMedia(path,entry){
 const host=$("path-signatures");if(!host)return;
 // Stop any previous playback rather than playing two previews on top of each other.
 host.querySelector("video")?.pause();host.replaceChildren();
 if(isUnrevealed()){
  const panel=el("div","unrevealed-signature");
  const mark=el("span","unrevealed-signature-mark","?");mark.setAttribute("aria-hidden","true");
  panel.append(mark,el("strong","","FOOTAGE UNAVAILABLE"),el("p","","This path has yet to make its debut."));host.append(panel);return;
 }
 const videoData=entry&&path.media?.[entry.name];
 const frame=el("div","ability-video-frame");
 const placeholder=el("div","ability-video-placeholder");
 const play=el("span","ability-video-play");play.setAttribute("aria-hidden","true");
 play.innerHTML='<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="16" cy="16" r="14"/><path d="m13 10 10 6-10 6Z" fill="currentColor" stroke="none"/></svg>';
 placeholder.append(play,el("strong","",entry?"Gameplay preview coming soon":"No footage available"),el("span","","In-game ability demonstration"));
 frame.append(placeholder);
 if(videoData?.video){
  const video=el("video","ability-video");video.controls=true;video.preload="metadata";video.playsInline=true;video.setAttribute("aria-label",entry.name+" gameplay video");
  if(videoData.poster)video.poster=videoData.poster;
  video.addEventListener("error",()=>{video.remove();placeholder.hidden=false;placeholder.querySelector("strong").textContent="Footage currently unavailable"},{once:true});
  placeholder.hidden=true;video.src=videoData.video;frame.append(video);
 }
 host.append(frame);
 if(entry){
  const caption=el("div","ability-video-caption");caption.append(el("strong","",entry.name),el("span","",videoData?.video?"Gameplay footage":"Footage pending"));host.append(caption);
 }
}
function skillDetail(path,entry){
 detail.replaceChildren();
 if(!entry){detail.append(el("p","path-pending","Advanced abilities have yet to be revealed."));renderAbilityMedia(path,null);return}
 const head=el("div","ability-detail-header"),text=el("div","ability-detail-heading");
 const category={core:"Core mechanic",standard:"Standard skill",ultimate:"Ultimate"}[entry.group];
 text.append(el("span","ability-category-label",category),el("h4","",entry.name),el("span","ability-detail-type",entry.type));
 head.append(abilitySymbol(entry),text);detail.append(head);
 if(entry.skill){
  const s=entry.skill;
  detail.append(el("p","",s[6]));
  const grid=el("div","skill-data");
  [["Range",s[3]],["Effect",s[4]],["Cooldown",s[5]]].forEach(([k,v])=>{
   const cell=el("div");cell.append(el("span","",k),el("strong","",v));grid.append(cell);
  });
  detail.append(grid);
  for(const m of entry.mechanics||[])detail.append(mechanicDetail(m));
 }else if(entry.mechanic)detail.append(mechanicDetail(entry.mechanic,false));
 renderAbilityMedia(path,entry);
}
function renderSkills(){
 const path=pathData();
 $("class-details").dataset.skillTheme=active==="saint"&&activePath===1?"archsaint":active==="saint"&&activePath===2?"fallensaint":active;
 skills.replaceChildren();
 if(isUnrevealed()){
  skills.hidden=true;detail.replaceChildren();
  const sealed=el("div","unrevealed-sealed-panel");
  const lock=el("span","unrevealed-lock");lock.setAttribute("aria-hidden","true");lock.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></svg>';
  sealed.append(lock,el("strong","","ABILITIES SEALED"),el("p","","No abilities have been revealed for this path."));detail.append(sealed);renderAbilityMedia(path,null);return;
 }
 const entries=abilityEntries(path);
 skills.hidden=!entries.length;
 if(!entries.some(e=>e.name===chosen))chosen=(entries.find(e=>e.group==="standard")||entries[0])?.name||null;
 const buttons=[];
 function select(entry){
  chosen=entry.name;
  for(const [b,e] of buttons){const on=e.name===chosen;b.classList.toggle("is-current",on);b.setAttribute("aria-pressed",String(on))}
  skillDetail(path,entry);
 }
 for(const [group,label] of [["core","Core Mechanics"],["standard","Standard Skills"],["ultimate","Ultimate"]]){
  const section=el("section","ability-group ability-group-"+group),header=el("div","ability-group-head");
  header.append(el("h4","",label));section.append(header);
  const list=el("div","ability-group-icons");list.setAttribute("role","group");list.setAttribute("aria-label",label);
  const members=entries.filter(e=>e.group===group);
  if(!members.length)list.append(el("p","ability-group-empty",group==="ultimate"?"Not yet revealed":"No entries revealed"));
  for(const entry of members){
   const btn=el("button","skill-icon ability-tile");btn.type="button";btn.title=entry.name;btn.setAttribute("aria-label","Inspect "+entry.name);
   btn.append(abilitySymbol(entry),el("span","skill-name",entry.name));
   btn.addEventListener("click",()=>select(entry));buttons.push([btn,entry]);list.append(btn);
  }
  section.append(list);skills.append(section);
 }
 const selected=entries.find(e=>e.name===chosen);
 if(selected)select(selected);else skillDetail(path,null);
}

function renderPathPresentation(){
 const host=$("class-details"),mystery=isUnrevealed(),path=pathData(),wasSpecial=host.dataset.unrevealed==="true"||host.dataset.customPathHeader==="true";
 if(mystery)host.dataset.unrevealed="true";else delete host.dataset.unrevealed;
 host.style.setProperty("--class-highlight",mystery?"#b8bed8":DATA[active].color);
 $("class-codex-path-label").textContent=mystery?"UNREVEALED PATH":path.overviewType?path.type:"BASIC PATH";
 $("path-inspect-label").textContent=mystery?"UNDISCLOSED":"SELECT TO INSPECT";
 if(mystery){
  const emblem=$("class-emblem");emblem.classList.remove("class-art-host","has-class-art");emblem.textContent="?";
  $("class-name").textContent="Coming soon";
  $("class-type").textContent="UNREVEALED SPECIALIZATION";
  $("class-description").textContent="Not every path has been written in the chronicles. What lies beyond this one remains a mystery.";
 }else if(path.overviewType){
  if(wasSpecial&&typeof selectClass==="function")selectClass(active);
  host.dataset.customPathHeader="true";
  $("class-name").textContent=path.name;
  $("class-type").textContent=path.overviewType;
  $("class-description").textContent=path.overviewDescription;
  if(active==="saint"&&SAINT_PATH_ART[activePath]&&typeof setClassArtwork==="function")setClassArtwork($("class-emblem"),active,SAINT_PATH_ART[activePath]);
 }else if(wasSpecial&&typeof selectClass==="function")selectClass(active);
 if(!path.overviewType)delete host.dataset.customPathHeader;
 renderClassMeta(pathCombatData());renderStats();
}
function renderPathAdvancement(path){
 const panel=$("path-advancement"),copy=$("path-advancement-text");
 if(!panel||!copy)return;
 const info=path.advancement;
 panel.hidden=!info||activePath===0||isUnrevealed();
 copy.replaceChildren();
 if(panel.hidden)return;
 const quest=document.createElement("strong"),target=document.createElement("strong");
 quest.textContent=info.quest;target.textContent=path.name;
 copy.append("Complete the questline “",quest,"” to advance from "+info.from+" to ",target,".");
}
// Skill section headings describe the path, not the character class name.
function pathSectionTitle(path,isBase){
 return isBase?"Base Class":(path.type||"ADVANCED PATH").toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
}
// Shared visual identities for every revealed path type.
function renderPathIdentity(path,isBase){
 const heading=$("path-detail-title"),icon=$("path-category-icon"),panel=heading?.closest(".path-overview");
 if(!icon||!panel)return;
 const key=isBase?"base":(path.type||"UNREVEALED PATH").toLowerCase().replace(/ path$/,"");
 const symbols={
  base:'<path d="M12 3v18M4 12h16M12 5l7 7-7 7-7-7Z"/>',
  true:'<circle cx="12" cy="12" r="4"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4M5 5l3 3m8 8 3 3M5 19l3-3m8-8 3-3"/>',
  corrupted:'<path d="M19 15A8 8 0 0 1 9 5a8 8 0 1 0 10 10Z"/><path d="M17 3q-4 5 0 7 4-2 0-7Z"/>',
  twisted:'<path d="M12 21v-6c0-4-6-4-6-9m6 9c0-4 6-4 6-9M3 8l3-3 3 3m6 0 3-3 3 3"/>',
  fable:'<path d="M3 6q5-2 9 2 4-4 9-2v12q-5-2-9 2-4-4-9-2ZM12 8v12M16 3v4m-2-2h4"/>',
  mythical:'<path d="M13 2c1 5 7 8 7 13a8 8 0 0 1-16 0c0-4 3-6 5-9 0 4 2 5 3 5 2-2 2-5 1-9Z"/><path d="M12 12c3 3 4 5 0 8-4-3-3-5 0-8Z"/>',
  unrevealed:'<path d="M9 8a3 3 0 1 1 5 2c-1 1-2 2-2 4m0 4h.01M12 2l10 10-10 10L2 12Z"/>'
 };
 const theme=Object.prototype.hasOwnProperty.call(symbols,key)?key:"unrevealed";
 panel.dataset.pathTheme=theme;
 icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" focusable="false">'+symbols[theme]+'</svg>';
 icon.hidden=false;
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
   const symbol=b.querySelector(".path-symbol");
   const artwork=active==="saint"?SAINT_PATH_ART[i]:null;
   if((i===0||artwork)&&typeof setClassArtwork==="function")setClassArtwork(symbol,active,artwork);
   else {
    symbol.classList.remove("class-art-host","has-class-art");
    delete symbol.dataset.artSrc;
    symbol.textContent=i===1?"◇":i===2?"✧":unknown?"?":"◈";
   }
  });
 }
 const title=$("path-detail-title"),desc=$("path-description"),core=$("path-core-title");
 if(title)title.textContent=pathSectionTitle(path,activePath===0);
 renderPathIdentity(path,activePath===0);
 if(desc)desc.textContent=path.description;
 renderPathAdvancement(path);
 if(core)core.textContent=isUnrevealed()?"Unrevealed abilities":"Abilities & mechanics";
 renderSkills();
}
$("class-paths")?.querySelectorAll("[data-path]").forEach(b=>b.addEventListener("click",()=>{
 const next=Number(b.dataset.path);
 const previousPath=activePath;
 const changed=next!==previousPath;
 if(changed)stopVoice();
 activePath=next;chosen=null;renderPath();
 if(changed)drawEnvironment();
 if(changed){
  renderPreview(true);updateVoiceButton();
  // Mystery entry uses its teaser; the other paths retain their switch greetings.
  if(window.MythboundSFX?.enabled()===false)return;
  if(isUnrevealed())playVoice("Teaser",true);
  else if(active==="saint"&&(activePath===1||activePath===2||((previousPath===1||previousPath===2||previousPath===3)&&activePath===0)))playVoice("Switch",true);
 }
}));
const atmosphere=document.querySelector(".class-atmosphere");
// Anchor the base Saint's landscape to the actual end of the portrait overview,
// not the height of the currently selected skill description.
const sceneHost=$("class-details"),sceneOverview=sceneHost.querySelector(".path-overview");
function sizeBaseSaintScene(){
 const end=sceneOverview?.offsetTop||0;
 if(end>0)sceneHost.style.setProperty("--base-saint-scene-height",end+"px");
}
if(typeof ResizeObserver==="function"){
 const sceneObserver=new ResizeObserver(sizeBaseSaintScene);
 for(const node of [sceneHost,sceneHost.querySelector(".showcase-columns"),sceneHost.querySelector(".showcase-overline")])if(node)sceneObserver.observe(node);
}else window.addEventListener("resize",sizeBaseSaintScene);
let environmentRequest=0,environmentKey=null,environmentFadeTimer=0;

function fillSceneEffects(layer,scene){
 if(layer.dataset.scene===scene)return;
 layer.dataset.scene=scene;layer.replaceChildren();
 function add(kind,i,vars){
  const p=document.createElement("span");p.className="scene-fx "+kind;
  for(const [key,val] of Object.entries(vars))p.style.setProperty("--"+key,String(val));
  if(kind==="scene-feather"){
   // A lightweight feather silhouette; strokes form the quill and separate vanes.
   p.innerHTML='<svg viewBox="0 0 32 52" fill="none" aria-hidden="true"><path d="M27 2C11 4 2 15 4 29c0 6 4 10 7 13 2-9 8-12 13-20 4-7 5-15 3-20Z" fill="#fff9ee"/><path d="M5 50Q13 30 25 8M11 36l-5-12M14 30l-5-12M17 24l-3-10M12 35l11-8M16 28l10-7M20 19l6-5" stroke="#c9cce5" stroke-width="1" stroke-linecap="round"/></svg>';
  }else if(kind==="scene-petal"){
   p.innerHTML='<svg viewBox="0 0 24 18" aria-hidden="true"><path d="M1 8C6 0 16-2 23 3c-1 8-8 13-15 13C4 16 1 12 1 8Z" fill="currentColor"/><path d="M3 10Q13 9 21 4" fill="none" stroke="#ffc1c5" stroke-width=".6" opacity=".6"/></svg>';
  }
  layer.append(p);
 }
 if(scene==="judgment"){
  for(let i=0;i<3;i++)add("scene-mist",i,{y:(24+i*23)+"%",duration:(27+i*10)+"s",delay:(-7-i*12)+"s",alpha:[.38,.31,.24][i]});
  return;
 }
 if(!["heavenly","bloodmoon"].includes(scene))return;
 const heavenly=scene==="heavenly",count=heavenly?12:22;
 for(let i=0;i<count;i++){
  const d=(heavenly?15:10)+(i%7)*1.8;
  add(heavenly?"scene-feather":"scene-petal",i,{x:(3+(i*37.13)%94)+"%",size:(heavenly?13+(i%5)*3:8+(i%5)*2)+"px",duration:d+"s",delay:(-d*(i*.371%1))+"s",drift:((i%5-2)*32)+"px",turn:((i%2?1:-1)*(40+i%4*35))+"deg",alpha:(.43+(i%4)*.10).toFixed(2),hue:(i%3)*8+"deg"});
 }
 for(let i=0;i<30;i++)add("scene-glint",i,{x:(2+(i*53.17)%96)+"%",y:(7+(i*29.71)%88)+"%",size:(1.5+(i%4)*.9)+"px",duration:(5+i%6*1.3)+"s",delay:(-i*.73)+"s",drift:((i%7-3)*9)+"px"});
}
function drawEnvironment(){
 if(!atmosphere)return;
 const host=$("class-details"),landscape=atmosphere.querySelector(".class-landscape"),embers=atmosphere.querySelector(".class-embers");
 host.dataset.environment=active;
 const classId=active,special=classId==="saint"?SAINT_SCENES[activePath]:null;
 const scene=special?.id||"base";
 const layer=atmosphere.querySelector(".class-scene-effects");
 const key=classId+":"+scene;
 if(key===environmentKey)return;
 const initial=environmentKey===null;
 environmentKey=key;
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
 clearTimeout(environmentFadeTimer);
 const candidates=special?[special.src]:["../Environment"+cap(classId)+".jpg","../Environment"+cap(classId)+".png"];
 if(classId==="saint"&&!special)candidates.push("../mythbound-home-watercolor.jpg");
 const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 let faded=initial||reduced,loaded=false,asset=null;
 host.classList.add("environment-fading");
 function commit(){
  if(request!==environmentRequest||!faded||!loaded)return;
  host.dataset.scene=scene;host.dataset.sceneClass=classId;
  if(classId==="saint"&&scene==="base")sizeBaseSaintScene();
  fillSceneEffects(layer,scene);
  landscape.style.backgroundImage=asset?'url("'+asset+'")':"";
  atmosphere.classList.toggle("has-landscape",Boolean(asset));
  // Commit the new image and effects while invisible, then start the fade-in.
  // Guard the frame callback as well as the image callback against fast switches.
  void atmosphere.offsetWidth;
  if(request===environmentRequest)host.classList.remove("environment-fading");
 }
 if(!faded)environmentFadeTimer=setTimeout(()=>{faded=true;commit()},720);
 function tryImage(i){
  if(request!==environmentRequest)return;
  if(i>=candidates.length){loaded=true;commit();return}
  const image=new Image();
  image.onload=()=>{if(request!==environmentRequest)return;asset=candidates[i];loaded=true;commit()};
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
 for(const [key,label] of d.roles||CLASS_ROLES[active]){
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
  stopVoice();active=button.dataset.class;activePath=0;chosen=null;gender="male";draw();updateVoiceButton();
 });
});
document.querySelectorAll(".gender-option").forEach(button=>button.addEventListener("click",()=>{
 const next=button.dataset.gender;if(next===gender||!["male","female"].includes(next))return;
 gender=next;renderPreview(false);if(window.MythboundSFX?.enabled()!==false)playVoice("Switch",true);else stopVoice();
}));
draw();updateVoiceButton();
})();
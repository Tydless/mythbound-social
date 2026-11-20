/* Mythbound's preliminary atlas. Replace the map artwork and coordinates independently of the region entries. */
(()=>{
"use strict";
const world=document.getElementById("page-discover");
if(!world)return;
const $=id=>document.getElementById(id);
const markers=$("mw-map-markers"),directory=$("mw-region-directory"),location=$("mw-region-interface");
if(!markers||!directory||!location)return;
const regions=[
 {id:"greatfields",name:"The GreatFields",type:"Starting region",color:"#c4d59a",symbol:"✦",x:47,y:50,description:"Your journey begins in the GreatFields. The game's starting area and the shared setting for the six base class backgrounds.",note:"Starting point confirmed. Individual settlements and landmarks are yet to be revealed.",status:"STARTING AREA",icon:"M2 19h20M3 15q4-6 8 0t10 0M5 10l3-4 3 4m5 0V5m-3 3h6"},
 {id:"fable",name:"The Fable Woods",type:"Woodland region",color:"#a5d4a8",symbol:"◇",x:24,y:35,description:"A woodland shaped by the spirit of fables, where stories and strange creatures may cross an adventurer's path.",note:"Local inhabitants, settlements and encounters have not yet been detailed.",status:"REGION",icon:"M12 3 5 13h4l-5 6h16l-5-6h4L12 3Zm0 16v3"},
 {id:"wondrous",name:"The Wondrous Lands",type:"Whimsical region",color:"#d7c5f4",symbol:"◇",x:49,y:26,description:"A realm of wonders, offering a glimpse of Mythbound's more whimsical side.",note:"Local landmarks and the nature of its wonders are yet to be revealed.",status:"REGION",icon:"M12 2 14 9l8 3-8 3-2 7-2-7-8-3 8-3 2-7Zm6 1v4m-2-2h4"},
 {id:"bloodmoon",name:"The Blood Moonshire",type:"Mysterious region",color:"#e9aebb",symbol:"◇",x:73,y:47,description:"A more mysterious corner of the world, with the ominous beauty suggested by its name.",note:"Its inhabitants, local lore and encounters remain undisclosed.",status:"REGION",icon:"M20 15a9 9 0 0 1-11-11 9 9 0 1 0 11 11Zm-4-7 2-4 2 4-2 4-2-4Z"},
 {id:"heavenly",name:"The Heavenly Realm",type:"Celestial realm",color:"#f3e5c8",symbol:"○",x:83,y:15,description:"A celestial realm within Mythbound's world of fables, mythical beings and ordinary inhabitants.",note:"Its precise location, access requirements and points of interest are yet to be revealed.",status:"REALM",icon:"M2 16h20M5 16a7 7 0 0 1 14 0M12 3v3M4 6l2 2m14-2-2 2M8 20h8"},
 {id:"dunes",name:"The Wild Dunes",type:"Desert region",color:"#f2d39c",symbol:"◇",x:48,y:77,description:"A sprawling desert region, bringing a different landscape to the lands of Mythbound.",note:"Routes, settlements and hidden discoveries are still to be established.",status:"REGION",icon:"M2 17q5-8 10 0t10 0M4 21h16M18 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6"}
];
const previews={"greatfields":{"difficulty":"Beginner","rank":1,"art":"../mythbound-home-watercolor.jpg","artLabel":"Provisional landscape","description":"Rolling green meadows, welcoming villages and curious creatures await beneath brilliant skies. The GreatFields are where every new legend begins."},"fable":{"difficulty":"Easy","rank":2,"art":null,"description":"Deep beneath ancient canopies, tiny woodland villages and mischievous fable creatures hide among the roots. Follow a winding path and you might wander into a story of your own."},"wondrous":{"difficulty":"Moderate","rank":3,"art":null,"description":"A land of impossible paths, peculiar inhabitants and larger-than-life wonders. Here, curiosity is often a better compass than logic."},"dunes":{"difficulty":"Challenging","rank":4,"art":null,"description":"Beyond the golden dunes lie enchanted oases, splendid palaces and the mysteries of a thousand and one nights. Not every treasure is easily found."},"bloodmoon":{"difficulty":"Very challenging","rank":5,"art":"../BloodMoonshrineBackground.png","description":"In the haunting light of the blood moon, forgotten shrines and lantern-lit paths conceal spirits, mythical creatures and secrets best approached with care."},"heavenly":{"difficulty":"Unknown","rank":0,"art":"../HeavenlyRealmBackground.png","description":"Above the mortal world, celestial gardens and luminous sanctuaries rest among the clouds. The mysteries of this realm remain beyond the reach of ordinary travelers."}};
const landscapeSketches={"fable":"<rect width=\"720\" height=\"320\" fill=\"#739a87\"/><circle cx=\"470\" cy=\"91\" r=\"42\" fill=\"#e3d9a0\"/><path d=\"M0 218Q140 145 290 210T540 190T720 200V320H0\" fill=\"#416a59\"/><path d=\"M0 256Q165 207 320 260T720 232V320H0\" fill=\"#264e43\"/><g fill=\"#254538\"><path d=\"M40 0H90L111 205 83 228 62 211Z M590 0H635L648 225 609 241 580 210Z\"/><path d=\"M0 52Q90 -20 199 45T383 33L440 0H0Z M475 0Q560 87 720 44V0Z\"/></g><g fill=\"#d7c29a\" stroke=\"#405745\" stroke-width=\"2\"><path d=\"M210 235V191L248 164 286 191V235Z\"/><path d=\"M202 194L248 151 294 194Z\" fill=\"#926e55\"/><rect x=\"238\" y=\"211\" width=\"17\" height=\"24\" fill=\"#634b3e\"/></g><path d=\"M230 320Q338 270 248 236\" fill=\"none\" stroke=\"#cbb88b\" stroke-width=\"14\"/><g fill=\"#f2dca1\"><circle cx=\"141\" cy=\"150\" r=\"3\"/><circle cx=\"153\" cy=\"156\" r=\"2\"/><circle cx=\"546\" cy=\"189\" r=\"3\"/><circle cx=\"386\" cy=\"118\" r=\"2\"/></g>","wondrous":"<rect width=\"720\" height=\"320\" fill=\"#a8a2cf\"/><circle cx=\"520\" cy=\"72\" r=\"55\" fill=\"#f1dcc0\"/><path d=\"M0 213Q120 123 258 202T480 174T720 169V320H0\" fill=\"#807fa8\"/><path d=\"M0 247Q170 204 342 255T720 215V320H0\" fill=\"#698b8b\"/><path d=\"M122 320Q420 220 335 190T500 132\" stroke=\"#ead3aa\" stroke-width=\"17\" fill=\"none\"/><g fill=\"#d4b0c9\" stroke=\"#eee0ce\" stroke-width=\"2\"><path d=\"M278 181V97L302 62 326 97V181Z M335 177V117L359 87 382 117V177Z\"/><path d=\"M294 62L302 35 310 62Z\" fill=\"#e9c17e\"/><path d=\"M351 87L359 61 367 87Z\" fill=\"#e9c17e\"/></g><g fill=\"#bd769c\"><path d=\"M52 217Q18 166 85 159Q144 169 112 217Z\"/><path d=\"M590 240Q550 181 625 170Q704 182 662 240Z\"/></g><g fill=\"#e9d1c2\"><path d=\"M77 214H88L92 264H69Z M618 237H631L637 290H610Z\"/></g><g fill=\"#f7e8c9\"><circle cx=\"93\" cy=\"181\" r=\"5\"/><circle cx=\"66\" cy=\"193\" r=\"4\"/><circle cx=\"638\" cy=\"194\" r=\"6\"/><circle cx=\"605\" cy=\"211\" r=\"4\"/></g>","dunes":"<rect width=\"720\" height=\"320\" fill=\"#b99a86\"/><circle cx=\"542\" cy=\"91\" r=\"49\" fill=\"#f3d1a0\"/><path d=\"M0 211Q160 105 330 207T720 158V320H0\" fill=\"#bf956c\"/><path d=\"M0 273Q220 179 385 255T720 229V320H0\" fill=\"#d6b17f\"/><path d=\"M0 310Q160 270 340 300T720 270V320H0\" fill=\"#9d7256\"/><g fill=\"#755664\"><path d=\"M245 231V169H286V231Z M291 231V143H359V231Z M365 231V177H404V231Z\"/><path d=\"M291 143Q291 111 325 93Q359 111 359 143Z\"/><path d=\"M245 169Q265 138 286 169Z M365 177Q384 147 404 177Z\"/><path d=\"M231 231V112H241V231Z M409 231V101H419V231Z\"/></g><g fill=\"#405c57\"><path d=\"M125 275L133 201 141 275Z M133 207Q81 173 69 207Q113 186 133 207Q183 171 196 202Q158 188 133 207Z\"/><path d=\"M550 276L557 213 564 276Z M557 219Q516 188 503 219Q538 202 557 219Q598 184 614 216Q580 201 557 219Z\"/></g>"};
for(const r of regions)Object.assign(r,previews[r.id]);
// Regional encyclopedia: expandable data, independent of the map geometry and audio.
const regionLore={"greatfields":{"lore":"Wide fields and a bright sky invite travelers into the world of Mythbound. Here, the familiar comforts of village life meet the promise of adventure. The GreatFields form the starting region and the shared setting for the six base class backgrounds.","inhabitants":"The region is envisioned as lively, with grazing animals, curious creatures and village inhabitants. Individual species and characters are still to be introduced.","locations":[],"journal":[{"title":"The beginning of your journey","text":"The GreatFields are the confirmed starting area for Mythbound's six base classes."}]},"fable":{"lore":"The forest draws its spirit from childhood fables and enchanted woodland stories. Tiny villages, winding trails and ancient trees form a landscape meant to reward curiosity. The forest's hidden creatures and their stories will be explored as the region develops.","inhabitants":"Fable creatures and woodland inhabitants are central to this region's concept. Their individual designs and lore are not yet established.","locations":[],"journal":[]},"wondrous":{"lore":"Inspired by the impossible worlds of Wonderland and Oz, the Wondrous Lands are a place of playful contradictions, curious paths and unexpected discoveries. The region's peculiar logic is part of its identity.","inhabitants":"Whimsical beings and unusual characters belong to this region's vision. Individual inhabitants will be introduced in future entries.","locations":[],"journal":[]},"dunes":{"lore":"The Wild Dunes draw their enchantment from the legends and tales of the Arabian Nights. Golden sands, magical oases and splendid palaces set the stage for discoveries both beautiful and mysterious.","inhabitants":"The region's mythical beings and desert communities have yet to be defined.","locations":[],"journal":[]},"bloodmoon":{"lore":"The darkest of Mythbound's regions draws on Asian folklore and the haunting presence of spirits and mythical beings. Among its shadowed paths stands the Blood Moonshrine, tied to the forbidden magic of the Fallen Saint.","inhabitants":"Yokai-inspired spirits and mythical creatures are part of the region's concept. Specific species, settlements and encounters remain to be decided.","locations":[{"title":"The Blood Moonshrine","text":"The shrine associated with the Fallen Saint's pact with the Blood Moon. Its wider location details and encounters have yet to be revealed."}],"journal":[{"title":"When Heaven Remains Silent","text":"The Fallen Saint's class advancement story: forsaken by the heavens, the Saint seeks an answer at the Blood Moonshrine and makes a forbidden pact."}]},"heavenly":{"lore":"A celestial realm beyond the mortal world, imagined as a place of heavenly beauty and mystery. Divine magic and the Archsaint's calling are connected to the heavens; the nature of the realm and its access remain open.","inhabitants":"Celestial inhabitants are planned, but their appearance, culture and origins have not yet been established.","locations":[],"journal":[{"title":"When Heaven Answers","text":"The Archsaint's class advancement story is connected to a divine calling. Further regional story details are still to be revealed."}]}};
// Add individual city/settlement records to regionLore[id].locations:
// Special adventurer artwork uses separate portrait and full-body transparent PNGs.
regionLore.greatfields.locations.push({
 id:"greatfields-settlements",type:"settlement",title:"Cities & settlements",text:"Settlement entries forthcoming.",pending:true,
 npcs:[{id:"special-adventurer",name:"Little Adventurer",role:"Special NPC",description:"A young adventurer accompanied by Pipo.",portrait:"../special-adventurer-portrait.png",fullBody:"../special-adventurer-fullbody.png",location:"The GreatFields"}]
});
// {id, type:"city"|"settlement", title, text, npcs:[{id,name,portrait,fullBody,role,description,location,details:[{label,value}]}]}.
// Each city owns its NPC roster. Unrevealed cities show layout placeholders only.
// Creature entries accept transparent PNG art, and confirmed names, descriptions, and strength (1–5).
// These sample bestiary entries are explicitly provisional design suggestions, not established world lore.
const creatureConcepts={
 greatfields:[
  {name:"Meadow Hopper",description:"A small, quick-footed creature that bounds through the tall grass.",strength:1,form:"hopper"},
  {name:"Brambleback",description:"A sturdy field-dweller with a thorny coat and a surprisingly stubborn temper.",strength:2,form:"beast"},
  {name:"Windcrest",description:"A watchful winged creature that circles the hills before swooping down.",strength:3,form:"winged"}
 ],
 fable:[
  {name:"Mossling",description:"A tiny woodland creature that is easily mistaken for a patch of moss.",strength:1,form:"hopper"},
  {name:"Briar Sprite",description:"A mischievous inhabitant of tangled roots and brambles.",strength:2,form:"spirit"},
  {name:"Hollowwood Stalker",description:"A quiet creature that blends into the shadows of ancient trees.",strength:3,form:"beast"}
 ],
 wondrous:[
  {name:"Teacup Trickster",description:"A peculiar little creature that appears where it is least expected.",strength:2,form:"hopper"},
  {name:"Ribbonwing",description:"A fluttering wonder that drifts along impossible paths.",strength:3,form:"winged"},
  {name:"Mirrormask",description:"An elusive creature whose strange movements are difficult to anticipate.",strength:4,form:"spirit"}
 ],
 dunes:[
  {name:"Dune Skitter",description:"A swift desert creature that disappears beneath loose sand.",strength:2,form:"hopper"},
  {name:"Oasis Wisp",description:"An elusive glow that flickers between pools and palms.",strength:3,form:"spirit"},
  {name:"Sandstone Prowler",description:"A heavy creature whose rough hide resembles weathered stone.",strength:4,form:"beast"}
 ],
 bloodmoon:[
  {name:"Lantern Wisp",description:"A wandering spirit glimpsed along moonlit paths.",strength:3,form:"spirit"},
  {name:"Shrine Watcher",description:"A silent figure that lingers near forgotten sacred places.",strength:4,form:"winged"},
  {name:"Crimson Stalker",description:"A formidable creature that emerges from the shadows under the blood moon.",strength:5,form:"beast"}
 ],
 heavenly:[
  {name:"Cloudling",description:"A drifting creature glimpsed among the clouds.",strength:2,form:"spirit"},
  {name:"Halo Wing",description:"A luminous winged being that glides through the celestial realm.",strength:3,form:"winged"},
  {name:"Ivory Guardian",description:"An imposing figure standing watch over heavenly sanctuaries.",strength:5,form:"beast"}
 ]
};
const bestiary={}; // Confirmed entries by region: {creatures:[{name,description,strength,art,form}],boss:{silhouette}}.
const creatureShapes={
 hopper:'<path d="M36 74Q22 57 31 43Q21 26 29 12Q43 16 49 36Q57 29 65 35Q71 13 85 11Q94 25 80 47Q96 64 82 78Q102 90 89 101H25Q17 90 36 74Z"/><circle cx="86" cy="70" r="10"/>',
 beast:'<path d="M16 69Q7 47 23 39L37 23 43 39 60 27 70 42Q91 37 106 52L117 43 111 66 100 77 103 100H91L82 79 59 81 53 101H40L39 78 27 100H15L20 77Z"/>',
 winged:'<path d="M64 40L55 21 69 30 81 20 76 42Q91 35 117 11L109 51 118 62 87 72 76 90 91 105 65 98 40 108 50 90 40 72 10 61 21 46 8 11 42 36Z"/>',
 spirit:'<path d="M69 8Q91 29 88 43Q108 59 98 80Q88 92 65 97L48 113 50 94Q22 90 24 73Q17 56 43 43Q41 27 69 8Z"/>',
 boss:'<path d="M9 103L18 73 7 45 29 54 32 25 46 42 53 31 46 5 66 23 81 4 77 32 86 43 102 24 99 52 121 41 111 74 120 103 99 103 86 84 81 101H48L42 84 28 103Z"/>'
};
const find=id=>regions.find(r=>r.id===id);
let selected="greatfields";
const make=(tag,cls,value)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(value!==undefined)node.textContent=value;return node};
function emblem(region){
 const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("fill","none");svg.setAttribute("stroke","currentColor");svg.setAttribute("stroke-width","1.2");svg.setAttribute("stroke-linecap","round");svg.setAttribute("stroke-linejoin","round");svg.setAttribute("aria-hidden","true");
 const path=document.createElementNS(svg.namespaceURI,"path");path.setAttribute("d",region.icon);svg.append(path);return svg;
}
const preview=$("mw-region-preview");
let opener=null;
function previewPlacement(anchor,width,height,vw,vh,header=0){
 const gap=12,pad=10,topEdge=Math.max(pad,header+pad),bottomEdge=vh-pad;
 const clamp=(v,min,max)=>Math.max(min,Math.min(v,Math.max(min,max)));
 const sideY=clamp(anchor.top+(anchor.height-height)/2,topEdge,bottomEdge-height);
 const centeredX=clamp(anchor.left+(anchor.width-width)/2,pad,vw-pad-width);
 const right=anchor.right+gap,left=anchor.left-gap-width,below=anchor.bottom+gap,above=anchor.top-gap-height;
 // Prefer a side on wide screens; on phones use the available space above or below.
 if(vw>600){
  const preferRight=vw-anchor.right>=anchor.left;
  if(preferRight&&right+width<=vw-pad)return {x:right,y:sideY};
  if(left>=pad)return {x:left,y:sideY};
  if(right+width<=vw-pad)return {x:right,y:sideY};
 }
 if(below+height<=bottomEdge)return {x:centeredX,y:below};
 if(above>=topEdge)return {x:centeredX,y:above};
 // On short screens constrain the card to the side with more usable vertical space.
 const down=bottomEdge-below,up=anchor.top-gap-topEdge;
 const useBelow=down>=up,available=Math.max(0,useBelow?down:up);
 if(available>=100)return {x:centeredX,y:useBelow?below:topEdge,maxHeight:available};
 return {x:centeredX,y:clamp(useBelow?below:above,topEdge,bottomEdge-height)};
}
function headerBottom(){
 const header=document.querySelector(".site-header");
 return header?Math.max(0,header.getBoundingClientRect().bottom):0;
}
function positionFloating(card,trigger,close){
 if(!trigger)return;
 const anchor=trigger.getBoundingClientRect(),vw=document.documentElement.clientWidth,vh=window.innerHeight;
 if(!trigger.isConnected||anchor.bottom<headerBottom()||anchor.top>vh||anchor.right<0||anchor.left>vw){close();return}
 card.style.maxHeight="";
 const size=card.getBoundingClientRect();
 const pos=previewPlacement(anchor,size.width,size.height,vw,vh,headerBottom());
 if(pos.maxHeight)card.style.maxHeight=pos.maxHeight+"px";
 card.style.left=Math.round(pos.x)+"px";card.style.top=Math.round(pos.y)+"px";
}
function positionPreview(){positionFloating(preview,opener,closePreview)}
function closePreview(restore=false){
 if(!opener)return;
 const old=opener;opener=null;old.setAttribute("aria-expanded","false");
 if(typeof preview.hidePopover==="function"){if(preview.matches(":popover-open"))preview.hidePopover()}else preview.hidden=true;
 if(restore)old.focus({preventScroll:true});
}
function renderLandscape(landscape,r){
 landscape.replaceChildren();
 function fallback(){landscape.replaceChildren();if(landscapeSketches[r.id]){landscape.innerHTML='<svg viewBox="0 0 720 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+landscapeSketches[r.id]+'</svg>';}else{landscape.append(emblem(r));}landscape.append(make("span","mw-preview-artnote",landscapeSketches[r.id]?"Landscape concept · placeholder":"Landscape forthcoming"));}
 if(r.art){const img=make("img");img.alt=r.name+" landscape";img.addEventListener("error",()=>{if(landscape.contains(img))fallback()},{once:true});img.src=r.art;landscape.append(img);if(r.artLabel)landscape.append(make("span","mw-preview-artnote",r.artLabel));}else fallback();
}
function openPreview(id,trigger,{sound=false}={}){
 const r=find(id);if(!r||!preview)return;
 const anchor=trigger instanceof HTMLElement?trigger:markers.querySelector('[data-atlas-region="'+id+'"]');
 if(!anchor)return;
 if(opener===anchor){closePreview();return}
 if(opener)closePreview();
 choose(id,{sound});opener=anchor;opener.setAttribute("aria-expanded","true");
 preview.style.setProperty("--region-accent",r.color);
 $("mw-preview-type").textContent=r.type;
 $("mw-preview-title").textContent=r.name;
 $("mw-preview-description").textContent=r.description;
 $("mw-preview-difficulty").textContent=r.difficulty;
 const dots=$("mw-preview-dots");dots.replaceChildren();
 for(let i=1;i<=5;i++)dots.append(make("span",i<=r.rank?"is-filled":""));
 dots.hidden=!r.rank;
 renderLandscape($("mw-preview-landscape"),r);
 preview.style.left="0px";preview.style.top="0px";
 if(typeof preview.showPopover==="function"){preview.showPopover()}else preview.hidden=false;
 positionPreview();
}
if(preview){
 // Native manual popover is non-modal and in the top layer, avoiding atlas clipping.
 if(typeof preview.showPopover!=="function"){preview.removeAttribute("popover");preview.hidden=true;document.body.append(preview)}
 $("mw-preview-close").addEventListener("click",()=>closePreview(true));
 $("mw-preview-guide").addEventListener("click",()=>{closePreview();showTab("region");scrollToRegionBanner()});
 document.addEventListener("pointerdown",e=>{
  if(!opener||preview.contains(e.target)||opener.contains(e.target))return;
  const terrain=e.target.closest?.("[data-terrain]");
  // A region surface and its icon share one preview toggle and anchor.
  if(terrain?.dataset.terrain===opener.dataset.atlasRegion)return;
  closePreview();
 },true);
 document.addEventListener("keydown",e=>{if(opener&&e.key==="Escape"){e.preventDefault();closePreview(true)}});
 window.addEventListener("resize",positionPreview);
 window.addEventListener("scroll",positionPreview,{passive:true});
 if(typeof MutationObserver!=="undefined")new MutationObserver(()=>{if(world.hidden)closePreview()}).observe(world,{attributes:true,attributeFilter:["hidden"]});
}
function scrollToRegionBanner(){
 const target=$("mw-region-interface");
 if(!target)return;
 const top=window.scrollY+target.getBoundingClientRect().top-headerBottom()-10;
 window.scrollTo({top:Math.max(0,top),behavior:(window.MythboundPreferences?.reduced()??matchMedia("(prefers-reduced-motion: reduce)").matches)?"instant":"smooth"});
}
let activeTab="region";
const tabs=$("mw-codex-tabs"),body=$("mw-codex-panel");
const sections=["region","locations","creatures","journal"];
function choose(id,{sound=false}={}){
 const r=find(id);if(!r)return;
 const changed=selected!==id;
 selected=id;
 if(sound)window.MythboundRegionAudio?.play(id);
 world.querySelectorAll("[data-atlas-region]").forEach(b=>{
  const on=b.dataset.atlasRegion===id;b.classList.toggle("is-active",on);b.setAttribute("aria-pressed",String(on))
 });
 world.querySelectorAll("[data-terrain]").forEach(p=>p.classList.toggle("is-active",p.dataset.terrain===id));
 location.style.setProperty("--region-accent",r.color);
 $("mw-codex-type").textContent=r.type;
 $("mw-codex-name").textContent=r.name;
 $("mw-codex-difficulty").textContent="Area difficulty · "+r.difficulty+" (provisional)";
 if(changed||!$("mw-codex-landscape").children.length)renderLandscape($("mw-codex-landscape"),r);
 showTab(changed?"region":activeTab);
}
function card(title,description,kind=""){
 const article=make("article","mw-codex-entry"+(kind?" "+kind:""));
 article.append(make("h4","",title),make("p","",description));return article;
}
// Non-modal NPC previews use the same anchored positioning and visual language as map regions.
const npcDialog=make("div","mw-npc-preview");npcDialog.id="mw-npc-preview";
npcDialog.setAttribute("role","dialog");npcDialog.setAttribute("aria-labelledby","mw-npc-title");
npcDialog.setAttribute("popover","manual");
const npcClose=make("button","mw-preview-close");npcClose.type="button";npcClose.setAttribute("aria-label","Close NPC profile");
npcClose.innerHTML='<svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>';
const npcContent=make("div","mw-preview-body mw-npc-content");npcDialog.append(npcClose,npcContent);document.body.append(npcDialog);
if(typeof npcDialog.showPopover!=="function"){npcDialog.removeAttribute("popover");npcDialog.hidden=true}
let npcOpener=null;
function closeNPC(restore=false){
 if(!npcOpener)return;
 const old=npcOpener;npcOpener=null;old.setAttribute("aria-expanded","false");
 if(typeof npcDialog.hidePopover==="function"){if(npcDialog.matches(":popover-open"))npcDialog.hidePopover()}else npcDialog.hidden=true;
 if(restore&&old.isConnected)old.focus({preventScroll:true});
}
function positionNPC(){positionFloating(npcDialog,npcOpener,closeNPC)}
npcClose.addEventListener("click",()=>closeNPC(true));
document.addEventListener("pointerdown",e=>{if(npcOpener&&!npcDialog.contains(e.target)&&!npcOpener.contains(e.target))closeNPC()},true);
document.addEventListener("keydown",e=>{if(npcOpener&&e.key==="Escape"){e.preventDefault();closeNPC(true)}});
window.addEventListener("resize",positionNPC);
window.addEventListener("scroll",positionNPC,{passive:true});
if(typeof MutationObserver!=="undefined")new MutationObserver(()=>{if(world.hidden)closeNPC()}).observe(world,{attributes:true,attributeFilter:["hidden"]});
function npcPortrait(npc){
 const face=make("span","mw-npc-portrait");
 const placeholder=make("span","mw-npc-silhouette");placeholder.setAttribute("aria-hidden","true");placeholder.innerHTML='<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><circle cx="32" cy="23" r="12"/><path d="M9 59c0-15 9-25 23-25s23 10 23 25Z"/></svg>';face.append(placeholder);
 if(npc?.portrait){const img=make("img");img.alt="";img.loading="lazy";img.addEventListener("load",()=>placeholder.hidden=true,{once:true});img.addEventListener("error",()=>img.remove(),{once:true});img.src=npc.portrait;face.append(img)}
 return face;
}
function openNPC(npc,r,trigger,keyboard=false){
 if(npcOpener===trigger){closeNPC();return}
 if(npcOpener)closeNPC();
 closePreview();
 npcOpener=trigger;trigger.setAttribute("aria-expanded","true");
 npcDialog.style.setProperty("--region-accent",r.color);npcDialog.style.setProperty("--npc-accent",r.color);npcContent.replaceChildren();
 const title=make("h2","",npc?.name||"Yet to be revealed");title.id="mw-npc-title";
 const portrait=make("div","mw-npc-preview-art");
 if(npc?.fullBody){
  portrait.classList.add("has-fullbody");
  const img=make("img","mw-npc-fullbody");img.alt="Full-body illustration of "+npc.name;
  img.addEventListener("load",()=>positionNPC(),{once:true});
  img.addEventListener("error",()=>{portrait.classList.remove("has-fullbody");portrait.replaceChildren(npcPortrait(npc));positionNPC()},{once:true});
  img.src=npc.fullBody;portrait.append(img);
 }else portrait.append(npcPortrait(npc));
 npcContent.append(portrait,make("span","mw-kicker mw-npc-kicker",r.name),title);
 if(npc?.role)npcContent.append(make("p","mw-npc-role",npc.role));
 npcContent.append(make("p","mw-npc-description",npc?.description||"This character has not been introduced yet."));
 const fields=[...(npc?.location?[{label:"Location",value:npc.location}]:[]),...(npc?.details||[])];
 if(fields.length){const dl=make("dl","mw-npc-details");for(const f of fields){dl.append(make("dt","",f.label),make("dd","",f.value))}npcContent.append(dl)}
 npcDialog.style.left="0px";npcDialog.style.top="0px";
 if(typeof npcDialog.showPopover==="function")npcDialog.showPopover();else npcDialog.hidden=false;
 positionNPC();if(keyboard&&npcOpener)npcClose.focus({preventScroll:true});
}
function renderNPCs(r,city,container){
 const roster=city.npcs||[];
 container.append(make("h5","mw-city-npc-heading","NPCs"));
 const gallery=make("div","mw-npc-gallery");gallery.setAttribute("role","group");gallery.setAttribute("aria-label","NPCs in "+city.title);
 const entries=[...roster,...Array.from({length:Math.max(0,6-roster.length)},()=>null)];
 entries.forEach((npc,i)=>{
  const name=npc?.name||"Coming soon";
  const btn=make("button","mw-npc-tile"+(npc?"":" is-pending"));btn.type="button";btn.setAttribute("aria-haspopup","dialog");btn.setAttribute("aria-controls","mw-npc-preview");btn.setAttribute("aria-expanded","false");btn.setAttribute("aria-label",npc?name:"Unrevealed NPC slot "+(i+1));btn.append(npcPortrait(npc),make("span","mw-npc-name",name));
  btn.addEventListener("click",e=>openNPC(npc?{...npc,location:npc.location||city.title}:null,r,btn,e.detail===0));gallery.append(btn);
 });
 container.append(gallery);
 if(!roster.length)container.append(make("p","mw-npc-empty","Character profiles will be revealed as the world unfolds."));
}
function renderLocations(r,lore){
 body.append(make("h4","mw-codex-panel-heading","Places to discover"));
 const list=make("div","mw-location-list");
 const cities=lore.locations.filter(item=>["city","settlement","village","town"].includes(item.type));
 const others=lore.locations.filter(item=>!cities.includes(item));
 const cityEntries=cities.length?cities:[{title:"Cities & settlements",text:"Settlement entries forthcoming.",npcs:[],pending:true}];
 for(const city of cityEntries){
  const overview=card(city.title,city.text,"mw-city-overview"+(city.pending?" is-pending":""));
  renderNPCs(r,city,overview);list.append(overview);
 }
 const secondary=make("div","mw-codex-entries mw-other-locations");
 for(const item of others)secondary.append(card(item.title,item.text));
 for(const [title,desc] of [["Dungeons & raids","Encounter entries forthcoming."],["Landmarks & hidden places","Discovery entries forthcoming."]])secondary.append(card(title,desc,"is-pending"));
 list.append(secondary);body.append(list);
}
function creatureArt(entry,boss=false){
 const art=make("div","mw-creature-art"+(boss?" is-boss-art":""));
 const shape=make("span","mw-creature-placeholder");shape.setAttribute("aria-hidden","true");
 shape.innerHTML='<svg viewBox="0 0 128 120" fill="currentColor" aria-hidden="true">'+(creatureShapes[boss?"boss":entry.form]||creatureShapes.beast)+'</svg>';
 art.append(shape);
 const src=boss?entry?.silhouette:entry?.art;
 if(src){
  const img=make("img");img.alt=boss?"Unrevealed boss silhouette":entry.name;img.loading="lazy";
  img.addEventListener("load",()=>shape.hidden=true,{once:true});
  img.addEventListener("error",()=>{img.remove();shape.hidden=false},{once:true});
  img.src=src;art.append(img);
 }
 if(!boss&&!src)art.append(make("span","mw-creature-art-label","Art pending"));
 return art;
}
function strengthMeter(strength){
 const value=Number.isFinite(strength)?Math.max(1,Math.min(5,Math.round(strength))):0;
 const meter=make("div","mw-creature-strength");meter.append(make("span","mw-strength-label","Strength"));
 const dots=make("span","mw-strength-dots");dots.setAttribute("role","img");dots.setAttribute("aria-label",value?value+" out of 5":"Not yet rated");
 for(let i=1;i<=5;i++){const dot=make("span","difficulty-dot"+(i<=value?" is-filled":""));dot.setAttribute("aria-hidden","true");dots.append(dot)}
 meter.append(dots);return meter;
}
function renderCreatures(r){
 const data=bestiary[r.id],provisional=!data;
 const entries=(data?.creatures||creatureConcepts[r.id]||[]).slice(0,3);
 body.append(make("h4","mw-codex-panel-heading","Creatures and Enemies of the Region"));
 if(provisional)body.append(make("p","mw-creature-concept-note","Concept previews · names, strength and artwork provisional"));
 const list=make("div","mw-creature-list");
 for(const entry of entries){
  const row=make("article","mw-creature-row");
  const copy=make("div","mw-creature-copy");
  copy.append(make("h5","",entry.name),make("p","",entry.description),strengthMeter(entry.strength));
  row.append(creatureArt(entry),copy);list.append(row);
 }
 const boss=make("article","mw-creature-row mw-boss-row"),bossCopy=make("div","mw-creature-copy");
 bossCopy.append(make("span","mw-boss-kicker","Boss"),make("h5","","???"));
 boss.append(creatureArt(data?.boss||{},true),bossCopy);list.append(boss);
 body.append(list,make("p","mw-creature-more","And much more…"));
}
function showTab(key){
 if(!sections.includes(key))return;
 closeNPC();
 activeTab=key;const r=find(selected),lore=regionLore[selected];
 if(!r||!lore)return;
 tabs.querySelectorAll("[data-region-tab]").forEach(b=>{
  const on=b.dataset.regionTab===key;b.setAttribute("aria-selected",String(on));b.tabIndex=on?0:-1;
 });
 body.setAttribute("aria-labelledby","mw-tab-"+key);
 body.replaceChildren();
 if(key==="region"){
  const intro=make("div","mw-codex-overview");
  intro.append(make("h4","","About "+r.name),make("p","",r.description),make("h4","","Regional lore"),make("p","",lore.lore));
  const next=make("button","outline-action mw-codex-next","Discover locations");next.type="button";next.addEventListener("click",()=>{showTab("locations");$("mw-tab-locations").focus({preventScroll:true})});intro.append(next);body.append(intro);
 }else if(key==="locations"){
  renderLocations(r,lore);
 }else if(key==="creatures"){
  renderCreatures(r);
 }else{
  body.append(make("h4","mw-codex-panel-heading","Regional journal"),make("p","mw-codex-intro","Follow the stories, discoveries and events of this land."));
  const list=make("div","mw-codex-journal");
  for(const item of lore.journal)list.append(card(item.title,item.text));
  list.append(card("More stories to come","Additional story beats and events will be added as the chronicles unfold.","is-pending"));body.append(list);
 }
}
for(const b of tabs.querySelectorAll("[data-region-tab]")){
 b.addEventListener("click",()=>showTab(b.dataset.regionTab));
 b.addEventListener("keydown",e=>{
  let i=sections.indexOf(b.dataset.regionTab);
  if(e.key==="ArrowRight")i=(i+1)%sections.length;else if(e.key==="ArrowLeft")i=(i+sections.length-1)%sections.length;else if(e.key==="Home")i=0;else if(e.key==="End")i=sections.length-1;else return;
  e.preventDefault();showTab(sections[i]);$("mw-tab-"+sections[i]).focus();
 });
}
// Directory order follows the fictional News announcement chronology (first two share a date).
// Keep map marker order and coordinates independent.
const releaseOrder=["greatfields","dunes","heavenly","fable","bloodmoon","wondrous"];
for(const r of releaseOrder.map(find).filter(Boolean)){
 const btn=make("button","mw-location-tab",r.name);btn.type="button";btn.dataset.atlasRegion=r.id;btn.style.setProperty("--region-accent",r.color);btn.setAttribute("aria-pressed","false");
 btn.addEventListener("click",()=>{closePreview();choose(r.id);showTab("region")});directory.append(btn);
}
const terrainById=new Map([...world.querySelectorAll(".mw-terrain [data-terrain]")].map(path=>[path.dataset.terrain,path]));
for(const r of regions){
 const pin=make("button","mw-map-pin");pin.type="button";pin.dataset.atlasRegion=r.id;
 pin.style.setProperty("--pin-x",r.x+"%");pin.style.setProperty("--pin-y",r.y+"%");pin.style.setProperty("--region-accent",r.color);
 pin.setAttribute("aria-haspopup","dialog");pin.setAttribute("aria-expanded","false");pin.setAttribute("aria-controls","mw-region-preview");pin.setAttribute("aria-label","Explore "+r.name);pin.setAttribute("aria-pressed","false");
 const symbol=make("span","mw-pin-symbol",r.symbol);symbol.setAttribute("aria-hidden","true");
 const label=make("span","mw-pin-label",r.name);pin.append(symbol,label);pin.addEventListener("click",()=>openPreview(r.id,pin,{sound:true}));markers.append(pin);
 const terrain=terrainById.get(r.id);
 if(!terrain)continue;
 terrain.style.setProperty("--region-accent",r.color);
 const highlight=on=>{terrain.classList.toggle("is-hovered",on);pin.classList.toggle("is-hovered",on)};
 for(const target of [terrain,pin]){
  target.addEventListener("pointerenter",e=>{if(e.pointerType!=="touch")highlight(true)});
  target.addEventListener("pointerleave",()=>highlight(false));
  target.addEventListener("pointercancel",()=>highlight(false));
 }
 pin.addEventListener("focus",()=>terrain.classList.add("is-focused"));
 pin.addEventListener("blur",()=>terrain.classList.remove("is-focused"));
 // Keep one accessible keyboard button per region. Pointer clicks anywhere in
 // the SVG land shape use the exact same behavior and marker-anchored preview.
 terrain.addEventListener("click",()=>openPreview(r.id,pin,{sound:true}));
}
// Both map surfaces and marker buttons open the preview and play the regional cue.
choose(selected);
})();

/* Mythbound's preliminary atlas. Replace the map artwork and coordinates independently of the region entries. */
(()=>{
"use strict";
const world=document.getElementById("page-discover");
if(!world)return;
const $=id=>document.getElementById(id);
const markers=$("mw-map-markers"),directory=$("mw-region-directory"),detail=$("mw-region-detail"),location=$("mw-location-region");
if(!markers||!directory||!detail||!location)return;
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
function positionPreview(){
 if(!opener)return;
 const anchor=opener.getBoundingClientRect(),vw=document.documentElement.clientWidth,vh=window.innerHeight;
 if(anchor.bottom<0||anchor.top>vh||anchor.right<0||anchor.left>vw){closePreview();return}
 const header=document.querySelector(".site-header");
 const headerBottom=header?Math.max(0,header.getBoundingClientRect().bottom):0;
 preview.style.maxHeight="";
 const size=preview.getBoundingClientRect();
 const pos=previewPlacement(anchor,size.width,size.height,vw,vh,headerBottom);
 if(pos.maxHeight)preview.style.maxHeight=pos.maxHeight+"px";
 preview.style.left=Math.round(pos.x)+"px";preview.style.top=Math.round(pos.y)+"px";
}
function closePreview(restore=false){
 if(!opener)return;
 const old=opener;opener=null;old.setAttribute("aria-expanded","false");
 if(typeof preview.hidePopover==="function"){if(preview.matches(":popover-open"))preview.hidePopover()}else preview.hidden=true;
 if(restore)old.focus({preventScroll:true});
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
 const landscape=$("mw-preview-landscape");landscape.replaceChildren();
 function fallback(){landscape.replaceChildren();if(landscapeSketches[id]){landscape.innerHTML='<svg viewBox="0 0 720 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+landscapeSketches[id]+'</svg>';}else{landscape.append(emblem(r));}landscape.append(make("span","mw-preview-artnote",landscapeSketches[id]?"Landscape concept · placeholder":"Landscape forthcoming"));}
 if(r.art){const img=make("img");img.alt=r.name+" landscape";img.addEventListener("error",()=>{if(landscape.contains(img))fallback()},{once:true});img.src=r.art;landscape.append(img);if(r.artLabel)landscape.append(make("span","mw-preview-artnote",r.artLabel));}else fallback();
 preview.style.left="0px";preview.style.top="0px";
 if(typeof preview.showPopover==="function"){preview.showPopover()}else preview.hidden=false;
 positionPreview();
}
if(preview){
 // Native manual popover is non-modal and in the top layer, avoiding atlas clipping.
 if(typeof preview.showPopover!=="function"){preview.removeAttribute("popover");preview.hidden=true;document.body.append(preview)}
 $("mw-preview-close").addEventListener("click",()=>closePreview(true));
 $("mw-preview-guide").addEventListener("click",()=>{closePreview();moveTo($("mw-locations"))});
 document.addEventListener("pointerdown",e=>{if(opener&&!preview.contains(e.target)&&!opener.contains(e.target))closePreview()},true);
 document.addEventListener("keydown",e=>{if(opener&&e.key==="Escape"){e.preventDefault();closePreview(true)}});
 window.addEventListener("resize",positionPreview);
 window.addEventListener("scroll",positionPreview,{passive:true});
 if(typeof MutationObserver!=="undefined")new MutationObserver(()=>{if(world.hidden)closePreview()}).observe(world,{attributes:true,attributeFilter:["hidden"]});
}
function moveTo(el){el.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"})}
function choose(id,{scroll=false,sound=false}={}){
 const r=find(id);if(!r)return;
 selected=id;
 if(sound)window.MythboundRegionAudio?.play(id);
 world.querySelectorAll("[data-atlas-region]").forEach(b=>{
  const on=b.dataset.atlasRegion===id;b.classList.toggle("is-active",on);b.setAttribute("aria-pressed",String(on))
 });
 world.querySelectorAll("[data-terrain]").forEach(p=>p.classList.toggle("is-active",p.dataset.terrain===id));
 detail.style.setProperty("--region-accent",r.color);
 location.style.setProperty("--region-accent",r.color);
 for(const entry of world.querySelectorAll("[data-region-panel]")){
  const on=entry.dataset.regionPanel===id;
  entry.classList.toggle("is-current",on);
  entry.setAttribute("aria-hidden",String(!on));
 }
 if(scroll){
  requestAnimationFrame(()=>{
   const atlas=world.querySelector(".mw-atlas"),header=document.querySelector(".site-header");
   if(!atlas)return;
   const headerBottom=header?Math.max(0,header.getBoundingClientRect().bottom):0;
   const top=Math.max(0,window.scrollY+atlas.getBoundingClientRect().top-headerBottom-10);
   window.scrollTo({top,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
  });
 }
}
// Stack every region's content in the same grid cell. The tallest entry reserves
// space at the current screen width; switching only visibility cannot cause reflow.
function initStableDetails(){
 const symbols=make("div","mw-detail-symbol-stack mw-region-stack");
 const copies=make("div","mw-detail-copy-stack mw-region-stack");
 const headings=make("div","mw-location-stack mw-region-stack");
 function panel(node,r){
  node.dataset.regionPanel=r.id;
  node.style.setProperty("--region-accent",r.color);
  node.setAttribute("aria-hidden","true");
  return node;
 }
 const tabs=make("div","mw-location-tabs");tabs.setAttribute("role","group");tabs.setAttribute("aria-label","Filter by region");
 for(const r of regions){
  const art=panel(make("div","mw-detail-symbol"),r);art.append(emblem(r));symbols.append(art);
  const copy=panel(make("div","mw-detail-copy"),r);
  copy.append(make("span","mw-kicker",r.type),make("h3","",r.name),make("p","",r.description),make("p","mw-region-note",r.note));copies.append(copy);
  const heading=panel(make("div","mw-location-current"),r);
  heading.append(make("span","mw-kicker","Exploring"),make("h3","",r.name),make("p","",r.note));headings.append(heading);
  const btn=make("button","mw-location-tab",r.name);btn.type="button";btn.dataset.atlasRegion=r.id;btn.style.setProperty("--region-accent",r.color);btn.setAttribute("aria-pressed","false");
  btn.addEventListener("click",()=>{closePreview();choose(r.id)});tabs.append(btn);
 }
 const guide=make("button","outline-action mw-detail-guide","View location guide");guide.type="button";guide.addEventListener("click",()=>moveTo($("mw-locations")));
 detail.replaceChildren(symbols,copies,guide);
 location.replaceChildren(tabs,headings);
}
initStableDetails();
for(const r of regions){
 const pin=make("button","mw-map-pin");pin.type="button";pin.dataset.atlasRegion=r.id;
 pin.style.setProperty("--pin-x",r.x+"%");pin.style.setProperty("--pin-y",r.y+"%");pin.style.setProperty("--region-accent",r.color);
 pin.setAttribute("aria-haspopup","dialog");pin.setAttribute("aria-expanded","false");pin.setAttribute("aria-controls","mw-region-preview");pin.setAttribute("aria-label","Explore "+r.name);pin.setAttribute("aria-pressed","false");
 const symbol=make("span","mw-pin-symbol",r.symbol);symbol.setAttribute("aria-hidden","true");
 const label=make("span","mw-pin-label",r.name);pin.append(symbol,label);pin.addEventListener("click",()=>openPreview(r.id,pin,{sound:true}));markers.append(pin);
 const card=make("article","mw-region mw-region-entry");card.style.setProperty("--region-accent",r.color);
 const art=make("div","mw-region-art");art.append(emblem(r));
 const content=make("div","mw-region-copy");
 const button=make("button","mw-region-open","Explore region");button.type="button";button.dataset.atlasRegion=r.id;button.setAttribute("aria-label","Explore "+r.name);button.setAttribute("aria-pressed","false");button.setAttribute("aria-haspopup","dialog");button.setAttribute("aria-expanded","false");button.setAttribute("aria-controls","mw-region-preview");button.addEventListener("click",()=>openPreview(r.id,button));
 content.append(make("span","mw-kicker",r.type),make("h3","",r.name),make("p","",r.description),button);card.append(art,content);directory.append(card);
}
world.querySelectorAll("[data-terrain]").forEach(path=>path.addEventListener("click",()=>openPreview(path.dataset.terrain,path,{sound:true})));
choose(selected);
})();

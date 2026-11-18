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
const find=id=>regions.find(r=>r.id===id);
let selected="greatfields";
const make=(tag,cls,value)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(value!==undefined)node.textContent=value;return node};
function emblem(region){
 const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("fill","none");svg.setAttribute("stroke","currentColor");svg.setAttribute("stroke-width","1.2");svg.setAttribute("stroke-linecap","round");svg.setAttribute("stroke-linejoin","round");svg.setAttribute("aria-hidden","true");
 const path=document.createElementNS(svg.namespaceURI,"path");path.setAttribute("d",region.icon);svg.append(path);return svg;
}
function moveTo(el){el.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"})}
function choose(id,{scroll=false}={}){
 const r=find(id);if(!r)return;
 selected=id;
 world.querySelectorAll("[data-atlas-region]").forEach(b=>{
  const on=b.dataset.atlasRegion===id;b.classList.toggle("is-active",on);b.setAttribute("aria-pressed",String(on))
 });
 world.querySelectorAll("[data-terrain]").forEach(p=>p.classList.toggle("is-active",p.dataset.terrain===id));
 detail.style.setProperty("--region-accent",r.color);
 const art=make("div","mw-detail-symbol");art.append(emblem(r));
 const copy=make("div","mw-detail-copy");
 copy.append(make("span","mw-kicker",r.type),make("h3","",r.name),make("p","",r.description),make("p","mw-region-note",r.note));
 const guide=make("button","outline-action mw-detail-guide","View location guide");guide.type="button";guide.addEventListener("click",()=>moveTo($("mw-locations")));
 detail.replaceChildren(art,copy,guide);
 location.style.setProperty("--region-accent",r.color);
 const locationHeading=make("div","mw-location-current");
 locationHeading.append(make("span","mw-kicker","Exploring"),make("h3","",r.name),make("p","",r.note));
 const tabs=make("div","mw-location-tabs");tabs.setAttribute("role","group");tabs.setAttribute("aria-label","Filter by region");
 for(const v of regions){
  const btn=make("button","mw-location-tab",v.name);btn.type="button";btn.dataset.atlasRegion=v.id;btn.classList.toggle("is-active",v.id===id);btn.setAttribute("aria-pressed",String(v.id===id));btn.addEventListener("click",()=>{choose(v.id);location.querySelector('[data-atlas-region="'+v.id+'"]')?.focus({preventScroll:true})});tabs.append(btn)
 }
 location.replaceChildren(tabs,locationHeading);
 if(scroll)moveTo($("mw-atlas"));
}
for(const r of regions){
 const pin=make("button","mw-map-pin");pin.type="button";pin.dataset.atlasRegion=r.id;
 pin.style.setProperty("--pin-x",r.x+"%");pin.style.setProperty("--pin-y",r.y+"%");pin.style.setProperty("--region-accent",r.color);
 pin.setAttribute("aria-label","Explore "+r.name);pin.setAttribute("aria-pressed","false");
 const symbol=make("span","mw-pin-symbol",r.symbol);symbol.setAttribute("aria-hidden","true");
 const label=make("span","mw-pin-label",r.name);pin.append(symbol,label);pin.addEventListener("click",()=>choose(r.id));markers.append(pin);
 const card=make("article","mw-region mw-region-entry");card.style.setProperty("--region-accent",r.color);
 const art=make("div","mw-region-art");art.append(emblem(r));
 const content=make("div","mw-region-copy");
 const button=make("button","mw-region-open","Explore region");button.type="button";button.dataset.atlasRegion=r.id;button.setAttribute("aria-label","Explore "+r.name);button.setAttribute("aria-pressed","false");button.addEventListener("click",()=>choose(r.id,{scroll:true}));
 content.append(make("span","mw-kicker",r.type),make("h3","",r.name),make("p","",r.description),button);card.append(art,content);directory.append(card);
}
world.querySelectorAll("[data-terrain]").forEach(path=>path.addEventListener("click",()=>choose(path.dataset.terrain)));
choose(selected);
})();

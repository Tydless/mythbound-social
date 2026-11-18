/* Inventory and floor-plan editor. Coordinates use the same world units as Babylon. */
(()=>{
"use strict";
const catalog=[
 {id:"plant",name:"Potted plant",icon:"♧",qty:2,w:.5,d:.5,color:"#79a58a"},
 {id:"chair",name:"Lounge chair",icon:"▣",qty:1,w:1,d:1,color:"#a999bd"},
 {id:"table",name:"Coffee table",icon:"▤",qty:1,w:1.5,d:.5,color:"#c3a585"},
 {id:"lamp",name:"Floor lamp",icon:"♢",qty:1,w:.5,d:.5,color:"#e5ce95"},
 {id:"rug",name:"Small rug",icon:"▧",qty:2,w:1.5,d:1,color:"#bc8395"}
];
const by=id=>catalog.find(c=>c.id===id);
const fixed=[{x:-3.55,z:1.65,w:2.05,d:3.65,name:"Bed"},{x:2.6,z:2.85,w:3.25,d:1.4,name:"Desk"},{x:2.65,z:1.38,w:.87,d:.85,name:"Chair"},{x:-.05,z:3.22,w:1.35,d:1.05,name:"Shelf"},{x:-3.98,z:-1.1,w:1.16,d:1.12,name:"Radio table"},{x:4.12,z:-2.8,w:.65,d:.65,name:"Plant"}];
const access=[{x:0,z:-1.8,w:1,d:1,name:"Entry spawn"},{x:1.68,z:-3.1,w:1.6,d:1.3,name:"Door access"},{x:2.65,z:.35,w:1.2,d:1.2,name:"Computer access"},{x:-2.65,z:-1.1,w:1,d:1.1,name:"Radio access"},{x:.75,z:-1.15,w:1,d:2.5,name:"Walkway"},{x:1.65,z:.2,w:2,d:.8,name:"Walkway"},{x:1.05,z:-2.6,w:1.8,d:.7,name:"Walkway"},{x:-1.45,z:-1.15,w:2.4,d:.7,name:"Walkway"}];
const overlaps=(a,b,pad=0)=>Math.abs(a.x-b.x)<(a.w+b.w)/2+pad-1e-6&&Math.abs(a.z-b.z)<(a.d+b.d)/2+pad-1e-6;
function bounds(p){const c=by(p.type);if(!c)return null;return {x:p.x,z:p.z,w:p.rot%2?c.d:c.w,d:p.rot%2?c.w:c.d}}
function valid(p,items,avatar){
 const b=bounds(p);if(!b||!Number.isFinite(p.x)||!Number.isFinite(p.z)||!Number.isInteger(p.rot)||p.rot<0||p.rot>3)return false;
 if(Math.abs(b.x)+b.w/2>4.7||Math.abs(b.z)+b.d/2>3.7)return false;
 const rug=p.type==="rug",solids=items.filter(v=>v.id!==p.id);
 if(fixed.some(o=>overlaps(b,o,rug?0:.12)))return false;
 if(!rug&&access.some(o=>overlaps(b,o)))return false;
 if(!rug&&avatar&&overlaps(b,{...avatar,w:.55,d:.55}))return false;
 return !solids.some(o=>(rug===(o.type==="rug"))&&overlaps(b,bounds(o),rug?0:.12));
}
function clean(items){
 const out=[];if(!Array.isArray(items))return out;
 for(const p of items){if(!p||typeof p.id!=="string"||out.some(o=>o.id===p.id))continue;const c=by(p.type);if(!c||out.filter(o=>o.type===p.type).length>=c.qty)continue;const v={id:p.id,type:p.type,x:p.x,z:p.z,rot:p.rot};if(valid(v,out))out.push(v)}
 return out
}
function editor(opts){
 const $=id=>document.getElementById(id),dialog=$("decor-dialog");let selected=null,placing=null;
 const say=t=>$("decor-feedback").textContent=t;
 const get=()=>opts.get();
 const set=(next,type,detail)=>{opts.set(next,type,detail);render()};
 function choose(p){selected=p?.id||null;placing=null;render();say(p?"Choose a new floor square, rotate or put this item away.":"Choose an item from the inventory.")}
 function attempt(x,z){
  const items=get(),old=items.find(p=>p.id===selected);
  if(!placing&&!old){const p=items.slice().reverse().find(v=>overlaps(bounds(v),{x,z,w:.05,d:.05}));if(p)choose(p);else say("Choose furniture from the inventory first.");return}
  const p=old?{...old,x,z}:{id:globalThis.crypto?.randomUUID?.()||"f-"+Date.now()+"-"+Math.random(),type:placing,x,z,rot:0};
  if(!valid(p,items,opts.avatar())){say("That spot is blocked. Try another square.");return}
  if(!old&&items.filter(v=>v.type===placing).length>=by(placing).qty){say("No more of that item in storage.");return}
  selected=p.id;placing=null;set(old?items.map(v=>v.id===p.id?p:v):[...items,p],old?"decor.moved":"decor.placed",{item:p.type,x,z,rotation:p.rot*90});say(by(p.type).name+" placed.");
 }
 function render(){
  const items=get(),stock=$("decor-stock"),placed=$("decor-placed"),grid=$("decor-grid");stock.replaceChildren();placed.replaceChildren();grid.replaceChildren();
  for(const c of catalog){const remaining=c.qty-items.filter(p=>p.type===c.id).length,b=document.createElement("button");b.type="button";b.className="decor-item"+(placing===c.id?" selected":"");b.disabled=remaining<=0;b.textContent=c.icon+"  "+c.name+" · "+remaining;b.onclick=()=>{placing=c.id;selected=null;render();say("Choose where to place your "+c.name.toLowerCase()+".")};stock.append(b)}
  for(const p of items){const b=document.createElement("button");b.type="button";b.className="decor-item"+(selected===p.id?" selected":"");b.textContent=by(p.type).icon+"  "+by(p.type).name;b.onclick=()=>choose(p);placed.append(b)}
  if(!items.length){const e=document.createElement("p");e.className="small";e.textContent="Nothing placed yet.";placed.append(e)}
  const active=items.find(p=>p.id===selected);$("decor-rotate").disabled=!active;$("decor-remove").disabled=!active;
  for(let row=0;row<16;row++)for(let col=0;col<20;col++){
   const x=-4.75+col*.5,z=3.75-row*.5,point={x,z,w:.42,d:.42},b=document.createElement("button");b.type="button";b.className="decor-cell";const f=fixed.find(v=>overlaps(v,point)),a=access.find(v=>overlaps(v,point)),p=items.slice().reverse().find(v=>overlaps(bounds(v),point));
   if(f||a)b.classList.add("fixed");if(p){b.classList.add("occupied");b.style.setProperty("--item-color",by(p.type).color);if(p.id===selected)b.classList.add("selected")}
   const label=p?by(p.type).name:f?.name||a?.name||"Free floor";
   b.title=label;b.setAttribute("aria-label",label+", column "+(col+1)+", row "+(row+1));
   if(p&&Math.abs(p.x-x)<.26&&Math.abs(p.z-z)<.26)b.textContent=by(p.type).icon;
   b.onclick=()=>{if(!placing&&p&&p.id!==selected)choose(p);else attempt(x,z)};grid.append(b)
  }
 }
 $("decor-rotate").onclick=()=>{const items=get(),p=items.find(v=>v.id===selected);if(!p)return;const v={...p,rot:(p.rot+1)%4};if(!valid(v,items,opts.avatar())){say("Not enough space to rotate here.");return}set(items.map(o=>o.id===v.id?v:o),"decor.rotated",{item:v.type,rotation:v.rot*90});say("Rotated.")};
 $("decor-remove").onclick=()=>{const p=get().find(v=>v.id===selected);if(!p)return;selected=null;placing=null;set(get().filter(v=>v.id!==p.id),"decor.stored",{item:p.type});say("Returned to inventory.")};
 $("decor-done").onclick=()=>dialog.close();dialog.addEventListener("close",()=>opts.close());
 return {open(){selected=null;placing=null;render();say("Choose an item from the inventory.");dialog.showModal()}};
}
window.LifeDecor={catalog,by,bounds,clean,valid,editor};
})();
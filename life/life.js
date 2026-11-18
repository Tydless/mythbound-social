(()=>{
"use strict";
const $=id=>document.getElementById(id),M=window.WorldMemory;
const apps=[
 {id:"mythbound",name:"Mythbound",description:"The MMORPG",icon:"✥",color:"#9a7848",path:"../mythbound/"},
 {id:"afterhours",name:"Afterhours",description:"Friends & social posts",icon:"◎",color:"#916f88",path:"../"},
 {id:"livewire",name:"Livewire",description:"Streams & community",icon:"▣",color:"#7755ae",path:"../livewire/"},
 {id:"viewpoint",name:"Viewpoint",description:"Videos & messages",icon:"▶",color:"#a94d62",path:"../viewpoint/"}
];
const roomDefs={home:{name:"Your room",detail:"A little corner of your own.",wall:"#75878c",floor:"#9f826d",cloth:"#b8c7b8",rug:"#587c78",wood:"#735e51"},friend:{name:"Fighter's apartment",detail:"A provisional room for your gaming buddy.",wall:"#82818e",floor:"#886f61",cloth:"#ab919f",rug:"#68556f",wood:"#685c55"}};
let saved=M.load()||{},current=roomDefs[saved.room]?saved.room:"home",start={x:Number.isFinite(saved.x)?saved.x:0,z:Number.isFinite(saved.z)?saved.z:-1.4};
let scene,engine,camera,body,targets=[],obstacles=[],nearest=null,paused=false,activeApp=null,toastTimer,attachedDoc=null,frameVisitId=0;
const keys=new Set(),touches=new Set(),canvas=$("room"),desktop=$("desktop"),frame=$("website");
function log(source,type,d={}){M.record(source,type,d)}
function refreshIdentity(){const p=M.player();$("player").textContent=p.nickname;$("desktop-greeting").textContent="Welcome back, "+p.nickname+"."}
function notify(t){$("notice").textContent=t;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("notice").textContent="",2400)}
function save(){const p=body?.position||start;start={x:p.x,z:p.z};$("saved").textContent=M.save({room:current,x:start.x,z:start.z,version:1})?"Progress saved":"Storage unavailable"}
function roomLabel(){$("room-name").textContent=roomDefs[current].name;$("room-detail").textContent=roomDefs[current].detail;$("quick-travel").textContent=current==="home"?"Visit Fighter's apartment":"Return to your room"}
function modalOpen(){return desktop.hidden===false||$("menu").open||$("memories").open}
function interact(){if(!modalOpen()&&nearest)nearest.run()}
function focusRoom(){keys.clear();touches.clear();if(!modalOpen())canvas.focus({preventScroll:true})}
function launchDesktop(){save();keys.clear();touches.clear();desktop.hidden=false;desktopHome();refreshIdentity();log("life","computer.opened",{room:current});$("desktop-home").focus()}
function desktopHome(){frameVisitId++;frame.hidden=true;frame.src="about:blank";activeApp=null;attachedDoc=null;$("desktop-launcher").hidden=false;$("external").hidden=true;$("desktop-title").textContent="Desktop"}
function openApp(app){activeApp=app;frameVisitId++;$("desktop-launcher").hidden=true;frame.hidden=false;$("desktop-title").textContent=app.name;$("external").href=app.path;$("external").hidden=false;log(app.id,"website.opened",{from:"virtual-computer",room:current});frame.src=app.path}
function websiteForLocation(url){if(url.origin!==location.origin)return null;const base=new URL("../",location.href).pathname;const sub=url.pathname.startsWith(base)?url.pathname.slice(base.length):"";if(sub.startsWith("mythbound/"))return apps[0];if(sub.startsWith("livewire/"))return apps[2];if(sub.startsWith("viewpoint/"))return apps[3];if(sub===""||sub==="index.html")return apps[1];return null}
function watchWebsite(){
 if(!activeApp||frame.hidden)return;
 try{
  const doc=frame.contentDocument,url=new URL(frame.contentWindow.location.href),app=websiteForLocation(url);
  if(!doc||!app||attachedDoc===doc)return;
  attachedDoc=doc;activeApp=app;$("desktop-title").textContent=app.name;$("external").href=url.href;
  log(app.id,"website.loaded",{page:url.pathname});refreshIdentity();
  doc.addEventListener("click",e=>{
   const b=e.target?.closest?.("button,a");if(!b)return;
   // Explicitly selected fictional interactions only; no password fields, chat text or keystrokes.
   let type=null,d={};
   if(app.id==="mythbound"){
    if(b.matches("[data-class]")){type="class.selected";d={classId:b.dataset.class}}
    else if(b.matches("[data-path]")){type="class.path_selected";d={path:b.dataset.path}}
    else if(b.id==="open-inbox"){type="inbox.opened"}
    else if(b.id==="fighter-friend"||b.id==="chaotic-friend"||b.id==="responsible-friend"){type="friend.opened";d={friend:b.id}}
    else if(b.matches(".mb-voice-play")){type="voice.interacted"}
    else if(b.matches("[data-atlas-region]")){type="region.selected";d={region:b.dataset.atlasRegion}}
   }else if(app.id==="afterhours"){
    if(b.closest(".post")&&b.matches(".art-button,.comments-link,.icon-button")){type="post.interacted";d={postId:b.closest(".post").id,action:b.getAttribute("aria-label")||"open comments"}}
    else if(b.id==="open-dm"){type="message.opened"}
   }else if(app.id==="livewire"&&["follow","videos","stream","about"].includes(b.id)){type="channel.interacted";d={control:b.id}}
   else if(app.id==="viewpoint"&&["sub","messages","home"].includes(b.id)){type="channel.interacted";d={control:b.id}}
   if(type){log(app.id,type,d);setTimeout(refreshIdentity,0)}
  },true);
  doc.addEventListener("keydown",e=>{if(e.key==="Escape"){/* Website may use Escape to close its own dialog; preserve that behavior. */}});
 }catch{notify("This page may require opening in your regular browser.")}
}
function closeDesktop(){if(desktop.hidden)return;log("life","computer.closed",{room:current});desktopHome();desktop.hidden=true;refreshIdentity();save();focusRoom()}
for(const app of apps){const b=document.createElement("button");b.className="app";const icon=document.createElement("span");icon.className="app-icon";icon.style.setProperty("--app-color",app.color);icon.textContent=app.icon;const title=document.createElement("strong");title.textContent=app.name;const sub=document.createElement("small");sub.textContent=app.description;b.append(icon,title,sub);b.onclick=()=>openApp(app);$("apps").append(b)}
frame.addEventListener("load",watchWebsite);$("desktop-home").onclick=desktopHome;$("close-desktop").onclick=closeDesktop;
function travel(){current=current==="home"?"friend":"home";start={x:0,z:-1.8};if(engine)buildRoom();roomLabel();save();log("life","room.visited",{room:current});notify("Arrived at "+roomDefs[current].name);focusRoom()}
function resetPosition(){start={x:0,z:-1.8};if(body){body.position.x=start.x;body.position.z=start.z}save();notify("Position reset")}
function resetCamera(){if(camera){camera.alpha=-Math.PI/3;camera.beta=.96;camera.radius=15;camera.target.set(0,.6,0)}}
$("settings").onclick=()=>{save();keys.clear();$("menu").showModal()};$("resume").onclick=()=>$("menu").close();
$("quick-computer").onclick=()=>{$("menu").close();launchDesktop()};$("quick-travel").onclick=()=>{$("menu").close();travel()};
$("reset").onclick=()=>{resetPosition();$("menu").close()};$("camera-reset").onclick=()=>{resetCamera();$("menu").close()};$("menu").addEventListener("close",focusRoom);
function showJournal(){
 save();keys.clear();const p=M.player();$("memory-identity").textContent=p.nickname+" · "+p.id+" · "+M.all().length+" events";
 const list=$("memory-list");list.replaceChildren();
 const events=M.all().slice().reverse();if(!events.length){const empty=document.createElement("p");empty.textContent="No recorded events yet.";list.append(empty)}
 for(const e of events){const row=document.createElement("div");row.className="event";const title=document.createElement("strong");title.textContent=e.source+" · "+e.type.replaceAll("."," ");const time=document.createElement("span");time.textContent=new Date(e.at).toLocaleString();const detail=document.createElement("small");detail.textContent=Object.entries(e.details||{}).map(([k,v])=>k+": "+v).join(" · ");row.append(title,time,detail);list.append(row)}
 $("memories").showModal()
}
$("journal").onclick=showJournal;$("close-journal").onclick=()=>$("memories").close();$("memories").addEventListener("close",focusRoom);
$("export").onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(M.snapshot(),null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="afterhours-player-memory.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
$("action").onclick=interact;
const moveKeys=["w","a","s","d","arrowup","arrowleft","arrowdown","arrowright"];
window.addEventListener("keydown",e=>{if(modalOpen())return;const k=e.key.toLowerCase();if(moveKeys.includes(k)){e.preventDefault();keys.add(k)}if(k==="e"&&!e.repeat){e.preventDefault();interact()}});
window.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));window.addEventListener("blur",()=>{keys.clear();touches.clear();save()});window.addEventListener("pagehide",save);document.addEventListener("visibilitychange",()=>{if(document.hidden){keys.clear();touches.clear();save()}});
document.querySelectorAll("[data-key]").forEach(b=>{const k=b.dataset.key;const clear=()=>touches.delete(k);b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);touches.add(k)};b.onpointerup=clear;b.onpointercancel=clear;b.onlostpointercapture=clear});
function buildRoom(){
 const B=window.BABYLON;if(scene)scene.dispose();scene=new B.Scene(engine);scene.clearColor=new B.Color4(.085,.111,.145,1);scene.ambientColor=new B.Color3(.72,.72,.72);
 const c=roomDefs[current];targets=[];obstacles=[];
 function mat(name,color,glow=false){const m=new B.StandardMaterial(name,scene);m.diffuseColor=B.Color3.FromHexString(color);m.specularColor=new B.Color3(.09,.09,.09);if(glow)m.emissiveColor=B.Color3.FromHexString(color).scale(.65);return m}
 const palette={wall:mat("wall",c.wall),floor:mat("floor",c.floor),wood:mat("wood",c.wood),cream:mat("cream","#dfd5c4"),cloth:mat("cloth",c.cloth),rug:mat("rug",c.rug),metal:mat("metal","#3a4750"),screen:mat("screen","#779dba",true),green:mat("plant","#6c9879"),gold:mat("gold","#d9c39b",true),dark:mat("dark","#35444d"),skin:mat("skin","#d1b49e"),hair:mat("hair","#483b39"),shirt:mat("shirt","#7896ad"),pants:mat("pants","#4c5866")};
 function box(name,x,y,z,w,h,d,m,block=false){const mesh=B.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);mesh.position.set(x,y,z);mesh.material=m;if(block)obstacles.push({x,z,w,d});return mesh}
 function sphere(name,x,y,z,w,h,d,m,parent){const mesh=B.MeshBuilder.CreateSphere(name,{diameter:1,segments:12},scene);mesh.scaling.set(w,h,d);mesh.position.set(x,y,z);mesh.material=m;if(parent)mesh.parent=parent;return mesh}
 function cylinder(name,x,y,z,diameter,height,m){const mesh=B.MeshBuilder.CreateCylinder(name,{diameter,height,tessellation:16},scene);mesh.position.set(x,y,z);mesh.material=m;return mesh}
 const hemi=new B.HemisphericLight("ambient",new B.Vector3(.1,1,-.2),scene);hemi.intensity=.84;
 const sun=new B.DirectionalLight("sun",new B.Vector3(-.5,-1,.65),scene);sun.position.set(5,9,-6);sun.intensity=.8;
 camera=new B.ArcRotateCamera("camera",-Math.PI/3,.96,15,new B.Vector3(0,.6,0),scene);camera.lowerBetaLimit=.48;camera.upperBetaLimit=1.21;camera.lowerRadiusLimit=8;camera.upperRadiusLimit=20;camera.wheelDeltaPercentage=.035;camera.panningSensibility=0;camera.attachControl(canvas,true);camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");camera.lowerAlphaLimit=-Math.PI*.74;camera.upperAlphaLimit=-.13;
 const shadows=new B.ShadowGenerator(1024,sun);shadows.useBlurExponentialShadowMap=true;shadows.blurKernel=22;
 const floor=box("room-floor",0,-.13,0,10,.25,8,palette.floor);floor.receiveShadows=true;
 for(let i=1;i<10;i++){box("plank",i-5,.003,0,.014,.006,7.98,palette.wood)}
 box("back wall",0,1.6,4,10,3.2,.13,palette.wall);box("left wall",-5,1.6,0,.13,3.2,8,palette.wall);
 box("baseboard-back",0,.09,3.91,10,.18,.06,palette.cream);box("baseboard-left",-4.91,.09,0,.06,.18,8,palette.cream);
 // Window, wall art, books and small plants give the prototype a recognizable home.
 box("window frame",-1.15,2.03,3.9,2.5,1.65,.11,palette.cream);box("sky",-1.15,2.03,3.82,2.27,1.42,.03,palette.screen);box("window bar",-1.15,2.03,3.77,.055,1.45,.05,palette.cream);box("sill",-1.15,1.26,3.74,2.64,.08,.3,palette.wood);
 box("wall picture",-4.88,2.2,-1.3,.055,1.12,1.35,palette.wood);box("poster",-4.84,2.2,-1.3,.03,.91,1.16,palette.cloth);
 box("rug",.15,.018,-.2,4,.035,3.4,palette.rug);
 box("bed base",-3.55,.3,1.65,2.05,.55,3.65,palette.wood,true);box("mattress",-3.55,.69,1.65,1.94,.27,3.5,palette.cream);box("quilt",-3.55,.86,1.25,1.93,.16,2.55,palette.cloth);box("headboard",-3.55,.83,3.5,2.05,1.55,.15,palette.wood);
 box("pillow A",-4.03,.94,2.94,.84,.24,.62,palette.cream);box("pillow B",-3.09,.94,2.94,.84,.24,.62,palette.cream);
 box("desk",2.6,1.05,2.85,3.25,.16,1.4,palette.wood,true);
 for(const x of [1.15,4.05])for(const z of [2.3,3.4])box("leg",x,.53,z,.12,1.05,.12,palette.wood);
 box("monitor foot",2.65,1.19,2.96,.8,.1,.36,palette.metal);box("monitor stand",2.65,1.43,3.02,.13,.43,.13,palette.metal);box("monitor",2.65,1.92,3.04,1.65,.94,.15,palette.metal);box("computer screen",2.65,1.92,2.95,1.51,.78,.025,palette.screen);
 box("keyboard",2.65,1.16,2.45,1.0,.05,.34,palette.dark);box("mouse",3.43,1.17,2.47,.21,.08,.31,palette.cream);
 box("PC tower",4.18,.48,3.1,.45,.95,.68,palette.dark);box("PC light",4.18,.55,2.75,.29,.58,.025,palette.screen);
 box("chair seat",2.65,.56,1.38,.87,.17,.85,palette.metal,true);box("chair back",2.65,1.04,.99,.91,.8,.13,palette.metal);cylinder("chair stand",2.65,.3,1.38,.12,.5,palette.dark);cylinder("chair base",2.65,.08,1.38,.77,.11,palette.dark);
 box("shelf",-.05,1.02,3.22,1.35,2.04,1.05,palette.wood,true);
 for(let i=0;i<3;i++){box("shelf board",-.05,.18+i*.78,2.65,1.26,.08,.14,palette.cream);for(let k=0;k<4;k++)box("book",-.5+k*.26,.4+i*.78,2.64,.18,.34,.13,k%2?palette.rug:palette.cloth)}
 box("side table",-3.98,.44,-1.1,1.16,.86,1.12,palette.wood,true);cylinder("lamp base",-3.98,.92,-1.1,.44,.09,palette.metal);cylinder("lamp stalk",-3.98,1.19,-1.1,.075,.48,palette.metal);cylinder("lamp shade",-3.98,1.53,-1.1,.62,.34,palette.gold);
 cylinder("plant pot",4.12,.26,-2.8,.56,.52,palette.cream);sphere("leaves",4.12,.85,-2.8,.85,.94,.85,palette.green);obstacles.push({x:4.12,z:-2.8,w:.65,d:.65});
 // Doorway at the front edge. A standing frame makes the exit clear.
 box("door left",.88,1.12,-3.78,.13,2.24,.22,palette.wood);box("door right",2.48,1.12,-3.78,.13,2.24,.22,palette.wood);box("door header",1.68,2.23,-3.78,1.73,.16,.22,palette.wood);box("door panel",2.64,1.07,-3.38,.11,2.12,1.18,palette.wood);
 box("door mat",1.68,.025,-3.15,1.7,.05,1.1,palette.cloth);
 // Interaction indicators float above real objects.
 function target(name,x,z,reach,label,run,markerY){targets.push({name,x,z,reach,label,run});const mark=B.MeshBuilder.CreateTorus("interaction "+name,{diameter:.32,thickness:.055,tessellation:24},scene);mark.rotation.x=Math.PI/2;mark.position.set(x,markerY,z);mark.material=palette.gold}
 target("computer",2.65,.35,1.35,"Use computer",launchDesktop,1.15);
 target("door",1.68,-3.12,1.2,current==="home"?"Visit Fighter's apartment":"Return home",travel,.08);
 body=new B.TransformNode("player",scene);body.position.set(Math.max(-4.65,Math.min(4.65,start.x)),0,Math.max(-3.65,Math.min(3.65,start.z)));
 function part(name,x,y,z,w,h,d,m){const q=box(name,x,y,z,w,h,d,m);q.parent=body;shadows.addShadowCaster(q);return q}
 const torso=part("player torso",0,.7,0,.38,.48,.25,palette.shirt),head=sphere("player head",0,1.13,0,.37,.36,.35,palette.skin,body);shadows.addShadowCaster(head);
 sphere("hair",0,1.245,-.025,.39,.20,.38,palette.hair,body);
 const armL=part("left arm",-.26,.68,0,.13,.45,.15,palette.shirt),armR=part("right arm",.26,.68,0,.13,.45,.15,palette.shirt),legL=part("left leg",-.105,.25,0,.16,.45,.17,palette.pants),legR=part("right leg",.105,.25,0,.16,.45,.17,palette.pants);
 for(const m of scene.meshes){if(!m.name.startsWith("interaction")&&m!==floor&&!m.name.includes("wall"))shadows.addShadowCaster(m)}
 function blocked(x,z){return x< -4.65||x>4.65||z< -3.65||z>3.65||obstacles.some(o=>Math.abs(x-o.x)<o.w/2+.23&&Math.abs(z-o.z)<o.d/2+.23)}
 if(blocked(body.position.x,body.position.z)){body.position.x=0;body.position.z=-1.8}
 let walk=0;
 scene.onBeforeRenderObservable.add(()=>{
  if(!body||modalOpen()||document.hidden)return;
  const dt=Math.min(.05,engine.getDeltaTime()/1000),has=(...a)=>a.some(k=>keys.has(k)||touches.has(k));
  const ux=Number(has("d","arrowright"))-Number(has("a","arrowleft")),uz=Number(has("w","arrowup"))-Number(has("s","arrowdown"));
  let moving=false;
  if(ux||uz){
   const forward=camera.target.subtract(camera.position);forward.y=0;forward.normalize();const right=new B.Vector3(forward.z,0,-forward.x);
   const dir=forward.scale(uz).add(right.scale(ux)).normalize();const speed=2.7*dt,x=body.position.x,z=body.position.z;
   if(!blocked(x+dir.x*speed,z))body.position.x+=dir.x*speed;
   if(!blocked(body.position.x,z+dir.z*speed))body.position.z+=dir.z*speed;
   moving=Math.hypot(body.position.x-x,body.position.z-z)>.0001;if(moving)body.rotation.y=Math.atan2(dir.x,dir.z);
  }
  walk+=moving?dt*10:0;const step=moving?Math.sin(walk)*.5:0;legL.rotation.x=step;legR.rotation.x=-step;armL.rotation.x=-step*.7;armR.rotation.x=step*.7;torso.position.y=.7+(moving?Math.abs(Math.sin(walk))*.025:0);
  nearest=targets.map(t=>({...t,distance:Math.hypot(body.position.x-t.x,body.position.z-t.z)})).filter(t=>t.distance<t.reach).sort((a,b)=>a.distance-b.distance)[0]||null;
  $("interact").hidden=!nearest;if(nearest)$("action-text").textContent=nearest.label;
 });
}
refreshIdentity();roomLabel();log("life","session.started",{room:current});
try{
 const B=window.BABYLON;if(!B||!B.Engine.isSupported())throw Error("WebGL unavailable");
 engine=new B.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true});buildRoom();engine.runRenderLoop(()=>{if(!desktop.hidden||document.hidden)return;scene?.render()});window.addEventListener("resize",()=>engine.resize());$("loading").hidden=true;focusRoom();
}catch(err){console.warn("Room startup",err);$("loading").textContent="3D could not start. Your computer and travel controls are still available from Menu.";if(engine){engine.dispose();engine=null;body=null}}
setInterval(()=>{if(!modalOpen())save()},4000);
})();
